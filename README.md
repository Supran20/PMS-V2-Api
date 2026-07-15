# Podcast Management System

Welcome to the **Podcast Management System** backend repository. This project is a robust, scalable backend application designed to manage podcasts, users, episodes, and related metadata.

## 🚀 Overview

The Podcast Management System is built using modern backend technologies to ensure high performance, security, and maintainability. It provides RESTful APIs for managing podcast content, handling user authentication, processing media uploads, and scheduling automated tasks.

This README is designed to serve as a comprehensive guide for developers and as a knowledge-base document for AI assistants (like Claude) attached to this project.

## 🛠️ Technology Stack

- **Runtime Environment:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js 5
- **Database ORM:** Sequelize
- **Database Dialect:** PostgreSQL (`pg`)
- **Package Manager:** pnpm
- **Data Validation:** Zod
- **Authentication & Security:** JWT (`jsonwebtoken`) & `bcryptjs`
- **File Uploads:** Multer
- **Task Scheduling:** `node-cron`
- **Email Services:** Nodemailer, AWS SES, and `@react-email` for email templating

## 📁 Project Structure

While the full structure may evolve, the core directories generally include:
- `src/` - Contains the TypeScript source code (controllers, routes, services, models, middlewares).
- `dist/` - Compiled JavaScript output (generated after build).
- `database/` - Sequelize migrations and seeders.
- `docs/` - Project documentation.
- `uploads/` - Local storage for uploaded files (if not using cloud storage).
- `react-email-starter/` - Templates for transactional emails.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (v10+ as specified in `package.json`)
- [PostgreSQL](https://www.postgresql.org/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Podcast Management System"
```

### 2. Install dependencies
Use `pnpm` to install the required packages:
```bash
pnpm install
```

### 3. Environment Configuration
Copy the sample environment file and configure your local settings:
```bash
cp .env.sample .env
```
Make sure to fill in the necessary database credentials, JWT secrets, and AWS/Email configurations in your `.env` file.

### 4. Database Setup
The project uses Sequelize CLI to manage database migrations and seeding.
Run the following commands to set up your local database:
```bash
# Run all pending migrations
pnpm run migrate

# (Optional) Seed the database with initial data
pnpm run seed
```

### 5. Running the Application
**Development Mode:**
To start the server with hot-reloading (using `ts-node-dev`):
```bash
pnpm run dev
```

**Production Mode:**
To build the TypeScript code and start the compiled JavaScript server:
```bash
pnpm run build
pnpm run start
```

## 📜 Available Scripts

- `pnpm run dev`: Starts the development server with auto-reload.
- `pnpm run build`: Compiles the TypeScript source code to JavaScript.
- `pnpm run start`: Starts the production server from the `dist/` directory.
- `pnpm run migrate`: Runs database migrations.
- `pnpm run migrate:undo`: Reverts all database migrations.
- `pnpm run seed`: Runs database seeders to populate initial data.
- `pnpm run seed:undo`: Reverts all database seeders.

## 🤖 Context for AI Assistants (e.g., Claude)

If you are an AI assistant analyzing this project, please note the following architectural decisions:
- **Validation:** All incoming request payloads (body, query, params) should be validated using **Zod** schemas.
- **Authentication:** Protected routes expect a valid JSON Web Token (JWT). Passwords must always be hashed using `bcryptjs` before saving to the database.
- **Database:** The project relies heavily on **Sequelize** models. All schema changes must be accompanied by corresponding migration files in the `database/` directory.
- **File Handling:** **Multer** is configured to handle multipart/form-data for podcast audio and image uploads.
- **Background Jobs:** Scheduled tasks (like podcast publishing or notifications) are managed by `node-cron`.

## 📄 License

This project is licensed under the ISC License.
