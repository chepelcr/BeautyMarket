# Overview

This is a full-stack e-commerce application for "Strawberry Essentials," a beauty products catalog and ordering system. The application is built as a single-page application (SPA) with a React frontend and Express.js backend, designed to showcase beauty products across categories like makeup, skincare, and accessories. The system integrates with WhatsApp for order processing and includes comprehensive admin functionality for product management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses **React 18** with **TypeScript** and **Vite** as the build tool. The architecture follows modern React patterns:

- **Component Architecture**: Uses shadcn/ui component library built on Radix UI primitives for consistent, accessible UI components
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **State Management**: Zustand for client-side state management with persistence middleware for cart functionality
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management, caching, and synchronization
- **Form Handling**: React Hook Form with Zod for validation and type safety

## Backend Architecture

The backend is built with **Express.js** and follows RESTful API principles:

- **Database Layer**: Uses Drizzle ORM with PostgreSQL (specifically Neon Database) for type-safe database operations
- **API Structure**: RESTful endpoints for products, orders, and file management
- **File Storage**: Google Cloud Storage integration for product image management with custom ACL (Access Control List) system
- **Development**: Hot module replacement with Vite middleware integration for seamless development experience

## Data Storage Solutions

- **Primary Database**: PostgreSQL via Neon Database serverless platform
- **Object Storage**: Google Cloud Storage for product images and media files
- **Session Storage**: Browser localStorage for cart persistence
- **Database Schema**: Two main entities - Products and Orders with proper relationships and constraints

## Authentication and Authorization

The application currently implements a basic admin interface without complex authentication. The object storage system includes a comprehensive ACL framework for future access control needs, supporting different access group types and permission levels.

## File Upload and Management

- **Upload System**: Custom object uploader component using Uppy.js for file management
- **Storage Integration**: Direct upload to Google Cloud Storage with presigned URLs
- **ACL System**: Extensible access control system for object-level permissions
- **Public Access**: Configurable public object search paths for serving static assets

## Order Processing

- **Cart Management**: Client-side cart with persistent storage across sessions
- **Checkout Flow**: Multi-step checkout with customer information and delivery details
- **Location System**: Integrated Costa Rican location data (provinces, cantons, districts)
- **WhatsApp Integration**: Generates formatted WhatsApp messages for order processing
- **Order Storage**: Orders are stored in the database with full customer and item details

## Development and Deployment

- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development**: Integrated development server with hot reload
- **Type Safety**: Full TypeScript support across frontend, backend, and shared schemas
- **Database Migrations**: Drizzle Kit for database schema management
- **Environment**: Replit-optimized with specific plugins and configurations