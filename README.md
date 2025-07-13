# 🌐 Full Stack AI-Powered Web Application

Welcome to our AI-powered full stack web application built using the **MERN** stack with **Vite** on the frontend and **Express/Node.js** on the backend. This app integrates AI functionalities, payment handling, authentication, and file/directory operations — making it a powerful base for intelligent applications.

---

## 🚀 Features

- 🔐 **User Authentication** (Login/Register)
- 📁 **File & Folder Management** (Create directories, upload/view files)
- ☁️ **Firebase Storage Integration**
- 🤖 **AI Assistant Support** using Mistral AI API
- 💰 **Payments Integration** via Razorpay
- 🔄 **Password Recovery**
- 🧠 Smart interactions using custom prompts and AI models

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **Cloud Storage**: Firebase Storage
- **Payments**: Razorpay
- **AI Integration**: Mistral AI

---

## 🧩 Environment Variables

### 🔓 Client-side (`.env` file in root of Vite React project)

| Variable               | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `VITE_MISTRAL_API_KEY` | API key for accessing Mistral AI                          |
| `VITE_BACKEND_URL`     | URL of the backend server (e.g., `http://localhost:5000`) |
| `VITE_RAZORPAY_KEY`    | Razorpay Public Key for payments                          |

> ⚠️ These variables **must start with `VITE_`** to be exposed to the Vite client.

#### 🔍 How to Get These:

- **VITE_MISTRAL_API_KEY**: Sign up at [Mistral AI](https://mistral.ai/) and generate an API key.
- **VITE_BACKEND_URL**: Set this to your backend server address (e.g., `http://localhost:5000`).
- **VITE_RAZORPAY_KEY**: [Register](https://razorpay.com/) and get your public key from the Razorpay Dashboard.

---

### 🔐 Server-side (`.env` file in backend folder)

| Variable       | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `MONGO_URI`    | MongoDB connection string                                           |
| `PORT`         | Port number for server (e.g., `5000`)                               |
| `FRONTEND_URL` | CORS whitelist URL of your frontend (e.g., `http://localhost:5173`) |
| `AI_API_KEY`   | Private Mistral AI API key (used server-side for secured calls)     |
| `WORK_DIR`     | Directory path to manage files (e.g., `/tmp/uploads`)               |

#### 🔍 How to Get These:

- **MONGO_URI**: Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or use local MongoDB.
- **PORT**: Choose any available port (commonly `5000`).
- **FRONTEND_URL**: The domain/port where your frontend is running.
- **AI_API_KEY**: Keep the same as `VITE_MISTRAL_API_KEY` but **secure** on server side.
- **WORK_DIR**: Any working directory on your server or development machine for storing files temporarily.

---

## 🧪 Local Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chandankumarm55/Evolve-ai.git
   cd your-project
   ```
   Frontend Setup
   bashcd client
   npm install
   touch .env

# Add the required VITE\_ environment variables

npm run dev

Backend Setup
bashcd server
npm install
touch .env

# Add the required backend environment variables

npm run dev

Make sure both client and server are running and connected properly.

🙌 Contributing
We welcome contributions from the community! ✨
If you'd like to help improve this project, feel free to fork it, raise issues, or submit pull requests.
To Contribute:

Fork the repository
Create a new branch: git checkout -b feature/your-feature-name
Commit your changes: git commit -m "Added a cool feature"
Push to your fork: git push origin feature/your-feature-name
Create a Pull Request

📬 Contact
For queries or collaboration, please reach out to us via GitHub or email.
Built with ❤️ by Chandan and contributors.

🚀 Future Additions
Let me know if you'd like to include:

⭐ If you found this project helpful, please give it a star!
