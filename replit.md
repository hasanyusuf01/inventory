# Device Management System

## Overview

This is a full-stack device management system built with React, Node.js/Express, and PostgreSQL. The application allows users to manage devices, track their availability, and handle device issuance/returns. It features a modern UI built with shadcn/ui components and follows a clean architecture with separate client and server directories.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt hashing

### Data Storage
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Database Schema
- **Users Table**: Stores user credentials with bcrypt-style password hashing
- **Devices Table**: Manages device inventory with fields for device ID, issue status, and assignment tracking
- **Sessions Table**: Automatically managed by connect-pg-simple for session persistence

### Authentication System
- Session-based authentication using Passport.js
- Local strategy with username/password
- Protected routes with authentication middleware
- Automatic session management with PostgreSQL storage

### Device Management
- CRUD operations for device inventory
- Device search and filtering capabilities
- Status tracking (available/issued)
- Assignment tracking with user information and dates
- Statistics dashboard for device counts and trends

### API Structure
- RESTful API design with `/api` prefix
- Authentication endpoints: `/api/login`, `/api/register`, `/api/logout`, `/api/user`
- Device endpoints: `/api/devices` with full CRUD operations
- Statistics endpoint: `/api/devices/stats`

## Data Flow

1. **Authentication Flow**: User logs in → Passport validates credentials → Session created in PostgreSQL → User data cached in TanStack Query
2. **Device Management Flow**: User interacts with UI → Form validation with Zod → API request → Database operation via Drizzle → Real-time UI updates
3. **Data Fetching**: TanStack Query manages server state → Automatic caching and invalidation → Optimistic updates for better UX

## External Dependencies

### Database
- Neon Database (PostgreSQL) for production
- Connection pooling and serverless compatibility
- WebSocket support for real-time features

### UI Components
- Radix UI primitives for accessibility
- Lucide React for icons
- date-fns for date formatting
- Embla Carousel for UI components

### Development Tools
- Vite plugins for development enhancement
- Replit-specific development tools
- TypeScript for type safety
- ESLint and Prettier for code quality

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema updates

### Environment Configuration
- `DATABASE_URL` for PostgreSQL connection
- `SESSION_SECRET` for session encryption
- `NODE_ENV` for environment-specific behavior

### Production Setup
- Express serves static files from `dist/public`
- PostgreSQL connection with SSL support
- Session persistence across server restarts
- Error handling and logging middleware

### Development Mode
- Vite dev server with HMR
- Concurrent client and server development
- Automatic database migrations
- Real-time error overlay

The application follows a monorepo structure with shared types and schemas, making it easy to maintain consistency between frontend and backend while providing a smooth development experience.