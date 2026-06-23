🎬 StreamNova
### Next-Generation Video Streaming & Social Platform
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/CSS-Vanilla-1572B6?style=for-the-badge&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
> **Stream. Connect. Experience More.**  
> Premium video streaming with AI-powered multilingual comments, real-time VoIP, cinematic gesture controls, and an intelligent membership ecosystem.
![StreamNova Banner](https://img.shields.io/badge/Status-Live%20%26%20Running-success?style=for-the-badge)
</div>
---
## ✨ Features
### 🎥 Cinematic Video Player
- Custom-built HTML5 video player with gesture controls
- **Double-tap** left/right to seek ±10 seconds
- **Swipe up/down** for volume control
- **Pinch-to-zoom** and fullscreen support
- Animated progress bar with dot scrubber
- Smart watch-time limits enforced per membership tier
### 💬 AI-Powered Multilingual Comments
- Real-time comment system with **live translation**
- Supports multiple languages powered by browser Translation API
- Like / dislike reactions with animated counters
- Geo-tagged comments showing user's city & country
- Smart comment moderation
### 🏆 Membership Tiers
|
 Plan 
|
 Watch Limit 
|
 Downloads/Day 
|
 Video Quality 
|
 Price 
|
|
------
|
-------------
|
---------------
|
---------------
|
-------
|
|
 🆓 
**
Free
**
|
 5 minutes 
|
 1 
|
 HD 
|
 ₹0 
|
|
 🥉 
**
Bronze
**
|
 7 minutes 
|
 3 
|
 Full HD 
|
 ₹49/mo 
|
|
 🥈 
**
Silver
**
|
 10 minutes 
|
 Unlimited 
|
 4K 
|
 ₹99/mo 
|
|
 🥇 
**
Gold
**
|
 Unlimited 
|
 Unlimited 
|
 4K HDR 
|
 ₹199/mo 
|
### 📞 Live Room (VoIP)
- Real-time video/audio calls using WebRTC
- Multi-participant grid layout
- Microphone mute / camera toggle
- Screen sharing support
- Session recording (Gold plan)
- Co-watch YouTube videos together in sync
### 🔐 Authentication
- OTP-based login via **Email** or **Phone**
- Secure session management via Context API
- Plan badge & avatar displayed in the navbar
### 💳 Payment Integration
- Beautiful custom **Checkout Modal** with three payment methods:
  - 📱 **UPI** (pre-filled with registered phone)
  - 💳 **Card** (number, expiry, CVV)
  - 🏦 **Net Banking** (SBI, HDFC, ICICI, Axis, Kotak, Yes Bank)
- Animated processing spinner → success confirmation
- Auto-generated PDF **Invoice** on successful payment
- Annual billing with **17% discount**
### 📱 Fully Responsive
- Mobile-first design with hamburger navigation menu
- Optimized for phones, tablets, laptops, and desktops
- Touch-friendly gestures and tap targets
- Smooth transitions across all breakpoints
### 🎨 Premium UI/UX
- **Dark Mode** (default) + **Light Mode** toggle
- Glassmorphism cards with backdrop blur
- Spring-physics animations on all interactive elements
- Sliding "magic pill" navigation indicator
- Smooth 300–500ms cubic-bezier transitions
- Luxury hover, touch & active effects
---
## 🗂️ Project Structure
```
StreamNova/
├── src/
│   ├── app/
│   │   ├── auth/             # Login / OTP page
│   │   ├── premium/          # Membership plans & comparison table
│   │   ├── profile/          # User profile, downloads, plan info
│   │   ├── room/             # Live VoIP co-watching room
│   │   ├── watch/            # Video watch page with player + comments
│   │   ├── globals.css       # Design system, tokens, base styles
│   │   ├── responsive.css    # Full responsive overhaul (all breakpoints)
│   │   ├── layout.js         # Root layout with Navbar + providers
│   │   └── page.js           # Home page (Hero, Video Grid, Features)
│   ├── components/
│   │   ├── CinemaPlayer.js   # Custom HTML5 video player
│   │   ├── CommentSection.js # AI multilingual comment system
│   │   ├── InvoiceModal.js   # PDF invoice generator modal
│   │   ├── Navbar.js         # Responsive navbar with mobile menu
│   │   ├── ToastContainer.js # Global toast notification system
│   │   └── VideoCard.js      # Video thumbnail card component
│   ├── context/
│   │   └── AppContext.js     # Global state (user, theme, plan, toasts)
│   └── utils/
│       ├── data.js           # Videos, categories, plans mock data
│       └── location.js       # Geolocation & invoice ID utilities
├── package.json
├── next.config.js
└── README.md
```
---
## 🚀 Getting Started
### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
### Installation
```bash
# 1. Clone the repository
git clone https://github.com/HarinathSasikumar/StreamNova.git
# 2. Navigate into the project
cd StreamNova
# 3. Install dependencies
npm install
# 4. Start the development server
npm run dev
```
### Open in Browser
```
http://localhost:3000
```
---
## 🛠️ Tech Stack
|
 Technology 
|
 Purpose 
|
|
------------
|
---------
|
|
**
Next.js 14
**
|
 React framework with App Router 
|
|
**
React 18
**
|
 UI component library 
|
|
**
Vanilla CSS
**
|
 Custom design system, glassmorphism, animations 
|
|
**
Context API
**
|
 Global state management (auth, theme, plan) 
|
|
**
WebRTC
**
|
 Real-time peer-to-peer video/audio in Live Room 
|
|
**
jsPDF + html2canvas
**
|
 Client-side PDF invoice generation 
|
|
**
react-icons
**
|
 Feather icon set throughout the UI 
|
|
**
Razorpay SDK
**
|
 Payment gateway (mock mode in development) 
|
---
## 📐 Design System
### Color Palette (Dark Mode)
|
 Token 
|
 Value 
|
 Usage 
|
|
-------
|
-------
|
-------
|
|
`--bg-primary`
|
`#05070f`
|
 Main background 
|
|
`--accent`
|
`#6366f1`
|
 Indigo — primary brand color 
|
|
`--accent-2`
|
`#a855f7`
|
 Purple — secondary accent 
|
|
`--accent-3`
|
`#06b6d4`
|
 Cyan — highlights 
|
|
`--gold`
|
`#f59e0b`
|
 Gold plan color 
|
|
`--success`
|
`#10b981`
|
 Confirmation states 
|
|
`--danger`
|
`#ef4444`
|
 Error / danger states 
|
### Responsive Breakpoints
|
 Breakpoint 
|
 Screen 
|
 Layout changes 
|
|
------------
|
--------
|
----------------
|
|
`≥ 1280px`
|
 Desktop 
|
 Full 4-column plan grid, 3-column video grid 
|
|
`1024–1280px`
|
 Laptop 
|
 2-column plan grid 
|
|
`768–1024px`
|
 Tablet 
|
 Single-column watch layout, stacked profile 
|
|
`480–768px`
|
 Phone 
|
 Hamburger menu, 2-column video grid 
|
|
`< 480px`
|
 Small phone 
|
 1-column video grid, bottom-sheet modals 
|
---
## 📸 Pages Overview
|
 Page 
|
 Route 
|
 Description 
|
|
------
|
-------
|
-------------
|
|
**
Home
**
|
`/`
|
 Hero, video grid, category filter, feature showcase 
|
|
**
Watch
**
|
`/watch/[id]`
|
 Cinema player + multilingual comments + recommendations 
|
|
**
Premium
**
|
`/premium`
|
 Plan cards, billing toggle, comparison table, FAQ 
|
|
**
Live Room
**
|
`/room`
|
 WebRTC video grid, controls, YouTube co-watch 
|
|
**
Profile
**
|
`/profile`
|
 User info, plan badge, download history 
|
|
**
Auth
**
|
`/auth`
|
 Email/Phone OTP login flow 
|
---
## 🎯 Key Interactions
- **Hover effects** — Spring-physics scale + elevation + glow on all cards
- **Magic pill nav** — Sliding highlight that smoothly tracks cursor across nav links  
- **Notification bell** — Dropdown with 3 latest notifications
- **Theme toggle** — Instant dark ↔ light mode switch (persisted)
- **Plan upgrade** — Checkout modal → processing spinner → success → invoice PDF
- **Search** — Live results dropdown with thumbnail previews
---
## 📄 License
This project is for educational and demonstration purposes.
---
<div align="center">
Made with ❤️ using **Next.js** · **React** · **Vanilla CSS**
⭐ Star this repo if you found it useful!
</div>
