const http = require('http');
const { spawn } = require('child_process');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQrAttendanceTests() {
  console.log('================================================================');
  console.log('   GATHERLY QR ATTENDANCE & DUAL-MODE SCANNER TEST SUITE');
  console.log('================================================================');

  let serverProcess = null;
  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  // 1. Check if server is already running on port 5000, if not start it
  let serverRunning = false;
  try {
    const health = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    if (health.status === 200) {
      serverRunning = true;
      console.log('[Setup] Existing server found running on http://localhost:5000');
    }
  } catch (err) {
    serverRunning = false;
  }

  if (!serverRunning) {
    console.log('[Setup] Spawning backend server on port 5000...');
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    serverProcess = spawn(npxCmd, ['tsx', 'server/server.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: '5000' },
      stdio: 'pipe',
      shell: true,
    });

    serverProcess.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line.includes('running')) {
        console.log(`  [Server]: ${line}`);
      }
    });

    // Wait for server to come online
    let attempts = 0;
    while (attempts < 15) {
      await sleep(1000);
      try {
        const res = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
        if (res.status === 200) {
          console.log('[Setup] Server successfully started and responding on http://localhost:5000\n');
          break;
        }
      } catch (e) {
        attempts++;
      }
    }
  }

  try {
    // PREPARATION: Create a fresh event and register two distinct attendees
    console.log('\n--- Step 1: Create Test Events & Registrations ---');
    
    // Create Event A
    const eventARes = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/events',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Cybersecurity Gate Pass Summit 2026',
        category: 'Tech Workshop',
        venue: 'Engineering Hall Alpha',
        capacity: 100,
        date: 'Nov 15, 2026',
        time: '10:00 AM',
        organizer: 'GDSC Security Chapter',
      }
    );
    assert('1a. Create Target Event A', eventARes.status === 201 && eventARes.data?.id, `(ID: ${eventARes.data?.id})`);
    const eventAId = eventARes.data?.id;

    // Create Event B
    const eventBRes = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/events',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Design Systems Expo 2026',
        category: 'Design Sprint',
        venue: 'Studio Beta',
        capacity: 50,
        date: 'Nov 16, 2026',
        time: '2:00 PM',
        organizer: 'UI/UX Guild',
      }
    );
    assert('1b. Create Alternative Event B', eventBRes.status === 201 && eventBRes.data?.id, `(ID: ${eventBRes.data?.id})`);
    const eventBId = eventBRes.data?.id;

    // Register Student 1 for Event A
    const regStudent1 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/events/${eventAId}/register`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        studentId: 'STU-ALPHA-001',
        studentName: 'Alice Gatekeeper',
        studentEmail: 'alice@gate.campus.edu',
        studentPhone: '+1-555-0199',
        rollNumber: 'CS26-001',
        department: 'Cybersecurity',
        yearOfStudy: 'Year 3',
      }
    );
    assert(
      '1c. Register Student 1 for Event A',
      regStudent1.status === 201 && regStudent1.data?.registration?.ticketId,
      `Ticket ID: ${regStudent1.data?.registration?.ticketId}`
    );
    const ticketA = regStudent1.data?.registration?.ticketId;

    // Register Student 2 for Event B
    const regStudent2 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/events/${eventBId}/register`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        studentId: 'STU-BETA-002',
        studentName: 'Bob Crosswire',
        studentEmail: 'bob@design.campus.edu',
        studentPhone: '+1-555-0288',
        rollNumber: 'DS26-002',
        department: 'Interaction Design',
        yearOfStudy: 'Year 2',
      }
    );
    assert(
      '1d. Register Student 2 for Event B',
      regStudent2.status === 201 && regStudent2.data?.registration?.ticketId,
      `Ticket ID: ${regStudent2.data?.registration?.ticketId}`
    );
    const ticketB = regStudent2.data?.registration?.ticketId;

    // --- Step 2: Verification Endpoint Inspection ---
    console.log('\n--- Step 2: Ticket Verification Lookup ---');
    const verifyBefore = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: `/api/tickets/${encodeURIComponent(ticketA)}/verify`,
      method: 'GET',
    });
    assert(
      '2a. Initial Verification of Ticket A',
      verifyBefore.status === 200 &&
        verifyBefore.data?.valid === true &&
        verifyBefore.data?.checkedIn === false &&
        verifyBefore.data?.studentName === 'Alice Gatekeeper',
      `Valid: ${verifyBefore.data?.valid}, CheckedIn: ${verifyBefore.data?.checkedIn}`
    );

    // --- Step 3: Option B External Scanner URL Normalization ---
    console.log('\n--- Step 3: Option B External Scanner Full URL Input ---');
    const fullVerificationUrl = `https://gatherly-tau-two.vercel.app/verify?ticket=${encodeURIComponent(ticketA)}`;
    const checkInWithUrl = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/tickets/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Role': 'organizer',
        },
      },
      {
        ticketId: fullVerificationUrl,
        eventId: eventAId,
        organizerName: 'North Gate Turnstile',
      }
    );
    assert(
      '3. Check-In via Full External Scanner URL (Option B)',
      checkInWithUrl.status === 200 &&
        checkInWithUrl.data?.status === 'checked_in' &&
        checkInWithUrl.data?.studentName === 'Alice Gatekeeper',
      `Status: ${checkInWithUrl.data?.status}, CheckedInAt: ${checkInWithUrl.data?.checkedInAt}`
    );

    // --- Step 4: Duplicate Check-In Prevention ---
    console.log('\n--- Step 4: Duplicate Check-In Prevention ---');
    const duplicateCheckIn = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/tickets/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Role': 'organizer',
        },
      },
      {
        ticketId: ticketA,
        eventId: eventAId,
        organizerName: 'South Gate Turnstile',
      }
    );
    assert(
      '4. Reject Duplicate Check-In with HTTP 409',
      duplicateCheckIn.status === 409 &&
        duplicateCheckIn.data?.status === 'already_checked_in' &&
        duplicateCheckIn.data?.originalCheckedInAt,
      `Status code: ${duplicateCheckIn.status}, Message: "${duplicateCheckIn.data?.message}"`
    );

    // --- Step 5: Wrong Event Ticket Check-In Rejection ---
    console.log('\n--- Step 5: Wrong Event Rejection ---');
    // Try to check in Ticket B (belongs to Event B) at Event A
    const wrongEventCheckIn = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/tickets/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Role': 'organizer',
        },
      },
      {
        ticketId: ticketB,
        eventId: eventAId, // Expected Event A, but ticket is for Event B!
        organizerName: 'North Gate Turnstile',
      }
    );
    assert(
      '5. Reject Wrong Event Ticket with HTTP 422',
      wrongEventCheckIn.status === 422 &&
        wrongEventCheckIn.data?.status === 'wrong_event' &&
        wrongEventCheckIn.data?.actualEvent?.id === eventBId,
      `Status code: ${wrongEventCheckIn.status}, Message: "${wrongEventCheckIn.data?.message}"`
    );

    // --- Step 6: Invalid / Fake Ticket Rejection ---
    console.log('\n--- Step 6: Invalid Ticket Rejection ---');
    const fakeTicketCheckIn = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/tickets/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Role': 'organizer',
        },
      },
      {
        ticketId: 'TKT-FORGERY-999999',
        eventId: eventAId,
      }
    );
    assert(
      '6. Reject Fake Ticket with HTTP 404',
      fakeTicketCheckIn.status === 404 && fakeTicketCheckIn.data?.status === 'invalid_ticket',
      `Status code: ${fakeTicketCheckIn.status}, Message: "${fakeTicketCheckIn.data?.message}"`
    );

    // --- Step 7: Unauthorized Student Role Rejection ---
    console.log('\n--- Step 7: Unauthorized Student Check-In Rejection ---');
    const studentCheckIn = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/tickets/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'student',
        },
      },
      {
        ticketId: ticketB,
        eventId: eventBId,
        role: 'student',
      }
    );
    assert(
      '7. Reject Student Check-In Attempt with HTTP 403 Forbidden',
      studentCheckIn.status === 403 &&
        studentCheckIn.data?.status === 'unauthorized',
      `Status code: ${studentCheckIn.status}, Message: "${studentCheckIn.data?.message}"`
    );

    // --- Step 8: Option A In-App Scanner Check-In of Valid Ticket B ---
    console.log('\n--- Step 8: Option A In-App Camera/Manual Check-In ---');
    const validCheckInB = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/tickets/${encodeURIComponent(ticketB)}/check-in`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Role': 'organizer',
        },
      },
      {
        eventId: eventBId,
        organizerName: 'In-App Camera Scanner Lead',
      }
    );
    assert(
      '8. In-App Check-In of Ticket B (Option A)',
      validCheckInB.status === 200 &&
        validCheckInB.data?.status === 'checked_in' &&
        validCheckInB.data?.studentName === 'Bob Crosswire',
      `Status: ${validCheckInB.data?.status}, Attendee: ${validCheckInB.data?.studentName}`
    );

    // --- Step 9: Post-Check-In Verification State Check ---
    console.log('\n--- Step 9: Verify Final Attendance State ---');
    const verifyAfter = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: `/api/tickets/${encodeURIComponent(ticketA)}/verify`,
      method: 'GET',
    });
    assert(
      '9. Public Verification Reflects Checked-In & Attended Status',
      verifyAfter.status === 200 &&
        verifyAfter.data?.checkedIn === true &&
        verifyAfter.data?.status === 'Attended' &&
        verifyAfter.data?.checkedInAt,
      `Status: ${verifyAfter.data?.status}, CheckedIn: ${verifyAfter.data?.checkedIn}, At: ${verifyAfter.data?.checkedInAt}`
    );

  } catch (error) {
    console.error('[Error during test execution]:', error);
    failed++;
  } finally {
    if (serverProcess) {
      console.log('\n[Teardown] Shutting down spawned test server...');
      serverProcess.kill('SIGINT');
    }
  }

  console.log('\n================================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runQrAttendanceTests();
