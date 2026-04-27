# Food Waste Backend

Express.js backend for the Food Waste Management app.

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create `.env` file with these values:
PORT=5000
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=railway
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

4. Run: `npm run dev`

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/vendors/register | ❌ | Register vendor |
| POST | /api/vendors/login | ❌ | Login vendor |
| GET | /api/vendors/me/listings | ✅ | Get my listings |
| GET | /api/food-items?lat=&lng= | ❌ | Get nearby food |
| POST | /api/food-items | ✅ | Create listing |
| PATCH | /api/food-items/:id/claim | ❌ | Claim food item |
| PATCH | /api/food-items/:id/status | ✅ | Update status |
| POST | /api/upload | ✅ | Upload image |
