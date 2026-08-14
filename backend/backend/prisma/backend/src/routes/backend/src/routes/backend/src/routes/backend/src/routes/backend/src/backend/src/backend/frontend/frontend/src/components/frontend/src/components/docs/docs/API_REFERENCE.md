# API Reference - College Event Portal

## Base URL

\`http://localhost:5000/api\`

All API endpoints start with this URL.

---

## Authentication

For endpoints marked **[Protected]**, you need to send a JWT token in the header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN_HERE
\`\`\`

---

## 1. Authentication Endpoints

### Register New User

**POST** `/auth/register`

**Request Body:**
\`\`\`json
{
  "email": "user@college.edu",
  "password": "secure_password_123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CLUB_COORDINATOR"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@college.edu",
    "role": "CLUB_COORDINATOR"
  }
}
\`\`\`

---

### Login

**POST** `/auth/login`

**Request Body:**
\`\`\`json
{
  "email": "admin@college.edu",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "admin@college.edu",
    "firstName": "Admin",
    "lastName": "User",
    "role": "SUPER_ADMIN"
  }
}
\`\`\`

---

## 2. Event Endpoints

### Create Event [Protected]

**POST** `/events/create`

**Request Body:**
\`\`\`json
{
  "title": "Annual Tech Summit 2024",
  "description": "Meet leading tech innovators and network",
  "eventDate": "2024-09-15T10:00:00Z",
  "venue": "Main Auditorium",
  "capacity": 500,
  "duration": 180,
  "organizationId": "org_123",
  "isPaid": false
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Event created successfully",
  "event": {
    "id": "event_123",
    "title": "Annual Tech Summit 2024",
    "status": "DRAFT",
    "createdAt": "2024-09-01T10:00:00Z"
  }
}
\`\`\`

---

### Get All Events

**GET** `/events`

**Query Parameters (optional):**
- `status` - APPROVED, DRAFT, SUBMITTED, REJECTED
- `organizationId` - Filter by organization ID
- `venue` - Filter by venue name
- `fromDate` - Start date (2024-09-01)
- `toDate` - End date (2024-09-30)

**Example Request:**
\`\`\`
GET /events?status=APPROVED&fromDate=2024-09-01&toDate=2024-09-30
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Events retrieved",
  "total": 5,
  "events": [
    {
      "id": "event_123",
      "title": "Annual Tech Summit",
      "eventDate": "2024-09-15T10:00:00Z",
      "venue": "Main Auditorium",
      "capacity": 500,
      "status": "APPROVED",
      "organization": {
        "name": "Coding Club"
      }
    }
  ]
}
\`\`\`

---

### Check for Calendar Clash

**POST** `/events/check-clash`

**Request Body:**
\`\`\`json
{
  "venue": "Main Auditorium",
  "eventDate": "2024-09-15T10:00:00Z",
  "duration": 180
}
\`\`\`

**Response (No Clash):**
\`\`\`json
{
  "hasClash": false,
  "clashes": []
}
\`\`\`

**Response (Clash Found):**
\`\`\`json
{
  "hasClash": true,
  "clashes": [
    {
      "id": "booking_123",
      "venue": "Main Auditorium",
      "eventDate": "2024-09-15T10:00:00Z",
      "event": {
        "title": "Another Event",
        "organizationId": "org_456"
      }
    }
  ]
}
\`\`\`

---

## 3. Permission Workflow Endpoints

### Get Pending Approvals [Protected]

**GET** `/permissions/pending`

**Response:**
\`\`\`json
{
  "message": "Pending permissions",
  "total": 3,
  "permissions": [
    {
      "id": "perm_123",
      "status": "PENDING",
      "workflowLevel": "FACULTY_COORDINATOR",
      "event": {
        "title": "Tech Summit",
        "eventDate": "2024-09-15T10:00:00Z"
      },
      "requester": {
        "email": "coordinator@college.edu",
        "firstName": "John"
      }
    }
  ]
}
\`\`\`

---

### Approve Event [Protected]

**POST** `/permissions/:permissionId/approve`

**Request Body:**
\`\`\`json
{
  "approvalNotes": "Approved! Event looks great."
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Event approved and published!",
  "permission": {
    "id": "perm_123",
    "status": "APPROVED",
    "approvedAt": "2024-09-01T15:30:00Z"
  }
}
\`\`\`

---

### Reject Event [Protected]

**POST** `/permissions/:permissionId/reject`

**Request Body:**
\`\`\`json
{
  "rejectionReason": "Venue not available on that date"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Event rejected",
  "permission": {
    "id": "perm_123",
    "status": "REJECTED",
    "rejectionReason": "Venue not available on that date",
    "rejectedAt": "2024-09-01T15:30:00Z"
  }
}
\`\`\`

---

## 4. Registration Endpoints

### Register for Event

**POST** `/registrations/:eventId/register`

**Request Body:**
\`\`\`json
{
  "studentName": "Alice Smith",
  "studentEmail": "alice@student.edu",
  "studentPhone": "+91-9876543210"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Registered successfully",
  "registration": {
    "id": "reg_123",
    "studentName": "Alice Smith",
    "studentEmail": "alice@student.edu",
    "ticketId": "EVENT123-ABC123",
    "status": "CONFIRMED"
  },
  "ticket": {
    "ticketId": "EVENT123-ABC123"
  }
}
\`\`\`

---

### Get Event Registrations [Protected]

**GET** `/registrations/:eventId/registrations`

**Response:**
\`\`\`json
{
  "message": "Registrations retrieved",
  "eventTitle": "Annual Tech Summit",
  "totalRegistrations": 250,
  "registrations": [
    {
      "id": "reg_123",
      "studentName": "Alice Smith",
      "studentEmail": "alice@student.edu",
      "registrationDate": "2024-09-01T12:00:00Z",
      "paymentStatus": "PAID",
      "status": "CONFIRMED"
    }
  ]
}
\`\`\`

---

### Check-In (Scan Ticket)

**POST** `/registrations/checkin/:ticketId`

**Response:**
\`\`\`json
{
  "message": "Check-in successful",
  "student": "Alice Smith",
  "event": "Annual Tech Summit"
}
\`\`\`

---

## Error Responses

All errors return with appropriate HTTP status codes:

### 400 - Bad Request
\`\`\`json
{
  "error": "Missing required fields"
}
\`\`\`

### 401 - Unauthorized
\`\`\`json
{
  "error": "Invalid credentials"
}
\`\`\`

### 404 - Not Found
\`\`\`json
{
  "error": "Event not found"
}
\`\`\`

### 409 - Conflict
\`\`\`json
{
  "error": "Venue already booked for this date"
}
\`\`\`

### 500 - Server Error
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`

---

## Testing the APIs

You can test these APIs using a tool like **Postman**:

1. Download Postman: https://www.postman.com/downloads/
2. Create a new request
3. Select the HTTP method (GET, POST, etc.)
4. Enter the endpoint URL
5. Add request body (for POST requests)
6. Click "Send"

---
