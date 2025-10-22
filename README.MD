# Chat Application

A real-time chat app with JWT authentication, Socket.IO messaging, and modern UI components.

## Features

- 🔐 **JWT Authentication** - Login/register with secure cookies
- 💬 **Real-time Messaging** - Instant chat with Socket.IO
- 👥 **Group & Private Chats** - Multiple conversation types
- 📧 **Email Integration** - OTP verification via Nodemailer
- 🔑 **Password Recovery** - Forgot & reset password with OTP
- 👤 **User Profiles** - Detailed profile pages with account info
- 🔍 **User Search** - Find users by username or email
- 🔔 **Notification System** - Real-time alerts with unread counts
- 📄 **Smart Pagination** - Efficient loading for messages and notifications
- ⏱️ **OTP Timer** - Real-time countdown with expiry warnings
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
- **React Router** - Navigation with dynamic routes
- **Socket.IO Client** - Real-time connection
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Radix UI** - Accessible UI components
- **Lucide React** - Modern icon library
- **Cobe** - 3D globe visualization

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

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
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
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user  
- `GET /api/users/logout` - Logout user
- `GET /api/users/me` - Get current user
- `GET /api/users/search` - Search users by username/email

### Password Management
- `POST /api/send-mail` - Send OTP via email
- `POST /api/users/verify-otp` - Verify OTP code
- `POST /api/users/reset-password` - Reset with old password
- `POST /api/users/reset-password-otp` - Reset with OTP

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages?page=1&limit=20` - Get messages with pagination

### Notifications
- `GET /notifications/user/:userId?page=1&limit=20` - Get user notifications with pagination
- `PUT /notifications/user/:userId/conversation/:conversationId/read` - Mark conversation notifications as read
- `PUT /notifications/user/:userId/notification/:notificationId/read` - Mark single notification as read
- `DELETE /notifications/user/:userId/delete-all-read` - Delete all read notifications

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
- `EMAIL_USER` - SMTP email address
- `EMAIL_PASS` - SMTP password/app password
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port

**Frontend:**
- `VITE_BACKEND_URL` - API base URL

## Key Features Overview

### Password Recovery System
- **Forgot Password**: Email-based OTP verification
- **Reset Password**: Change password with current password
- **OTP Management**: 6-digit codes with 5-minute expiry
- **Real-time Timer**: Visual countdown with expiry warnings
- **Secure Flow**: Multi-step verification process

### User Profile Management
- **Detailed Profiles**: Avatar, stats, account info
- **Account Settings**: Password reset, security options
- **User Statistics**: Conversation count, join date
- **Responsive Design**: Mobile-friendly profile pages

### Email Integration
- **Nodemailer Setup**: SMTP email delivery
- **OTP Templates**: Professional email templates
- **Multiple Types**: Support for forgot/reset flows
- **Validation**: Email format and delivery verification

### Notification System
- **Real-time Alerts**: Instant notifications for new messages
- **Unread Counter**: Badge showing unread notification count
- **Multiple Types**: Message, mention, and system notifications
- **Read Status**: Track read/unread state with visual indicators
- **Bulk Actions**: Mark all as read, delete read notifications
- **Conversation Linking**: Click notifications to jump to conversations
- **Auto Cleanup**: Automatic deletion of read notifications

### Pagination System
- **Message Pagination**: Load chat messages in chunks for better performance
- **Notification Pagination**: Fetch notifications with configurable page size
- **Optimized Loading**: Reduce initial load time and memory usage
- **Scroll-based Navigation**: Seamless infinite scroll experience
- **Flexible Parameters**: Customizable page size and offset controls
- **Future Ready**: Conversation list pagination support ready for implementation

## Application Routes

- `/` - Home page
- `/login` - User login
- `/register` - User registration  
- `/profile` - User profile page
- `/chat` - Main chat interface
- `/reset-password/forgot` - Forgot password flow
- `/reset-password/reset` - Reset password flow
