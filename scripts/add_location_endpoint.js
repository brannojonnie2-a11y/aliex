const fs = require('fs');
const path = require('path');

const serverPath = '/vercel/share/v0-project/server.js';
let content = fs.readFileSync(serverPath, 'utf8');

const locationEndpoint = `
// Location endpoint - bypasses CORS and provides IP + country
app.get('/api/location', async (req, res) => {
  try {
    // Get user IP from request
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket.remoteAddress;
    
    // Try to get country from the IP
    try {
      const locRes = await fetch(\`https://ip-api.com/json/\${ip}?fields=country,countryCode\`);
      const locData = await locRes.json();
      
      return res.json({
        ip: ip || 'Unknown',
        country: locData.country || 'Unknown',
        countryCode: locData.countryCode || 'Unknown'
      });
    } catch (e) {
      // If ip-api fails, return just the IP
      console.error('Location lookup failed:', e);
      return res.json({
        ip: ip || 'Unknown',
        country: 'Unknown',
        countryCode: 'Unknown'
      });
    }
  } catch (error) {
    console.error('Location endpoint error:', error);
    res.status(500).json({ ip: 'Unknown', country: 'Unknown' });
  }
});
`;

// Check if endpoint already exists
if (!content.includes('/api/location')) {
  // Find the last app. route and insert after it
  const lastIndex = content.lastIndexOf('app.');
  const nextLineEnd = content.indexOf('\n', lastIndex);
  
  if (lastIndex !== -1) {
    content = content.slice(0, nextLineEnd) + locationEndpoint + content.slice(nextLineEnd);
    fs.writeFileSync(serverPath, content);
    console.log('Added /api/location endpoint to server.js');
  }
}
