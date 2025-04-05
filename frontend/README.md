# PPRO Admin Dashboard

Frontend application for the PPRO Admin Dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

3. Run the development server:
```bash
npm run dev
```

## Deployment on Netlify

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Use the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the following environment variables:
   - `VITE_API_URL`: `https://ppro-backend.onrender.com`

## Features

1. **User Management**
   - Login for admins and moderators
   - Change password functionality
   - User role management (superadmin only)

2. **Rider Management**
   - View all riders
   - Add new riders
   - Edit rider details
   - Delete riders
   - Search and filter riders

3. **Data Export**
   - Export to PDF with logo and metadata
   - Export to Excel with detailed information

4. **Real-time Updates**
   - WebSocket connection for instant updates
   - Live notifications for rider changes

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
