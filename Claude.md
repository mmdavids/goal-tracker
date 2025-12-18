# Goal Tracker Application

A full-stack goal tracking and progress management application built with SvelteKit, TypeScript, and SQLite.

## Project Overview

This is a personal goal tracking application that allows users to:
- Create and manage goals with optional target dates and quarters
- Track progress with incremental updates
- Attach images as evidence of progress
- Organize goals with custom types and categories
- Archive completed goals
- Soft-delete goals to a trash bin
- Configure fiscal year settings for quarter calculations
- Switch between light and dark modes

## Tech Stack

### Frontend
- **SvelteKit**: Modern reactive framework for building the UI
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Lucide Svelte**: Icon library for UI elements
- **CSS Variables**: For theming and dark mode support

### Backend
- **Fastify**: Fast and low overhead web framework
- **TypeScript**: Type-safe backend code
- **better-sqlite3**: Synchronous SQLite database
- **Sharp**: High-performance image processing for thumbnails
- **Multer**: File upload middleware

### Database
- **SQLite**: Embedded relational database
- Tables: users, goals, progress_updates, images, goal_types, progress_update_types, config

## Project Structure

```
goals/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── db.ts            # Database initialization
│   │   ├── main.ts          # Fastify server setup
│   │   └── types.ts         # TypeScript type definitions
│   ├── uploads/             # User-uploaded images
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/         # API client functions
│   │   │   ├── components/  # Reusable Svelte components
│   │   │   ├── stores/      # Svelte stores (theme, goals, celebrations)
│   │   │   └── utils/       # Helper functions
│   │   ├── routes/          # SvelteKit pages/routes
│   │   ├── app.css          # Global styles with theme variables
│   │   └── app.html         # HTML template
│   └── package.json
├── database.sqlite          # SQLite database file
└── Claude.md               # This file
```

## Key Features

### Goal Management
- Create goals with title, description, target date, quarter, year, and type
- Edit goal details
- Track progress percentage (0-100%)
- Archive goals when completed
- Move goals to trash bin (soft delete)
- Permanently delete from trash or restore

### Progress Updates
- Add incremental progress updates with title, notes, and progress delta
- Attach multiple images to updates as evidence
- Edit existing updates (including moving to different goals)
- Delete updates with ninja slice animation
- View update history timeline

### Goal Types
- Create custom goal types with icons, colors, and descriptions
- Assign types to goals for better organization
- View goal count per type
- Prevent deletion of types with active goals

### Progress Update Types
- Create custom progress update types with configurable emojis
- Optional field - existing updates continue to work without a type
- Type emoji replaces numbered marker in timeline for visual categorization
- Type name displays next to the date in update footer
- Manage types in Settings page
- Cannot delete types that are in use by existing updates

### Customizable Terminology
- Personalize application name throughout the interface
- Customize what "Goals" are called (e.g., "Projects", "Categories", "Events")
- Configure singular and plural forms in Settings
- All user-facing text updates automatically including page titles, buttons, forms, and labels
- Settings persist in browser localStorage
- Backend implementation remains unchanged for data compatibility

### Fiscal Year Configuration
- Configure fiscal year start month (default: September)
- Automatic quarter calculation based on fiscal year
- Quick date picker buttons for quarter end dates
- Settings persist in localStorage

### Database Configuration
- Configure custom database path or use default location
- View current and configured database paths
- Browse filesystem to select database location

### Dark Mode
- Toggle between light and dark themes
- Theme preference stored in localStorage
- Falls back to system preference
- Smooth transitions between themes
- All components support both modes

### Celebrations
- Animated confetti on reaching 25%, 50%, 75%, 100% progress
- Plays only once per milestone

## Component Architecture

### Key Components

**GoalForm.svelte**
- Reusable form for creating and editing goals
- Handles quarter/year calculations based on fiscal settings
- Provides quick-select buttons for quarter end dates
- Icons: Save (editing), Plus (creating)

**GoalCard.svelte**
- Displays goal summary with progress bar
- Shows goal type icon and color
- Actions: Edit, Archive/Restore, Delete
- Visual indicators for status

**ProgressUpdate.svelte**
- Displays or edits a progress update
- Image gallery with modal viewer
- Move updates between goals
- Delete with ninja slice animation

**ProgressBar.svelte**
- Animated progress visualization
- Multiple sizes (sm, md, lg)
- Color changes based on progress level

**PathBrowser.svelte**
- Filesystem browser for selecting database location
- Navigate directories
- Create new folders

### Pages/Routes

**/ (Dashboard)**
- Lists all active goals
- Quick stats (total, active, archived)
- Create new goal form
- Filter by goal type

**/goal/[id]**
- Goal details with full progress history
- Add progress updates with images
- Quick win button (+10%)
- Edit goal inline

**/settings**
- Manage goal types
- Configure fiscal year
- Set database path

**/archived**
- View completed/archived goals
- Restore to active

**/trash**
- View soft-deleted goals
- Restore or permanently delete

## Styling Approach

### Theme System
- CSS custom properties defined in `app.css`
- Two themes: light (default) and dark
- Theme controlled by `data-theme` attribute on document root

### Theme Variables
```css
--color-primary: Blue for primary actions
--color-success: Green for positive actions
--color-warning: Orange for warnings
--color-danger: Red for destructive actions

--bg-primary: Main background
--bg-secondary: Secondary background
--bg-tertiary: Tertiary background (buttons, cards)

--text-primary: Primary text color
--text-secondary: Secondary text color
--text-tertiary: Tertiary text color (hints, timestamps)

--border-primary: Border color
--border-secondary: Secondary border color
--shadow: Box shadow color
```

### Component Styling
- Scoped styles in each `.svelte` file
- Consistent spacing and sizing
- Hover states and transitions
- Responsive where needed

## API Design

### RESTful Endpoints

**Goals**
- `GET /api/goals?status=active|archived|deleted` - List goals
- `GET /api/goals/:id` - Get goal details
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Soft delete goal
- `PATCH /api/goals/:id/archive` - Archive/unarchive
- `DELETE /api/goals/:id/permanent` - Permanently delete

**Progress Updates**
- `GET /api/goals/:goalId/progress` - List updates for goal
- `POST /api/goals/:goalId/progress` - Create update
- `PATCH /api/progress/:id` - Update progress entry
- `DELETE /api/progress/:id` - Delete update
- `PATCH /api/progress/:id/move` - Move to different goal

**Images**
- `POST /api/progress/:updateId/images` - Upload images
- `GET /api/images/:filename?thumbnail=true` - Get image/thumbnail
- `DELETE /api/images/:id` - Delete image

**Goal Types**
- `GET /api/goal-types` - List all types with goal counts
- `POST /api/goal-types` - Create type
- `PATCH /api/goal-types/:id` - Update type
- `DELETE /api/goal-types/:id` - Delete type (only if no goals)

**Config**
- `GET /api/config/database-path` - Get database paths
- `POST /api/config/database-path` - Update database path
- `GET /api/config/browse-path` - Browse filesystem
- `POST /api/config/create-folder` - Create new folder

## Database Schema

### users
- Single user system (user_id: 1)
- Prepared for multi-user expansion

### goals
- id, user_id, title, description, progress, target_date, quarter, year
- goal_type_id (FK to goal_types)
- status: active, archived, deleted
- created_at, updated_at, deleted_at

### progress_updates
- id, goal_id, title, notes, progress_delta, date_achieved
- progress_update_type_id (FK to progress_update_types, nullable)
- created_at, updated_at

### images
- id, progress_update_id, filename, caption, file_size
- created_at

### goal_types
- id, user_id, name, description, icon, color
- created_at, updated_at

### progress_update_types
- id, name, description, emoji
- created_at, updated_at

### config
- id, user_id, key, value
- Currently used for database_path setting

## State Management

### Svelte Stores

**theme.ts**
- Manages light/dark theme preference
- Syncs with localStorage
- Falls back to system preference
- Applies theme via data-theme attribute

**goals.ts**
- Not currently used (direct API calls instead)
- Available for future reactive goal list

**celebrations.ts**
- Tracks celebration display state
- Ensures milestones show only once per session
- Controls confetti animation

**terminology.ts**
- Manages custom application name and goal terminology
- Stores user preferences for app name, singular and plural goal terms
- Syncs with localStorage
- Provides setAppName(), setGoalTerminology(), and reset() methods
- Ensures backward compatibility by merging stored data with defaults

**animations.ts**
- Manages animation preferences
- Controls delete animation (ninja slice) on/off
- Syncs with localStorage

## Common Patterns

### API Calls
```typescript
// All API functions in frontend/src/lib/api/client.ts
import { goalsAPI } from '$lib/api/client';

const goals = await goalsAPI.getAll('active');
const goal = await goalsAPI.getOne(id);
await goalsAPI.update(id, { title: 'New Title' });
```

### Event Dispatching
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', { data });
  }
</script>
```

### Theme Usage
```svelte
<script>
  import { theme } from '$lib/stores/theme';
</script>

<button on:click={() => theme.toggle()}>
  {$theme === 'dark' ? '☀️' : '🌙'}
</button>
```

## Development Workflow

### Running the App
1. Start backend: `cd backend && pnpm run dev` (port 5000)
2. Start frontend: `cd frontend && pnpm run dev` (port 5173)
3. Open browser to http://localhost:5173

### Adding a New Feature
1. Add database migrations if needed (db.ts)
2. Create/update API endpoints (backend/src/routes/)
3. Add TypeScript types (backend/src/types.ts, frontend types)
4. Create/update components (frontend/src/lib/components/)
5. Update API client (frontend/src/lib/api/client.ts)
6. Test in browser with dark mode enabled

### Code Style
- TypeScript strict mode enabled
- Consistent indentation (2 spaces)
- Descriptive variable names
- Comments for complex logic
- CSS custom properties for all colors

### Committing Changes

When committing changes to this project, follow these guidelines:

1. **Update Changelog First**: Before creating any commits, update the changelog page at `frontend/src/routes/changelog/+page.svelte` with a description of your changes
2. **Group Logically**: Combine related changes into single commits rather than creating overly granular commits
   - Good: "Add dark mode support to modals and forms"
   - Bad: Separate commits for each modal component
3. **Commit Message Style**:
   - Be terse but useful - explain what changed and why
   - Use imperative mood ("Add feature" not "Added feature")
   - First line should be concise summary (max 72 chars)
   - Add bullet points in body for multiple related changes
4. **Logical Grouping Examples**:
   - Group all dark mode fixes together
   - Group icon additions across multiple components
   - Group related feature additions (UI + backend + API)
   - Separate bug fixes from new features
5. **Changelog Updates**: The changelog should be updated in the same commit as the related changes

## Recent Changes

### Customizable Application Name & Collapsible Settings (Latest - 2025-12-18)
- Added customizable application name in Settings → Terminology
  - Replaces "Goal Tracker" in navigation bar, page titles, and browser tabs
  - Works seamlessly with custom goal terminology
  - Settings persist in browser localStorage
- Made all settings sections collapsible for better organization
  - All sections start collapsed by default for cleaner UI
  - Click section headers to expand/collapse
  - Rotating chevron icon indicates expansion state
  - Smooth slide-down animation when expanding
  - Action buttons hidden in collapsed state

### Customizable Terminology & Progress Update Types (2025-12-17)
- Added customizable terminology system
  - Configure custom singular and plural terms for "Goals" (e.g., "Projects", "Categories")
  - All user-facing text updates automatically throughout the application
  - Settings stored in browser localStorage
  - Backend unchanged for data compatibility
- Implemented progress update types
  - User-definable types with configurable emojis (85 emojis available)
  - Optional field - no breaking changes for existing updates
  - Type emoji replaces numbered marker in timeline
  - Type name displays in update footer
  - Manage types in Settings page
  - Cannot delete types in use
- Expanded emoji selection to 56 goal type icons and 85 progress update emojis

### Dark Mode Improvements
- Fixed form inputs to properly display text in dark mode
- Updated all modals to use theme variables
- Added proper background and text colors to all form elements
- Consistent styling across GoalForm, ProgressUpdate, and all modals

### Icon Additions
- Added Save (floppy disc) icon to all Save buttons
- Added Plus icon to Create Goal button
- Added Home icon to Dashboard navigation link
- Added Settings (cog) icon to Settings navigation link
- Added Wrench icon to "Use Default Location" button

### Settings Page Enhancements
- "Use Default Location" button now fits content width
- All save buttons have icons for better UX
- Consistent icon sizing across the interface

## Known Limitations

1. **Single User**: No authentication system, assumes single user (ID: 1)
2. **Local Storage**: Images stored locally, not suitable for cloud deployment
3. **No Backup**: Database not automatically backed up
4. **Browser-based**: No native mobile app
5. **Limited Search**: No full-text search or advanced filtering

## Future Enhancements

### Near-term
- [ ] Add search and filtering
- [ ] Export goals to PDF/CSV
- [ ] Goal templates
- [ ] Recurring goals
- [ ] Goal dependencies

### Long-term
- [ ] Multi-user support with authentication
- [ ] Cloud storage for images (S3)
- [ ] Real-time collaboration
- [ ] Mobile app (React Native/Flutter)
- [ ] Analytics and insights dashboard
- [ ] Integration with calendars
- [ ] Webhooks for external notifications

## Troubleshooting

### Common Issues

**Dark mode text not visible**
- Ensure all form inputs have `color: var(--text-primary)` and `background: var(--bg-primary)`
- Check that hardcoded colors aren't overriding theme variables

**Images not uploading**
- Check Sharp is installed: `pnpm rebuild sharp`
- Verify uploads/ directory exists and is writable
- Check file size (5MB limit)

**Database locked errors**
- Close any SQLite browser tools
- Ensure only one backend instance is running
- Delete `database.sqlite-journal` if present

**Port conflicts**
- Backend uses 5000, frontend uses 5173
- Check if ports are available: `lsof -i :5000 -i :5173`
- Update ports in config files if needed

## Testing

Currently no automated tests. Manual testing checklist:

- [ ] Create, edit, delete goals in both themes
- [ ] Add progress updates with images
- [ ] Archive and restore goals
- [ ] Move goals to trash and restore
- [ ] Change fiscal year settings
- [ ] Configure database path
- [ ] Create and delete goal types
- [ ] Test quarter calculations across year boundaries
- [ ] Verify dark mode across all pages
- [ ] Test image upload and deletion
- [ ] Check celebrations at milestones

## Performance Considerations

- SQLite is single-threaded - suitable for personal use
- Images are served directly through Fastify (no CDN)
- Thumbnails generated on upload for faster loading
- No pagination - assumes reasonable number of goals (<1000)
- Frontend is statically generated for fast initial load

## Security Notes

- No authentication - assumes trusted environment
- File uploads limited to images only
- File size limited to 5MB
- Filenames are sanitized and UUID-based
- SQL injection prevented by parameterized queries
- CORS enabled for localhost development

## Contributing

This is a personal project, but suggestions welcome:
1. File issues for bugs or feature requests
2. Fork and create pull requests
3. Follow existing code style
4. Test in both light and dark modes
5. Update this documentation for major changes

## License

Personal project - use and modify as needed.

---

**Last Updated**: 2025-12-18
**Version**: 1.0.0
