# Goal Tracking App - Implementation Complete

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

## API Endpoints

### Goals
- `GET /api/goals` - List all goals
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `PATCH /api/goals/:id/progress` - Update progress
- `GET /api/goals/stats` - Get statistics

### Progress Updates
- `GET /api/goals/:id/progress` - List updates for goal
- `POST /api/goals/:id/progress` - Create update
- `PATCH /api/progress/:id` - Update progress entry
- `DELETE /api/progress/:id` - Delete update

### Images
- `POST /api/progress/:id/images` - Upload images
- `GET /api/images/:filename` - Get image
- `GET /api/images/:filename/thumbnail` - Get thumbnail
- `DELETE /api/images/:id` - Delete image

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag
- `POST /api/tags/:tagId/goals/:goalId` - Add tag to goal
- `DELETE /api/tags/:tagId/goals/:goalId` - Remove tag from goal
- `DELETE /api/tags/:id` - Delete tag

## Database

The SQLite database (`database.sqlite`) is automatically created when the backend starts. It includes:

- users table (with default user)
- goals table
- progress_updates table
- images table
- milestones table
- tags table
- goal_tags junction table

## Known Issues & Notes

1. **better-sqlite3**: Native module that requires rebuilding after installation
   - Run: `pnpm rebuild better-sqlite3` if you encounter errors

2. **sharp**: Image processing library that also requires native bindings
   - Run: `pnpm rebuild sharp` if image uploads fail

3. **Single User**: Currently configured for single-user mode (default user ID: 1)
   - Multi-user support can be added by implementing authentication

4. **File Storage**: Images are stored in `/backend/uploads` directory
   - For production, consider using cloud storage (S3, etc.)

## Next Steps

To enhance the application further, consider:

1. **Authentication**: Add user authentication (JWT, OAuth)
2. **Dark Mode**: Implement theme switching
3. **Export**: Add PDF/CSV export functionality
4. **Search**: Implement search and filtering
5. **Notifications**: Browser notifications for milestones
6. **Mobile App**: Build React Native or Flutter mobile version
7. **Deployment**: Deploy to production (Docker, Vercel, etc.)
8. **Testing**: Add unit and integration tests
9. **Analytics**: Track usage patterns and insights
10. **Collaboration**: Allow sharing goals with others

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Rebuild native dependencies: `pnpm rebuild better-sqlite3 sharp`
- Check `.env` file exists with correct settings

### Frontend can't connect to API
- Ensure backend is running on port 5000
- Check CORS settings in backend `main.ts`
- Verify `.env` file has `PUBLIC_API_URL=http://localhost:5000/api`

### Images not uploading
- Ensure `uploads/` directory exists and is writable
- Check Sharp is properly installed: `pnpm rebuild sharp`
- Verify file size is under 5MB limit

### Database errors
- Delete `database.sqlite` to reset (will lose all data)
- Check write permissions in backend directory

## License

This is a personal project implementation. Feel free to modify and use as needed.
