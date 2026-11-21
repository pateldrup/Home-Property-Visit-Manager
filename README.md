# Property Visit Manager

A React Native full-stack assignment for managing home and property visits.

## Features
- User Authentication (Register/Login) with JWT
- View, Add, Edit, Delete Properties
- Device Camera and Gallery integration for Property Photos
- Geolocation tracking with reverse geocoding
- Device Contacts access to link Property Owner/Agent
- Copy Address/Phone to Clipboard
- Share Property details
- Search properties by title, city, or type

## Tech Stack
- Frontend: React Native, Expo, Expo Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Security: bcryptjs, jsonwebtoken
- File Uploads: multer

## Folder Structure
```text
Home-Property-Visit-Manager/
├── backend/            # Express REST API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── .env.example
│
└── my-APP/             # React Native (Expo) App
    ├── app/            # Expo Router Pages
    ├── components/     # Reusable UI
    ├── context/        # React Context (Auth)
    ├── services/       # API Services (Axios)
    └── package.json
```

## Setup Instructions

### 1. Backend Setup
1. Open terminal and navigate to `backend` folder.
2. Run `npm install` to install dependencies.
3. Rename `.env.example` to `.env`.
4. Make sure MongoDB is running locally or provide a MongoDB Atlas URI in `.env`.
5. Run `node server.js` (or `npm start` if added).
6. Backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open another terminal and navigate to `my-APP`.
2. Run `npm install`.
3. Open `my-APP/services/api.js` and configure the `API_URL`.
   - Android Emulator: `http://10.0.2.2:5000/api`
   - iOS Emulator: `http://localhost:5000/api`
   - Physical Device: `http://YOUR_LOCAL_IP:5000/api` (ensure phone and PC are on same WiFi).
4. Run `npx expo start`.
5. Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## REST API Endpoints
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Properties**: `GET /api/properties`, `POST /api/properties`, `GET /api/properties/:id`, `PUT /api/properties/:id`, `DELETE /api/properties/:id`

## Permissions
The app uses the following permissions:
- **Camera & Gallery**: To take and select property photos.
- **Location**: To fetch the precise coordinates of the property.
- **Contacts**: To link a property with an owner/agent.

## Viva Explanation
This project is built using the MERN stack (React Native instead of React JS). 
1. **React Native (Frontend)**: Presents the UI and gathers user inputs, including images, coordinates, and contacts.
2. **Axios/Fetch**: Makes HTTP requests to our Node.js server.
3. **Express REST API (Backend)**: Handles the incoming HTTP requests, performs validations, handles image uploads with `multer`, and checks JWT authentication.
4. **MongoDB (Database)**: Stores the user and property data securely.

## Common Errors
- `Network Error`: Check your API_URL configuration and ensure your backend is running. For physical devices, ensure the IP address is correct.
- `Permission Denied`: Grant the necessary permissions in your device settings to use Camera, Location, and Contacts.