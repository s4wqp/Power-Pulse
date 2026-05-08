# Power Pulse — Final Project Documentation (Web App)

Power Pulse Web is a **React single-page application** built with **Vite** that mirrors the mobile app's functionality. It connects **Trainees**, **Trainers**, and **Admins** through the same shared **ASP.NET Core REST API** backend. Deployed on **Vercel** with API proxy rewrites.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Project Structure](#2-architecture--project-structure)
3. [Technology Stack & Libraries](#3-technology-stack--libraries)
4. [Design System](#4-design-system)
5. [Routing & Protected Routes](#5-routing--protected-routes)
6. [Authentication & Registration](#6-authentication--registration)
7. [Trainee Features](#7-trainee-features)
8. [Trainer Features](#8-trainer-features)
9. [Admin Features](#9-admin-features)
10. [Reusable Components](#10-reusable-components)
11. [State Management (Zustand)](#11-state-management-zustand)
12. [API Services Layer](#12-api-services-layer)
13. [Key User Flows](#13-key-user-flows)
14. [Deployment & Configuration](#14-deployment--configuration)
15. [Assets & Resources](#15-assets--resources)

---

## 1. Project Overview

| Item | Detail |
|---|---|
| **App Name** | Power Pulse (Web) |
| **Framework** | React 19.1 + Vite 6.3 |
| **Language** | JavaScript (JSX) |
| **Styling** | CSS Modules + CSS Variables |
| **State Management** | Zustand 5.0 |
| **HTTP Client** | Axios 1.13 |
| **Deployment** | Vercel |
| **Backend API** | `http://powerpuls.runasp.net` (ASP.NET Core) |
| **Primary Font** | Montserrat Alternates (Google Fonts CDN) |

### Stats at a Glance

| Metric | Count |
|---|---|
| Total Pages | 48 |
| Auth Pages | 11 (+ 2 CSS files) |
| Trainee Pages | 22 (+ 1 CSS file) |
| Trainer Pages | 15 (+ 1 CSS file) |
| Admin Pages | 3 (+ 1 CSS file) |
| Reusable Components | 7 (+ 6 CSS modules) |
| Zustand Stores | 5 |
| API Services | 7 |
| URL Routes | 55 |
| User Roles | 3 (Trainee · Trainer · Admin) |

---

## 2. Architecture & Project Structure

The project follows a **feature-based architecture** with clear separation between pages, components, stores, and services.

```
react_web/
├── index.html                # HTML entry point (Google Fonts + Material Icons CDN)
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite config with dev proxy
├── vercel.json               # Vercel deployment rewrites
├── eslint.config.js          # ESLint configuration
├── .env                      # Environment variables (Google Client ID)
│
├── public/
│   └── assets/               # Static assets (images, icons)
│
└── src/
    ├── main.jsx              # React entry point, GoogleOAuthProvider wrapper
    ├── App.jsx               # Router, all routes, ProtectedRoute guard
    ├── App.css               # Global app styles
    ├── index.css             # CSS variables (design tokens) + base styles
    │
    ├── components/           # Reusable UI components (7 components + 6 CSS modules)
    │   ├── BottomNav.jsx         # Trainee bottom navigation
    │   ├── TrainerBottomNav.jsx  # Trainer bottom navigation
    │   ├── Sidebar.jsx           # Web sidebar navigation
    │   ├── WebLayout.jsx         # Page layout wrapper with sidebar
    │   ├── Button.jsx            # Styled button
    │   ├── TextField.jsx         # Styled input field
    │   └── CachedImage.jsx       # Network image with cache + fallback
    │
    ├── pages/                # All page components (48 pages)
    │   ├── auth/                 # Auth pages (11 JSX + 2 CSS)
    │   ├── trainee/              # Trainee pages (22 JSX + 1 CSS)
    │   ├── trainer/              # Trainer pages (15 JSX + 1 CSS)
    │   └── admin/                # Admin pages (3 JSX + 1 CSS)
    │
    ├── stores/               # Zustand state management (5 stores)
    │   ├── authStore.js          # Auth state, login, register, auto-login
    │   ├── chatStore.js          # Chat state, messages, unread counts
    │   ├── traineeStore.js       # Trainee data (products, exercises, trainers)
    │   ├── trainerStore.js       # Trainer data (plans, workouts, subscribers)
    │   └── cartStore.js          # Shopping cart state
    │
    ├── services/             # API service layer (7 services)
    │   ├── apiClient.js          # Axios instance with JWT interceptor
    │   ├── authService.js        # Login, register, password reset APIs
    │   ├── chatService.js        # Message, conversation APIs
    │   ├── driveService.js       # Google Drive file upload/download
    │   ├── productService.js     # Product catalog APIs
    │   ├── traineeService.js     # Trainee-specific APIs
    │   └── trainerService.js     # Trainer-specific APIs
    │
    ├── utils/
    │   └── custom.jsx            # Design system (colors, toast, typography)
    │
    └── assets/               # Bundled assets
        ├── fonts/                # Montserrat Alternates (20 font files)
        └── images/               # App images
```

### App Entry Point ([main.jsx](file:///d:/power_pulse/react_web/src/main.jsx))

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
```

Wraps the entire app with:
1. **React StrictMode** — Development checks
2. **GoogleOAuthProvider** — Google OAuth for Drive API authentication

### App Root ([App.jsx](file:///d:/power_pulse/react_web/src/App.jsx))

- **BrowserRouter** — Client-side routing
- **Toaster** — Global toast notifications (bottom-center, 3s duration)
- **ProtectedRoute** — HOC that checks JWT token + user role → redirects unauthorized users
- **55 Route definitions** — Auth (11 public) + Trainee (27 protected) + Trainer (18 protected) + Admin (3 protected) + fallback

---

## 3. Technology Stack & Libraries

### Runtime Dependencies (12 packages)

| Package | Version | Purpose |
|---|---|---|
| **react** | ^19.1.0 | Core UI library — component-based declarative rendering |
| **react-dom** | ^19.1.0 | DOM rendering for React components |
| **react-router-dom** | ^7.13.1 | Client-side routing — `BrowserRouter`, `Routes`, [Route](file:///d:/power_pulse/lib/routing.dart#132-366), `Navigate`, URL params |
| **zustand** | ^5.0.11 | Lightweight state management — global stores with hooks, no boilerplate |
| **axios** | ^1.13.6 | HTTP client — API calls with interceptors for JWT token injection, timeout, error handling |
| **@microsoft/signalr** | ^10.0.0 | SignalR client for real-time WebSocket connections — powers instant chat messaging |
| **@react-oauth/google** | ^0.13.4 | Google OAuth 2.0 provider — wraps app for Google Sign-In (used for Drive API auth) |
| **gapi-script** | ^1.2.0 | Google API JavaScript client loader — initializes Google Drive API |
| **react-hot-toast** | ^2.6.0 | Toast notifications — success, error, and info messages with customizable styles |
| **leaflet** | ^1.9.4 | Interactive map library — OpenStreetMap-based map rendering |
| **react-leaflet** | ^5.0.0 | React wrapper for Leaflet — declarative map components (`MapContainer`, `TileLayer`, `Marker`) |
| **puppeteer** | ^24.38.0 | Headless browser automation — used for testing and API validation scripts |

### Dev Dependencies (7 packages)

| Package | Version | Purpose |
|---|---|---|
| **vite** | ^6.3.5 | Build tool — fast dev server with HMR, optimized production builds |
| **@vitejs/plugin-react** | ^4.4.1 | Vite plugin for React — enables JSX transform, Fast Refresh |
| **eslint** | ^9.25.0 | JavaScript linter for code quality |
| **@eslint/js** | ^9.25.0 | ESLint JavaScript configuration |
| **eslint-plugin-react-hooks** | ^5.2.0 | ESLint rules for React Hooks |
| **eslint-plugin-react-refresh** | ^0.4.19 | ESLint rules for React Refresh |
| **globals** | ^16.0.0 | Global variable definitions for ESLint |
| **@types/react** | ^19.1.2 | TypeScript type definitions for React (editor support) |
| **@types/react-dom** | ^19.1.2 | TypeScript type definitions for React DOM (editor support) |

### External CDN Resources

| Resource | Purpose |
|---|---|
| **Google Fonts** (Montserrat Alternates) | Primary app typography — all 9 weights, normal + italic |
| **Material Icons** | Icon font for UI icons throughout the app |

---

## 4. Design System

### CSS Variables ([index.css](file:///d:/power_pulse/react_web/src/index.css))

All design tokens are defined as CSS custom properties on `:root`:

| Variable | Value | Usage |
|---|---|---|
| `--color-primary` | `#17A073` | Primary buttons, active states, accents |
| `--color-black` | `#000000` | Primary text |
| `--color-white` | `#FFFFFF` | Backgrounds, light text |
| `--color-gray` | `#9B9B9B` | Secondary text |
| `--color-search` | `#535353` | Search bar text |
| `--color-text-field` | `#000842` | Input field text |
| `--color-text-second` | `#ABABAB` | Placeholder / secondary input text |
| `--color-bg-aqua` | `#D6EBEB` | Height/weight picker background |
| `--color-filter` | `#504F4F` | Filter UI elements |
| `--color-bottom-nav` | `#9CA3AF` | Bottom nav inactive icons |
| `--color-bottom-nav-bg` | `rgba(250,250,250,0.94)` | Bottom nav background |
| `--color-rating` | `#EEE720` | Star ratings |
| `--color-calories` | `#93D8A2` | Calorie badges (green) |
| `--color-error` | `#FF0000` | Error states, delete actions |
| `--color-save` | `#30BE71` | Save/success actions |
| `--color-border` | `#A4A4A4` | Border colors |
| `--color-bg-container` | `rgba(217,217,217,0.63)` | Container backgrounds |
| `--color-light-black` | `#333333` | Dark text variant |
| `--color-clothes-price` | `#49A4FF` | Clothing price tags (blue) |
| `--color-clothes` | `#3A4968` | Clothing UI accents |
| `--color-muscle-bg` | `#D9D9D9` | Muscle group card backgrounds |
| `--font-family` | `'Montserrat Alternates'` | App-wide font |

### Custom Utilities ([utils/custom.jsx](file:///d:/power_pulse/react_web/src/utils/custom.jsx))

| Export | Purpose |
|---|---|
| [CustomColors](file:///d:/power_pulse/lib/custom.dart#4-33) | Object mapping color names to CSS variable references |
| [showToast(message, isError)](file:///d:/power_pulse/react_web/src/utils/custom.jsx#12-33) | Unified toast helper using `react-hot-toast` — green success or red error |
| `Typography.mainText(text)` | Renders `<h1>` with bold, 30px, Montserrat |
| `Typography.subMainText(text)` | Renders `<h3>` with bold, 20px, Montserrat |

### CSS Modules

Each feature area has its own scoped CSS module to prevent style conflicts:

| Module | Scope |
|---|---|
| [Auth.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | All authentication pages |
| [Trainee.module.css](file:///d:/power_pulse/react_web/src/pages/trainee/Trainee.module.css) | Trainee-specific pages |
| [Trainer.module.css](file:///d:/power_pulse/react_web/src/pages/trainer/Trainer.module.css) | Trainer-specific pages |
| [Admin.module.css](file:///d:/power_pulse/react_web/src/pages/admin/Admin.module.css) | Admin-specific pages |
| [Sidebar.module.css](file:///d:/power_pulse/react_web/src/components/Sidebar.module.css) | Sidebar navigation |
| [WebLayout.module.css](file:///d:/power_pulse/react_web/src/components/WebLayout.module.css) | Web layout wrapper |
| [BottomNav.module.css](file:///d:/power_pulse/react_web/src/components/BottomNav.module.css) | Bottom navigation |
| [Button.module.css](file:///d:/power_pulse/react_web/src/components/Button.module.css) | Button component |
| [TextField.module.css](file:///d:/power_pulse/react_web/src/components/TextField.module.css) | Text field component |
| [CachedImage.module.css](file:///d:/power_pulse/react_web/src/components/CachedImage.module.css) | Cached image component |
| [SplashPage.module.css](file:///d:/power_pulse/react_web/src/pages/auth/SplashPage.module.css) | Splash page animations |

---

## 5. Routing & Protected Routes

### Route Protection

The [ProtectedRoute](file:///d:/power_pulse/react_web/src/App.jsx#65-82) component wraps all role-specific routes:

```jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's correct home based on role
  }
  return children;
};
```

### All URL Routes (55 total)

#### Public Routes (11)
| Path | Page | Description |
|---|---|---|
| `/` | SplashPage | Landing + auto-login |
| `/login` | LoginPage | Email + password login |
| `/register` | BeforeRegisterPage | Role selection |
| `/register/trainee` | TraineeRegisterPage | Trainee registration step 1 |
| `/register/trainee/height-weight` | HeightWeightPage | Trainee registration step 2 |
| `/register/trainer` | TrainerRegisterPage | Trainer registration step 1 |
| `/register/trainer/profile` | ProfileRegisterPage | Trainer registration step 2 |
| `/register/trainer/business` | BusinessRegisterPage | Trainer registration step 3 |
| `/forgot-password` | ForgetPasswordPage | Enter email for reset |
| `/verify-code` | VerifyResetCodePage | Enter verification code |
| `/reset-password` | ResetPasswordPage | Set new password |

#### Trainee Routes (27 — all protected, role: `Trainee`)
| Path | Page | Description |
|---|---|---|
| `/trainee/home` | TraineeHomePage | Main dashboard |
| `/trainee/food` | GenericCategoryPage | Food store |
| `/trainee/supplements` | GenericCategoryPage | Supplements store |
| `/trainee/clothes` | GenericCategoryPage | Clothes store |
| `/trainee/category` | GenericCategoryPage | Generic category view |
| `/trainee/category/details` | GenericDetailsPage | Product details (via state) |
| `/trainee/product/:id` | GenericDetailsPage | Product details (via URL param) |
| `/trainee/clothing` | GenericCategoryPage | Clothing category |
| `/trainee/exercises` | ExerciseLibraryPage | Exercise library |
| `/trainee/exercises/details` | ExerciseDetailPage | Exercise details |
| `/trainee/chat` | ChatListPage | Chat contact list |
| `/trainee/chat/:id` | ChatDetailPage | Chat conversation |
| `/trainee/profile` | ProfilePage | Profile hub |
| `/trainee/personal-details` | PersonalDetailsPage | Edit personal info |
| `/trainee/cart` | ShoppingCartPage | Shopping cart |
| `/trainee/checkout` | CheckoutPage | Checkout & payment |
| `/trainee/addresses` | DeliveryAddressesPage | Address list |
| `/trainee/addresses/new` | NewAddressPage | Add/edit address |
| `/trainee/addresses/select` | SelectDeliveryLocationPage | Select for checkout |
| `/trainee/payment-details` | PaymentDetailsPage | Manage payment cards |
| `/trainee/orders` | OrdersPage | Order history |
| `/trainee/success` | TransactionSuccessPage | Purchase confirmation |
| `/trainee/coach/:id` | CoachProfilePage | Trainer profile view |
| `/trainee/settings` | AppSettingsPage | App settings |
| `/trainee/notification-settings` | NotificationSettingsPage | Notification toggles |
| `/trainee/contact-us` | ContactUsPage | Contact support |
| `/trainee/terms` | TermsAndPrivacyPage | Terms & privacy policy |

#### Trainer Routes (18 — all protected, role: `Trainer`)
| Path | Page | Description |
|---|---|---|
| `/trainer/home` | TrainerHomePage | Dashboard with stats |
| `/trainer/exercises` | TrainerExerciseLibraryPage | Exercise library |
| `/trainer/exercises/details` | TrainerExerciseDetailPage | Exercise details |
| `/trainer/add-workout` | AddWorkoutPage | Create new exercise |
| `/trainer/chat` | TrainerChatListPage | Chat contact list |
| `/trainer/chat/:id` | TrainerChatDetailPage | Chat with trainee |
| `/trainer/chat/:traineeId/notes` | TrainerNotesPage | Daily notes list |
| `/trainer/chat/:traineeId/notes/:noteId` | TrainerNoteEditorPage | Note editor |
| `/trainer/profile` | TrainerProfilePage | Trainer profile |
| `/trainer/edit-profile` | TrainerEditProfilePage | Edit profile |
| `/trainer/account` | TrainerAccountPage | Account overview |
| `/trainer/information` | TrainerInformationPage | Read-only info |
| `/trainer/plans` | TrainerPlansPage | Manage plans |
| `/trainer/add-plan` | TrainerAddPlanPage | Create/edit plan |
| `/trainer/subscribers` | TrainerSubscribersPage | View subscribers |
| `/trainer/payment-details` | PaymentDetailsPage | Payment cards |
| `/trainer/contact-us` | ContactUsPage | Contact support |
| `/trainer/terms` | TermsAndPrivacyPage | Terms & privacy |

#### Admin Routes (3 — all protected, role: `Admin`)
| Path | Page | Description |
|---|---|---|
| `/admin/home` | AdminHomePage | Category grid |
| `/admin/category/:categoryId` | AdminCategoryPage | Category items |
| `/admin/category/:categoryId/add` | AdminAddItemPage | Add product |

#### Fallback
| Path | Behavior |
|---|---|
| `*` | Redirects to `/` |

---

## 6. Authentication & Registration

### 6.1 Splash Page
**File:** [SplashPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/SplashPage.jsx) + [SplashPage.module.css](file:///d:/power_pulse/react_web/src/pages/auth/SplashPage.module.css)
Animated landing page. Calls `tryAutoLogin()` — if a stored JWT exists and is valid, redirects to the role-appropriate home screen.

### 6.2 Login
**File:** [LoginPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/LoginPage.jsx)
Email + password form → returns JWT token + role → stored in `localStorage` → redirects to dashboard.

### 6.3 Role Selection
**File:** [BeforeRegisterPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/BeforeRegisterPage.jsx)
Choose to register as Trainee or Trainer → routes to the matching flow.

### 6.4 Forgot Password (3 steps)
| Step | File | Action |
|---|---|---|
| 1. Enter Email | [ForgetPasswordPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/ForgetPasswordPage.jsx) | Submit email → backend sends code |
| 2. Verify Code | [VerifyResetCodePage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/VerifyResetCodePage.jsx) | Enter received code |
| 3. Reset Password | [ResetPasswordPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/ResetPasswordPage.jsx) | Set new password |

### 6.5 Trainee Registration (2 steps)
| Step | File | Action |
|---|---|---|
| 1. Details | [TraineeRegisterPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/TraineeRegisterPage.jsx) | Name, email, phone, password, goal |
| 2. Body Metrics | [HeightWeightPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/HeightWeightPage.jsx) | Height/weight picker → create account |

### 6.6 Trainer Registration (3 steps)
| Step | File | Action |
|---|---|---|
| 1. Basic | [TrainerRegisterPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/TrainerRegisterPage.jsx) | Name, email, phone, password |
| 2. Profile | [ProfileRegisterPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/ProfileRegisterPage.jsx) | Title, specializations, certifications, bio |
| 3. Business | [BusinessRegisterPage.jsx](file:///d:/power_pulse/react_web/src/pages/auth/BusinessRegisterPage.jsx) | Business details |

---

## 7. Trainee Features (22 pages)

### 7.1 Home Dashboard
**File:** [TraineeHomePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/TraineeHomePage.jsx)
- Welcome banner with trainee's name
- Product carousel (Food, Supplements, Clothes)
- Trainer discovery with search & specialization filter
- Sidebar navigation (web layout)

### 7.2 Product Store

| Page | File | Function |
|---|---|---|
| Category Browse | [GenericCategoryPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/GenericCategoryPage.jsx) | Grid of products by category — used for Food, Supplements, and Clothes |
| Product Details | [GenericDetailsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/GenericDetailsPage.jsx) | Name, description, nutrition/sizes, price, rating, image, Add to Cart |
| Shopping Cart | [ShoppingCartPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ShoppingCartPage.jsx) | Items, quantities, price total |
| Select Address | [SelectDeliveryLocationPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/SelectDeliveryLocationPage.jsx) | Choose delivery address |
| Checkout | [CheckoutPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/CheckoutPage.jsx) | Order summary → confirm (also handles subscriptions) |
| Success | [TransactionSuccessPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/TransactionSuccessPage.jsx) | Purchase confirmation |
| Orders | [OrdersPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/OrdersPage.jsx) | Order history with status |

### 7.3 Delivery Addresses
| Page | File | Function |
|---|---|---|
| Address List | [DeliveryAddressesPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/DeliveryAddressesPage.jsx) | View saved addresses |
| Add/Edit | [NewAddressPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/NewAddressPage.jsx) | Address form (building, apartment, floor, street, phone) |

### 7.4 Coach Profile & Subscription
**File:** [CoachProfilePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/CoachProfilePage.jsx)
Full trainer profile + available plans → subscribe → checkout → chat unlocked.

### 7.5 Exercise Library
| Page | File | Function |
|---|---|---|
| Library | [ExerciseLibraryPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ExerciseLibraryPage.jsx) | Muscle-group filter chips, exercise cards |
| Detail | [ExerciseDetailPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ExerciseDetailPage.jsx) | Name, video, target/assistant muscles, description |

### 7.6 Chat
| Page | File | Function |
|---|---|---|
| Chat List | [ChatListPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ChatListPage.jsx) | Contacts with last message, timestamp, unread count |
| Chat Detail | [ChatDetailPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ChatDetailPage.jsx) | Real-time messaging, text + media sharing |

### 7.7 Profile Management
| Page | File | Function |
|---|---|---|
| Profile | [ProfilePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ProfilePage.jsx) | Name, email, photo upload, nav links |
| Personal Details | [PersonalDetailsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/PersonalDetailsPage.jsx) | Edit name, phone, weight, height, goal |
| Payment | [PaymentDetailsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/PaymentDetailsPage.jsx) | Manage cards |
| Notifications | [NotificationSettingsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/NotificationSettingsPage.jsx) | Toggle settings |
| App Settings | [AppSettingsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/AppSettingsPage.jsx) | General settings |
| Contact Us | [ContactUsPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/ContactUsPage.jsx) | Contact form |
| Terms | [TermsAndPrivacyPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainee/TermsAndPrivacyPage.jsx) | Terms + privacy policy |

---

## 8. Trainer Features (15 pages)

### 8.1 Home Dashboard
**File:** [TrainerHomePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerHomePage.jsx)
Stats cards (Total Clients, Today's Revenue, Lifetime Revenue) + quick action buttons.

### 8.2 Training Plans (CRUD)
| Page | File | Function |
|---|---|---|
| View Plans | [TrainerPlansPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerPlansPage.jsx) | All plans with name, price, duration, badge |
| Create/Edit | [TrainerAddPlanPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerAddPlanPage.jsx) | Plan form with all fields |

### 8.3 Workout Management
| Page | File | Function |
|---|---|---|
| Library | [TrainerExerciseLibraryPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerExerciseLibraryPage.jsx) | Browse by muscle group |
| Detail | [TrainerExerciseDetailPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerExerciseDetailPage.jsx) | View exercise details |
| Add Workout | [AddWorkoutPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/AddWorkoutPage.jsx) | Create exercise form |

### 8.4 Subscriber Management
**File:** [TrainerSubscribersPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerSubscribersPage.jsx)
View all subscribed trainees with plan info.

### 8.5 Daily Notes (Web-exclusive dedicated UI)
| Page | File | Function |
|---|---|---|
| Notes List | [TrainerNotesPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerNotesPage.jsx) | All notes for a subscriber |
| Note Editor | [TrainerNoteEditorPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerNoteEditorPage.jsx) | Rich text editor, title + body |

> [!TIP]
> The **dedicated Notes UI** with full list/editor views is a **web-exclusive** feature. On mobile, notes are only accessible through the chat detail screen.

### 8.6 Chat
| Page | File | Function |
|---|---|---|
| Chat List | [TrainerChatListPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerChatListPage.jsx) | Subscribed trainees as contacts |
| Chat Detail | [TrainerChatDetailPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerChatDetailPage.jsx) | Real-time messaging + workout sharing |

### 8.7 Profile Management
| Page | File | Function |
|---|---|---|
| Profile | [TrainerProfilePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerProfilePage.jsx) | View profile (name, title, bio, etc.) |
| Edit Profile | [TrainerEditProfilePage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerEditProfilePage.jsx) | Update specializations, certifications, bio |
| Account | [TrainerAccountPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerAccountPage.jsx) | Account overview |
| Information | [TrainerInformationPage.jsx](file:///d:/power_pulse/react_web/src/pages/trainer/TrainerInformationPage.jsx) | Read-only detailed info |

---

## 9. Admin Features (3 pages)

### 9.1 Dashboard
**File:** [AdminHomePage.jsx](file:///d:/power_pulse/react_web/src/pages/admin/AdminHomePage.jsx)
Category grid (Food, Supplements, Clothes) → tap to manage.

### 9.2 Product CRUD
| Page | File | Function |
|---|---|---|
| Category Items | [AdminCategoryPage.jsx](file:///d:/power_pulse/react_web/src/pages/admin/AdminCategoryPage.jsx) | View/edit/delete products |
| Add Product | [AdminAddItemPage.jsx](file:///d:/power_pulse/react_web/src/pages/admin/AdminAddItemPage.jsx) | Name, description, price, calories, image, sizes |

---

## 10. Reusable Components

| Component | Files | Purpose |
|---|---|---|
| **Sidebar** | [Sidebar.jsx](file:///d:/power_pulse/react_web/src/components/Sidebar.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Web sidebar navigation with role-specific menu items, active state, and branding |
| **WebLayout** | [WebLayout.jsx](file:///d:/power_pulse/react_web/src/components/WebLayout.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Page layout wrapper — sidebar + content area, responsive |
| **BottomNav** | [BottomNav.jsx](file:///d:/power_pulse/react_web/src/components/BottomNav.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Trainee bottom navigation (Home, Chat, Exercises, Profile) |
| **TrainerBottomNav** | [TrainerBottomNav.jsx](file:///d:/power_pulse/react_web/src/components/TrainerBottomNav.jsx) | Trainer bottom navigation with role-specific tabs |
| **Button** | [Button.jsx](file:///d:/power_pulse/react_web/src/components/Button.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Styled primary button component |
| **TextField** | [TextField.jsx](file:///d:/power_pulse/react_web/src/components/TextField.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Styled form input with label and validation |
| **CachedImage** | [CachedImage.jsx](file:///d:/power_pulse/react_web/src/components/CachedImage.jsx) + [.module.css](file:///d:/power_pulse/react_web/src/pages/auth/Auth.module.css) | Network image with loading state and error fallback |

---

## 11. State Management (Zustand)

Uses **Zustand** — a lightweight state management library with hook-based API and no boilerplate.

| Store | File | Responsibilities |
|---|---|---|
| **authStore** | [authStore.js](file:///d:/power_pulse/react_web/src/stores/authStore.js) | Login, registration, token storage (`localStorage`), auto-login, role detection, logout. Exposes: `user`, `token`, `login()`, `register()`, `tryAutoLogin()`, `logout()` |
| **chatStore** | [chatStore.js](file:///d:/power_pulse/react_web/src/stores/chatStore.js) | Real-time messaging, conversation list, unread counts, SignalR connection management. Exposes: `conversations`, `messages`, `unreadCount`, `sendMessage()`, `markAsRead()` |
| **traineeStore** | [traineeStore.js](file:///d:/power_pulse/react_web/src/stores/traineeStore.js) | Trainee data: products by type, exercises, trainer list, orders, addresses. Exposes: `products`, `exercises`, `trainers`, `fetchProducts()`, `fetchExercises()` |
| **trainerStore** | [trainerStore.js](file:///d:/power_pulse/react_web/src/stores/trainerStore.js) | Trainer data: plans CRUD, workouts CRUD, subscribers, notes, profile. Exposes: `plans`, `workouts`, `subscribers`, `createPlan()`, `addWorkout()` |
| **cartStore** | [cartStore.js](file:///d:/power_pulse/react_web/src/stores/cartStore.js) | Shopping cart: add/remove items, quantity adjustment, total calculation. Exposes: `items`, `total`, `addItem()`, `removeItem()`, `clearCart()` |

---

## 12. API Services Layer

### API Client ([apiClient.js](file:///d:/power_pulse/react_web/src/services/apiClient.js))

```javascript
const apiClient = axios.create({
  baseURL: '',  // Relative URLs → proxy handles routing
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// JWT interceptor — auto-injects Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Service Files

| Service | File | API Endpoints |
|---|---|---|
| **authService** | [authService.js](file:///d:/power_pulse/react_web/src/services/authService.js) | Login, register (trainee/trainer), forgot password, verify code, reset password |
| **chatService** | [chatService.js](file:///d:/power_pulse/react_web/src/services/chatService.js) | Get conversations, get messages, send message, mark as read |
| **driveService** | [driveService.js](file:///d:/power_pulse/react_web/src/services/driveService.js) | Google Drive upload/download (profile photos, chat media) |
| **productService** | [productService.js](file:///d:/power_pulse/react_web/src/services/productService.js) | Get products by type/category, get product details |
| **traineeService** | [traineeService.js](file:///d:/power_pulse/react_web/src/services/traineeService.js) | Get trainers, get exercises, manage addresses, manage orders, create subscriptions |
| **trainerService** | [trainerService.js](file:///d:/power_pulse/react_web/src/services/trainerService.js) | Plans CRUD, workouts CRUD, subscribers, notes CRUD, profile update, dashboard stats |

---

## 13. Key User Flows

### Flow 1: Trainee → Discover & Subscribe
```
/trainee/home → Browse Trainers → /trainee/coach/:id → View Plans → /trainee/checkout → /trainee/success → /trainee/chat/:id
```

### Flow 2: Trainee → Shop for Products
```
/trainee/home → /trainee/food → /trainee/category/details → Add to Cart → /trainee/cart → /trainee/addresses/select → /trainee/checkout → /trainee/success
```

### Flow 3: Trainer → Manage Content
```
/trainer/home → /trainer/add-plan → /trainer/add-workout → /trainer/subscribers → /trainer/chat/:id → /trainer/chat/:traineeId/notes
```

### Flow 4: Password Recovery
```
/login → /forgot-password → /verify-code → /reset-password → /login
```

### Flow 5: Admin → Manage Products
```
/admin/home → /admin/category/:categoryId → /admin/category/:categoryId/add
```

---

## 14. Deployment & Configuration

### Vite Dev Server ([vite.config.js](file:///d:/power_pulse/react_web/vite.config.js))

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://powerpuls.runasp.net',
        changeOrigin: true,
      },
      '/chathub': {
        target: 'http://powerpuls.runasp.net',
        changeOrigin: true,
        ws: true,  // WebSocket support for SignalR
      },
    },
  },
});
```

### Vercel Production ([vercel.json](file:///d:/power_pulse/react_web/vercel.json))

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://powerpuls.runasp.net/api/:path*" },
    { "source": "/chathub", "destination": "http://powerpuls.runasp.net/chathub" },
    { "source": "/((?!api|chathub).*)", "destination": "/index.html" }
  ]
}
```

- `/api/*` → Proxied to backend API
- `/chathub` → Proxied to SignalR hub (WebSocket)
- Everything else → SPA fallback to [index.html](file:///d:/power_pulse/react_web/index.html)

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for Drive API |

### NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 15. Assets & Resources

### Public Assets (`public/assets/`)
- App icon (`app_icon.png`)
- Product images, banners, category thumbnails
- 21 static asset files

### Bundled Assets (`src/assets/`)
- **Fonts:** Montserrat Alternates — 20 font files (all weights, regular + italic)
- **Images:** App-specific images bundled with Vite

### External Resources (CDN)
| Resource | URL |
|---|---|
| Montserrat Alternates | Google Fonts CDN |
| Material Icons | Google Fonts Icon CDN |
