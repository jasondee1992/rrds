# RRDS Airconditioning Services Website

Project foundation for the RRDS Airconditioning Services Website.

Phase 4 adds secure admin authentication and the protected admin dashboard foundation. Quotation creation, estimate processing, chatbot logic, contact form backend, PDF generation, and content management are not included yet.

## Technology Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

Backend:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Zod
- dotenv
- cors
- helmet
- morgan
- JWT
- bcrypt

## Folder Structure

```text
rrds/
├── frontend/
│   └── src/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
├── docs/
├── .gitignore
└── README.md
```

## Installation

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

## Environment Variables

Create local environment files from the examples. Do not commit actual `.env` files.

Frontend: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend: `backend/.env`

```env
PORT=5000
DATABASE_URL="file:./dev.db"
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
ADMIN_NAME="RRDS Super Admin"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
```

## Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Placeholder routes:

- `/`
- `/services`
- `/projects`
- `/free-quotation`
- `/contact`
- `/admin/login`
- `/admin/dashboard`

## Run the Backend

```bash
cd backend
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

Health endpoint:

```text
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "RRDS API is running"
}
```

## Phase 3 Database Setup

The Prisma schema is configured for SQLite development.

Create `backend/.env` from `backend/.env.example`, then update the admin seed values:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Confirm the Prisma schema is valid:

```bash
npm run prisma:validate
```

Create the SQLite database and run migrations:

```bash
npx prisma migrate dev -n phase_3_database_design
```

Seed the initial super admin and company settings:

```bash
npm run prisma:seed
```

Alternative direct Prisma seed command:

```bash
npx prisma db seed
```

The seed script inserts or updates:

- One `SUPER_ADMIN` using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`
- One default `CompanySetting`

## Phase 3 Database Models

- `AdminUser`
- `Customer`
- `Inquiry`
- `EstimateRequest`
- `Quotation`
- `QuotationItem`
- `CompanySetting`

## Phase 3 Enums

- `AdminRole`
- `InquiryStatus`
- `InquirySource`
- `EstimateRequestStatus`
- `QuotationStatus`
- `QuotationItemType`

## Phase 4 Admin Authentication

Admin users are created through the seed script or database administration. Public admin registration is intentionally not available.

Seed or update the default admin after setting `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`:

```bash
cd backend
npm run prisma:seed
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open the admin login page:

```text
http://localhost:5173/admin/login
```

Use the seeded credentials from `backend/.env`:

```text
Email: admin@example.com
Password: change-this-password
```

Change these values before using the project outside local development.

### Admin API Endpoints

```text
POST /api/admin/auth/login
GET  /api/admin/auth/me
POST /api/admin/auth/logout
GET  /api/admin/dashboard/summary
```

Protected endpoints require:

```text
Authorization: Bearer <access-token>
```

JWT logout is stateless in Phase 4. The logout endpoint returns success, and the frontend removes the stored token. Refresh tokens and token revocation are intentionally not implemented yet.

### Token Storage

The frontend stores the admin access token in `localStorage` for this development phase. The token access code is isolated so it can later be changed to secure HTTP-only cookies.
