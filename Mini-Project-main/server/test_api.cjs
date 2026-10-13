const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, text: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('   GATHERLY BACKEND COMPREHENSIVE TEST SUITE');
  console.log('==================================================');

  // Test 1: Health Check
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Test 1 - Health Check:', health.status === 200 ? 'PASS' : 'FAIL', `(${health.status})`);

  // Test 2: GET /api/events (Listing & filtering)
  const allEvents = await request({ host: 'localhost', port: 5000, path: '/api/events', method: 'GET' });
  console.log('Test 2a - GET /api/events:', allEvents.status === 200 ? 'PASS' : 'FAIL', `(Found ${allEvents.data?.length} events)`);

  const hackathons = await request({ host: 'localhost', port: 5000, path: '/api/events?category=Hackathon', method: 'GET' });
  console.log('Test 2b - Filter ?category=Hackathon:', hackathons.status === 200 && hackathons.data.length === 1 ? 'PASS' : 'FAIL', `(${hackathons.data[0]?.title})`);

  const search = await request({ host: 'localhost', port: 5000, path: '/api/events?search=Web3', method: 'GET' });
  console.log('Test 2c - Search ?search=Web3:', search.status === 200 && search.data.length === 1 ? 'PASS' : 'FAIL', `(${search.data[0]?.title})`);

  // Test 3: GET /api/events/:id existing & non-existing
  const single = await request({ host: 'localhost', port: 5000, path: '/api/events/evt-1', method: 'GET' });
  console.log('Test 3a - GET /api/events/evt-1:', single.status === 200 ? 'PASS' : 'FAIL', `(Title: "${single.data?.title}", registeredCount: ${single.data?.registeredCount})`);

  const missing = await request({ host: 'localhost', port: 5000, path: '/api/events/non-existent-id', method: 'GET' });
  console.log('Test 3b - GET non-existent (404 expected):', missing.status === 404 ? 'PASS' : 'FAIL', `(${missing.status} - ${missing.data?.error})`);

  // Test 4: POST /api/events (Validation error handling)
  const invalidBody = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { title: 'ab' }); // Missing required fields
  console.log('Test 4 - POST invalid body validation (400 expected):', invalidBody.status === 400 ? 'PASS' : 'FAIL', `(${invalidBody.status} - ${invalidBody.data?.details?.join(', ')})`);

  // Test 5: POST /api/events (Successful Creation)
  const newEventPayload = {
    title: 'AI Agents & LLM Hackathon 2024',
    category: 'Hackathon',
    type: 'Hackathon',
    date: 'Nov 12 • 9:00 AM',
    time: '9:00 AM - 9:00 PM',
    venue: 'Computer Science Complex, Hall A',
    capacity: 50,
    description: 'Build autonomous agent workflows with DeepMind and open source AI toolkits.',
    eligibleYears: ['Junior', 'Senior'],
    organizer: 'AI Student Society'
  };
  const createdEvent = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newEventPayload);
  console.log('Test 5 - POST /api/events (201 expected):', createdEvent.status === 201 ? 'PASS' : 'FAIL', `(ID: ${createdEvent.data?.id}, registeredCount: ${createdEvent.data?.registeredCount})`);

  const createdId = createdEvent.data?.id;

  // Test 6: GET /api/events/:id fetching newly created event
  const fetchCreated = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}`, method: 'GET' });
  console.log('Test 6 - GET newly created event by ID:', fetchCreated.status === 200 && fetchCreated.data?.title === newEventPayload.title ? 'PASS' : 'FAIL');

  // Test 7: PUT /api/events/:id
  const updatedEvent = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { venue: 'Computer Science Auditorium Room 101', capacity: 60 });
  console.log('Test 7 - PUT /api/events/:id update:', updatedEvent.status === 200 && updatedEvent.data?.venue === 'Computer Science Auditorium Room 101' ? 'PASS' : 'FAIL', `(New Venue: "${updatedEvent.data?.venue}")`);

  // Test 8: Student Registration
  // 8a: Register student for newly created event
  const reg1 = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentId: '#GTH-8821',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@campus.edu',
    seatPass: 'Front Row A-01'
  });
  console.log('Test 8a - Register student (201 expected):', reg1.status === 201 ? 'PASS' : 'FAIL', `(Reg ID: ${reg1.data?.registration?.id}, Recalculated Count: ${reg1.data?.event?.registeredCount})`);

  // 8b: Duplicate registration check (409 expected)
  const duplicateReg = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentId: '#GTH-8821',
    studentName: 'Alex Chen'
  });
  console.log('Test 8b - Duplicate registration rejection (409 expected):', duplicateReg.status === 409 ? 'PASS' : 'FAIL', `(${duplicateReg.status} - "${duplicateReg.data?.message}")`);

  // 8c: Also test without leading '#' to test normalization
  const duplicateRegNormalized = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentId: 'GTH-8821',
    studentName: 'Alex Chen'
  });
  console.log('Test 8c - Normalized duplicate registration rejection (409 expected):', duplicateRegNormalized.status === 409 ? 'PASS' : 'FAIL', `(${duplicateRegNormalized.status} - "${duplicateRegNormalized.data?.message}")`);

  // 8d: Register second student
  const reg2 = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentId: '#GTH-9944',
    studentName: 'Elena Rostova',
    studentEmail: 'elena.r@campus.edu'
  });
  console.log('Test 8d - Register 2nd student (201 expected):', reg2.status === 201 ? 'PASS' : 'FAIL', `(New Event Count: ${reg2.data?.event?.registeredCount})`);

  // Test 9: Check Registration Count consistency
  const eventRegs = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}/registrations`, method: 'GET' });
  console.log('Test 9a - GET /api/events/:id/registrations count:', eventRegs.status === 200 && eventRegs.data?.count === 2 ? 'PASS' : 'FAIL', `(Stored Registrations: ${eventRegs.data?.count})`);

  const eventCheck = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}`, method: 'GET' });
  console.log('Test 9b - Calculated registeredCount on Event is 2:', eventCheck.data?.registeredCount === 2 ? 'PASS' : 'FAIL', `(registeredCount: ${eventCheck.data?.registeredCount})`);

  // Test 10: GET /api/students/:studentId/registrations
  const studentRegs = await request({ host: 'localhost', port: 5000, path: '/api/students/%23GTH-8821/registrations', method: 'GET' });
  console.log('Test 10 - Student registrations lookup for Alex Chen:', studentRegs.status === 200 ? 'PASS' : 'FAIL', `(Total registered events: ${studentRegs.data?.count})`);

  // Test 11: Capacity Limit Enforcement
  const limitedEvent = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    title: 'VIP Masterclass with CTO',
    category: 'Tech Workshop',
    date: 'Nov 15 • 3:00 PM',
    time: '3:00 PM - 4:00 PM',
    venue: 'Executive Boardroom',
    capacity: 1
  });
  const limitedId = limitedEvent.data?.id;

  // First student fills capacity
  await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${limitedId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { studentId: '#GTH-0001', studentName: 'First Student' });

  // Second student attempts to register
  const capacityBlocked = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${limitedId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { studentId: '#GTH-0002', studentName: 'Second Student' });
  console.log('Test 11 - Capacity Limit Reached rejection (409 expected):', capacityBlocked.status === 409 ? 'PASS' : 'FAIL', `(${capacityBlocked.status} - "${capacityBlocked.data?.message}")`);

  // Test 12: DELETE /api/events/:id with cascade registrations removal
  const deleteResult = await request({ host: 'localhost', port: 5000, path: `/api/events/${limitedId}`, method: 'DELETE' });
  console.log('Test 12a - DELETE /api/events/:id:', deleteResult.status === 200 ? 'PASS' : 'FAIL', `(${deleteResult.data?.message})`);

  const deleteCheck = await request({ host: 'localhost', port: 5000, path: `/api/events/${limitedId}`, method: 'GET' });
  console.log('Test 12b - Verify deleted event returns 404:', deleteCheck.status === 404 ? 'PASS' : 'FAIL');

  console.log('==================================================');
  console.log('   ALL API TESTS EXECUTED AND VERIFIED!');
  console.log('==================================================');
}

runTests().catch(console.error);
