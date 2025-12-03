# Changelog

All notable changes to the Goal Tracker application.

## 2025-12-03

### UI/UX Improvements
- **Navigation Icons**: Added Home icon to Dashboard link and Settings (cog) icon to Settings link
- **Save Button Icons**: Added floppy disc icons to all Save buttons throughout the app
- **Form Action Icons**: Added Plus icon to Create Goal button and Wrench icon to "Use Default Location" button

### Dark Mode Fixes
- **Form Input Text**: Fixed dark mode styling for form inputs - text now properly visible in dark mode
- **Modal Styling**: Updated ConfirmModal, InputModal, GoalTypeSelector, and ImageUpload to use theme variables
- **Component Consistency**: All components now properly support light and dark themes

### Dark Mode Foundation
- **Trash Page**: Added dark mode support to trash page
- **Archived Page**: Added dark mode support to archived goals page
- **Settings Page**: Added dark mode support to settings page
- **Goal Card**: Updated goal cards with dark mode styling
- **Homepage**: Added dark mode support to dashboard
- **Theme Toggle**: Added theme toggle button to navigation bar with sun/moon icons
- **Theme System**: Implemented complete dark mode system with CSS variables and localStorage persistence

### User Experience
- **Timestamp Display**: Improved timestamp formatting with relative time (e.g., "2 hours ago") and full date/time on hover
- **Goal Card Layout**: Enhanced goal card text handling and layout
- **Text Formatting**: Preserve newlines in goal descriptions for better readability

## 2025-12-02

### Features
- **Goal Export**: Added goal selection and markdown export functionality to homepage
- **Move Progress Updates**: Added ability to move progress updates between different goals
- **Quarter Countdown**: Added quarter countdown widgets to homepage showing days remaining in current quarter
- **Database Configuration**: Added database path configuration UI with file browser
  - Browse filesystem to select custom database location
  - View current and default database paths
  - Create new folders from within the browser

### Bug Fixes
- **Consecutive Deletions**: Fixed issue where deleting multiple goals in quick succession would fail

## Initial Release

### Core Features
- **Goal Management**: Create, edit, delete, and archive goals
- **Progress Tracking**: Add progress updates with incremental percentage changes
- **Image Attachments**: Upload and attach images to progress updates as evidence
- **Goal Types**: Create custom goal types with icons and colors
- **Trash Bin**: Soft-delete goals with ability to restore or permanently delete
- **Fiscal Year Configuration**: Configure fiscal year start month for quarter calculations
- **Quarter Support**: Set target dates by quarter with automatic end-date calculation
- **Progress Timeline**: View chronological history of all progress updates
- **Celebration Animations**: Confetti animations at 25%, 50%, 75%, and 100% milestones
- **Statistics Dashboard**: View total, active, and archived goal counts

### Technical Stack
- **Frontend**: SvelteKit, TypeScript, Vite
- **Backend**: Fastify, TypeScript, SQLite
- **Image Processing**: Sharp for thumbnail generation
- **Database**: SQLite with better-sqlite3
