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

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. Health Check
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  assert('Test 1 - Health Check (200 OK)', health.status === 200, `(${health.status})`);

  // 2. GET /api/events (Listing & filtering)
  const allEvents = await request({ host: 'localhost', port: 5000, path: '/api/events', method: 'GET' });
  assert('Test 2a - GET /api/events', allEvents.status === 200 && Array.isArray(allEvents.data), `(Found ${allEvents.data?.length} events)`);

  const hackathons = await request({ host: 'localhost', port: 5000, path: '/api/events?category=Hackathon', method: 'GET' });
  assert('Test 2b - Filter ?category=Hackathon', hackathons.status === 200 && hackathons.data.length >= 1, `(Found ${hackathons.data?.length})`);

  const search = await request({ host: 'localhost', port: 5000, path: '/api/events?search=Web3', method: 'GET' });
  assert('Test 2c - Search ?search=Web3', search.status === 200 && search.data.length >= 1, `(Found ${search.data?.length})`);

  // 3. GET /api/events/:id
  const single = await request({ host: 'localhost', port: 5000, path: '/api/events/evt-1', method: 'GET' });
  assert('Test 3a - GET /api/events/evt-1', single.status === 200 && single.data?.id === 'evt-1', `(Title: "${single.data?.title}", registeredCount: ${single.data?.registeredCount})`);

  const missing = await request({ host: 'localhost', port: 5000, path: '/api/events/non-existent-id', method: 'GET' });
  assert('Test 3b - GET non-existent (404 expected)', missing.status === 404, `(${missing.status})`);

  // 4. POST /api/events (Validation)
  const invalidBody = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { title: 'ab' });
  assert('Test 4 - POST invalid body validation (400 expected)', invalidBody.status === 400 && invalidBody.data?.details?.length > 0, `(${invalidBody.status})`);

  // 5. POST /api/events (Success)
  const newEventPayload = {
    title: 'AI Agents & LLM Hackathon 2024',
    category: 'Hackathon',
    type: 'Hackathon',
    date: 'Nov 12 • 9:00 AM',
    time: '9:00 AM - 9:00 PM',
    venue: 'Computer Science Complex, Hall A',
    capacity: 2,
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
  assert('Test 5 - POST /api/events (201 expected)', createdEvent.status === 201 && Boolean(createdEvent.data?.id), `(ID: ${createdEvent.data?.id})`);

  const createdId = createdEvent.data?.id;

  // 6. PUT /api/events/:id
  const updatedEvent = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { venue: 'CS Auditorium Room 101' });
  assert('Test 6 - PUT /api/events/:id', updatedEvent.status === 200 && updatedEvent.data?.venue === 'CS Auditorium Room 101');

  // 7. Student Registration Validation
  // 7a: Invalid email format
  const invalidEmailReg = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Test Student',
    studentEmail: 'not-an-email',
    rollNumber: 'GTH-9999'
  });
  assert('Test 7a - Invalid email validation (400 expected)', invalidEmailReg.status === 400, `(${invalidEmailReg.status} - ${invalidEmailReg.data?.message})`);

  // 7b: Invalid phone number
  const invalidPhoneReg = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Test Student',
    studentEmail: 'test@campus.edu',
    studentPhone: '123',
    rollNumber: 'GTH-9999'
  });
  assert('Test 7b - Invalid phone validation (400 expected)', invalidPhoneReg.status === 400, `(${invalidPhoneReg.status})`);

  // 7c: Successful registration with complete form fields
  const fullFormReg = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Maya Lin',
    studentEmail: 'maya.lin@campus.edu',
    studentPhone: '+1 (555) 789-0123',
    rollNumber: 'GTH-5521',
    department: 'Computer Science & Engineering',
    yearOfStudy: 'Junior (Year 3)',
    collegeName: 'Campus Institute of Technology',
    additionalNotes: 'Need access to high-performance GPU cluster',
    seatPass: 'Zone A-01'
  });
  assert('Test 7c - Full student registration (201 expected)', fullFormReg.status === 201 && fullFormReg.data?.registration?.ticketId?.startsWith('TKT-'), `(Ticket: ${fullFormReg.data?.registration?.ticketId}, Reg: ${fullFormReg.data?.registration?.id})`);

  const generatedTicketId = fullFormReg.data?.registration?.ticketId;

  // 8. Duplicate Registration Prevention
  // 8a: Duplicate with same roll number
  const dupRoll = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Maya Lin Duplicate',
    studentEmail: 'maya.other@campus.edu',
    rollNumber: 'GTH-5521'
  });
  assert('Test 8a - Duplicate roll number rejection (409 expected)', dupRoll.status === 409, `(${dupRoll.status} - "${dupRoll.data?.message}")`);

  // 8b: Duplicate with normalization (case and prefix '#')
  const dupNormalized = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Maya Lin',
    rollNumber: '#gth-5521'
  });
  assert('Test 8b - Normalized duplicate rejection (409 expected)', dupNormalized.status === 409, `(${dupNormalized.status})`);

  // 9. Register 2nd student to reach capacity (capacity = 2)
  const reg2 = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'David Zhang',
    studentEmail: 'david.z@campus.edu',
    rollNumber: 'GTH-7711',
    department: 'Electrical Engineering',
    yearOfStudy: 'Senior (Year 4)'
  });
  assert('Test 9 - Register 2nd student (201 expected)', reg2.status === 201 && reg2.data?.event?.registeredCount === 2);

  // 10. Capacity Limit Enforcement (attempting 3rd registration when capacity is 2)
  const blockedReg = await request({
    host: 'localhost',
    port: 5000,
    path: `/api/events/${createdId}/register`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentName: 'Excess Student',
    studentEmail: 'excess@campus.edu',
    rollNumber: 'GTH-9900'
  });
  assert('Test 10 - Capacity limit rejection (409 expected)', blockedReg.status === 409, `(${blockedReg.status} - "${blockedReg.data?.message}")`);

  // 11. Event Registrations Consistency
  const eventRegs = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}/registrations`, method: 'GET' });
  assert('Test 11a - GET /api/events/:id/registrations', eventRegs.status === 200 && eventRegs.data?.count === 2);

  const eventCheck = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}`, method: 'GET' });
  assert('Test 11b - Enriched registeredCount matches stored records', eventCheck.data?.registeredCount === 2);

  // 12. Student Registrations Lookup
  const studentLookup = await request({ host: 'localhost', port: 5000, path: '/api/students/GTH-5521/registrations', method: 'GET' });
  assert('Test 12 - GET /api/students/:studentId/registrations', studentLookup.status === 200 && studentLookup.data?.count >= 1);

  // 13. Digital Ticket Verification
  // 13a: Valid ticket verification
  const validTicket = await request({ host: 'localhost', port: 5000, path: `/api/tickets/${encodeURIComponent(generatedTicketId)}/verify`, method: 'GET' });
  assert('Test 13a - GET /api/tickets/:id/verify (Valid Pass)', validTicket.status === 200 && validTicket.data?.valid === true && validTicket.data?.studentName === 'Maya Lin', `(Ticket: ${validTicket.data?.ticketId}, Event: ${validTicket.data?.event?.title})`);

  // 13b: Invalid ticket verification
  const invalidTicket = await request({ host: 'localhost', port: 5000, path: '/api/tickets/TKT-INVALID-CODE/verify', method: 'GET' });
  assert('Test 13b - GET /api/tickets/invalid/verify (404 expected)', invalidTicket.status === 404 && invalidTicket.data?.valid === false, `(${invalidTicket.status})`);

  // 14. Tasks Persistence API
  // 14a: List tasks
  const tasksList = await request({ host: 'localhost', port: 5000, path: '/api/tasks', method: 'GET' });
  assert('Test 14a - GET /api/tasks', tasksList.status === 200 && Array.isArray(tasksList.data), `(Found ${tasksList.data?.length} tasks)`);

  // 14b: Create task
  const createdTask = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/tasks',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    title: 'Verify Projector & Sound in Auditorium',
    assignee: 'Maya Patel'
  });
  assert('Test 14b - POST /api/tasks (201 expected)', createdTask.status === 201 && createdTask.data?.title === 'Verify Projector & Sound in Auditorium');

  const taskId = createdTask.data?.id;

  // 14c: Toggle task
  const toggledTask = await request({ host: 'localhost', port: 5000, path: `/api/tasks/${taskId}/toggle`, method: 'PATCH' });
  assert('Test 14c - PATCH /api/tasks/:id/toggle', toggledTask.status === 200 && toggledTask.data?.completed === true);

  // 14d: Delete task
  const deletedTask = await request({ host: 'localhost', port: 5000, path: `/api/tasks/${taskId}`, method: 'DELETE' });
  assert('Test 14d - DELETE /api/tasks/:id', deletedTask.status === 200);

  // 15. DELETE /api/events/:id with cascading registrations deletion
  const deleteEventRes = await request({ host: 'localhost', port: 5000, path: `/api/events/${createdId}`, method: 'DELETE' });
  assert('Test 15a - DELETE /api/events/:id', deleteEventRes.status === 200 && deleteEventRes.data?.deletedRegistrationsCount === 2, `(Cascaded ${deleteEventRes.data?.deletedRegistrationsCount} registrations)`);

  const deletedTicketCheck = await request({ host: 'localhost', port: 5000, path: `/api/tickets/${encodeURIComponent(generatedTicketId)}/verify`, method: 'GET' });
  assert('Test 15b - Deleted event registrations no longer verify as active', deletedTicketCheck.status === 404);

  console.log('==================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
