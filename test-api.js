const http = require('http');

const data = JSON.stringify({
  name: "Test Strategy",
  definition_json: {
    entryConditions: {
      operator: "AND",
      conditions: [{ indicator: "SMA", period: 14, comparison: ">", value: 0 }]
    }
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/strategies',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
