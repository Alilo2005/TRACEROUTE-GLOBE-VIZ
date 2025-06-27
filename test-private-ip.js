// Test private IP detection
function isPrivateIP(ip) {
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

function getPrivateIPLocation(ip) {
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return {
      lat: 48.8566,
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

const testIPs = [
  '192.168.243.145',
  '192.168.1.1',
  '10.0.0.1',
  '172.16.0.1',
  '127.0.0.1',
  '8.8.8.8'
];

console.log('Testing private IP detection:');
testIPs.forEach(ip => {
  const isPrivate = isPrivateIP(ip);
  const fallback = getPrivateIPLocation(ip);
  console.log(`IP: ${ip}`);
  console.log(`  Private: ${isPrivate}`);
  console.log(`  Fallback: ${fallback ? 'Yes' : 'No'}`);
  if (fallback) {
    console.log(`  Location: ${fallback.city} (${fallback.lat}, ${fallback.lng})`);
  }
  console.log('');
});
