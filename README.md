# Connect Api — setup guide

This project has a React/Vite frontend and an Express/Sequelize/MySQL backend.

## 1. Requirements
- Node.js 20.19+ (Node 24 is suitable)
- MySQL Server and a database user
- A database named `api_connect_project` (or update `backend/.env`)

## 2. Configure the backend
1. Open a terminal in `backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Edit `.env` with your own MySQL database name, username, password and a long random `JWT_SECRET`.
5. Start MySQL, then run `npm run dev`.
6. Open `http://localhost:5000/`; the API should return a JSON success message.

## 3. Configure the frontend
1. Open a second terminal in `frontend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if you need to change the API URL.
4. Run `npm run dev` and open the local URL printed by Vite.

## 4. Important notes
- Keep real `.env` files private. They are intentionally not included in this ZIP; create them from the example files.
- The backend uses Sequelize `sync()` to create missing tables, but it does not guarantee that an existing database has every required column or compatible schema. Back up your database before schema changes.
- Uploaded images are stored in `backend/uploads/`; this folder is created when the upload configuration loads.
- Protected API endpoints require a valid JWT token. Sign in through the relevant login page first.
- This archive has been statically reviewed and JavaScript syntax checked. Runtime integration with your local MySQL database and credentials must be tested on your computer.
