# Money Tracker

Full-stack expense tracker — React Native (Expo) mobile + Node/Express/MongoDB backend.

Add income and expenses, view charts, filter by period, export to Excel, and share via WhatsApp.

---

## Stack

- **Backend:** Node.js, Express, Mongoose, MongoDB Atlas, JWT, bcryptjs
- **Mobile:** Expo SDK 57, Expo Router, React Query, react-native-paper, axios, SecureStore
- **Extras:** react-native-chart-kit, DateTimePicker, xlsx, expo-sharing

---

## Features

- Sign up, login, auto-login, logout
- Add / edit / delete transactions with category, description, and date
- Net balance + pie chart (expenses or income by category)
- Month / Year / Custom date filters shared across all screens
- Export transactions to `.xlsx` and share via WhatsApp or any app
- Edit profile (name, password)
- Per-user data isolation

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/money-tracker
JWT_SECRET=<32+ random characters>
PORT=5000
```

```bash
npm start
```

### 2. Mobile

```bash
cd mobile
npm install
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://<LAN-IP>:5000
```

```bash
npx expo start --clear
```

Scan the QR code with Expo Go.

---

## API

All `/api/transactions` routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| `GET` | `/api/auth/me` | Current user |
| `PUT` | `/api/auth/me` | Update name / password |
| `GET` | `/api/transactions?from=&to=` | List (optional date range) |
| `POST` | `/api/transactions` | Create |
| `PUT` | `/api/transactions/:id` | Update |
| `DELETE` | `/api/transactions/:id` | Delete |

**Categories:** `Food · Transport · Shopping · Bills · Entertainment · Health · Salary · Other`

---

## Deploy to Render

1. Push to GitHub.
2. Render → **New Web Service** → connect repo.
3. **Root Directory:** `backend` · **Build:** `npm install` · **Start:** `npm start`
4. Env vars: `MONGO_URI`, `JWT_SECRET` *(do not set `PORT`)*.
5. Point `mobile/.env` → `https://<render-url>.onrender.com`.
6. `npx expo start --clear`.

> **Free tier:** 30–50s cold start after 15min idle. Keep warm with a free cron on `https://<render-url>/` every 10 minutes.

---

## Notes

- **Backup MongoDB Atlas monthly** — free tier has no automated backups.
- **1000-row cap** per filtered query.
- No currency setting — `$` is hardcoded.
- Filter resets to current month on app restart.

---

## License

MIT
