# RRDS Airconditioning Services Website

Phase 1 project foundation for the RRDS Airconditioning Services Website.

This repository is intentionally limited to the initial frontend and backend setup. Authentication, quotation workflows, chatbot features, business database models, and landing page design are not included in this phase.

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
rrds-website/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── public/
│       │   └── admin/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── App.tsx
│       └── main.tsx
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
├── docs/
├── .gitignore
└── README.md
```

## Installation

Install frontend dependencies:

```bash
cd rrds-website/frontend
npm install
```

Install backend dependencies:

```bash
cd rrds-website/backend
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
```

## Run the Frontend

```bash
cd rrds-website/frontend
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
cd rrds-website/backend
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

## Initialize Prisma

The Prisma schema is configured for SQLite development.

Generate the Prisma client:

```bash
cd rrds-website/backend
npm run prisma:generate
```

Confirm the Prisma schema is valid:

```bash
npm run prisma:validate
```

Create or sync the local SQLite database:

```bash
npm run prisma:push
```

The Phase 1 schema does not include business models yet. It only confirms the application can connect to SQLite.
