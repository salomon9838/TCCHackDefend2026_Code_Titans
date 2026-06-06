# Frontend Login Guide - SmartChange

## Setup

1. **Make sure backend is running:**
   ```bash
   cd frontend1/backend
   python manage.py runserver 8000
   ```

2. **Environment variables (if needed):**
   - Frontend will use `http://localhost:8000` by default
   - If running on different host/port, check `src/api/index.ts` line 3:
     ```typescript
     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
     ```

3. **Start frontend:**
   ```bash
   cd frontend1/frontend1
   npm run dev
   ```

## Test Credentials

### Available Test Users (auto-created)

| Role | Email | Password |
|------|-------|----------|
| **Merchant** | merchant@demo.local | Demo123!@ |
| **Customer** | customer@demo.local | Demo123!@ |
| **Partner** | partner@demo.local | Demo123!@ |

### How to Login

1. Open http://localhost:5173 (or the URL shown by Vite)
2. Click "Se connecter" (Login tab)
3. Enter credentials:
   - **Email ou téléphone**: `merchant@demo.local`
   - **Mot de passe**: `Demo123!@`
4. Click "Se connecter"

## What Should Happen

✅ **Successful Login Flow:**
1. User clicks login button
2. Backend receives request and authenticates user
3. Backend returns JWT tokens (`access` and `refresh`)
4. Frontend stores tokens in localStorage
5. Frontend redirects to dashboard
6. GET `/api/auth/me/` succeeds with 200 OK
7. User profile loads correctly

## Common Issues & Fixes

### ❌ Error: "Bad Request: /api/auth/login/"
**Problem**: Frontend sends invalid payload
**Check**:
- [ ] Verify `API_BASE_URL` points to correct backend (http://localhost:8000)
- [ ] Check DevTools Network tab - see the POST payload
- [ ] Ensure fields are `email_or_phone` and `password`

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Enter login credentials
4. Look for POST request to `/api/auth/login/`
5. Click it and check:
   - **Request Payload**: Should show `{"email_or_phone": "...", "password": "..."}`
   - **Response**: Check error message

### ❌ Error: "Unauthorized: /api/auth/me/"
**Problem**: Token not being sent or stored
**Check**:
- [ ] DevTools > Storage > localStorage > `smartchange_access_token` exists
- [ ] DevTools > Network > Auth headers include `Authorization: Bearer ...`

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Storage > localStorage
3. Check if these keys exist:
   - `smartchange_access_token`
   - `smartchange_refresh_token`
4. If missing, login failed silently (check console for errors)
5. Go to Console tab and check for JavaScript errors

### ❌ Pages show "Not authenticated"
**Problem**: Token stored but not being sent with requests
**Check**:
- [ ] All requests include `Authorization: Bearer <token>` header
- [ ] CORS is configured correctly
- [ ] Frontend uses `apiRequest` wrapper function

## Testing Workflow

### Test 1: Login Flow
1. Clear localStorage: DevTools > Storage > Clear All
2. Login with valid credentials
3. Check localStorage for tokens
4. Verify token format starts with `eyJ` (base64 JWT)

### Test 2: Persist After Refresh
1. Login successfully
2. Go to Dashboard or Wallet page
3. Refresh page (F5)
4. User should still be logged in (token in localStorage)

### Test 3: Token Expiration
1. Login successfully
2. Wait for token to expire (normally 24 hours, but testable with short token in settings)
3. Try to access protected page
4. Should auto-refresh using refresh token
5. Or should redirect to login

## API Endpoints (Protected - Need Token)

All these require `Authorization: Bearer <token>` header:

- `GET /api/auth/me/` - Get current user info
- `GET /api/wallet/` - Get wallet balance
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/` - List transactions
- `POST /api/qr/scan/` - Scan QR code
- `POST /api/wallet/withdraw/` - Withdraw money
- `GET /api/dashboard/` - Get dashboard stats
- `GET /api/partners/` - List partners

## Manual API Testing

Use curl or Postman to test:

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone": "merchant@demo.local", "password": "Demo123!@"}'

# 2. Copy the access token from response
# 3. Use it to test protected endpoint
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. If login works, proceed to test dashboard features
2. If login fails, check browser console for errors
3. If backend errors, check Django logs: `python manage.py runserver 8000`
4. Check database: Users should exist in PostgreSQL
