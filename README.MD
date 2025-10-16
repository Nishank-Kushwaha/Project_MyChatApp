# Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for instant messaging.

## 🚀 Features

### Core Functionality

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT tokens
- **Private conversations** (1-on-1 chats)
- **Group chats** with multiple participants
- **Live typing indicators**
- **Message read status tracking**
- **User search** functionality
- **Responsive design** with Tailwind CSS

### User Interface

- Modern, clean UI with animated components
- Particle background effects
- Rainbow button animations
- Collapsible sidebar
- Real-time conversation list
- Message timestamps
- User avatars with gradient colors

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **Lucide React** - Icon library

## 📁 Project Structure

```
Project Chat App/
├── backend/
│   ├── controllers/           # Route handlers
│   │   ├── auth.controller.js
│   │   ├── conversation.controller.js
│   │   └── message.controller.js
│   ├── middlewares/           # Custom middleware
│   │   └── auth.middleware.js
│   ├── models/               # Database schemas
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── ConversationMember.js
│   │   └── Group.js
│   ├── routers/              # API routes
│   │   ├── auth.router.js
│   │   ├── conversation.router.js
│   │   └── message.router.js
│   ├── utils/                # Utility functions
│   │   ├── auth.js
│   │   └── pathUtil.js
│   ├── app.js                # Main server file
│   ├── dbConnect.js          # Database connection
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── react-components/  # Main React components
│   │   │   │   ├── ChatLayout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── PageNotFound.jsx
│   │   │   └── ui/               # Reusable UI components
│   │   │       ├── avatar.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── particles.jsx
│   │   │       └── rainbow-button.jsx
│   │   ├── redux/               # State management
│   │   │   ├── slices/
│   │   │   │   ├── userSlice.js
│   │   │   │   └── chatSlice.js
│   │   │   └── store.js
│   │   ├── lib/                 # Utility libraries
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.MD
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Project Chat App"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb://localhost:27017/your-database-name
# or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name

MONGODB_DB_NAME=chatapp
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here
```

Start the backend server:

```bash
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_JWT_SECRET=your-super-secret-jwt-key-here
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🔑 API Endpoints

### Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user
- `POST /api/users/logout` - User logout

### Conversations

- `GET /conversations` - Get user conversations
- `POST /conversations/private` - Create private chat
- `POST /conversations/group` - Create group chat
- `GET /conversations/search` - Search users

### Messages

- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message (via Socket.IO)

## 🔌 Socket.IO Events

### Client → Server

- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a new message
- `typing` - Send typing indicator

### Server → Client

- `new_message` - Receive new message
- `user_typing` - Receive typing indicator
- `error` - Error notifications

## 🎨 UI Components

### Key Features

- **Particle Background**: Animated particle system
- **Rainbow Buttons**: Gradient animated buttons
- **Responsive Chat Layout**: Collapsible sidebar, message bubbles
- **Real-time Updates**: Live message delivery and typing indicators
- **Modal Dialogs**: New chat creation with user search
- **Avatar System**: Gradient colored avatars with initials

## 🗃️ Database Schema

### User Model

```javascript
{
  username: String(required, unique);
  email: String(required, unique);
  passwordHash: String(required);
  timestamps: true;
}
```

### Conversation Model

```javascript
{
  type: String("private" | "group");
  name: String;
  createdBy: ObjectId(User);
  lastMessage: String;
  lastMessageAt: Date;
  timestamps: true;
}
```

### Message Model

```javascript
{
  conversationId: ObjectId(Conversation);
  senderId: ObjectId(User);
  content: String;
  readBy: [ObjectId](Users);
  timestamps: true;
}
```

## 🔧 Development Scripts

### Backend

```bash
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start production server
npm test        # Run tests (not implemented)
```

### Frontend

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## 🌟 Features in Detail

### Real-time Messaging

- Instant message delivery using Socket.IO
- Message persistence in MongoDB
- Read receipts tracking
- Typing indicators

### User Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Persistent login sessions
- Automatic token refresh

### Chat Management

- Create private 1-on-1 conversations
- Create group chats with multiple users
- Search and add users to conversations
- Real-time conversation updates

### Modern UI/UX

- Responsive design for all screen sizes
- Dark/light theme support (via Tailwind)
- Smooth animations and transitions
- Accessible components using Radix UI

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Use MongoDB Atlas for database
3. Deploy to services like Heroku, Railway, or Vercel

### Frontend Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify, Vercel, or similar
3. Update CORS settings in backend for production URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

For questions or support, please contact [Nishank Kushwaha] at [kushwahanishank01@gmail.com]

---

**Built with ❤️ using the MERN Stack + Socket.IO**
