# InstructorHub - Music Instruction Management System

## Overview

InstructorHub is a comprehensive web application designed to help music instructors manage their teaching business. The system provides tools for student management, class scheduling, attendance tracking, payment processing, and business reporting. Built as a full-stack application with a React frontend and Express backend, it offers a modern, responsive interface for instructors to streamline their administrative tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Styling System**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

The frontend uses a feature-based structure with pages for dashboard, students, schedule, attendance, payments, and reports. Shared UI components follow the shadcn/ui pattern with customizable variants using class-variance-authority.

### Backend Architecture
The server-side application uses Express.js with TypeScript in a RESTful API design:

- **Web Framework**: Express.js with middleware for JSON parsing, logging, and error handling
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **Database Layer**: Drizzle ORM for type-safe database operations and query building
- **API Design**: REST endpoints organized by feature (students, attendance, payments, dashboard)

The backend follows a layered architecture with separate modules for authentication, database operations, and route handlers. The storage layer abstracts database operations behind a clean interface.

### Database Design
The system uses PostgreSQL with a normalized schema designed for multi-tenant instructor management:

- **Users Table**: Stores instructor profiles with Replit Auth integration
- **Students Table**: Student information linked to instructors with status tracking
- **Class Schedules**: Recurring class information with day/time specifications
- **Attendance Records**: Individual class attendance tracking with status
- **Payment Records**: Financial transactions with due dates and status
- **Sessions Table**: Authentication session storage

The schema enforces referential integrity and includes proper indexing for performance. All tables include created/updated timestamps for audit trails.

### Authentication & Security
The application has been configured to run without external authentication dependencies:

- **Local Development**: Mock authentication middleware for development and testing
- **Multi-tenant Ready**: Data isolation structure maintained for future auth integration
- **Authorization Framework**: Route-level protection structure preserved for easy auth addition
- **Portable Deployment**: Can run on any hosting service without platform-specific dependencies

### API Structure
The REST API follows conventional patterns with protected endpoints:

- **Authentication Routes**: Login/logout via Replit Auth
- **Student Management**: CRUD operations for student profiles and scheduling
- **Attendance Tracking**: Daily class management and historical records  
- **Payment Processing**: Invoice generation and payment status tracking
- **Dashboard Metrics**: Aggregated business intelligence data

All API responses use consistent JSON structure with proper HTTP status codes and error handling.

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database for data persistence (or any PostgreSQL instance)

### Removed Dependencies
- **Replit Auth**: Removed to enable deployment on any hosting service
- **Passport.js**: Removed along with authentication dependencies
- **express-session**: Removed as not needed for mock authentication
- **connect-pg-simple**: Removed as session storage not required

### UI Component Library
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Drizzle ORM**: Type-safe database operations and migrations
- **Zod**: Runtime type validation for forms and API data
- **Vite**: Fast development server and build tool for frontend

### Utility Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **date-fns**: Date manipulation and formatting utilities
- **clsx/tailwind-merge**: Conditional CSS class composition