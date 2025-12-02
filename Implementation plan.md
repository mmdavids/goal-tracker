# Goal Tracking App - Implementation Plan

## 🎯 Core Philosophy
**"Progress over perfection"** - Make it effortless to record wins, upload evidence, and see progress without the bureaucratic overhead.

---

## 1. Core Features

### Essential Features (MVP)
- **Quick Goal Entry**: Create goals in seconds with minimal fields
- **Progress Tracking**: Simple progress bar with percentage completion
- **Evidence Upload**: Drag-and-drop images with captions
- **Timeline View**: Chronological feed of progress updates
- **Goal Status**: Active, Completed, On Hold, Archived

### Delightful Features (Make it Fun)
- **Progress Celebrations**: Animations when milestones hit
- **Visual Progress**: Image gallery showing journey
- **Quick Wins**: Dedicated section for small achievements
- **Emoji Support**: Add personality to goals and updates

---

## 2. Database Schema (SQLite)

```sql
-- Users (optional if single-user, but good for future)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Goals
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, completed, on_hold, archived
  progress INTEGER DEFAULT 0, -- 0-100
  target_date DATE,
  emoji TEXT DEFAULT '🎯',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Progress Updates (Evidence entries)
CREATE TABLE progress_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  progress_delta INTEGER DEFAULT 0, -- how much progress this update added
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- Images
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progress_update_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progress_update_id) REFERENCES progress_updates(id) ON DELETE CASCADE
);

-- Milestones (for celebrations)
CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  threshold INTEGER NOT NULL, -- progress % that triggers this
  achieved BOOLEAN DEFAULT FALSE,
  achieved_at DATETIME,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- Tags (for categorization)
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3b82f6'
);

CREATE TABLE goal_tags (
  goal_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (goal_id, tag_id),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## 3. NestJS Backend Architecture

### Project Structure
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── common/
│   │   ├── interceptors/
│   │   └── filters/
│   ├── modules/
│   │   ├── goals/
│   │   │   ├── goals.controller.ts
│   │   │   ├── goals.service.ts
│   │   │   ├── goals.module.ts
│   │   │   └── dto/
│   │   ├── progress/
│   │   │   ├── progress.controller.ts
│   │   │   ├── progress.service.ts
│   │   │   └── progress.module.ts
│   │   ├── images/
│   │   │   ├── images.controller.ts
│   │   │   ├── images.service.ts
│   │   │   └── images.module.ts
│   │   └── tags/
│   │       ├── tags.controller.ts
│   │       ├── tags.service.ts
│   │       └── tags.module.ts
│   └── database/
│       ├── database.service.ts
│       └── migrations/
├── uploads/ (for image storage)
└── database.sqlite
```

### Key Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "better-sqlite3": "^9.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0"
  }
}
```

### Database Service Pattern
- Use better-sqlite3 for synchronous, fast SQLite operations
- Create a DatabaseService with prepared statements
- Use transactions for data consistency

---

## 4. Svelte Frontend Structure

### Project Structure
```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── GoalCard.svelte
│   │   │   ├── GoalForm.svelte
│   │   │   ├── ProgressUpdate.svelte
│   │   │   ├── ProgressBar.svelte
│   │   │   ├── ImageUpload.svelte
│   │   │   ├── ImageGallery.svelte
│   │   │   ├── MilestoneModal.svelte
│   │   │   ├── CelebrationAnimation.svelte
│   │   │   └── EmojiPicker.svelte
│   │   ├── stores/
│   │   │   ├── goals.ts
│   │   │   ├── ui.ts
│   │   │   └── celebrations.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       └── animations.ts
│   ├── routes/
│   │   ├── +page.svelte (Dashboard/All Goals)
│   │   ├── +layout.svelte
│   │   ├── goal/
│   │   │   └── [id]/
│   │   │       └── +page.svelte (Goal Detail)
│   │   └── completed/
│   │       └── +page.svelte (Completed Goals Archive)
│   └── app.css
└── package.json
```

### Key Dependencies
```json
{
  "dependencies": {
    "svelte": "^4.0.0",
    "@sveltejs/kit": "^2.0.0",
    "svelte-confetti": "^1.3.2",
    "svelte-dnd-action": "^0.9.0",
    "lucide-svelte": "^0.300.0"
  }
}
```

### UI/UX Design Principles
- **Minimal clicks**: Create goal → Add update in 2 clicks max
- **Drag & Drop**: Images and goal reordering
- **Instant feedback**: Optimistic updates, smooth animations
- **Mobile-first**: Touch-friendly, responsive design
- **Color psychology**: Green for progress, gold for milestones

---

## 5. API Endpoints

### Goals
```
GET    /api/goals                    # List all goals (with filters)
GET    /api/goals/:id                # Get single goal with full details
POST   /api/goals                    # Create new goal
PATCH  /api/goals/:id                # Update goal
DELETE /api/goals/:id                # Delete goal
PATCH  /api/goals/:id/progress       # Update progress percentage
```

### Progress Updates
```
GET    /api/goals/:id/progress       # Get all updates for a goal
POST   /api/goals/:id/progress       # Create new progress update
PATCH  /api/progress/:id             # Update progress entry
DELETE /api/progress/:id             # Delete progress entry
```

### Images
```
POST   /api/progress/:id/images      # Upload images (multipart/form-data)
GET    /api/images/:filename          # Serve image
DELETE /api/images/:id                # Delete image
```

### Tags
```
GET    /api/tags                      # List all tags
POST   /api/tags                      # Create tag
POST   /api/goals/:id/tags/:tagId    # Add tag to goal
DELETE /api/goals/:id/tags/:tagId    # Remove tag from goal
```

### Statistics (Bonus)
```
GET    /api/stats                     # Overall statistics
```

---

## 6. Image Upload & Storage Strategy

### Backend Implementation
- Use multer for file uploads
- Store images in /uploads directory
- Generate thumbnails with sharp
- Max file size: 5MB per image
- Supported formats: jpg, png, webp
- Generate unique filenames: `{timestamp}-{uuid}.{ext}`

### File Structure
```
uploads/
├── originals/
│   └── {timestamp}-{uuid}.jpg
└── thumbnails/
    └── {timestamp}-{uuid}-thumb.jpg
```

### Image Optimization
- Resize originals to max 1920px width
- Generate 400px thumbnails for gallery view
- Convert to WebP for better compression
- Strip EXIF data for privacy

### Frontend Upload Flow
1. User drags/selects images
2. Preview images immediately (client-side)
3. Upload on "Save Update" button
4. Show upload progress
5. Optimistic UI updates

---

## 7. Gamification & Fun Elements

### Progress Celebrations
- **25% Complete**: 🎉 "Great start!"
- **50% Complete**: 🔥 "Halfway there!"
- **75% Complete**: ⭐ "Almost there!"
- **100% Complete**: 🏆 Confetti animation + "Goal crushed!"

### Visual Feedback
- Smooth progress bar animations
- Pulse effect on new updates
- Haptic feedback on mobile (if supported)
- Color transitions: gray → yellow → green

### Quick Actions
- **Quick Win Button**: Add 10% progress with one tap
- **Evidence Snap**: Quick photo upload from mobile
- **Milestone Suggestions**: Auto-suggest at 25%, 50%, 75%

### Motivational Elements
- Random encouraging messages on dashboard
- Goal completion gallery (visual timeline)
- Weekly recap: "You made progress on X goals this week!"

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Setup NestJS project with SQLite integration
2. Create database schema and migrations
3. Setup Svelte project with routing
4. Basic CRUD for goals
5. Simple list and detail views

### Phase 2: Progress Tracking (Week 2)
1. Progress updates API
2. Progress update UI with forms
3. Progress bar component
4. Timeline view of updates
5. Manual progress adjustment

### Phase 3: Images (Week 3)
1. Image upload endpoint with multer
2. Image optimization with sharp
3. Drag & drop image upload component
4. Image gallery component
5. Image viewing modal

### Phase 4: Polish & Fun (Week 4)
1. Add celebration animations
2. Implement milestones
3. Tags and filtering
4. Statistics dashboard
5. Mobile responsiveness

### Phase 5: Quality of Life (Week 5)
1. Quick actions (quick win button)
2. Search and filtering
3. Export functionality (PDF/CSV)
4. Settings panel
5. Dark mode

---

## 9. Development Setup

### Backend Commands
```bash
# Initialize NestJS project
npm i -g @nestjs/cli
nest new goal-tracker-api
cd goal-tracker-api

# Install dependencies
npm install better-sqlite3 @types/better-sqlite3
npm install multer @types/multer
npm install sharp
npm install class-validator class-transformer

# Run development
npm run start:dev
```

### Frontend Commands
```bash
# Initialize SvelteKit project
npm create svelte@latest goal-tracker-ui
cd goal-tracker-ui

# Install dependencies
npm install
npm install lucide-svelte
npm install svelte-confetti

# Run development
npm run dev
```

### Environment Variables

**backend/.env**
```env
PORT=5000
DATABASE_PATH=./database.sqlite
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```env
PUBLIC_API_URL=http://localhost:5000/api
```

---

## 10. Key Features for Simplicity

### What Makes It Simple
✅ No user authentication initially (single-user app)
✅ No complex forms - title + optional description
✅ Visual progress - see it, feel it
✅ Quick updates - 3 taps to log progress
✅ Images tell the story - less writing needed

### What Reduces Stress
✅ No deadlines required (optional target dates)
✅ No scoring or performance metrics
✅ Progress can go up OR down (life happens)
✅ Archive instead of delete (no pressure to finish)
✅ Private by default

---

## Summary

This implementation plan creates a **lightweight, visual, and encouraging** goal tracking system that focuses on:

1. **Speed**: Record progress in seconds
2. **Evidence**: Images show real progress
3. **Motivation**: Celebrations make it rewarding
4. **Flexibility**: No rigid structure or deadlines
5. **Simplicity**: Clean UI, minimal friction

The tech stack (NestJS + SQLite + Svelte) provides:
- Fast development with TypeScript across the stack
- Zero deployment complexity (SQLite = single file)
- Reactive UI updates with Svelte
- Easy to extend and maintain

---

## Tech Stack Summary

- **Backend**: NestJS + TypeScript
- **Database**: SQLite with better-sqlite3
- **Frontend**: SvelteKit + TypeScript
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Styling**: CSS (with potential for Tailwind)
- **Icons**: Lucide Svelte
- **Animations**: Svelte transitions + svelte-confetti
