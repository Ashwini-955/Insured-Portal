# Insured-Portal 
# Main modules- policy , claims, billings

### 1. Backend Setup

#### Step 1 — Go to the backend folder
```bash
cd backend
```

#### Step 2 — Install dependencies
```bash
npm install
```

#### Step 3 — Create your environment file

Create a file called `.env` inside the `/backend` folder:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
```

> ⚠️ Never push your `.env` file to GitHub. It is already listed in `.gitignore`.

To get your `MONGO_URI`:
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string and replace `<password>` with your DB user password

#### Step 4 — Run the backend server
```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```
🔌 API Overview
POST /api/auth/login
Authenticates user using email and returns JWT token + user details.
GET /api/policies/email/:email
Fetches all policies associated with the user’s email.
GET /api/claims?policyNumbers=...
Retrieves claims data for given policy numbers.
GET /api/billing?policyNumbers=...
Retrieves billing details (dues, payments) for given policy numbers.
