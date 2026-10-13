# Gatherly - Backend Architecture & Setup Guide

This document describes the backend architecture, JSON persistent storage, REST API endpoints, digital gate pass ticket verification, testing procedures, and operational details for the **Gatherly** campus event management platform.

---

## 1. Required Software

- **Node.js**: v18.0.0 or later (Tested on Node v24.21.0)
- **npm**: v9.0.0 or later (Tested on npm v11.19.0)
- **PowerShell / Bash / Command Prompt** (Windows, macOS, Linux compatible)

---

## 2. Project Structure & Data Storage

All persistent records are stored in atomic JSON data files located at:
- **Events Data**: `server/data/events.json`
- **Registrations Data**: `server/data/registrations.json`
- **Organizer Tasks Data**: `server/data/tasks.json`

### Storage Layer Guarantees
- **Safe Initialization / Migration**: If the storage files do not exist, the server automatically initializes them on first boot with seed data preserving the original mock data. The server **never** duplicates or re-seeds records on subsequent restarts.
- **Atomic Writes**: All file mutations write to an isolated temporary file (`.tmp`) before renaming, protecting data from corruption in case of unexpected process termination or concurrent requests.
- **Mutex Concurrency Queue**: Concurrent reads and writes are serialized through an asynchronous lock to avoid race conditions.
- **Single Source of Truth**: `registeredCount` on every event is strictly calculated from matching records in `registrations.json`, preventing frontend state tampering or out-of-sync counts.
- **No Mock Fallbacks in APIs**: The backend and frontend communicate via real HTTP REST endpoints.

---

## 3. Installation & Setup

Navigate into the project directory (e.g., `Mini-Project-main`):

```bash
# Install all frontend and backend dependencies
npm install
```

*(Note for Windows PowerShell users: if running scripts is restricted by PowerShell ExecutionPolicy, use `npm.cmd install` and `npm.cmd run dev`)*.

---

## 4. Commands to Run the Application

| Command | Action | URL |
| :--- | :--- | :--- |
| `npm run dev` | Runs backend server & Vite frontend together | Frontend: `http://localhost:5173`<br>Backend: `http://localhost:5000` |
| `npm run server` | Runs only the Express backend with hot reloading (`tsx`) | `http://localhost:5000` |
| `npm run client` | Runs only the Vite frontend dev server | `http://localhost:5173` |
| `npm run build` | Compiles frontend for production | Outputs to `dist/` |
| `npm run lint` | Runs TypeScript compiler verification (`tsc --noEmit`) | Console output |
| `node server/test_api.cjs` | Runs the automated API test suite against running server | 27 passing tests |

---

## 5. API Endpoints & Example Requests

### Base URL: `http://localhost:5000` (or `/api` via Vite proxy)

### Health Check
- **`GET /api/health`**
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "service": "Gatherly Campus Event Management API",
      "version": "1.1.0",
      "timestamp": "2026-10-14T01:00:00.000Z"
    }
    ```

---

### Feature 1: Event Management API

#### 1. `GET /api/events`
Returns all events with calculated `registeredCount`. Supports optional query filtering.
- **Query Parameters**:
  - `category` (optional, string): Case-insensitive category match (e.g. `Hackathon`, `Tech Workshop`)
  - `search` or `q` (optional, string): Case-insensitive search on title, description, venue, or category
- **Example Response (200 OK)**:
  ```json
  [
    {
      "id": "evt-1",
      "title": "Intro to Web3 & Smart Contracts",
      "category": "Tech Workshop",
      "type": "Tech Workshop",
      "status": "Active",
      "date": "Oct 24 • 5:00 PM",
      "time": "5:00 PM - 7:30 PM",
      "venue": "Innovation Center, Room 204",
      "registeredCount": 3,
      "capacity": 150,
      "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      "description": "Hands-on session on Ethereum development...",
      "eligibleYears": ["Freshman", "Sophomore", "Junior", "Senior"],
      "seatPass": "Zone B-14",
      "organizer": "GDSC Web3 Chapter"
    }
  ]
  ```

#### 2. `GET /api/events/:id`
Returns a single event by ID.
- **Response (200 OK)**: Event object.
- **Response (404 Not Found)**:
  ```json
  {
    "error": "Event not found",
    "message": "No event found with id 'evt-unknown'"
  }
  ```

#### 3. `POST /api/events`
Creates and saves a new event to `server/data/events.json`. Generates a unique event ID on the server.
- **Request Body**:
  ```json
  {
    "title": "Quantum Computing Workshop",
    "category": "Tech Workshop",
    "date": "Nov 15, 2024",
    "time": "3:00 PM - 5:00 PM",
    "venue": "Physics Lab 301",
    "capacity": 75,
    "description": "Exploration of quantum qubit superposition and algorithms.",
    "organizer": "Quantum Computing Society"
  }
  ```
- **Validation**: Requires `title` (min 3 chars), `date`, `time`, `venue`, `category`, and positive `capacity`. Returns `400 Bad Request` with array of descriptive error details if validation fails.
- **Response (201 Created)**: Created event object with generated `id` and `registeredCount: 0`.

#### 4. `PUT /api/events/:id`
Updates an existing event.
- **Protected Fields**: `id` cannot be altered, and `registeredCount` is always calculated strictly from stored registrations.
- **Response (200 OK)**: Updated event object.
- **Response (404 Not Found)**: If event does not exist.

#### 5. `DELETE /api/events/:id`
Deletes an event from `server/data/events.json` and cascades deletion of all associated registrations from `server/data/registrations.json`.
- **Response (200 OK)**:
  ```json
  {
    "message": "Event and associated registrations deleted successfully",
    "id": "evt-123",
    "deletedRegistrationsCount": 2
  }
  ```
- **Response (404 Not Found)**: If event ID does not exist.

---

### Feature 2: Student Event Registration API

#### 1. `POST /api/events/:id/register`
Registers a student for an existing event with complete academic & contact information.
- **Request Body**:
  ```json
  {
    "studentName": "Alex Chen",
    "studentEmail": "alex.chen@campus.edu",
    "studentPhone": "+1 (555) 234-5678",
    "rollNumber": "GTH-8821",
    "department": "Computer Science & Engineering",
    "yearOfStudy": "Senior (Year 4)",
    "collegeName": "Campus Institute of Technology",
    "additionalNotes": "Interested in Solidity development demo",
    "seatPass": "Zone B-14"
  }
  ```
- **Backend Validation**:
  1. Validates that the target event exists (returns `404 Not Found` if missing).
  2. Validates student name, email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), phone digits (min 7 digits), and university roll number.
  3. Prevents duplicate registrations for the same event and student (normalized against leading `#` and case-insensitive check; returns `409 Conflict`).
  4. Enforces capacity limit: rejects registration if `registeredCount >= capacity` (returns `409 Conflict`).
  5. Generates unique Ticket Pass ID (e.g., `TKT-EVT1-A8F2K9`) and atomic registration ID.
- **Response (201 Created)**:
  ```json
  {
    "message": "Successfully registered for 'Intro to Web3 & Smart Contracts'.",
    "registration": {
      "id": "reg-1728828900000-xyz",
      "eventId": "evt-1",
      "studentId": "GTH-8821",
      "studentName": "Alex Chen",
      "studentEmail": "alex.chen@campus.edu",
      "studentPhone": "+1 (555) 234-5678",
      "rollNumber": "GTH-8821",
      "department": "Computer Science & Engineering",
      "yearOfStudy": "Senior (Year 4)",
      "collegeName": "Campus Institute of Technology",
      "ticketId": "TKT-EVT1-ALEXCHEN",
      "seatPass": "Zone B-14",
      "registeredAt": "2026-10-14T01:05:00.000Z",
      "status": "Confirmed"
    },
    "event": {
      "id": "evt-1",
      "title": "Intro to Web3 & Smart Contracts",
      "registeredCount": 4,
      "capacity": 150
    }
  }
  ```

#### 2. `GET /api/events/:id/registrations`
Returns all attendees and registration count for a specific event.
- **Response (200 OK)**:
  ```json
  {
    "eventId": "evt-1",
    "eventTitle": "Intro to Web3 & Smart Contracts",
    "count": 3,
    "capacity": 150,
    "registrations": [...]
  }
  ```

#### 3. `GET /api/students/:studentId/registrations`
Returns all registered events for a specific student ID or roll number (normalizes `#` prefix).
- **Response (200 OK)**:
  ```json
  {
    "studentId": "GTH-8821",
    "count": 2,
    "registrations": [
      {
        "registration": { ... },
        "event": { ... }
      }
    ]
  }
  ```

---

### Feature 3: Digital Gate Pass & Ticket Verification API

#### 1. `GET /api/tickets/:ticketId/verify`
Scanners or event administrators query this endpoint to authenticate a student's digital gate pass at the venue entrance.
- **Example Valid Response (200 OK)**:
  ```json
  {
    "valid": true,
    "ticketId": "TKT-EVT1-ALEXCHEN",
    "registrationId": "reg-seed-1",
    "studentId": "#GTH-8821",
    "studentName": "Alex Chen",
    "studentEmail": "alex.chen@campus.edu",
    "rollNumber": "GTH-8821",
    "department": "Computer Science & Engineering",
    "yearOfStudy": "Senior (Year 4)",
    "seatPass": "Zone B-14",
    "registeredAt": "2024-10-10T12:00:00.000Z",
    "status": "Confirmed",
    "event": {
      "id": "evt-1",
      "title": "Intro to Web3 & Smart Contracts",
      "category": "Tech Workshop",
      "date": "Oct 24 • 5:00 PM",
      "time": "5:00 PM - 7:30 PM",
      "venue": "Innovation Center, Room 204",
      "organizer": "GDSC Web3 Chapter"
    },
    "message": "Gate pass successfully verified and approved for entry.",
    "verifiedAt": "2026-10-14T01:08:00.000Z"
  }
  ```
- **Example Invalid Response (404 Not Found)**:
  ```json
  {
    "valid": false,
    "ticketId": "TKT-INVALID",
    "error": "Ticket not found",
    "message": "No gate pass or registration matches ticket ID 'TKT-INVALID'.",
    "verifiedAt": "2026-10-14T01:08:00.000Z"
  }
  ```

---

### Feature 4: Organizer Tasks Persistence API

#### 1. `GET /api/tasks`
Lists all organizer preparation tasks from `server/data/tasks.json`.

#### 2. `POST /api/tasks`
Adds a new preparation task:
```json
{
  "title": "Confirm Audio Visual Equipment",
  "assignee": "Maya Patel",
  "assigneeAvatar": "https://..."
}
```

#### 3. `PATCH /api/tasks/:id/toggle`
Toggles task completion status (`completed: true / false`).

#### 4. `DELETE /api/tasks/:id`
Removes a task from persistent storage.

---

## 6. Frontend Features & User Experience

### Student Portal Event Registration Flow
1. **Discover Events**:
   - Every upcoming event displays date, time, venue, available seats, and a clear **Register Now** button.
   - Clicking on any event card opens the **Event Details Modal** (`EventDetailsModal.tsx`) showing full description, eligible cohorts, capacity status, and action buttons.
2. **Registration Modal** (`EventRegistrationModal.tsx`):
   - Opens when the student clicks "Register Now".
   - Collects: Full Name, Email Address, Phone Number, University Roll Number, Department/Branch, Year of Study, College Name, and optional notes.
   - Performs inline validation with clear error messages beside invalid fields.
   - Disables and indicates loading state during submission.
3. **Registration Confirmation & Digital Ticket**:
   - Displays a success card with registration ID and Ticket Pass ID.
   - Immediately updates the event's registration status and capacity count on the frontend and backend.
   - Disables the "Register Now" button for already-registered events.
   - Offers instant one-click access to the **Digital Gate Pass** (`TicketModal.tsx`).
4. **Digital Ticket Pass** (`TicketModal.tsx`):
   - Generates a **real, scannable QR Code** dynamically using the `qrcode` library.
   - Displays ticket ID with quick copy button, attendee name, roll number, seat allocation, and verification badge.
5. **My Registrations Section**:
   - Dedicated section on the Student Portal displaying all confirmed events the student has registered for.
   - Connected to backend registration APIs (`/api/students/:studentId/registrations`).
   - Includes "View Ticket" and "View Details" buttons for quick gate pass retrieval.

---

## 7. Cloud Deployment & CORS Configuration

- **Host Binding**: The server binds to `0.0.0.0` and reads port dynamically via `process.env.PORT` (defaults to `5000` locally).
- **CORS Allowed Origins**:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `http://localhost:5000`
  - `https://gatherly-tau-two.vercel.app` (production frontend)
  - Configurable via `process.env.CORS_ORIGIN` (comma-separated list of origins)
- **Vite Proxy**: Local dev frontend seamlessly proxies `/api` to `http://localhost:5000`. In production, `src/services/api.ts` uses `import.meta.env.VITE_API_BASE_URL || '/api'`.

---

## 8. Automated Test Suite Results

Run tests at any time with:
```bash
node server/test_api.cjs
```

**Test Coverage Summary (27 Test Cases - 100% Passing)**:
- [x] Health check response
- [x] Listing events with category and search filtering
- [x] Single event retrieval and 404 handling
- [x] Event creation validation and persistent creation
- [x] Event update with protected fields
- [x] Student registration with invalid email format rejection (400)
- [x] Student registration with invalid phone format rejection (400)
- [x] Student registration with complete fields & ticket generation (201)
- [x] Duplicate registration rejection by roll number (409)
- [x] Normalized duplicate registration rejection with `#` prefix (409)
- [x] Capacity limit enforcement (409)
- [x] Event registrations count consistency with stored records
- [x] Student registrations lookup
- [x] Valid Digital Gate Pass ticket verification
- [x] Invalid ticket rejection (404)
- [x] Organizer tasks listing, creation, status toggle, and deletion
- [x] Cascading registration deletion upon event removal
