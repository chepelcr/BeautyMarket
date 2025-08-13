# Overview

This is a full-stack e-commerce application for "Strawberry Essentials," a beauty products catalog and ordering system. The application is built as a single-page application (SPA) with a React frontend and Express.js backend, designed to showcase beauty products across categories like makeup, skincare, and accessories. The system integrates with WhatsApp for order processing and includes comprehensive admin functionality for product management.

**GitHub Pages Compatibility**: The application now supports both dynamic (with backend) and static deployment modes. When deployed to GitHub Pages, it automatically switches to static mode using localStorage and client-side data management while maintaining full functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 13, 2025)

- **✅ Foreign Key Category Management**: Migrated from string-based category matching to proper foreign key relationships between products and categories tables
- **✅ Database Schema Migration**: Updated products table to use `category_id` foreign key instead of `category` string field with proper constraints
- **✅ JOIN Query Optimization**: Implemented JOIN queries in product filtering for reliable category-based results using category slugs
- **✅ Product Form Enhancement**: Updated admin product forms to use category ID selection with proper foreign key validation
- **✅ API Backward Compatibility**: Maintained backward compatibility in API responses while using modern database relationships
- **✅ Category Slug Routing**: Enhanced category filtering to work with both category slugs and names for flexible URL structure
- **✅ AWS S3 Integration**: Implemented complete S3 integration for image uploads
- **✅ CMS Image Upload**: Replaced URL input fields with S3-powered image upload components  
- **✅ Background Settings Fix**: Converted "color" type fields to "background" type fields for advanced styling
- **✅ Preview Modal Fix**: Resolved redirect errors in CMS preview modal
- **✅ Deployment Target**: Changed from GitHub Pages to AWS S3 bucket hosting
- **✅ Upload Endpoints**: Added S3 presigned URL generation and file management
- **✅ Auto-Deploy Feature**: Added one-click deployment button in CMS for non-technical users
- **✅ Deployment Status**: Real-time deployment tracking with progress indicators
- **✅ Static Build Pipeline**: Automated build and deploy process to S3 without developer intervention
- **✅ Serverless Authentication**: Complete JWT-based authentication system with database-level session management
- **✅ API Key Protection**: Public endpoints protected with API key authentication for secure access
- **✅ Security Hardening**: Rate limiting, session invalidation, and comprehensive access control implemented
- **✅ Swagger Documentation**: Auto-generated API documentation with interactive testing interface
- **✅ AWS Lambda Deployment**: Complete serverless deployment setup with Docker and Serverless Framework
- **✅ Production Ready**: Full CI/CD pipeline with multiple deployment targets and comprehensive monitoring
- **✅ Shop Sidebar Theming**: Fixed ProductFilters and CartSidebar dark/light mode compatibility
- **✅ CMS Sidebar Options**: Added 8 comprehensive sidebar customization options to admin panel
- **✅ AWS SDK v3 Migration**: Migrated from AWS SDK v2 to v3 for better performance and security
- **✅ Auth Bug Fix**: Resolved login error with updateUser method implementation
- **✅ S3 ACL Fix**: Removed ACL settings from S3 deployment to support modern bucket configurations
- **✅ Deployment History**: Complete deployment tracking system with database storage and history page
- **✅ ES Module Migration**: Converted build scripts from CommonJS to ES modules for deployment compatibility
- **✅ Responsive Button Layout**: Fixed CMS button layout for proper tablet and mobile display
- **✅ Profile UX Enhancement**: Redesigned profile page with display-first approach and less aggressive security forms
- **✅ Admin Button Move**: Moved Admin button from navbar to user dropdown for cleaner navigation
- **✅ Profile Data Fix**: Fixed firstName/lastName mapping in user endpoint for proper profile updates
- **✅ Username Editing**: Added username editing functionality with uniqueness validation
- **✅ Comprehensive Font System**: Migrated from Inter to Nunito for rounded, friendly typography across entire application
- **✅ Font Token Architecture**: Implemented complete font token system with semantic typography classes and CSS variables
- **✅ CloudFront Integration**: Complete CloudFront distribution integration for consistent image delivery across the application
- **✅ Image Preservation System**: Updated deployment to preserve uploaded images in separate 'images/' directory during builds
- **✅ Unified Image URL System**: All image URLs now normalized through CloudFront (d1taomm62uzhjk.cloudfront.net) for consistent delivery
- **✅ CMS Upload Migration**: Updated all CMS image upload components to use new S3 system with CloudFront URLs
- **✅ Homepage Image Updates**: Applied CloudFront URL normalization to all homepage image content including hero section
- **✅ Background Image Support**: Added CloudFront URL support for CMS background image configurations
- **✅ Password Reset Integration**: Added complete forgot password functionality to login form with email modal
- **✅ Email Service CloudFront Fix**: Updated password reset emails to use CloudFront distribution URL instead of localhost
- **✅ S3 SPA Routing Fix**: Added proper S3 bucket website configuration and error document handling for client-side routing support

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

**Serverless JWT Authentication System**: Complete stateless authentication designed for serverless deployment:

- **Database-Level Sessions**: All session data stored in PostgreSQL with token hash validation
- **JWT Tokens**: Stateless authentication tokens with 24-hour expiration and automatic refresh
- **API Key Protection**: Public endpoints secured with API key authentication (default key: `sk-test123`)
- **Role-Based Access Control**: Admin-only endpoints for CMS and product management
- **Security Features**: Rate limiting (1000 req/15min), session invalidation, IP tracking, automatic cleanup
- **Database Tables**: `user_sessions` for JWT validation, `api_keys` for public access, enhanced `users` table
- **Deployment Ready**: No server-side session storage, fully horizontal-scalable architecture

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

## Auto-Deployment System

- **One-Click Deploy**: CMS includes automated deployment button for non-technical users
- **Real-time Status**: Live deployment progress tracking with build and upload phases
- **S3 Integration**: Automatic build and upload to AWS S3 static hosting
- **No Developer Required**: Complete autonomous deployment workflow from content changes to live site
- **Build Pipeline**: Automated static site generation optimized for production

## Development and Deployment

- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development**: Integrated development server with hot reload
- **Type Safety**: Full TypeScript support across frontend, backend, and shared schemas
- **Database Migrations**: Drizzle Kit for database schema management
- **Environment**: Replit-optimized with specific plugins and configurations
- **Image Storage**: AWS S3 integration for file uploads and management
- **Deployment Options**: 
  - Primary: AWS S3 static hosting with S3 image storage (`npm run deploy`)
  - Alternative: GitHub Pages with client-side data management (`npm run deploy:github`)
  - Dynamic: Replit with full backend functionality for development
- **AWS S3 Integration**: Direct image uploads to S3 with presigned URLs and comprehensive ACL system