// Test the traceroute parsing with French Windows output (5 hops)
const testOutput = `
Détermination de l'itinéraire vers google.com [172.217.19.142]
avec un maximum de 5 sauts :

  1     1 ms     2 ms     1 ms  192.168.243.145 
  2     *        *        *     Délai d'attente de la demande dépassé.
  3    40 ms    38 ms    36 ms  10.40.249.138 
  4    50 ms    57 ms    37 ms  172.17.116.145 
  5    53 ms    34 ms    43 ms  172.17.116.144 
`;

function parseTraceroute(output) {
  const lines = output.split('\n');
  const hops = [];
  
  for (const line of lines) {
    // Handle Windows tracert output (supports French locale)
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
          hostname: undefined,
          latency: latencies,
        });
      }
    }
  }
  
  return hops;
}

console.log('Testing French traceroute parsing:');
const result = parseTraceroute(testOutput);
console.log('Parsed hops:', JSON.stringify(result, null, 2));
