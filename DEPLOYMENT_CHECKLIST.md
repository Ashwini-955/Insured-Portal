# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All TypeScript/linting errors resolved
- [ ] No console.log() statements in production code
- [ ] All error handlers properly implemented
- [ ] Input validation on all endpoints
- [ ] Environment variables validated at startup

### Testing
- [ ] Unit tests passing (if available)
- [ ] Integration tests passing (if available)
- [ ] API endpoints tested with sample data
- [ ] Error scenarios tested
- [ ] Image upload tested
- [ ] AI image analysis tested
- [ ] RAG chat functionality tested
- [ ] Database indexes created

### Security
- [ ] CORS configured for production domain
- [ ] JWT secret changed from default
- [ ] Sensitive data removed from code/logs
- [ ] HTTPS enabled (in production)
- [ ] Security headers configured
- [ ] Database credentials secured
- [ ] API keys secured in environment variables
- [ ] No exposed database connection strings

### Configuration
- [ ] .env file created with all required variables
- [ ] .env.example updated (without secrets)
- [ ] PORT configured correctly
- [ ] NODE_ENV set to production
- [ ] ALLOWED_ORIGINS set appropriately
- [ ] Database connection tested
- [ ] Cloudinary credentials verified
- [ ] Gemini API key verified

---

## Backend Deployment

### Setup
- [ ] Clone/pull code from repository
- [ ] Navigate to `backend` directory
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all environment variables
- [ ] Run `npm install`
- [ ] Run `npm run setup:db` to create indexes
- [ ] Test database connection: `node -e "require('./config/db')()"`

### Verification
- [ ] Backend starts: `npm start`
- [ ] Health check passes: `curl http://localhost:5000/health`
- [ ] API is accessible: `curl http://localhost:5000/`
- [ ] All routes are working
- [ ] Error handling is functioning
- [ ] Logging is working

### Deployment Method
Choose one:

#### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start npm --name "insured-backend" -- start
pm2 save
pm2 startup
```

#### Option 2: Docker
```bash
docker build -t insured-backend .
docker run -d -p 5000:5000 --env-file .env insured-backend
```

#### Option 3: Traditional Server
```bash
npm install --production
npm start &
```

---

## Frontend Deployment

### Setup
- [ ] Navigate to `frontend` directory
- [ ] Copy `.env.example` to `.env.local` (or `.env.production`)
- [ ] Update NEXT_PUBLIC_API_URL to production backend URL
- [ ] Run `npm install`
- [ ] Test build: `npm run build`
- [ ] Test run: `npm start`

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel deploy
```

#### Option 2: Docker
```bash
docker build -t insured-frontend .
docker run -d -p 3000:3000 insured-frontend
```

#### Option 3: Traditional Server
```bash
npm run build
npm start &
```

---

## Post-Deployment Verification

### API Tests
- [ ] Login endpoint works
- [ ] Policy retrieval works
- [ ] Claims API works
- [ ] Billing API works
- [ ] AI services work
- [ ] RAG chat works
- [ ] Error handling works

### Frontend Tests
- [ ] Application loads
- [ ] Login page displays
- [ ] Dashboard loads after login
- [ ] All navigation works
- [ ] Chatbot appears
- [ ] Forms submit successfully
- [ ] Images can be uploaded
- [ ] Claims can be created

### Performance
- [ ] API response time < 500ms
- [ ] Frontend load time < 3s
- [ ] No console errors
- [ ] No memory leaks

### Security
- [ ] HTTPS working
- [ ] CORS headers correct
- [ ] Security headers present
- [ ] Sensitive data not exposed
- [ ] JWT tokens validate
- [ ] No sensitive logs visible

### Monitoring
- [ ] Error logging working
- [ ] Request logging working
- [ ] Health checks accessible
- [ ] Database connection stable
- [ ] API monitoring enabled

---

## Performance Optimization

### Backend
- [ ] Database indexes verified: `npm run setup:db`
- [ ] Query caching enabled (if applicable)
- [ ] Request timeout configured
- [ ] Memory limits set appropriately
- [ ] Connection pooling optimized

### Frontend
- [ ] Production build optimized: `npm run build`
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] CSS minified

---

## Monitoring & Alerts

### Set Up Monitoring
- [ ] Error rate monitoring
- [ ] Response time alerts
- [ ] Database performance monitoring
- [ ] API usage analytics
- [ ] Uptime monitoring
- [ ] CPU/Memory usage alerts
- [ ] Disk space alerts

### Logging
- [ ] Centralized logging service
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Log retention policy set
- [ ] Alerts configured for errors

---

## Database Management

### Backups
- [ ] Automated backups configured
- [ ] Backup retention policy set
- [ ] Test restore procedure
- [ ] Backup storage location verified
- [ ] Backup encryption enabled (if sensitive)

### Maintenance
- [ ] Database indexes verified
- [ ] Database optimization scheduled
- [ ] Slow query log enabled
- [ ] Database size monitoring
- [ ] Cleanup scripts scheduled

---

## Documentation & Knowledge Transfer

- [ ] Deployment process documented
- [ ] Configuration documented
- [ ] API documentation up to date
- [ ] Troubleshooting guide created
- [ ] Emergency procedures documented
- [ ] Team trained on deployment
- [ ] On-call procedures established

---

## Disaster Recovery

- [ ] Backup and restore tested
- [ ] Failover procedures documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined
- [ ] Incident response plan created
- [ ] Rollback procedures tested
- [ ] Communication plan for outages

---

## Post-Deployment Maintenance

### Weekly
- [ ] Check error logs
- [ ] Monitor API performance
- [ ] Verify backups completed
- [ ] Check disk space usage

### Monthly
- [ ] Review security logs
- [ ] Update dependencies (security patches)
- [ ] Test disaster recovery procedures
- [ ] Review API usage patterns

### Quarterly
- [ ] Full security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Update documentation
- [ ] Team training update

---

## Rollback Plan

### If Deployment Fails
1. [ ] Stop current deployment
2. [ ] Verify database integrity
3. [ ] Restore from last backup
4. [ ] Roll back code to previous version
5. [ ] Run verification tests
6. [ ] Notify stakeholders
7. [ ] Document incident

### Estimated Rollback Time
- Restore from backup: 10-15 minutes
- Verify application: 5-10 minutes
- Notify stakeholders: 2-5 minutes
- **Total: 20-30 minutes**

---

## Sign-Off

- [ ] Development team: _________________ Date: _______
- [ ] DevOps/Operations: _________________ Date: _______
- [ ] Security team: _________________ Date: _______
- [ ] Project manager: _________________ Date: _______

---

## Notes & Issues

### Known Issues (if any)
1. 
2. 
3. 

### Mitigation Plans
1. 
2. 
3. 

### Follow-up Items
1. 
2. 
3. 

---

## Emergency Contacts

- **Backend Lead**: _________________ Phone: _____________
- **Frontend Lead**: _________________ Phone: _____________
- **DevOps**: _________________ Phone: _____________
- **Database Admin**: _________________ Phone: _____________
- **Security Team**: _________________ Phone: _____________

---

## Resources

- Deployment Guide: `DEPLOYMENT.md`
- API Documentation: `API_TESTING.md`
- Fixes Summary: `FIXES_SUMMARY.md`
- Environment Template: `backend/.env.example`
