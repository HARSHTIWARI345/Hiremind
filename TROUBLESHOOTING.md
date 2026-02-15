# Troubleshooting Guide

## Clerk Authentication Error

### Error: "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"

**Solution:**
1. ✅ **Middleware Location**: Ensure `middleware.ts` is at the **root level** (same level as `app/`, not inside it)
2. ✅ **Restart Dev Server**: After moving middleware, restart your dev server:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```
3. ✅ **Check Environment Variables**: Ensure Clerk keys are set in `.env`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Common Issues

#### 1. Middleware Not Detected
- **Cause**: Middleware file in wrong location
- **Fix**: Move `middleware.ts` to root directory (not inside `app/`)

#### 2. Routes Not Matched
- **Cause**: Matcher config doesn't include your route
- **Fix**: Check `middleware.ts` matcher includes your routes

#### 3. Public Routes Blocked
- **Cause**: Public routes not defined in `isPublicRoute`
- **Fix**: Add route to `createRouteMatcher([...])` array

#### 4. Environment Variables Missing
- **Cause**: Clerk keys not set
- **Fix**: Add keys to `.env` file

## MongoDB Connection Issues

### Error: "Can't reach MongoDB server"

**Solutions:**
1. **Local MongoDB**: Ensure service is running
   - Windows: Check Services app
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

2. **MongoDB Atlas**: 
   - Check IP whitelist includes your IP
   - Verify connection string is correct
   - Ensure cluster is not paused

3. **Connection String Format**:
   ```env
   # Local
   DATABASE_URL="mongodb://localhost:27017/hiremind_ai"
   
   # Atlas
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hiremind_ai?retryWrites=true&w=majority"
   ```

## Prisma Issues

### Error: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
npx prisma db push
```

### Error: "Schema not in sync"

**Solution:**
```bash
npx prisma db push
# Or for production
npx prisma migrate dev
```

## Next.js Build Errors

### Error: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Type errors"

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Check TypeScript
npm run build
```

## Quick Fixes Checklist

- [ ] Middleware file at root level (`middleware.ts`, not `app/middleware.ts`)
- [ ] Restart dev server after middleware changes
- [ ] Clerk environment variables set
- [ ] MongoDB running and accessible
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Node modules installed (`npm install`)
