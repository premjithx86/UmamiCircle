# AI CONTEXT FILE - Always read this file first before making any changes to understand project connections and configuration.

## 1. Server Ports
- **Backend (API):** `8080` (Express + Node.js)
- **Frontend (Web):** `5173` (Vite + React)
- **Admin Panel:** `5174` (Vite + React - if running concurrently with frontend)

## 2. Database
- **Type:** MongoDB
- **Instance:** Running on `localhost`
- **Database Name:** `umamicircle` (Standard connection string: `mongodb://localhost:27017/umamicircle`)

## 3. API Base URLs
- **Frontend connects to:** `http://localhost:8080/api` (Axios base URL)
- **Admin connects to:** `http://localhost:8080/api/admin` (Used in `adminService.js` and `Login.jsx`)

## 4. Authentication Flow
- **User Authentication:** 
    - **Provider:** Firebase Auth
    - **Verification:** Backend verifies Firebase ID Tokens in `src/middleware/auth.js`
- **Admin Authentication:**
    - **Provider:** Custom Admin Model
    - **Credentials:** Email + Password (hashed with `bcrypt`)
    - **Verification:** JWT (stored in `localStorage` on frontend)

## 5. Key Environment Variables
### Backend (`.env`)
- `MONGO_URI`: `mongodb://localhost:27017/umamicircle`
- `PORT`: `8080`
- `JWT_ADMIN_SECRET`: Secret for signing admin JWTs
- `CLOUDINARY_CLOUD_NAME`: Cloudinary account cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `SIGHTENGINE_API_USER`: Sightengine account API user
- `SIGHTENGINE_API_SECRET`: Sightengine account API secret
- `GROQ_API_KEY`: Groq Cloud API key for text moderation
- `FRONTEND_URL`: URL for CORS (typically `http://localhost:5173`)

### Frontend (`umami-frontend/.env`)
- `VITE_API_URL`: `http://localhost:8080/api`

### Admin (`umami-admin/.env`)
- `VITE_API_URL`: `http://localhost:8080/api/admin`

## 6. Folder Structure
- `src/`: Backend source code (controllers, models, routes, services, middleware)
- `tests/`: Backend test suite (Jest + Supertest)
- `umami-frontend/`: Main user application (React + Vite + Tailwind)
- `umami-admin/`: Platform administrative interface (React + Vite + Tailwind)
- `scripts/`: Utility scripts (e.g., seeding data)
- `conductor/`: Conductor track documentation and plans

## 7. Frontend-Backend Connection
- **Tool:** Axios
- **Frontend Interceptor:** `umami-frontend/src/services/api.js` (automatically attaches Firebase ID tokens to requests)
- **Admin Service:** `umami-admin/src/services/adminService.js` (manually attaches JWT tokens to requests)

## 8. Socket.io Configuration
- **Backend initialization:** `server.js` (uses `notificationService.js` and `messagingService.js`)
- **Key Events:**
    - `join`: Used to register a user's presence for notifications
    - `join_conversation`: Joining a chat room
    - `leave_conversation`: Leaving a chat room
    - `new_message`: Real-time chat message delivery
    - `typing` / `stop_typing`: Chat indicators
    - `user_typing` / `user_stopped_typing`: Frontend listeners

## 9. Image Moderation Pipeline
1.  **Client Request:** Image uploaded to `/api/posts` or `/api/recipes`
2.  **Deduplication:** MD5 hash check (`imageHash`) to prevent duplicate uploads
3.  **Safety Check:** Sightengine API for nudity, drugs, and offensive content
4.  **Content Verification:** Google Cloud Vision for food detection
5.  **Persistence:** Successful uploads are stored in Cloudinary and the URL is saved to MongoDB

## 10. Text Moderation Pipeline
1.  **Profanity Check:** `obscenity` library filters offensive language from captions/descriptions
2.  **Censorship:** Profane words are replaced with asterisks (`*`)
3.  **Food Relevance:** Groq Cloud LLM analyzes the text to ensure the content is food-related
4.  **Rejection:** If the content is deemed irrelevant to food, the request is rejected with a `400 Bad Request`

## 11. Admin Seeding
- **Script:** `scripts/seedAdmin.js`
- **Default Credentials:**
    - **Email:** `admin@umamicircle.com`
    - **Password:** `Admin@123`
- **Command:** `node scripts/seedAdmin.js` (Checks for existing admin or creates a new one)
