const https = require('https');
const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const bodyStr = JSON.stringify(data);

    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Origin': 'https://gatherly-tau-two.vercel.app'
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, text: raw, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Origin': 'https://gatherly-tau-two.vercel.app'
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, text: raw, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function verifyFlow(baseUrl, label) {
  console.log(`\n--- Testing Registration Flow against ${label} (${baseUrl}) ---`);

  // Step 1: Health Check
  const health = await getJson(`${baseUrl}/health`);
  console.log(`1. Health Check: Status ${health.status} -> ${health.data?.service || health.data?.status}`);
  if (health.status !== 200) throw new Error(`Health check failed on ${label}`);

  // Step 2: Fetch events
  const eventsRes = await getJson(`${baseUrl}/events`);
  console.log(`2. GET /events: Status ${eventsRes.status}, count = ${eventsRes.data?.length}`);
  if (eventsRes.status !== 200 || !Array.isArray(eventsRes.data)) throw new Error(`GET /events failed on ${label}`);

  const targetEvent = eventsRes.data[0];
  console.log(`   Target Event ID: ${targetEvent.id} ("${targetEvent.title}")`);

  // Step 3: Register student
  const uniqueRoll = `GTH-VERIFY-${Date.now().toString().slice(-4)}`;
  const regPayload = {
    studentName: 'Jordan Lee',
    studentEmail: 'jordan.lee@campus.edu',
    studentPhone: '+1 (555) 321-7654',
    rollNumber: uniqueRoll,
    department: 'Computer Science & Engineering',
    yearOfStudy: 'Senior (Year 4)',
    collegeName: 'Campus Institute of Technology',
    additionalNotes: 'Ready for live hackathon gate access',
    seatPass: 'Zone A-Gate Pass'
  };

  const regRes = await postJson(`${baseUrl}/events/${targetEvent.id}/register`, regPayload);
  console.log(`3. POST /events/:id/register: Status ${regRes.status}`);
  console.log(`   Registration ID: ${regRes.data?.registration?.id}`);
  console.log(`   Generated Ticket ID: ${regRes.data?.registration?.ticketId}`);
  console.log(`   Recalculated Count: ${regRes.data?.event?.registeredCount}`);

  if (regRes.status !== 201) {
    throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
  }

  const ticketId = regRes.data?.registration?.ticketId;

  // Step 4: Verify generated ticket
  const verifyRes = await getJson(`${baseUrl}/tickets/${encodeURIComponent(ticketId)}/verify`);
  console.log(`4. GET /tickets/:id/verify: Status ${verifyRes.status}`);
  console.log(`   Ticket Valid: ${verifyRes.data?.valid}`);
  console.log(`   Attendee: ${verifyRes.data?.studentName} (${verifyRes.data?.rollNumber})`);
  console.log(`   Event: ${verifyRes.data?.event?.title}`);

  if (verifyRes.status !== 200 || !verifyRes.data?.valid) {
    throw new Error(`Ticket verification failed for ticket ${ticketId}`);
  }

  // Step 5: Duplicate registration prevention
  const dupRes = await postJson(`${baseUrl}/events/${targetEvent.id}/register`, regPayload);
  console.log(`5. Duplicate Registration Check: Status ${dupRes.status} (409 expected)`);
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate registration, got ${dupRes.status}`);
  }

  console.log(`SUCCESS: All registration steps on ${label} passed flawlessly!`);
}

async function run() {
  // Test local server
  await verifyFlow('http://localhost:5000/api', 'Local Server');

  // Test live Render server
  await verifyFlow('https://gatherly-7zxe.onrender.com/api', 'Live Render Backend');
}

run().catch((err) => {
  console.error('\nFAILURE:', err.message);
  process.exit(1);
});
