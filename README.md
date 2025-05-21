
# Convo 💬  
A real-time chat application with support for private and group messaging, typing indicators, emoji support, and more.

---

## 📌 Description

**Convo** is a full-stack real-time chat app built with React (frontend) and Node.js/Express (backend), using MongoDB for storage and Socket.IO for live messaging. It allows users to send and receive messages instantly, create or join group chats, and enjoy a modern, responsive interface with dark mode support.

---

## ✨ Features

- 🔐 User authentication (login/register)
- 💬 One-to-one private messaging
- 👥 Group chats
- 🕐 Real-time messaging via WebSocket (Socket.IO)
- ✍️ Typing indicators ("user is typing...")
- 😄 Emoji support
- 🌙 Dark mode
- 🖼️ Profile update (name, image, etc.)

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT (for authentication)
- Multer (for file uploads)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Esraakaram/Convo.git
cd Convo
```

### 2. Install Dependencies

#### Frontend:

```bash
cd frontend
npm install
```

#### Backend:

```bash
cd ../backend
npm install
```

### 3. Set Environment Variables

In the `backend` folder, create a `.env` file with the following:

```env
MONGODB_URI=mongodb+srv://seifzellaban:1GGiypoSQ7Iwp7ue@fake-prod.ansyfyo.mongodb.net/?retryWrites=true&w=majority&appName=fake-prod
PORT=5000
JWT_SECRET=fuckdepifr
```

### 4. Run the Application

#### Run backend server:

```bash
cd backend
npm run dev
```

#### Run frontend app:

```bash
cd frontend
npm run dev
```

---

## 📸 Screenshots 

![Convo Screenshot](home.png)  
![Dark Mode Screenshot](dark.png)  
![Group Chat Screenshot](profile.png)

