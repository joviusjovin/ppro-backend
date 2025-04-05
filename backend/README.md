# PPRO Backend

Backend server for the PPRO Admin Dashboard application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=3001
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

3. Run the server:
```bash
npm start
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: Set to `production`

## API Endpoints

### Authentication
- POST `/api/admin/login` - Admin login
- POST `/api/admin/change-password` - Change admin password

### Users
- POST `/api/admin/users` - Create new moderator
- GET `/api/admin/users` - Get all users (superadmin only)
- DELETE `/api/admin/users/:userId` - Delete moderator (superadmin only)

### Riders
- GET `/api/admin/riders` - Get all riders
- POST `/api/admin/riders` - Create new rider
- PUT `/api/admin/riders/:id` - Update rider
- DELETE `/api/admin/riders/:id` - Delete rider

## WebSocket Events

The server uses Socket.IO for real-time updates:
- `riderUpdate` - Emitted when a rider is created, updated, or deleted
