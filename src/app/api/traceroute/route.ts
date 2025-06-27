import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SecurityValidator, RateLimiter, securityLog, getSecurityHeaders } from '@/lib/security';

const execAsync = promisify(exec);

// Simple traceroute - just source and destination
async function simpleTraceroute(target: string): Promise<any[]> {
  const hops: any[] = [];
  
  try {
    // Get user's real public IP address
    let sourceIP = null;
    try {
      console.log('Fetching your real public IP...');
      const response = await fetch('https://api.ipify.org?format=json', { 
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        sourceIP = data.ip;
        console.log(`Your public IP: ${sourceIP}`);
      }
    } catch (error) {
      console.log('Could not get public IP, trying alternative...');
      try {
        // Alternative service
        const response = await fetch('https://httpbin.org/ip');
        if (response.ok) {
          const data = await response.json();
          sourceIP = data.origin;
          console.log(`Your public IP (alternative): ${sourceIP}`);
        }
      } catch (altError) {
        console.log('Could not determine public IP, using fallback');
      }
    }
    
    // Always add source hop (your real public IP) - with fallback if detection failed
    if (!sourceIP) {
      sourceIP = '8.8.8.8'; // Fallback to a known public IP for demo
    }
    
    hops.push({
      hopNumber: 1,
      ip: sourceIP,
      hostname: 'Your Location',
      latency: [1],
      isSource: true
    });
    console.log(`Source (Your IP): ${sourceIP}`);
    
    // Now get the destination IP
    let destinationIP = target;
    
    // If target is a domain, resolve it to IP
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(target)) {
      try {
        const isWindows = process.platform === 'win32';
        const pingCommand = isWindows ? `ping -n 1 ${target}` : `ping -c 1 ${target}`;
        const { stdout: pingOutput } = await execAsync(pingCommand, { timeout: 3000 });
        
        // Extract IP from ping output
        const ipMatch = pingOutput.match(/\b(\d+\.\d+\.\d+\.\d+)\b/);
        if (ipMatch) {
          destinationIP = ipMatch[1];
        }
      } catch (error) {
        console.log('Could not resolve domain, using as-is');
      }
    }
    
    // Add destination hop
    hops.push({
      hopNumber: 2,
      ip: destinationIP,
      hostname: target !== destinationIP ? target : undefined,
      latency: [50], // Estimated
      isDestination: true
    });
    
    console.log(`Destination: ${destinationIP}`);
    
  } catch (error) {
    console.error('Error in simple traceroute:', error);
    
    // Fallback hops - always ensure we have both source and destination
    hops.length = 0; // Clear any partial hops
    hops.push(
      {
        hopNumber: 1,
        ip: '8.8.8.8', // Use Google DNS as fallback source
        hostname: 'Your Location (Fallback)',
        latency: [1],
        isSource: true
      },
      {
        hopNumber: 2,
        ip: target,
        hostname: undefined,
        latency: [50],
        isDestination: true
      }
    );
  }
  
  return hops;
}

// Parse traceroute output
function parseTraceroute(output: string): any[] {
  const lines = output.split('\n');
  const hops: any[] = [];
  
  for (const line of lines) {
    // Handle Windows tracert output (supports French locale)
    // Match lines like: "  1     1 ms     2 ms     1 ms  192.168.1.1"
    // or "  2     *        *        *     Délai d'attente..."
    const hopMatch = line.match(/^\s*(\d+)\s+(.+)/);
    
    if (hopMatch) {
      const hopNumber = parseInt(hopMatch[1]);
      const restOfLine = hopMatch[2].trim();
      
      // Skip timeout lines
      if (restOfLine.includes('*') || restOfLine.includes('Délai') || restOfLine.includes('Request timed out')) {
        continue;
      }
      
      // Extract IP address - look for the last IP address pattern in the line
      const ipMatches = restOfLine.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
      if (!ipMatches || ipMatches.length === 0) continue;
      
      const ip = ipMatches[ipMatches.length - 1]; // Take the last IP found
      
      // Extract latency values
      const latencyMatches = restOfLine.match(/(\d+)\s*ms/g);
      const latencies = latencyMatches 
        ? latencyMatches.map(m => parseInt(m.replace(/\s*ms/, '')))
        : [];
      
      // Only add if we have valid data
      if (ip && latencies.length > 0) {
        hops.push({
          hopNumber,
          ip,
          hostname: undefined, // Windows tracert doesn't always show hostnames clearly
          latency: latencies,
        });
      }
    }
  }
  
  return hops;
}

export async function POST(request: NextRequest) {
  try {
    // Security: Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    securityLog('INFO', 'API request received', { clientIP, endpoint: '/api/traceroute' });
    
    // Security: Check rate limiting
    if (!RateLimiter.checkLimit(clientIP, 10, 60 * 1000)) {
      securityLog('WARN', 'Rate limit exceeded', { clientIP });
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait before making another request.',
          remainingRequests: RateLimiter.getRemainingRequests(clientIP, 10)
        },
        { 
          status: 429,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // Security: Validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      securityLog('WARN', 'Invalid JSON payload', { clientIP });
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
    
    const { target } = body;
    
    // Security: Comprehensive input validation using SecurityValidator
    const validation = SecurityValidator.validateTarget(target);
    
    if (!validation.isValid) {
      securityLog('WARN', 'Invalid target input', { 
        clientIP, 
        originalInput: target, 
        error: validation.error 
      });
      return NextResponse.json(
        { error: validation.error || 'Invalid target format' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
    
    const sanitizedTarget = validation.sanitized!;
    
    securityLog('INFO', 'Processing valid target', { 
      clientIP, 
      originalTarget: target,
      sanitizedTarget 
    });
    
    // Use simple source-to-destination approach
    let hops: any[] = [];
    
    // Always use the simple traceroute for source + destination only
    hops = await simpleTraceroute(sanitizedTarget);
      
    securityLog('INFO', 'Traceroute completed successfully', { 
      clientIP,
      target: sanitizedTarget,
      hopsCount: hops.length 
    });
      
    return NextResponse.json({
      target: sanitizedTarget,
      hops,
      status: 'completed',
      security: {
        validated: true,
        sanitized: target !== sanitizedTarget,
        remainingRequests: RateLimiter.getRemainingRequests(clientIP, 10)
      }
    }, {
      headers: getSecurityHeaders()
    });
    
  } catch (error: any) {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
                    
    securityLog('ERROR', 'Traceroute API error', { 
      clientIP,
      error: error.message,
      stack: error.stack 
    });
    
    // Security: Don't expose internal error details
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}
