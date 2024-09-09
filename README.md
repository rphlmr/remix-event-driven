# Real-Time Order Management System

This project demonstrates a cheap pub sub system using Remix, Supabase, and XState.


## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database using Supabase CLI:
   
   a. Install Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

   b. Start the Supabase local development setup:
   ```
   supabase start
   ```
   This command will set up a local Postgres database and other Supabase services.

3. Copy the `.env.example` file to `.env` and update the environment variables:
   ```
   cp .env.example .env
   ```
   Update the `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_PUBLIC`, and `SUPABASE_SERVICE_ROLE` variables with the values provided by the Supabase CLI after running `supabase start`.

4. Run database migrations:
   ```
   npm run db:migration:deploy
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000` to see the application running.

## Features

- Real-time order creation and updates
- Server-Sent Events (SSE) for live updates
- XState for managing complex state logic
- Supabase for real-time database functionality

## Project Structure

- `app/routes/_index.tsx`: Main page demo
- `app/routes/sse.tsx`: Server-Sent Events endpoint
- `app/modules/events/emitter.ts`: Event emitter using XState
- `app/database/schema.ts`: Database schema definitions
- `app/database/db.server.ts`: Database connection setup

