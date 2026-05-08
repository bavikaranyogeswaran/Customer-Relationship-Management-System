# CRM Lead Management System

A full-stack Customer Relationship Management (CRM) application designed for small sales teams to manage leads, track them through a sales pipeline, and view real-time performance analytics.

## Project Overview

This CRM application provides a complete solution for ingesting, managing, and converting sales leads. It features a secure authentication system, role-based access control, paginated lead management with full-text search and advanced filtering, interaction history (notes) tracking, and a real-time dashboard aggregating sales pipeline metrics.

## Tech Stack

*   **Frontend**: React 19, TypeScript, Vite, TailwindCSS, shadcn/ui
*   **Backend**: NestJS 11, TypeScript
*   **Database**: PostgreSQL (using `pg` driver with raw SQL)
*   **Authentication**: JSON Web Tokens (JWT) via Passport, bcrypt for password hashing
*   **Other**: NodeMailer for password reset flows

## Features Implemented

*   **Secure Authentication**: JWT-based login with HTTP-only refresh cookies, account lockout after 5 failed attempts, and password reset functionality.
*   **Lead Lifecycle Management**: Full CRUD operations for leads. Leads include all essential fields (Source, Status, Deal Value, Assigned Salesperson, etc.).
*   **Lead Notes**: chronological tracking of all interactions (calls, emails, meetings) attached to a specific lead.
*   **Advanced Filtering & Search**: Full-text search across lead names, companies, and emails. Dropdown filtering by Pipeline Status, Lead Source, and Assigned Salesperson.
*   **Real-time Dashboard**: Dynamic aggregation of new, contacted, qualified, and won leads. Calculates total pipeline value, won deal value, and win rates. Time-range filtering included.
*   **Role-Based Access Control**: "Admin" users can view all leads and manage team members. "User" (Sales Rep) accounts can only view and manage leads explicitly assigned to them.

---

## How to Run Locally

### Prerequisites
*   Node.js (v20+)
*   PostgreSQL (v14+)

### 1. Database Setup

1.  Ensure your local PostgreSQL server is running.
2.  Create a new database named `crm` (or your preferred name).
3.  Execute the schema file to create the necessary tables:
    You can manually run the SQL found in `backend/src/database/schema.sql`.

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Copy the template file to create your local environment configuration:
    ```bash
    cp .env.example .env
    ```
    *Update the `DATABASE_URL` in `.env` to match your local PostgreSQL credentials.*

4.  Seed the Database (Optional but recommended):
    This will create test users and sample leads.
    ```bash
    npm run db:seed
    ```

5.  Start the Backend Server:
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:3000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Copy the template file:
    ```bash
    cp .env.example .env
    ```

4.  Start the Frontend Development Server:
    ```bash
    npm run dev
    ```
    The CRM UI will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/crm?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Required for Password Reset functionality
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER="your_email@gmail.com"
MAIL_PASS="your_app_password_here"
MAIL_FROM="your_email@gmail.com"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3000"
```

---

## Test Login Credentials

If you ran the `npm run db:seed` command, you can use the following credentials to access the system:

**Admin User (Full Access)**
*   Email: `admin@crm.com`
*   Password: `password123`

**Sales Rep (Restricted Access)**
*   Email: `sales@crm.com`
*   Password: `password123`

---

## Known Limitations

*   **Concurrency**: While optimistic locking is implemented for lead updates (using a `version` column), simultaneous edits to the *exact same* Note content by different admins could result in a "last-write-wins" scenario.
*   **Email Deliverability**: The password reset functionality uses a basic SMTP configuration. In a production environment, this should be replaced with a dedicated transactional email service (like Resend or SendGrid) to ensure high deliverability rates.
*   **Soft Deletes**: Deleting a lead performs a "soft delete" (setting `deleted_at`). A background cron job should be implemented in the future to permanently purge data older than 90 days to comply with data retention policies.

---

## Reflection

Building this CRM was an excellent exercise in balancing architectural purity with practical, user-facing features. 
One of the most interesting challenges was implementing the role-based access control (RBAC) at the database query level. Initially, I handled the "Admin vs. Sales Rep" logic entirely in the application service layer by fetching all leads and then filtering them in memory. However, I quickly realized this would not scale. I refactored the backend `LeadsService` to dynamically append `AND assigned_to = $X` to the raw SQL queries if the user was not an admin. This pushed the filtering logic down to the database level, significantly improving performance and ensuring strict data isolation between sales reps.

Additionally, managing the state of the complex filtering system (Status + Source + Salesperson + Full-text search) on the frontend taught me the importance of resetting pagination correctly. Whenever a filter changes, the system must aggressively reset the `page` metadata back to `1` to prevent the UI from requesting a non-existent page of the newly filtered dataset.

---

## Demo Video

[Link to 5-10 minute Loom/YouTube Demo Video goes here]
