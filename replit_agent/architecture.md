# Architecture Overview

## Overview

This application is a Composite Panel Loading Planning System that helps users plan and optimize the loading of composite panels into vehicles. The system allows users to:

1. Select vehicle types with specific dimensions
2. Add different panel types with various properties
3. Calculate and visualize optimal loading plans
4. Export and import panel data

The application follows a full-stack architecture with a React frontend and an Express.js backend, using PostgreSQL for data persistence.

## System Architecture

The system follows a client-server architecture with the following components:

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│                │       │                │       │                │
│    React UI    │◄─────►│ Express Server │◄─────►│   PostgreSQL   │
│    (Client)    │       │    (Server)    │       │   (Database)   │
│                │       │                │       │                │
└────────────────┘       └────────────────┘       └────────────────┘
```

### Directory Structure

```
/
├── client/                # Frontend React application
│   ├── index.html         # HTML entry point
│   └── src/               # React source files
│       ├── components/    # UI components
│       │   ├── ui/        # shadcn/ui components
│       │   └── ...        # Application-specific components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions
│       ├── pages/         # Page components
│       ├── App.tsx        # Main application component
│       └── main.tsx       # React entry point
├── server/                # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── vite.ts            # Vite development server setup
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and type definitions
└── ...                    # Configuration files
```

## Key Components

### Frontend Architecture

The frontend is a React application with TypeScript, structured with a component-based architecture. Key aspects include:

1. **Component Library**: Uses shadcn/ui, a collection of reusable UI components built on Radix UI primitives.
2. **State Management**: Uses React Query for server state and Zustand for client state management.
3. **Styling**: Utilizes TailwindCSS for styling with a consistent theme configuration.
4. **Routing**: Implements Wouter for lightweight routing.
5. **UI Organization**: Separates components into:
   - Generic UI components (in `/components/ui/`)
   - Application-specific components (directly in `/components/`)
   - Page components (in `/pages/`)

### Backend Architecture

The backend is an Express.js server with TypeScript, structured as a RESTful API. Key aspects include:

1. **API Structure**: RESTful endpoints organized around resources (vehicles, panels, loading plans).
2. **Data Access**: Abstracted through a storage interface with implementations for database access.
3. **Schema Validation**: Uses Zod for request validation based on shared schemas.
4. **Development Setup**: Integrated with Vite for development with hot reloading.

### Data Model

The application uses Drizzle ORM with PostgreSQL. Key entities in the data model:

1. **Vehicles**:
   - Properties: dimensions (length, width, height), maximum payload
   - Represents transport vehicles used for panel loading

2. **Panels**:
   - Properties: color, core type, dimensions, weight per square meter, count
   - Represents composite panels to be loaded

3. **Loading Plans**:
   - Properties: vehicle reference, panel references, loading configuration
   - Represents optimized loading arrangements

## Data Flow

### Panel Loading Planning Flow

1. User selects a vehicle type or specifies custom dimensions
2. User adds panel specifications (dimensions, weight, quantity, etc.)
3. System calculates an optimal loading plan based on:
   - Vehicle dimensions and payload capacity
   - Panel dimensions, weight, and stacking rules
4. System visualizes the loading plan in a 3D or 2D representation
5. User can export the loading plan or modify parameters for recalculation

### API Communication Flow

```
┌─────────┐                         ┌─────────┐                         ┌─────────┐
│         │                         │         │                         │         │
│ Browser │────► HTTP Request ────► │ Server  │────► SQL Queries ────► │   DB    │
│         │                         │         │                         │         │
│         │◄───── Response ◄────────│         │◄───── Results ◄─────────│         │
└─────────┘                         └─────────┘                         └─────────┘
```

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **shadcn/ui & Radix UI**: Component library
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: State management
- **React Query**: Data fetching and state synchronization
- **Wouter**: Routing
- **date-fns**: Date utilities
- **lucide-react**: Icon library

### Backend Dependencies

- **Express.js**: Web framework
- **Drizzle ORM**: Database ORM
- **Zod**: Schema validation
- **Neon Serverless**: PostgreSQL connection

## Deployment Strategy

The application is configured for deployment on Replit, with the following setup:

1. **Build Process**:
   - Frontend: Vite builds static assets to `dist/public`
   - Backend: esbuild bundles server code to `dist/index.js`
   - Combined with `npm run build` command

2. **Runtime Configuration**:
   - Environment variables for database connection
   - Production vs. development mode settings

3. **Service Integration**:
   - PostgreSQL database (via `DATABASE_URL` environment variable)
   - Configured to use Neon's serverless PostgreSQL

4. **Scaling Considerations**:
   - Configured for autoscaling on Replit
   - Port mapping for HTTP traffic (5000 → 80)

## Security Considerations

1. **Data Validation**: Input validation through Zod schemas
2. **Error Handling**: Structured error responses from API endpoints
3. **Environment Configuration**: Separation of development and production settings

## Future Considerations

1. **Authentication**: No authentication system is currently implemented; this would be a logical next step
2. **Caching**: Implement response caching for optimization algorithms
3. **Advanced Visualizations**: Enhance 3D visualization capabilities
4. **Mobile Optimization**: Further enhance responsive design for mobile users