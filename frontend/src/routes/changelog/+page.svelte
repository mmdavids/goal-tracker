<script lang="ts">
  import { FileText } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Changelog - Goal Tracker</title>
</svelte:head>

<div class="changelog-page">
  <div class="header">
    <div class="header-title">
      <FileText size={32} />
      <h1>Changelog</h1>
    </div>
    <a href="/" class="back-link">Back to Dashboard</a>
  </div>

  <div class="changelog-content">
    <section class="changelog-section">
      <h2>2025-12-10</h2>

      <div class="change-group">
        <h3>Technical Improvements</h3>
        <ul>
          <li><strong>Database Service Refactoring</strong>: Removed migration logic, simplified to assume fresh database installation
            <ul>
              <li>Removed images table migration code</li>
              <li>Removed date normalization migrations</li>
              <li>Cleaner, more maintainable codebase</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Bug Fixes</h3>
        <ul>
          <li><strong>Dark Mode Date Picker</strong>: Fixed calendar icon visibility by adding color-scheme property to dark theme</li>
          <li><strong>Progress Timeline Sorting</strong>: Fixed incorrect ordering of progress updates caused by mixed date formats
            <ul>
              <li>Root cause: Creating updates used CURRENT_TIMESTAMP (SQLite format), editing updates sent ISO 8601 strings</li>
              <li>Solution implemented:
                <ul>
                  <li>Backend normalizes all incoming dates to SQLite format before storage</li>
                  <li>Query uses datetime() function for sorting to handle any edge cases</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Features</h3>
        <ul>
          <li><strong>Animation Preferences</strong>: Added setting to disable delete animation (ninja slice effect)
            <ul>
              <li>New "Animation Preferences" section in Settings page</li>
              <li>Toggle switch to enable/disable delete animations</li>
              <li>Preference stored in localStorage</li>
              <li>Applies to both progress update and goal deletions</li>
            </ul>
          </li>
          <li><strong>Reflection/Comment Mode</strong>: Added checkbox to progress update forms to create status reflections with zero progress
            <ul>
              <li>Checkbox labeled "Status reflection/comment (no progress)"</li>
              <li>When checked, automatically sets progress to 0</li>
              <li>When progress is manually set to 0, checkbox is automatically checked</li>
              <li>Progress input remains enabled to allow unchecking by changing the value</li>
              <li>Available in both add update and edit update forms</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="change-group">
        <h3>UI Improvements</h3>
        <ul>
          <li><strong>Export Enhancement</strong>: Progress updates with zero progress now display with 💬 comment emoji in markdown/ZIP exports</li>
          <li><strong>Changelog Navigation</strong>: Moved changelog link from main navigation to bottom of Settings page for cleaner navigation bar</li>
          <li><strong>Status Update Styling</strong>: Progress updates with zero progress change are now visually distinct as status reflections/comments
            <ul>
              <li>Dashed border and secondary background color</li>
              <li>Message bubble icon indicator</li>
              <li>Italic title styling with reduced font weight</li>
              <li>Reduced opacity (0.85) for subtle appearance</li>
            </ul>
          </li>
        </ul>
      </div>
    </section>

    <section class="changelog-section">
      <h2>2025-12-05</h2>

      <div class="change-group">
        <h3>Features</h3>
        <ul>
          <li><strong>Unarchive Goals</strong>: Archive button now toggles to "Unarchive" for completed goals, allowing you to restore archived goals back to active status</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>UI Improvements</h3>
        <ul>
          <li><strong>Padlock Archive Animation</strong>: New animated golden padlock appears when archiving a goal, with shackle closing animation, sparkle effects, and fade transition</li>
          <li><strong>Table View</strong>: Added new table view mode on homepage with concise overview showing: checkbox, title, progress bar with percentage, goal type, update count, image count, and quarter</li>
          <li><strong>View Toggle</strong>: New toggle button with text label on dedicated row below header to switch between grid and table views, preference saved in localStorage</li>
          <li><strong>Simplified Actions</strong>: Removed delete button from goal cards and all action buttons from table view for cleaner interface</li>
          <li><strong>Progress Badge Redesign</strong>: Larger, more motivational progress badges with gradient fill indicator showing completion amount</li>
          <li><strong>Visual Fill Amount</strong>: Badge fills left-to-right with purple gradient based on progress percentage (gray background for incomplete portion)</li>
          <li><strong>Completion Indicators</strong>: 100% completion shows ✨ with green gradient and pulse glow, over 100% shows 🔥 with orange-red gradient and fire pulse animation</li>
          <li><strong>Shimmer Effect</strong>: Animated shimmer overlay on all progress badges for extra polish</li>
          <li><strong>Export Buttons</strong>: Both export buttons now styled consistently with distinct icons (FileArchive for ZIP, FileText for MD) and goal counts</li>
          <li><strong>Larger Text Areas</strong>: Goal description textarea increased to 15 rows, progress notes to 7 rows for easier editing</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Goal Sorting</h3>
        <ul>
          <li>Goals now grouped by type, then sorted alphabetically by title</li>
          <li>Applied consistently to dashboard, archived goals, and exports</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Export Enhancements</h3>
        <ul>
          <li><strong>ZIP Export</strong>: New option to export goals as ZIP file with embedded images in organized 'images/' folder</li>
          <li><strong>Dual Format</strong>: UI now offers both "Export ZIP" (with images) and "Export MD" (markdown only)</li>
          <li><strong>Tabular Format</strong>: Progress updates display in clean table with columns: #, Date, Update, Progress, Images, Notes</li>
          <li><strong>Sequential Numbering</strong>: Updates numbered from oldest (1) to newest</li>
          <li><strong>Timestamped Filenames</strong>: Export filenames include timestamp down to second (e.g., goals-export-2025-12-05T12-34-56.md) to prevent overwrites</li>
          <li><strong>ZIP Image Gallery</strong>: ZIP exports include dedicated "Attached Images" section with previews grouped by update</li>
        </ul>
      </div>
    </section>

    <section class="changelog-section">
      <h2>2025-12-03</h2>

      <div class="change-group">
        <h3>Documentation</h3>
        <ul>
          <li><strong>Changelog Page</strong>: Added in-app changelog page accessible from navigation bar</li>
          <li><strong>Claude.md</strong>: Created comprehensive project documentation for developers and AI assistants</li>
          <li><strong>CHANGELOG.md</strong>: Added markdown changelog file in repository root</li>
          <li><strong>Commit Guidelines</strong>: Documented standards for making commits with logical grouping</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>UI/UX Improvements</h3>
        <ul>
          <li><strong>Navigation Icons</strong>: Added Home icon to Dashboard link and Settings (cog) icon to Settings link</li>
          <li><strong>Save Button Icons</strong>: Added floppy disc icons to all Save buttons throughout the app</li>
          <li><strong>Form Action Icons</strong>: Added Plus icon to Create Goal button and Wrench icon to "Use Default Location" button</li>
          <li><strong>Changelog Link</strong>: Added Changelog link with FileText icon to main navigation</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Dark Mode Fixes</h3>
        <ul>
          <li><strong>Form Input Text</strong>: Fixed dark mode styling for form inputs - text now properly visible in dark mode</li>
          <li><strong>Modal Styling</strong>: Updated ConfirmModal, InputModal, GoalTypeSelector, and ImageUpload to use theme variables</li>
          <li><strong>Component Consistency</strong>: All components now properly support light and dark themes</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Dark Mode Foundation</h3>
        <ul>
          <li><strong>Trash Page</strong>: Added dark mode support to trash page</li>
          <li><strong>Archived Page</strong>: Added dark mode support to archived goals page</li>
          <li><strong>Settings Page</strong>: Added dark mode support to settings page</li>
          <li><strong>Goal Card</strong>: Updated goal cards with dark mode styling</li>
          <li><strong>Homepage</strong>: Added dark mode support to dashboard</li>
          <li><strong>Theme Toggle</strong>: Added theme toggle button to navigation bar with sun/moon icons</li>
          <li><strong>Theme System</strong>: Implemented complete dark mode system with CSS variables and localStorage persistence</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>User Experience</h3>
        <ul>
          <li><strong>Timestamp Display</strong>: Improved timestamp formatting with relative time (e.g., "2 hours ago") and full date/time on hover</li>
          <li><strong>Goal Card Layout</strong>: Enhanced goal card text handling and layout</li>
          <li><strong>Text Formatting</strong>: Preserve newlines in goal descriptions for better readability</li>
        </ul>
      </div>
    </section>

    <section class="changelog-section">
      <h2>2025-12-02</h2>

      <div class="change-group">
        <h3>Features</h3>
        <ul>
          <li><strong>Goal Export</strong>: Added goal selection and markdown export functionality to homepage</li>
          <li><strong>Move Progress Updates</strong>: Added ability to move progress updates between different goals</li>
          <li><strong>Quarter Countdown</strong>: Added quarter countdown widgets to homepage showing days remaining in current quarter</li>
          <li><strong>Database Configuration</strong>: Added database path configuration UI with file browser
            <ul>
              <li>Browse filesystem to select custom database location</li>
              <li>View current and default database paths</li>
              <li>Create new folders from within the browser</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Bug Fixes</h3>
        <ul>
          <li><strong>Consecutive Deletions</strong>: Fixed issue where deleting multiple goals in quick succession would fail</li>
        </ul>
      </div>
    </section>

    <section class="changelog-section">
      <h2>Initial Release</h2>

      <div class="change-group">
        <h3>Core Features</h3>
        <ul>
          <li><strong>Goal Management</strong>: Create, edit, delete, and archive goals</li>
          <li><strong>Progress Tracking</strong>: Add progress updates with incremental percentage changes</li>
          <li><strong>Image Attachments</strong>: Upload and attach images to progress updates as evidence</li>
          <li><strong>Goal Types</strong>: Create custom goal types with icons and colors</li>
          <li><strong>Trash Bin</strong>: Soft-delete goals with ability to restore or permanently delete</li>
          <li><strong>Fiscal Year Configuration</strong>: Configure fiscal year start month for quarter calculations</li>
          <li><strong>Quarter Support</strong>: Set target dates by quarter with automatic end-date calculation</li>
          <li><strong>Progress Timeline</strong>: View chronological history of all progress updates</li>
          <li><strong>Celebration Animations</strong>: Confetti animations at 25%, 50%, 75%, and 100% milestones</li>
          <li><strong>Statistics Dashboard</strong>: View total, active, and archived goal counts</li>
        </ul>
      </div>

      <div class="change-group">
        <h3>Technical Stack</h3>
        <ul>
          <li><strong>Frontend</strong>: SvelteKit, TypeScript, Vite</li>
          <li><strong>Backend</strong>: Fastify, TypeScript, SQLite</li>
          <li><strong>Image Processing</strong>: Sharp for thumbnail generation</li>
          <li><strong>Database</strong>: SQLite with better-sqlite3</li>
        </ul>
      </div>
    </section>
  </div>
</div>

<style>
  .changelog-page {
    max-width: 900px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-primary);
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .back-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--color-primary);
  }

  .changelog-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .changelog-section {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 2rem;
  }

  .changelog-section h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-primary);
  }

  .change-group {
    margin-bottom: 1.5rem;
  }

  .change-group:last-child {
    margin-bottom: 0;
  }

  .change-group h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
    list-style: disc;
  }

  ul ul {
    margin-top: 0.5rem;
    list-style: circle;
  }

  li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  li:last-child {
    margin-bottom: 0;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
</style>
