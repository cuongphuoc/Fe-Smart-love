# Backend Integration Guide

This document explains how to integrate the To-Do List application with a backend API service.

## API Configuration

The application is set up to connect to a RESTful API backend. The API service is configured in the file `app/api/todoService.ts`.

### Setting the API URL

To connect to your backend service:

1. Open the file `app/api/todoService.ts`
2. Update the `API_BASE_URL` constant with your backend URL:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

For development with a local backend, you might use:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Environment Variables (Optional)

For better security and configuration management, consider using environment variables:

1. Create a `.env` file in the root of your project
2. Add your API URL:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

3. Uncomment the environment variable line in `todoService.ts`:

```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
```

## Required API Endpoints

Your backend service needs to implement the following endpoints:

### Task Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/tasks` | Get all tasks | - | `{ success: true, data: Task[] }` |
| POST | `/tasks` | Create a new task | `{ title, completed, dueDate }` | `{ success: true, data: Task }` |
| PUT | `/tasks/:id` | Update a task | `{ title?, completed?, dueDate? }` | `{ success: true, data: Task }` |
| DELETE | `/tasks/:id` | Delete a task | - | `{ success: true, data: boolean }` |
| DELETE | `/tasks` | Delete multiple tasks | `{ ids: string[] }` | `{ success: true, data: boolean }` |
| PATCH | `/tasks/:id/toggle` | Toggle task completion | `{ completed }` | `{ success: true, data: Task }` |

### Task Data Structure

Each task should have the following structure:

```typescript
interface Task {
  id: string;         // Unique identifier
  title: string;      // Task title/description
  completed: boolean; // Task completion status
  dueDate: string;    // ISO date string (e.g., "2023-12-31T15:00:00.000Z")
}
```

## Testing the API Connection

To verify your backend connection:

1. Run the application
2. Add a new task
3. Check your backend logs or database to confirm the task was created
4. Refresh the app to see if tasks load from the backend

## Error Handling

The application includes error handling for API requests. If there are issues with the backend connection, error messages will be displayed to the user.

## Offline Support

The application implements basic offline caching using AsyncStorage. Tasks will be cached locally and synchronized with the backend when a connection is available.

## Security Considerations

For a production application, consider implementing:

1. Authentication with JWT tokens or similar
2. HTTPS for all API communications
3. Rate limiting to prevent abuse
4. Input validation on both client and server side

## Backend Technologies

The frontend is designed to work with any RESTful API backend. Some recommended backend technologies:

- Node.js with Express or NestJS
- Django REST Framework
- Ruby on Rails
- ASP.NET Core
- Firebase Functions

Choose a solution that best fits your team's expertise and requirements. 