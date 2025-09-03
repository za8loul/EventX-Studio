# Event Management System Backend

A robust backend system for managing events with Role-Based Access Control (RBAC) and user management.

## Features

- **User Management**: Complete user CRUD operations with role-based access
- **Role-Based Access Control (RBAC)**: Four user roles with different permission levels
- **Event Management**: Full CRUD operations for events with ownership validation
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **MongoDB Integration**: Mongoose ODM for database operations

## User Roles & Permissions

### 1. Super Admin
- **Permissions**: All permissions
- **Capabilities**: Can manage users, roles, events, and system settings

### 2. Admin
- **Permissions**: User management, event management, view logs
- **Capabilities**: Can create, read, update users and events

### 3. Moderator
- **Permissions**: Read users, create/read/update events
- **Capabilities**: Can manage events but limited user access

### 4. User
- **Permissions**: Read events only
- **Capabilities**: Basic event viewing access

## API Endpoints

### Authentication Routes (`/users`)
- `POST /users/signup` - User registration
- `POST /users/login` - User login
- `POST /users/refresh-token` - Refresh access token
- `POST /users/logout` - User logout (requires auth)
- `PUT /users/update` - Update user profile (requires auth)
- `GET /users/profile` - Get user profile (requires auth)
- `POST /users/add` - Create new user (admin only)
- `GET /users/users` - List all users (super admin only)

### Event Routes (`/events`)
- `GET /events` - Get all published events (public)
- `GET /events/:id` - Get event by ID (public)
- `POST /events` - Create new event (requires CREATE_EVENT permission)
- `PUT /events/:id` - Update event (requires UPDATE_EVENT permission + ownership)
- `DELETE /events/:id` - Delete event (requires DELETE_EVENT permission + ownership)
- `GET /events/admin/all` - Get all events (admin only)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ems_db
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   SALT_ROUNDS=10
   ```

4. Run the migration script to convert existing admin data:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Models

### User Model
- Basic user information (name, email, age, gender)
- Role-based access control
- Account status and last login tracking
- Password hashing with bcrypt

### Event Model
- Event details (title, description, date, location)
- Capacity and pricing information
- Category and status management
- Creator ownership tracking

### Blacklisted Tokens
- JWT token blacklisting for logout functionality
- User reference for token management

## Security Features

- **Password Hashing**: Bcrypt with configurable salt rounds
- **JWT Tokens**: Access and refresh token system
- **Token Blacklisting**: Secure logout mechanism
- **Role Validation**: Middleware-based permission checking
- **Input Validation**: Request data validation and sanitization

## Middleware

### Authentication Middleware
- JWT token verification
- Token expiration handling
- User existence validation
- Account status checking

### Authorization Middleware
- Role-based access control
- Permission-based access control
- Admin and super admin validation

## Error Handling

- Comprehensive error handling for all routes
- Proper HTTP status codes
- Detailed error messages for debugging
- Graceful fallbacks for common issues

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Migration
```bash
npm run migrate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
