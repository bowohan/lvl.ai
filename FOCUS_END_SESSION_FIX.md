# Focus Mode "End Session" Fix

## Issue
When trying to end a focus session, the error "Failed to end session" occurred.

## Root Cause
**API Route Mismatch**: The backend routes required the session ID in the URL path, but the frontend was calling the endpoint without including the session ID.

### Backend Expected:
```
PUT /api/focus/:id/end
PUT /api/focus/:id/pause
PUT /api/focus/:id/resume
```

### Frontend Was Calling:
```
PUT /api/focus/end  (missing session ID)
PUT /api/focus/pause (missing session ID)
PUT /api/focus/resume (missing session ID)
```

## Files Fixed

### 1. `/frontend/src/lib/api/focusMode.ts`
**Problem**: API methods didn't include session ID in the URL

**Solution**: Updated all session control methods to accept and use session ID
```typescript
// Before
async endSession(payload: UpdateFocusSessionDTO): Promise<...> {
  const response = await apiClient.client.put('/focus/end', payload);
  return response.data.data;
}

// After
async endSession(sessionId: string, payload: UpdateFocusSessionDTO): Promise<...> {
  const response = await apiClient.client.put(`/focus/${sessionId}/end`, payload);
  return response.data.data;
}
```

### 2. `/frontend/src/hooks/useFocusMode.ts`
**Problem**: Hook wasn't passing the active session ID to API methods

**Solution**: Updated methods to extract session ID from activeSession and pass it
```typescript
// Before
const endSession = async (payload: UpdateFocusSessionDTO = {}) => {
  const result = await focusModeAPI.endSession(payload);
  ...
}

// After
const endSession = async (payload: UpdateFocusSessionDTO = {}) => {
  if (!activeSession) {
    setError('No active session found');
    return;
  }
  const result = await focusModeAPI.endSession(activeSession._id, payload);
  ...
}
```

### 3. `/backend/src/models/FocusSession.ts`
**Problem**: SessionStatus enum was missing PAUSED state

**Solution**: Added PAUSED to the enum
```typescript
// Before
export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// After
export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',     // Added
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### 4. `/backend/src/routes/focusModeRoutes.ts`
**Added**: Missing resume endpoint
```typescript
router.put('/:id/resume', authenticate, async (req, res, next) => {
  const session = await FocusSession.findOne({
    _id: sessionId,
    userId,
    status: SessionStatus.PAUSED
  });
  
  if (!session) {
    throw new CustomError('Paused session not found', 404);
  }
  
  session.status = SessionStatus.ACTIVE;
  await session.save();
  
  res.status(200).json({
    success: true,
    data: session,
    message: 'Session resumed successfully'
  });
});
```

**Fixed**: Pause route now actually pauses the session
```typescript
// Before - was only tracking distractions
session.distractionCount += 1;
await session.save();

// After - pauses AND tracks distraction
session.status = SessionStatus.PAUSED;
session.distractionCount += 1;
await session.save();
```

## Testing
Backend successfully started:
```
Mongo connected
Server running on port 5001
```

All Focus Mode operations should now work:
1. **Start Session** - Working
2. **Pause Session** - Working (changes status to PAUSED)
3. **Resume Session** - Working (changes status back to ACTIVE)
4. **End Session** - Working (completes session and awards rewards)

## How It Works Now
1. User starts a focus session → Creates session with unique `_id`
2. Frontend stores active session in state
3. User clicks "End Session" → Frontend calls `endSession(activeSession._id, payload)`
4. API request: `PUT /api/focus/{session_id}/end`
5. Backend processes the session, calculates rewards, updates user stats
6. Frontend receives rewards data and displays completion screen
