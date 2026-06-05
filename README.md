# <img src="client/public/logo.png" alt="Cactus" height="40"> Cactus — Campus Social & Study Discovery Platform

> A modern, real-time campus social app for students to connect, collaborate, and share moments with classmates.

[![Frontend — Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend — Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)](https://socket.io)

---

## ✨ Features

| Feature | Description |
|:---|:---|
| **📸 Stories** | Post 24-hour temporary campus moments (auto-deleted via MongoDB TTL) |
| **📬 Instants** | Snapchat-style single-view self-destructing photo messages |
| **💬 Real-time Chat** | WebSocket-powered direct messaging with typing indicators |
| **🔍 Semantic Search** | AI-powered post discovery via Google Gemini `text-embedding-004` + MongoDB Atlas Vector Search |
| **🖼️ Image Uploads** | Cloudinary-backed image upload pipeline via Multer memory streams |
| **🔐 Auth** | JWT-secured authentication with bcrypt password hashing |
| **🌙 Dark Mode** | Full pitch-black Instagram-style dark/light theme toggle |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — Fast SPA tooling
- **Tailwind CSS** — Utility-first styling with custom gradients
- **Socket.io Client** — Real-time WebSocket connection
- **React Router v6** — Client-side routing

### Backend
- **Node.js** + **Express.js** — REST API server
- **Socket.io** — Persistent WebSocket engine
- **Mongoose** — MongoDB ODM with TTL indexes
- **Multer** + **Cloudinary** — Media upload pipeline
- **Google Gemini API** — AI semantic embeddings
- **JWT** + **bcrypt** — Auth & security

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ or Bun v1.0+
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/sahilkhan117/Cactus.git
cd Cactus
```

### 2. Setup the Backend
```bash
cd server
cp .env.example .env      # Fill in your environment variables
bun install
bun run dev               # Starts on http://localhost:5000
```

### 3. Setup the Frontend
```bash
cd client
cp .env.example .env      # Set VITE_API_URL=http://localhost:5000/api
bun install
bun run dev               # Starts on http://localhost:5173
```

---

## 📦 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

| Layer | Platform | Details |
|:---|:---|:---|
| **Frontend** | Vercel | Root: `client/`, Build: `bun run build`, Output: `dist/` |
| **Backend** | Render | Root: `server/`, Start: `node --import tsx src/index.ts` |

See [`deployment_guide.md`](./docs/deployment_guide.md) for the full step-by-step guide.

---

## 📄 License
MIT © Cactus Team
