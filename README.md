# कृषिभूमि भारत — KrishiBhumi India

भारत का सबसे विश्वसनीय कृषि भूमि मार्केटप्लेस | India's most trusted agriculture land marketplace

## About

KrishiBhumi India is a Hindi-first, mobile-responsive marketplace exclusively for agricultural land in India. It connects buyers, sellers, and agents across rural India with a trustworthy, simple, and modern interface.

## Features

### 🌾 Core Platform
- Hindi-first branding with English toggle (bilingual UI)
- Mobile-first responsive design
- Advanced search & filters (State, District, Tehsil, Village, Price, Area, Land Type)
- Property listing with photos, videos, and PDF documents
- Google Map location pins for properties

### ✅ Verification & Trust
- Team-based property verification (Approve/Reject with remarks)
- Khasra number, land type (Irrigated/Non-Irrigated), and category (General/SC/ST) tracking
- Verified badge for approved properties

### 🔐 Authentication & Roles
- Email-based authentication with signup/login
- Four user roles: Buyer (खरीदार), Seller (विक्रेता), Agent (एजेंट), Admin
- Role-based access control with Row Level Security

### 🔗 Private Property Links
- Premium subscribers get private, OTP-protected property links
- Phone number verification ensures link exclusivity
- Full property details (photos, videos, documents) on private view
- View tracking with analytics (timestamp, device, IP)

### 💰 Subscription Plans
- **Buyer**: Free (5 contacts/month) → Premium (₹99/mo, unlimited)
- **Seller**: Basic (₹299/3 listings) → Standard (₹699/10) → Premium (₹1,499/unlimited)
- **Agent**: Basic (₹999/6mo) → Pro (₹2,499/year)
- Fast verification service: ₹1,000/property

### 💬 Communication
- Show Interest & Meeting Request features
- In-app messaging between buyers and sellers
- Automated admin notifications on property status changes

### 🛠 Admin Dashboard
- Property verification with bulk management
- User CRUD (edit profiles, change roles, delete accounts)
- Subscription management
- Private link analytics (view history, device info, IP tracking)
- Real-time statistics (properties, users, subscriptions, links)

### 📦 Media Storage
- Up to 10 photos per property
- Video upload support
- PDF document upload for land documents
- Cloud-based secure file storage

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **State**: TanStack React Query
- **Routing**: React Router v6
- **Animations**: Framer Motion ready

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd krishibhumi-india
npm install
npm run dev
```

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL` — Backend API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Backend public key

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # AppLayout, TopNav, BottomNav, Footer
│   └── ui/           # shadcn/ui components
├── contexts/         # LanguageContext, AuthContext
├── data/             # Mock data
├── hooks/            # Custom hooks
├── integrations/     # Backend client & types
├── pages/            # Route pages
└── lib/              # Utilities
supabase/
├── functions/        # Edge functions (upload-media, verify-otp, etc.)
└── migrations/       # Database migrations
```

## License

© 2026 कृषिभूमि भारत (KrishiBhumi India). All rights reserved.
