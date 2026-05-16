# 📚 CampusBook

> **A campus book exchange platform for college students — buy, sell, and trade textbooks with QR code verification**

CampusBook is a full-stack web application that lets college students list, discover, and exchange second-hand textbooks within their campus community. Built with a **React + TypeScript** frontend and a **Node.js** backend, it features QR code-based book verification, interactive charts, smooth animations, and a clean modern UI — deployed on Vercel.

---

## ✨ Features

- 📖 **Book Listings** — Post and browse second-hand textbooks available on campus
- 🔍 **Search & Filter** — Find books by title, subject, semester, or price
- 📷 **QR Code Support** — Generate and scan QR codes for quick book identification and verification
- 📊 **Analytics Dashboard** — Visual insights via Recharts (listings activity, price trends)
- 🎨 **Smooth Animations** — Framer Motion powered transitions and micro-interactions
- 🗃️ **State Management** — Zustand for lightweight, scalable client-side state
- 📱 **Responsive Design** — Mobile-first UI built with Tailwind CSS
- 🌐 **Deployed on Vercel** — Frontend live with SPA routing support via `vercel.json`
- ⚙️ **REST API Backend** — Node.js backend hosted on Back4App

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 6 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State Management | Zustand |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| QR Code | `qrcode`, `html5-qrcode` |
| Forms | React Hook Form |
| Backend | Node.js (REST API) |
| Backend Hosting | Back4App |
| Frontend Hosting | Vercel |

---

## 📁 Project Structure

```
campus-book/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── store/            # Zustand state stores
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript interfaces & types
│   ├── utils/            # Helper functions
│   └── main.tsx          # App entry point
├── backend/              # Node.js REST API
├── public/               # Static assets
├── .env.example          # Environment variable template
├── vercel.json           # Vercel SPA routing config
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Alis-paul/campus-book.git
cd campus-book

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
# 4. Start the development server
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:3000`

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3000` |

For production, set `VITE_API_URL` to your Back4App backend URL in Vercel's project environment settings.

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🌐 Deployment

### Frontend — Vercel

The `vercel.json` handles SPA routing (all routes redirect to `index.html`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Steps:
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` in Vercel → Project Settings → Environment Variables
4. Deploy

### Backend — Back4App

The Node.js backend is hosted on [Back4App](https://www.back4app.com/). Set the backend URL as the `VITE_API_URL` in Vercel after deploying.

---

## 📷 QR Code Flow

CampusBook uses two QR libraries:

- **`qrcode`** — Generates a unique QR code for each book listing
- **`html5-qrcode`** — Scans QR codes via the device camera to quickly pull up a book's listing page

This makes in-person exchanges faster — scan a code, verify the book details, confirm the handoff.

---

## 🛣️ Roadmap

- [ ] User authentication (JWT-based login/signup)
- [ ] In-app messaging between buyer and seller
- [ ] Book condition ratings and photos
- [ ] Wishlist and saved listings
- [ ] College-specific filtering (department, semester, subject)
- [ ] PWA support for mobile install

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Alister** — CSE Student, VVCE Mysore  
Built to solve a real campus problem — overpriced new textbooks and no easy way to find affordable second-hand ones within college.
