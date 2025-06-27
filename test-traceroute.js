// Simple test script to verify traceroute functionality
const { exec } = require('child_process');

function testTraceroute() {
  console.log('Testing traceroute functionality...');
  
  // Test Windows tracert command - limited to 5 hops
  const command = process.platform === 'win32' 
    ? 'tracert -h 5 -w 2000 8.8.8.8'
    : 'traceroute -m 5 -w 2 8.8.8.8';
  
  console.log(`Running command: ${command}`);
  
  exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing traceroute:', error.message);
      return;
    }
    
    if (stderr) {
      console.error('Stderr:', stderr);
    }
    
    console.log('Traceroute output:');
    console.log(stdout);
    
    // Parse basic output
    const lines = stdout.split('\n');
    const hops = [];
    
    for (const line of lines) {
      const hopMatch = line.match(/^\s*(\d+)\s+([^\s(]+)(?:\s+\(([^)]+)\))?\s+(.*)/);
      if (hopMatch) {
        const hopNumber = parseInt(hopMatch[1]);
        const hostname = hopMatch[2];
        const ip = hopMatch[3] || hopMatch[2];
        console.log(`Hop ${hopNumber}: ${ip} (${hostname})`);
        hops.push({ hopNumber, ip, hostname });
      }
    }
    
    console.log(`\nFound ${hops.length} valid hops`);
  });
}

testTraceroute();
