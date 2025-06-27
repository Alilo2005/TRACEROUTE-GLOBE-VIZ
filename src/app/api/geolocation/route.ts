import { NextRequest, NextResponse } from 'next/server';

interface IPInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string; // "lat,lng" format
  org?: string;
  timezone?: string;
}

// Check if IP is private/local
function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^fe80:/,                   // IPv6 link-local
    /^::1$/,                    // IPv6 localhost
  ];
  
  return privateRanges.some(range => range.test(ip));
}

// Get fallback location for private IPs
function getPrivateIPLocation(ip: string) {
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    // Local network - use approximate user location (you can customize this)
    return {
      lat: 48.8566,  // Paris coordinates as example
      lng: 2.3522,
      city: 'Local Network',
      region: 'Private',
      country: 'LAN',
      countryCode: 'LAN',
    };
  }
  
  if (ip.startsWith('127.')) {
    return {
      lat: 0,
      lng: 0,
      city: 'Localhost',
      region: 'Loopback',
      country: 'Local',
      countryCode: 'LOC',
    };
  }
  
  return null;
}

// Get fallback location for public IPs when geolocation fails
function getPublicIPFallback(ip: string) {
  // Parse IP to determine rough geographical region
  const parts = ip.split('.').map(Number);
  const firstOctet = parts[0];
  
  // Very rough geographic estimation based on IP ranges
  // This is a simplified fallback and not accurate
  if (firstOctet >= 1 && firstOctet <= 50) {
    return {
      lat: 39.0458, lng: -76.6413, // US East Coast (approximate)
      city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX'
    };
  } else if (firstOctet >= 51 && firstOctet <= 100) {
    return {
      lat: 51.5074, lng: -0.1278, // London (approximate)
      city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX'
    };
  } else if (firstOctet >= 101 && firstOctet <= 150) {
    return {
      lat: 35.6762, lng: 139.6503, // Tokyo (approximate)
      city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX'
    };
  } else if (firstOctet >= 151 && firstOctet <= 200) {
    return {
      lat: 37.7749, lng: -122.4194, // San Francisco (approximate)
      city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX'
    };
  } else {
    return {
      lat: 48.8566, lng: 2.3522, // Paris (default fallback)
      city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ips } = await request.json();
    
    if (!ips || !Array.isArray(ips)) {
      return NextResponse.json(
        { error: 'IPs array is required' },
        { status: 400 }
      );
    }
    
    const token = process.env.IPINFO_TOKEN;
    
    if (!token) {
      console.warn('IPINFO_TOKEN not found, using free tier with rate limits');
    }
    
    const results: Record<string, any> = {};
    
    // Process IPs in batches to respect rate limits
    for (const ip of ips) {
      console.log(`Processing IP: ${ip}, isPrivate: ${isPrivateIP(ip)}`);
      try {
        // Handle private IPs with fallback locations
        if (isPrivateIP(ip)) {
          const fallbackLocation = getPrivateIPLocation(ip);
          console.log(`✓ Using fallback location for private IP ${ip}:`, fallbackLocation);
          results[ip] = {
            ip,
            hostname: ip.startsWith('192.168.') ? 'Local Router' : 'Private Network',
            location: fallbackLocation,
            org: 'Private Network',
            isPrivate: true,
          };
          continue;
        }

        console.log(`→ Fetching geolocation for public IP: ${ip}`);

        // Try multiple geolocation services in order
        let geoData = null;
        
        // First try: ip-api.com (free, no token required, 45 req/min)
        try {
          const ipApiResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,query`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (ipApiResponse.ok) {
            const ipApiData = await ipApiResponse.json();
            if (ipApiData.status === 'success') {
              console.log(`✓ Got location from ip-api.com for ${ip}`);
              geoData = {
                ip: ipApiData.query,
                hostname: undefined,
                location: {
                  lat: ipApiData.lat,
                  lng: ipApiData.lon,
                  city: ipApiData.city,
                  region: ipApiData.regionName,
                  country: ipApiData.country,
                  countryCode: ipApiData.countryCode,
                },
                org: ipApiData.org || ipApiData.isp,
                isPrivate: false,
                source: 'ip-api.com'
              };
            }
          }
        } catch (error: any) {
          console.log(`ip-api.com failed for ${ip}:`, error?.message || 'Unknown error');
        }
        
        // Second try: ipinfo.io (if we have a token and ip-api failed)
        if (!geoData && token) {
          try {
            const url = `https://ipinfo.io/${ip}?token=${token}`;
            const response = await fetch(url, {
              headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
              const data: IPInfoResponse = await response.json();
              if (data.loc) {
                const [lat, lng] = data.loc.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                  console.log(`✓ Got location from ipinfo.io for ${ip}`);
                  geoData = {
                    ip: data.ip,
                    hostname: data.hostname,
                    location: {
                      lat, lng,
                      city: data.city,
                      region: data.region,
                      country: data.country,
                      countryCode: data.country,
                    },
                    org: data.org,
                    isPrivate: false,
                    source: 'ipinfo.io'
                  };
                }
              }
            }
          } catch (error: any) {
            console.log(`ipinfo.io failed for ${ip}:`, error?.message || 'Unknown error');
          }
        }
        
        // If both services failed, use fallback location
        if (!geoData) {
          console.log(`Using fallback location for ${ip}`);
          const fallbackLocation = getPublicIPFallback(ip);
          geoData = {
            ip,
            hostname: `Unknown (${ip})`,
            location: fallbackLocation,
            org: 'Unknown',
            isPrivate: false,
            source: 'fallback',
            isFallback: true
          };
        }
        
        results[ip] = geoData;
        console.log(`✓ Final location data for ${ip}:`, geoData);
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching location for IP ${ip}:`, error);
        // Provide fallback location even for errors
        const fallbackLocation = getPublicIPFallback(ip);
        results[ip] = {
          ip,
          hostname: `Unknown (${ip})`,
          location: fallbackLocation,
          org: 'Unknown',
          error: 'Failed to fetch location - using fallback',
          isFallback: true,
        };
      }
    }
    
    console.log('[GEOLOCATION] All geolocation results:', JSON.stringify(results, null, 2));
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
