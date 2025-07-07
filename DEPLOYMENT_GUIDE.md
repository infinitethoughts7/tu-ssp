# Deployment Guide - TU SSP System

## 🔐 Authentication Flow Explained

### How Tokens Work

1. **Login Process**: When a user logs in with email/password or roll number/password, the backend generates:

   - **Access Token**: Valid for 1 hour (increased from 5 minutes)
   - **Refresh Token**: Valid for 7 days (increased from 1 day)

2. **Token Storage**:

   - Access tokens are stored in localStorage as `staffAccessToken` or `studentAccessToken`
   - Refresh token is stored as `refreshToken`
   - User type is stored as `userType`

3. **Token Refresh**: When an API call fails with 401 (unauthorized), the frontend automatically:
   - Uses the refresh token to get a new access token
   - Retries the original request with the new token
   - If refresh fails, redirects to login

### Why Your EC2 Wasn't Working

The issue was that your frontend was configured to use `localhost:8000` as the API base URL. When your local server was down, the frontend couldn't reach the API to refresh tokens.

## 🚀 Deployment Steps

### 1. Backend Deployment (EC2)

Make sure your backend is running on EC2 with the updated settings:

```bash
# On your EC2 server
cd backend
python manage.py runserver 0.0.0.0:8000
# Or use gunicorn for production
gunicorn ssp.wsgi:application --bind 0.0.0.0:8000
```

### 2. Frontend Deployment

The CI/CD pipeline automatically handles frontend deployment when you push to the main branch. For manual deployment:

```bash
cd frontend
npm install
npm run build:prod
```

### 3. Environment Configuration

The frontend now has proper environment configuration:

- **Development** (`.env.development`): Uses `http://localhost:8000/api`
- **Production** (`.env.production`): Uses `http://51.21.200.136/api`

### 4. Serve Frontend Files

Copy the contents of `frontend/dist/` to your web server directory.

## 🔧 Testing the Fix

### Test 1: Local Development

```bash
# Terminal 1: Start backend
cd backend
python manage.py runserver

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Test 2: Production API with Local Frontend

```bash
cd frontend
npm run build:prod
npx serve -s dist -l 3000
```

### Test 3: Full Production

Deploy both backend and frontend to EC2 and test the complete flow.

## 🐛 Troubleshooting

### "Login failed, check your credentials"

1. Check if backend is running on EC2
2. Verify the API URL in browser dev tools
3. Check browser console for network errors
4. Ensure database is accessible from EC2

### Token Refresh Issues

1. Check if refresh token endpoint is correct (`/auth/refresh/`)
2. Verify token lifetimes in settings
3. Check browser localStorage for valid tokens

### CORS Issues

1. Ensure CORS settings in `settings_production.py` include your frontend domain
2. Check if frontend URL is in `CORS_ALLOWED_ORIGINS`

## 📝 Key Changes Made

1. **Fixed API Base URL**: Frontend now uses correct EC2 URL in production
2. **Fixed Token Refresh Endpoint**: Corrected `/auth/refresh/` endpoint
3. **Increased Token Lifetimes**:
   - Access token: 5 minutes → 1 hour
   - Refresh token: 1 day → 7 days
4. **Added Environment Files**: Proper dev/prod configuration
5. **Updated Build Script**: Ensures production mode is used

## 🔍 Verification Checklist

- [ ] Backend running on EC2 at `http://51.21.200.136:8000`
- [ ] Frontend built with production environment
- [ ] Frontend served from web server
- [ ] Login works with valid credentials
- [ ] Token refresh works automatically
- [ ] No CORS errors in browser console
- [ ] All API endpoints accessible

## 💡 Best Practices

1. **Always use production mode** when building for deployment
2. **Monitor token expiration** in browser dev tools
3. **Check network tab** for failed API calls
4. **Use HTTPS** in production for security
5. **Set up proper logging** on EC2 for debugging

## 🆘 Getting Help

If you still face issues:

1. Check browser console for errors
2. Verify EC2 server logs
3. Test API endpoints directly with curl/Postman
4. Ensure database connectivity on EC2
