# Goal Tracking App

NOTICE: THIS APP IS IN BETA STATE. IT IS A PRODUCTIVTY TOOL AND IN FUTURE MAY CONTAIN BREAKING CHANGES TO THE DB.

AI DISCLAIMER: ALL CODE IS FULLY AI GENERATED USING CLAUDE CODE.

Use this App to manage all your goals and track updates.

## How to Run the Application

### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   pnpm install
   pnpm rebuild better-sqlite3 sharp
   pnpm run dev
   ```

   The API will be available at `http://localhost:5000`

### Frontend

1. In a new terminal
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

   The UI will be available at `http://localhost:5173`

## Database

The SQLite database (`database.sqlite`) is automatically created when the backend starts. It includes:

- users table (with default user)
- goals table
- progress_updates table
- images table
- milestones table
- tags table
- goal_tags junction table

## Notes

1. **better-sqlite3**: Native module that requires rebuilding after installation
   - Run: `pnpm rebuild better-sqlite3` if you encounter errors

2. **sharp**: Image processing library that also requires native bindings
   - Run: `pnpm rebuild sharp` if image uploads fail

3. **Single User**: Currently configured for single-user mode (default user ID: 1)
   - Multi-user support can be added by implementing authentication

4. **File Storage**: Images are stored in `/backend/uploads` directory
   - For production, consider using cloud storage (S3, etc.)

## Potential Next Steps

1. **Authentication**: Add user authentication (JWT, OAuth)
2. **Search**: Implement search and filtering
3. **Mobile App**: Build React Native or Flutter mobile version
4. **Deployment**: Deploy to production (Docker, Vercel, etc.)
5. **Collaboration**: Allow sharing goals with others
6. **Integrations**: 
   - Google Calendar integration
   - Notion integration

## Troubleshooting

### Backend won't start

- Rebuild native dependencies: `pnpm rebuild better-sqlite3 sharp`
- Check `.env` file exists with correct settings

### Images not uploading

- Check Sharp is properly installed: `pnpm rebuild sharp`

### Database errors

- Delete `database.sqlite` to reset (will lose all data)
- Check write permissions in backend directory

## License

This is a personal project implementation. Feel free to modify and use as needed.
