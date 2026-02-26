

# कृषिभूमि भारत — Agriculture Land Marketplace

## Overview
A Hindi-first, mobile-responsive real estate platform exclusively for agricultural lands in India. The initial build will focus on a **complete, polished UI with mock data** across all pages, using an agriculture-inspired color theme (Leaf Green, Soil Brown, Light Cream, Accent Yellow). Backend (Supabase) and payments (Razorpay) will be integrated in a follow-up phase.

---

## Phase 1: Design System & Layout

- **Custom color theme**: Leaf Green (#2E7D32), Soil Brown (#8D6E63), Light Cream (#FFF8E1), Accent Yellow (#FBC02D)
- **Hindi-first typography**: Large, readable Noto Sans Devanagari font
- **Language toggle** (Hindi ↔ English) in the top header using a simple i18n context
- **Mobile-first layout** with bottom navigation bar: होम | खोजें | पोस्ट करें | संदेश | प्रोफाइल
- **Desktop layout** with top navbar and sidebar filters

---

## Phase 2: Homepage (होम)

- Hero banner with tagline in Hindi and search bar (State → District)
- Featured/verified properties carousel
- Stats section (total listings, verified properties, active users)
- "How it works" section for Buyers, Sellers, and Agents
- Trust badges and agriculture-themed imagery
- Footer with links, contact info

---

## Phase 3: Property Browse & Filter Page (खोजें)

- Filter sidebar/drawer with: State, District, Tehsil, Village, Area Range, Price Range, Category (General/ST/SC), Land Type (Irrigated/Non-Irrigated), Verified Only toggle
- Property listing cards with: photo thumbnail, location, area, price, verified badge (green "टीम द्वारा सत्यापित" or yellow "सत्यापन लंबित"), owner/broker tag
- Sort by price, date, area
- Pagination or infinite scroll
- Map view toggle (placeholder)

---

## Phase 4: Property Detail Page

- Photo gallery with swipe support
- Video player (if available)
- Google Maps embed showing location pin
- Full property details: Khasra number, land type, category, area, asking price, negotiable tag
- Owner/Broker info card
- Verification badge with Patwari/team remarks
- Action buttons: "रुचि दिखाएँ" (Show Interest) and "मालिक से मीटिंग अनुरोध करें" (Request Meeting)

---

## Phase 5: Auth Pages (Registration & Login)

- Registration form: Name, Mobile Number, State, District, Role selector (Buyer/Seller/Agent)
- OTP input screen (mocked for now, real OTP in backend phase)
- Login page with mobile number + OTP
- Simple profile page showing user info and role

---

## Phase 6: Seller Property Upload Form (पोस्ट करें)

- Multi-step form with:
  - **Step 1**: Location (State → District → Tehsil → Village)
  - **Step 2**: Land details (type, category, area, Khasra, price, negotiable)
  - **Step 3**: Media upload (photos up to 10, video, document PDF)
  - **Step 4**: Map location pin
  - **Step 5**: Owner type (Owner/Broker) + Review & Submit
- After submission: confirmation screen showing "सत्यापन लंबित" status

---

## Phase 7: User Dashboard & Profile (प्रोफाइल)

- **Buyer dashboard**: Saved properties, interest history, contact reveals remaining
- **Seller dashboard**: My listings with status (pending/verified/rejected), edit/delete
- **Agent dashboard**: My listings, subscription status, verified badge
- Profile edit page
- Subscription plan cards showing current plan and upgrade options

---

## Phase 8: Subscription Plans Page (💰)

- Plan cards for Buyer, Seller, and Agent tiers with INR pricing
- Feature comparison table
- Fast verification service (₹1000/property) option
- "Buy Now" buttons (mocked, Razorpay integration later)

---

## Phase 9: Messaging Page (संदेश)

- Conversation list between buyers and sellers
- Simple chat UI with message bubbles
- "Interest" and "Meeting Request" notifications
- All mocked with sample data

---

## Phase 10: Admin Panel

- Dashboard with stats cards: Total Users, Total Listings, Verified, Pending, Revenue
- Property review table: Approve/Reject with remarks fields
- Mark as verified (adds green badge) or pending (yellow badge)
- Patwari remarks and internal team remarks fields
- User management list

---

## Design Principles Throughout

- **Mobile-first**: Every page designed for small screens first
- **Hindi-dominant**: All labels, buttons, headings in Hindi by default
- **Trustworthy feel**: Verification badges, clean cards with soft shadows
- **Lightweight**: Minimal animations, lazy-loaded images, clean components
- **Accessible**: Large touch targets, high contrast text, simple navigation

