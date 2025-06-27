import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();
  
  // Security: Add CORS headers (restrict to your domain in production)
  response.headers.set('Access-Control-Allow-Origin', '*'); // Change to your domain in production
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Security: Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Security: Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.ipify.org https://httpbin.org http://ip-api.com https://ipinfo.io; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  
  // Security: Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const userAgent = request.headers.get('user-agent') || '';
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Security: Block suspicious user agents
    const suspiciousUserAgents = [
      /curl/i,
      /wget/i,
      /python/i,
      /bot/i,
      /spider/i,
      /crawler/i,
      /scanner/i,
      /hack/i,
    ];
    
    for (const pattern of suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        console.warn(`[SECURITY] Blocked suspicious user agent from ${clientIP}: ${userAgent}`);
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    
    // Security: Check for common attack patterns in URL
    const url = request.nextUrl.pathname + request.nextUrl.search;
    const attackPatterns = [
      /\.\./,
      /\/etc\//,
      /\/proc\//,
      /\/sys\//,
      /\/dev\//,
      /\/var\//,
      /passwd/,
      /shadow/,
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /data:/i,
      /base64/i,
    ];
    
    for (const pattern of attackPatterns) {
      if (pattern.test(url)) {
        console.warn(`[SECURITY] Blocked attack pattern from ${clientIP}: ${url}`);
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
