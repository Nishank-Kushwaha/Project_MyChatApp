# Chat Application

A real-time chat app with JWT authentication, Socket.IO messaging, and modern UI components.

## Features

- 🔐 **JWT Authentication** - Login/register with secure cookies
- 💬 **Real-time Messaging** - Instant chat with Socket.IO
- 👥 **Group & Private Chats** - Multiple conversation types
- 📧 **Email Integration** - User notifications
- 🎨 **Modern UI** - Responsive design with animations
- 🔒 **Secure** - Password hashing and protected routes

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **Socket.IO** - Real-time messaging
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality

### Frontend  
- **React 19** + **Vite** - UI framework & build tool
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Socket.IO Client** - Real-time connection
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - UI components

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or connection string

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://localhost:27017/chatapp
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start server:
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

### Frontend Setup
```bash
cd frontend  
npm install
```

Create `.env`:
```env
VITE_BACKEND_URL=http://localhost:3000
```

Start frontend:
```bash
npm run dev    # Development
npm run build  # Production build
```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register user
- `POST /api/users/signin` - Login user  
- `GET /api/users/logout` - Logout user
- `GET /api/users/me` - Get current user

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get messages

### Real-time Events
- `join_conversation` - Join chat room
- `send_message` - Send message
- `typing` - Typing indicator
- `new_message` - Receive message

## Project Structure

```
backend/
├── controllers/     # Route handlers
├── models/         # Database schemas  
├── routers/        # API routes
├── middlewares/    # Auth middleware
└── app.js         # Server entry point

frontend/
├── src/
│   ├── components/ # React components
│   ├── redux/     # State management
│   └── lib/       # Socket.IO client
└── package.json
```

## Development

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- Socket.IO path: `/socket.io/`

## Environment Variables

**Backend:**
- `JWT_SECRET` - JWT signing secret
- `MONGO_URI` - MongoDB connection
- `FRONTEND_URL` - CORS origin
- `NODE_ENV` - Environment mode

**Frontend:**
- `VITE_BACKEND_URL` - API base URL
