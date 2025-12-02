# Single User Application Update

## Changes Made

Removed all user-related functionality to simplify the application for single-user use.

### Backend Changes

#### 1. Database Schema (`backend/src/database/database.service.ts`)
- ✅ **Removed** `users` table entirely
- ✅ **Removed** `user_id` column from `goals` table
- ✅ **Removed** foreign key constraint from goals to users
- ✅ **Removed** default user insertion

**Before:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**After:**
```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_type_id INTEGER,
  ...
  FOREIGN KEY (goal_type_id) REFERENCES goal_types(id) ON DELETE SET NULL
);
```

#### 2. Goals Service (`backend/src/modules/goals/goals.service.ts`)
- ✅ **Removed** `userId` parameter from `create()` method
- ✅ **Updated** SQL INSERT to exclude `user_id`

**Before:**
```typescript
create(createGoalDto: CreateGoalDto, userId: number = 1) {
  const stmt = db.prepare(`
    INSERT INTO goals (user_id, goal_type_id, title, ...)
    VALUES (?, ?, ?, ...)
  `);
  const result = stmt.run(userId, ...);
}
```

**After:**
```typescript
create(createGoalDto: CreateGoalDto) {
  const stmt = db.prepare(`
    INSERT INTO goals (goal_type_id, title, ...)
    VALUES (?, ?, ...)
  `);
  const result = stmt.run(...);
}
```

### Frontend Changes

#### API Client (`frontend/src/lib/api/client.ts`)
- ✅ **Removed** `user_id` field from `Goal` interface

**Before:**
```typescript
export interface Goal {
  id: number;
  user_id: number;
  goal_type_id?: number;
  ...
}
```

**After:**
```typescript
export interface Goal {
  id: number;
  goal_type_id?: number;
  ...
}
```

## Impact

### What Was Removed
- Users table and all user management
- User ID tracking on goals
- User ID parameter in API calls
- Any user-related foreign key constraints

### What Remains Unchanged
- All goal functionality
- Progress tracking
- Images
- Tags
- Goal types
- All other features work exactly the same

### Database Migration

If you have an existing database with users/user_id:

**Option 1: Fresh Start (Recommended)**
- Delete `database.sqlite` file
- Restart the backend - it will create a clean schema

**Option 2: Manual Migration**
```sql
-- Create new goals table without user_id
CREATE TABLE goals_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_type_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  target_date DATE,
  emoji TEXT DEFAULT '🎯',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (goal_type_id) REFERENCES goal_types(id) ON DELETE SET NULL
);

-- Copy data
INSERT INTO goals_new SELECT
  id, goal_type_id, title, description, status, progress,
  target_date, emoji, created_at, updated_at, completed_at
FROM goals;

-- Replace table
DROP TABLE goals;
ALTER TABLE goals_new RENAME TO goals;

-- Drop users table
DROP TABLE users;
```

## Benefits

1. **Simplified Architecture** - No user management overhead
2. **Cleaner Code** - Removed unnecessary userId parameters
3. **Better Performance** - Fewer joins, simpler queries
4. **Easier Deployment** - No user authentication needed
5. **Focused Experience** - Built for personal use from the ground up

## Files Modified

### Backend
- ✅ `src/database/database.service.ts`
- ✅ `src/modules/goals/goals.service.ts`

### Frontend
- ✅ `src/lib/api/client.ts`

## Testing

To verify the changes:

1. Delete old database (if exists):
   ```bash
   rm backend/database.sqlite
   ```

2. Start backend:
   ```bash
   cd backend
   pnpm run dev
   ```

3. Start frontend:
   ```bash
   cd frontend
   pnpm run dev
   ```

4. Create a new goal - should work without any user context

## Notes

- This is a **breaking change** for existing databases with user data
- The simplest migration is to delete the old database and start fresh
- All other functionality (goals, progress, images, types, tags) remains 100% functional
- This change aligns with the app's purpose: personal goal tracking
