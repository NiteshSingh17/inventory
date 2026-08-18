Inventory Management

Quick start with Docker

```
docker-compose up --build
```

Backend runs on :3001, frontend on :3000.

Manual setup

Database

Need PostgreSQL running. Then:

```
cd backend
cp .env.example .env  
npm install
npx prisma migrate dev
npm run db:seed
```

Backend

```
cd backend
npm run start:dev
```

Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

Selecting a test user

Use the dropdown in the top nav to switch between seeded users (user1 through user10, plus admin). The app sends the selected user's ID via `x-user-id` header on every request.

Background worker

```
cd backend
npm run process:tasks
```

Or hit `POST /tasks/process` as an ADMIN user.

Concurrency test

With the backend running:

```
cd backend
npm run concurrency:test
```
