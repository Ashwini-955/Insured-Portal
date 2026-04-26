# API Documentation & Testing Guide

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://yourdomain.com/api`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health & Status

#### Get Server Status
```
GET /
```
Response (200):
```json
{
  "message": "Insured Portal API is running",
  "version": "1.0.0",
  "status": "success",
  "timestamp": "2025-04-26T12:00:00.000Z"
}
```

#### Health Check
```
GET /health
```
Response (200):
```json
{
  "status": "ok",
  "timestamp": "2025-04-26T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  }
}
```

Error responses:
- 400: Invalid email format
- 404: No account with this email
- 403: Account is deactivated
- 500: Server error

### Policies

#### Get Policies by Email
```
GET /api/policies/email/:email
```

Response (200):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "policyNumber": "FPP001",
      "policyType": "Farm Insurance",
      "status": "Active",
      "effectiveDate": "2024-01-15",
      "expirationDate": "2025-01-15",
      "agent": {
        "name": "Agent Name",
        "phone": "123-456-7890",
        "email": "agent@example.com"
      },
      "coverages": [
        {
          "name": "Dwelling Coverage",
          "limit": 500000
        }
      ]
    }
  ]
}
```

Error responses:
- 400: Email is required or invalid format
- 404: No policies found for this email
- 500: Server error

### Claims

#### Get Claims by Policy Numbers
```
GET /api/claims?policyNumbers=FPP001,FPP002
```

Response (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ClaimNumber": "CFPD123456-00-04262025-01",
      "PolicyNumber": "FPP001",
      "Status": "Pending Review",
      "LossDate": "2025-04-20",
      "ReceivedDate": "2025-04-22",
      "DescriptionOfLoss": "Roof damage from storm",
      "Location": "123 Farm Lane, State, 12345",
      "IncidentTime": "14:30",
      "PaidLoss": 0,
      "Images": ["https://cloudinary.com/..."]
    }
  ]
}
```

#### Create Claim
```
POST /api/claims
Content-Type: multipart/form-data

{
  "policyNumber": "FPP001",
  "incidentDate": "2025-04-20",
  "incidentTime": "14:30",
  "location": "123 Farm Lane",
  "description": "Damage from storm",
  "accidentCode": "WIND01",
  "images": [file1, file2, ...]  // up to 5 files
}
```

Response (201):
```json
{
  "success": true,
  "message": "Claim created successfully",
  "data": {
    "ClaimNumber": "CFPD123456-00-04202025-01",
    "PolicyNumber": "FPP001",
    "Status": "Pending Review"
  }
}
```

Error responses:
- 400: Missing required fields or invalid format
- 500: Server error

### Billing

#### Get Billing by Policy Numbers
```
GET /api/billing?policyNumbers=FPP001,FPP002
```

Response (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "PolicyNumber": "FPP001",
      "currentAmountDue": 250.00,
      "currentDueDate": "2025-05-15",
      "accountTotalBalance": 500.00,
      "projectedStatements": [
        {
          "status": "due",
          "statementDueDate": "2025-05-15",
          "statementTotalAmountDue": 250.00
        }
      ]
    }
  ]
}
```

#### Send Payment Email
```
POST /api/billing/send-payment-email
Content-Type: application/json

{
  "policyNumber": "FPP001",
  "email": "user@example.com",
  "amount": 250.00
}
```

Response (200):
```json
{
  "success": true,
  "message": "Payment email sent successfully"
}
```

Error responses:
- 400: Missing required fields or invalid format
- 404: Policy not found
- 500: Server error

### AI Services

#### Analyze Images
```
POST /api/ai/analyze-images
Content-Type: application/json

{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "data:image/jpeg;base64,..."
  ]
}
```

Response (200):
```json
{
  "success": true,
  "description": "Significant damage to roof with multiple shingles missing. Tree branch impact visible on west side. Gutters dislodged."
}
```

#### RAG Chat (Insurance Knowledge)
```
POST /api/chat/rag
Content-Type: application/json

{
  "message": "What types of coverage are available?"
}
```

Response (200):
```json
{
  "success": true,
  "userQuestion": "What types of coverage are available?",
  "answer": "We offer the following coverage types...",
  "sources": [
    {
      "title": "Coverage Options",
      "score": "0.8234"
    }
  ]
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid email format",
  "details": [...]
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "No policies found for this email"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error",
  "message": "Internal Server Error"
}
```

## Testing Checklist

### Authentication
- [ ] Login with valid email
- [ ] Login with invalid email
- [ ] Login with non-existent account
- [ ] Login with deactivated account

### Policies
- [ ] Get policies with valid email
- [ ] Get policies with invalid email
- [ ] Get policies with no results
- [ ] Verify policy details are complete

### Claims
- [ ] Get claims with valid policy numbers
- [ ] Get claims with invalid format
- [ ] Create claim with all required fields
- [ ] Create claim with images
- [ ] Create claim with missing fields

### Billing
- [ ] Get billing with valid policy numbers
- [ ] Get billing with invalid format
- [ ] Send payment email with valid data
- [ ] Send payment email with invalid data

### AI Services
- [ ] Analyze images successfully
- [ ] Analyze with no images
- [ ] Analyze with too many images
- [ ] Chat with valid message
- [ ] Chat with empty message

### Error Handling
- [ ] 400 Bad Request errors
- [ ] 404 Not Found errors
- [ ] 500 Server errors
- [ ] Validation errors
- [ ] Authentication errors

### Performance
- [ ] Response time < 500ms for GET requests
- [ ] Response time < 1000ms for POST requests
- [ ] Database queries use indexes
- [ ] No memory leaks in long-running tests

### Security
- [ ] CORS headers correctly set
- [ ] XSS headers enabled
- [ ] SQL injection prevention works
- [ ] JWT expiration works
- [ ] Rate limiting functions (if implemented)

## cURL Testing Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Get Policies
```bash
curl -X GET http://localhost:5000/api/policies/email/user@example.com \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Claim
```bash
curl -X POST http://localhost:5000/api/claims \
  -F "policyNumber=FPP001" \
  -F "incidentDate=2025-04-20" \
  -F "description=Damage description" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Health Check
```bash
curl http://localhost:5000/health
```
