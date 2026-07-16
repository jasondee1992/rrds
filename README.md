# RRDS Airconditioning Services Website

Project foundation for the RRDS Airconditioning Services Website.

Phase 3 adds the Prisma + SQLite database design for administrators, customers, inquiries, estimate requests, quotations, quotation items, and company settings. Authentication flows, admin dashboard pages, quotation forms, and chatbot features are not included yet.

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
npm run prisma:migrate -- --name phase_3_database_design
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
