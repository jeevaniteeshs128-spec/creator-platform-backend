# Creator Platform

A full-stack MERN creator platform where authenticated users can manage their own projects. The app includes authentication, protected routes, owner-based authorization, CRUD operations, pagination, and full-stack error handling with toast notifications.

## Tech Stack

- React + Vite
- React Router
- Axios
- React Toastify
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing

## Project Structure

```text
creator-platform-backend/
  client/   React frontend
  server/   Express and MongoDB backend
```

## Environment Variables

Create local `.env` files for development. Do not commit or submit real `.env` files.

Root or server `.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret
MONGODB_URI=mongodb://127.0.0.1:27017/creator-platform
```

Client `.env`:

```env
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=10000
```

## Setup

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Run the backend:

```bash
npm run dev
```

Run the frontend in a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

## Key Features

- Register and login with JWT authentication
- Persistent login on page refresh
- Protected frontend routes
- Protected backend API routes
- Create, read, update, and delete projects
- Owner-only access for viewing, editing, and deleting projects
- Paginated project dashboard using `limit` and `skip`
- Delete confirmation and responsive UI updates
- Centralized Express error middleware
- Consistent backend error response format
- Frontend toast notifications for API failures
- Logout clears client authentication state

## Submission Notes

Do not include these in the ZIP submission:

- `.env` files
- `node_modules/`
- `client/node_modules/`
- `dist/`
- `client/dist/`
