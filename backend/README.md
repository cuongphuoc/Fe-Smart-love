# TodoList Backend API

A RESTful API backend for the TodoList application built with Node.js, Express, and MongoDB.

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory based on `env.example`
5. Set up your MongoDB:
   - For local development: Start your MongoDB server (usually `mongod` command)
   - For production: Get your MongoDB Atlas connection string

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/todolist
```

For production with MongoDB Atlas:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/todolist?retryWrites=true&w=majority
```

### Running the Server

For development (with auto-restart on file changes):
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/tasks` | Get all tasks | - | `{ success: true, data: Task[] }` |
| GET | `/api/tasks/:id` | Get a single task | - | `{ success: true, data: Task }` |
| POST | `/api/tasks` | Create a new task | `{ title, completed, dueDate }` | `{ success: true, data: Task }` |
| PUT | `/api/tasks/:id` | Update a task | `{ title?, completed?, dueDate? }` | `{ success: true, data: Task }` |
| DELETE | `/api/tasks/:id` | Delete a task | - | `{ success: true, data: boolean }` |
| DELETE | `/api/tasks` | Delete multiple tasks | `{ ids: string[] }` | `{ success: true, data: boolean }` |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion | `{ completed }` | `{ success: true, data: Task }` |

## Task Model

```javascript
{
  title: String,        // required
  completed: Boolean,   // default: false
  dueDate: Date,        // required
  createdAt: Date,      // auto-generated
  updatedAt: Date       // auto-generated
}
```

## Setting up MongoDB Atlas (Cloud Database)

If you want to use MongoDB Atlas instead of a local MongoDB installation:

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient for development)
3. Configure database access (create a user with password)
4. Configure network access (IP whitelist)
5. Get your connection string and add it to the `.env` file

## Connecting to Frontend

To connect this backend to the TodoList frontend:

1. Make sure both servers are running
2. Update the `API_BASE_URL` in the frontend's `app/api/todoService.ts` file:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ``` 