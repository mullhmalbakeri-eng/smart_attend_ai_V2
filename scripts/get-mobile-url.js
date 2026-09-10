const { networkInterfaces } = require('os');

function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }

  return results;
}

console.log('🌐 MOBILE ACCESS URLs:');
console.log('=====================');

const ips = getLocalIP();

if (ips.length === 0) {
  console.log('❌ No network interfaces found');
} else {
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. http://${ip}:3000`);
  });
}

console.log('\n📱 INSTRUCTIONS:');
console.log('================');
console.log('1. Make sure your mobile and PC are on the same WiFi network');
console.log('2. Use one of the URLs above in your mobile browser');
console.log('3. If connection fails, check your firewall settings');
console.log('4. Ensure the server is running with: npm run dev');
