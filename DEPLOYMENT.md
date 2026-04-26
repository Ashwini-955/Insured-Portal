# Insured Portal - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Insured Portal application (frontend + backend) to production.

## Prerequisites
- Node.js 18+ installed
- MongoDB instance (Atlas or self-hosted)
- Cloudinary account (for image uploads)
- Google Gemini API key (for AI features)
- Git installed

## Backend Setup

### 1. Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secure-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database Indexes

```bash
npm run setup:db
```

This creates necessary indexes for optimal query performance.

### 4. Start Backend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:5000`.

### 5. Verify Backend

Test the API with:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "environment": "production"
}
```

## Frontend Setup

### 1. Environment Configuration

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build for Production

```bash
npm run build
```

### 4. Start Frontend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The frontend will start on `http://localhost:3000`.

## API Health Checks

Available health check endpoints:

- `GET /` - Basic server status
- `GET /health` - Detailed health check with uptime
- `POST /api/chat/test-retrieval` - Test RAG system

Example:
```bash
curl http://localhost:5000/health
```

## Error Handling

The application includes comprehensive error handling:

- **Type validation** on all inputs
- **Sanitization** of user inputs to prevent injection
- **Proper HTTP status codes** for different error scenarios
- **Detailed error messages** in development, sanitized in production
- **Graceful shutdown** handling for SIGTERM/SIGINT signals

## Database Optimization

### Indexes Created

The `setup:db` script creates the following indexes:

**Users:**
- `email` (unique index)

**Policies:**
- `insured.email` - For email-based policy lookup
- `PolicyNumber` - For policy retrieval
- `status` - For filtering by status

**Claims:**
- `PolicyNumber` - For policy-based claim lookup
- `ClaimNumber` (unique index)
- `Status` - For filtering claims
- `LossDate` - For date-based filtering

**Billing:**
- `PolicyNumber` - For policy-based billing lookup
- `currentDueDate` - For finding upcoming payments

### Query Optimization

All read operations use `.lean()` for better performance:
- Reduces memory usage
- Faster query execution
- Appropriate for read-only operations

## Security Features

### CORS
- Configured with `ALLOWED_ORIGINS` environment variable
- Restricts cross-origin requests to authorized domains
- Includes security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security`

### Input Validation
- Email validation
- Policy number format validation
- String sanitization
- Length restrictions

### Authentication
- JWT-based authentication
- 7-day token expiration
- Secure secret key configuration

## Monitoring & Logging

### Request Logging
All requests are logged with:
- HTTP method and path
- Response status code
- Response time in milliseconds
- Error level indication

Example log output:
```
[INFO] GET /api/policies/email/user@example.com - 200 (45ms)
[WARN] POST /api/claims - 400 (12ms)
[ERROR] POST /api/chat/rag - 500 (320ms)
```

## Deployment to Production

### Using PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'insured-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'insured-frontend',
      script: './frontend/npm',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

3. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Using Docker

Create `Dockerfile` in backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t insured-backend .
docker run -p 5000:5000 --env-file .env insured-backend
```

## Troubleshooting

### Connection Issues
- Verify MongoDB connection string in `.env`
- Check if MongoDB cluster allows your IP
- Ensure Firewall allows port 5000

### Image Upload Failures
- Verify Cloudinary credentials are correct
- Check folder permissions in Cloudinary
- Test with `npm run test` (if available)

### AI Service Errors
- Verify GEMINI_API_KEY is set
- Check API quota in Google Cloud Console
- Ensure API is enabled for your project

### Database Slow Queries
- Run `npm run setup:db` to create indexes
- Monitor MongoDB performance metrics
- Consider query optimization if issues persist

## Performance Optimization

### Backend
- ✅ Database indexes for common queries
- ✅ `.lean()` queries for read operations
- ✅ Proper error handling to prevent memory leaks
- ✅ CORS pre-flight caching (600s)
- ✅ Request logging with minimal overhead

### Frontend
- ✅ Next.js production build optimization
- ✅ React 19 with improved performance
- ✅ Proper error boundaries
- ✅ Efficient API calls with abort signals

## Support & Maintenance

- Monitor logs regularly using `pm2 logs`
- Set up alerts for error rates
- Regularly update dependencies: `npm update`
- Test API endpoints after deployments
- Keep MongoDB backups updated
- Review and rotate secrets quarterly
