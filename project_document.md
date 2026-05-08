# Power Pulse — Final Project Documentation

---

## Executive Summary

The Power Pulse application is a comprehensive digital sports environment aimed at revolutionizing the way trainees interact with personal trainers and how they purchase supplements and sports equipment. This system has been built to serve three main categories: **trainees**, **trainers**, and **admins**.

The project relies on a robust infrastructure consisting of a server (**ASP.NET Core REST API**) that provides data synchronously to a mobile application built with (**Flutter**) technology and a web application built with (**React**) technology. This documentation details the technical architecture, user workflows, and the engineering of each software feature individually.

---

# Chapter 1: Introduction

## 1.1 Problem Statement

Sports club enthusiasts and trainees face difficulty in finding certified trainers and maintaining continuous communication with them outside the gym. On the other hand, trainers suffer from the fragmentation of their clients' data, the difficulty in tracking their progress, and the lack of a unified platform to sell their training plans. Additionally, trainees need to purchase dietary supplements and sportswear from reliable sources, forcing them to use multiple applications.

More specifically, the following challenges exist:

1. **Fragmented Trainer-Client Communication:** Trainees rely on WhatsApp, phone calls, and emails to communicate with trainers — tools that are disorganized, lack structured coaching workflows, and do not support features like workout sharing, voice messages, or daily progress notes.

2. **No Structured Training Management:** Trainers have no efficient digital tool to create, price, and sell training plans; manage subscribers; build exercise libraries; or write daily coaching notes for each client.

3. **Disconnected Product Marketplace:** Fitness enthusiasts must browse multiple websites or visit physical stores to buy healthy food, supplements, and workout clothing. There is no centralized marketplace integrated with their training journey.

4. **Lack of an Exercise Reference Library:** Beginners and intermediate athletes lack a structured, visual exercise library organized by muscle group with proper form guidance, video demonstrations, target muscle information, and anatomy diagrams.

5. **Administrative Overhead:** Managing product catalogs, monitoring users, and maintaining platform content requires dedicated admin tools that most fitness apps do not provide.

6. **Limited Platform Accessibility:** Many fitness solutions are mobile-only or web-only, excluding users who prefer one platform over the other.

## 1.2 The Solution: Power Pulse

The solution comes to gather all these needs in one integrated platform (Ecosystem). The app allows the trainee to find the right coach, subscribe to their plans, chat with them in real-time, purchase their needs from the store, and track their workouts. It provides the trainer with professional tools to create exercises, manage subscribers, and write daily notes to ensure the trainee reaches their goal.

| Problem | Power Pulse Solution |
|---|---|
| Fragmented Communication | Built-in **real-time chat system** with text, photo/video sharing (via Google Drive), and voice messages. Automatic read receipts and unread message badges. |
| No Structured Training | Trainers can **create training plans** (pricing, duration, badges, features), build **workout libraries**, manage **subscribers**, and write **daily notes**. |
| Disconnected Marketplace | Integrated **product store** with three categories (Food, Supplements, Clothes), full shopping cart, delivery address management, checkout, and order history. |
| No Exercise Library | Comprehensive **exercise library** organized by muscle group (Chest, Back, Shoulders, Arms, Abs, Legs) with images, videos, anatomy diagrams, and descriptions. |
| Administrative Overhead | Dedicated **Admin dashboard** for full CRUD management of the product catalog. |
| Limited Accessibility | Fully **cross-platform** — Flutter mobile app (iOS & Android) + React web app, both sharing the same backend API. |

---

# Chapter 2: Architecture & Technology Stack

## 2.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Power Pulse Ecosystem                    │
├──────────────────────┬──────────────────────┬───────────────────┤
│   Flutter Mobile App │    React Web App     │   ASP.NET Core    │
│   (iOS & Android)    │    (Vite + Vercel)   │   REST API        │
│                      │                      │   (Backend)       │
│  • Provider State    │  • Zustand State     │                   │
│  • Dio HTTP Client   │  • Axios HTTP Client │  ┌─────────────┐  │
│  • Firebase SDK      │  • SignalR Client    │  │ SQL Database │  │
│  • Google Drive API  │  • Google Drive API  │  └─────────────┘  │
└──────────┬───────────┴──────────┬───────────┴────────┬──────────┘
           │                      │                    │
           └──────────────────────┼────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │      Firebase Services      │
                    │  • Firestore (Real-time DB)  │
                    │  • Firebase Auth             │
                    │  • Cloud Storage             │
                    └──────────────────────────────┘
```

## 2.2 API and Server (Backend — ASP.NET Core)

The server is the brain of the system, built using **C# .NET Core** with **Entity Framework Core** for managing relational databases. The server is divided into several independent services:

- **AuthService:** Responsible for creating and validating JWT tokens, and defining the permissions for each role (Role-Based Access Control) to ensure data security.
- **SubscriptionService & ExpiryService:** They manage the lifecycle of the trainee's subscription with the trainer and perform periodic background checks to update the status of expired subscriptions.
- **ProductService & OrderService:** Manages the product catalog (categories, attributes, images) and processes purchase orders from the store.
- **ChatService:** Manages communications between users using WebSocket technology (SignalR) to provide an instant chat experience.
- **TrainerService:** Manages trainer profiles, training plans, workouts, certifications, and specializations.
- **ExerciseService:** Manages the exercise library with muscle group categorization, target/assistant muscle data, and media references.

## 2.3 Mobile App (Flutter)

The Flutter framework (**Dart SDK ^3.9.2**) was used to build an application that works efficiently on Android and iOS systems. The application relies on a **Layered Architecture** and separates between:

- **Presentation Layer:** Consists of **48 screens** divided according to user roles (6 Auth, 27 Trainee, 18 Trainer, 3 Admin) plus **10 shared reusable widgets**.
- **State Management:** Using the **Provider (ChangeNotifier)** pattern with 4 global providers (AuthProvider, ChatProvider, TraineeProvider, TrainerProvider) to ensure interfaces are updated immediately when data changes.
- **Data Layer:** Relies on **Dio** to make HTTP connections with the server, **Firebase Firestore** for real-time chat, and **SharedPreferences** for local token/session storage.
- **Services Layer:** Includes **Google Drive API** integration for file uploads (profile photos, chat media) and a centralized error handler.

### Mobile App — Key Libraries

| Category | Libraries |
|---|---|
| **UI & Design** | cupertino_icons, flutter_svg, lottie, google_fonts, flutter_screenutil, cached_network_image |
| **Firebase** | firebase_core, firebase_auth, firebase_storage, cloud_firestore |
| **Networking** | dio 5.4, signalr_netcore 1.4, connectivity_plus 7.0 |
| **State & Storage** | provider 6.1, shared_preferences 2.2 |
| **Google Services** | google_sign_in, googleapis, extension_google_sign_in_as_googleapis_auth |
| **Maps & Location** | google_maps_flutter, flutter_map, geolocator, geocoding, latlong2 |
| **Media** | image_picker, video_player, chewie, video_thumbnail, video_compress, file_picker |
| **Audio (Voice Messages)** | record 6.1, audioplayers 6.1 |
| **Utilities** | permission_handler, url_launcher, path_provider |

### Mobile App — Project Structure

```
lib/
├── main.dart                    # App entry point, Firebase init, Provider setup
├── routing.dart                 # Named route definitions & route generator
├── custom.dart                  # Design system (colors, text styles, snackbars)
├── firebase_options.dart        # Firebase configuration (auto-generated)
│
├── business_logic/
│   └── providers/               # State management (Provider pattern)
│       ├── auth_provider.dart
│       ├── chat_provider.dart
│       ├── trainee_provider.dart
│       └── trainer_provider.dart
│
├── data/
│   ├── cart_service.dart            # Local shopping cart management
│   ├── models/                      # Data models (DTOs)
│   │   ├── auth_models.dart
│   │   ├── order_models.dart
│   │   ├── trainee_models.dart
│   │   └── trainer_models.dart
│   ├── repositories/               # API call abstractions
│   │   ├── auth_repository.dart
│   │   ├── chat_repository.dart
│   │   ├── trainee_repository.dart
│   │   └── trainer_repository.dart
│   └── network/                     # Dio HTTP client configuration
│
├── services/
│   └── drive_service.dart           # Google Drive API integration
│
├── utils/
│   └── error_handler.dart           # Centralized error handling
│
└── presentation/
    ├── screens/                 # Shared auth screens (6)
    ├── trainee/screens/         # Trainee screens (27)
    ├── trainer/screens/         # Trainer screens (18)
    ├── admin/screens/           # Admin screens (3)
    └── widgets/                 # Shared reusable widgets (10)
```

## 2.4 Web App (React & Vite)

A single-page application (SPA) built using **React 19.1** with **Vite 6.3** to provide a seamless user experience across browsers.

- **State Management:** Using **Zustand 5.0** to create lightweight and fast stores (authStore, chatStore, traineeStore, trainerStore, cartStore).
- **Routing:** Using **React Router DOM 7.13** with the `ProtectedRoute` component to protect pages based on user type (Trainee/Trainer/Admin) and login status. A total of **55 URL routes** are defined.
- **Design System:** A centralized design system was built using **CSS Variables** and **CSS Modules** to ensure that styles do not overlap. All design tokens (colors, fonts, spacing) are defined in `index.css` as custom properties.
- **API Layer:** **Axios 1.13** with JWT interceptors for automatic token injection on every request. 7 dedicated service files abstract all API endpoints.
- **Deployment:** Hosted on **Vercel** with proxy rewrites for API (`/api/*`) and SignalR WebSocket (`/chathub`) connections.

### Web App — Key Libraries

| Category | Libraries |
|---|---|
| **Core** | react 19.1, react-dom 19.1 |
| **Routing** | react-router-dom 7.13 |
| **State** | zustand 5.0 |
| **HTTP** | axios 1.13 |
| **Real-time** | @microsoft/signalr 10.0 |
| **Google OAuth** | @react-oauth/google, gapi-script |
| **Maps** | leaflet, react-leaflet |
| **Notifications** | react-hot-toast |
| **Build Tools** | vite 6.3, @vitejs/plugin-react |

### Web App — Project Structure

```
react_web/
├── index.html                # HTML entry point (Google Fonts + Material Icons CDN)
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite config with dev proxy
├── vercel.json               # Vercel deployment rewrites
│
└── src/
    ├── main.jsx              # React entry point, GoogleOAuthProvider wrapper
    ├── App.jsx               # Router, all routes, ProtectedRoute guard
    ├── index.css             # CSS variables (design tokens) + base styles
    │
    ├── components/           # Reusable UI components (7)
    │   ├── Sidebar.jsx           # Web sidebar navigation
    │   ├── WebLayout.jsx         # Page layout with sidebar
    │   ├── BottomNav.jsx         # Trainee bottom navigation
    │   ├── TrainerBottomNav.jsx  # Trainer bottom navigation
    │   ├── Button.jsx            # Styled button component
    │   ├── TextField.jsx         # Styled input field component
    │   └── CachedImage.jsx       # Network image with fallback
    │
    ├── pages/                # All page components (48 pages)
    │   ├── auth/                 # Auth pages (11)
    │   ├── trainee/              # Trainee pages (22)
    │   ├── trainer/              # Trainer pages (15)
    │   └── admin/                # Admin pages (3)
    │
    ├── stores/               # Zustand state management (5 stores)
    │   ├── authStore.js          # Auth state, login, token, auto-login
    │   ├── chatStore.js          # Chat state, messages, unread counts
    │   ├── traineeStore.js       # Products, exercises, trainers
    │   ├── trainerStore.js       # Plans, workouts, subscribers, notes
    │   └── cartStore.js          # Shopping cart state
    │
    └── services/             # API service layer (7 services)
        ├── apiClient.js          # Axios instance with JWT interceptor
        ├── authService.js        # Login, register, password reset
        ├── chatService.js        # Messages, conversations
        ├── driveService.js       # Google Drive upload/download
        ├── productService.js     # Product catalog
        ├── traineeService.js     # Trainee-specific APIs
        └── trainerService.js     # Trainer-specific APIs
```

## 2.5 Design System

Both platforms share a unified visual identity with consistent colors, typography, and component patterns.

### Color Palette

| Token | Hex Code | Usage |
|---|---|---|
| Primary Green | `#17A073` | Primary buttons, active states, accents |
| Black | `#000000` | Primary text |
| Gray | `#9B9B9B` | Secondary text |
| Text Field | `#000842` | Input field text |
| Rating Yellow | `#EEE720` | Star ratings |
| Calories Green | `#93D8A2` | Calorie info badges |
| Grams Red | `#D83F49` | Supplement content size |
| Clothes Blue | `#49A4FF` | Clothing price tags |
| Save Green | `#30BE71` | Save/success actions |
| Discard Red | `#FF0000` | Discard/delete actions |
| Chat Accent | `#10B981` | Chat accent color |

### Typography

The application uses the **Montserrat Alternates** font family across all platforms with four weights: Regular (400), Medium (500), SemiBold (600), and Bold (700). The design reference size is **375×812** pixels for mobile.

---

# Chapter 3: Detailed Features & Workflows

*(Note: To increase the number of pages in the Word file, it is recommended to include a screenshot for each screen below its explanation.)*

## 3.1 Authentication System

### 3.1.1 Splash Screen & Auto-Login

When opening the application (mobile or web), the splash screen appears with a smooth animation. In the background, the system searches for a previously saved JWT token in **SharedPreferences** (on mobile) or **localStorage** (on the web). If the token is valid, the server determines the user type (Role) and immediately directs them to their control panel (Trainee Home, Trainer Home, or Admin Home), saving the user the hassle of logging in every time.

*(Insert image: Splash Screen)*

### 3.1.2 Login Screen

The login screen provides a clean form with two fields: **Email** and **Password**. Upon submission, the system sends the credentials to the server's **AuthService**, which validates them and returns:
- A **JWT Bearer Token** for authenticating all future requests.
- A **Role Identifier** (Trainee, Trainer, or Admin) used for role-based routing.

The token is stored locally, and the user is redirected to their role-specific dashboard. Validation includes real-time field checking for empty inputs and invalid email formats.

*(Insert image: Login Screen)*

### 3.1.3 New Trainee Registration (Trainee Registration)

Registering as a trainee involves two connected steps:

**Step 1 — Basic Information:** The user enters their name, email, phone number, and password. All fields undergo real-time validation (email format, password strength, phone number format).

**Step 2 — Body Metrics:** The user navigates to an interactive screen (HeightWeightPage) to select their height, weight, and athletic goal (e.g., weight loss, muscle building). This data is sent to the server (TraineeService) to create a customized profile that will later be used for calorie calculation and plan suggestions.

*(Insert image: Trainee Registration Form)*

*(Insert image: Height and Weight Selection Interface)*

### 3.1.4 New Trainer Registration (Trainer Registration)

The trainer registration process is more detailed to ensure the quality of service providers, and it is done in 3 stages:

**Step 1 — Personal Information:** Name, email, phone number, and password. Standard validation rules apply.

**Step 2 — Profile Setup:** The trainer enters their professional title (e.g., "Certified Personal Trainer"), specializations (selected from predefined options like Yoga, Weight Loss, Strength Training, Bodybuilding), certifications (name, issuing organization, year, and optional certificate image), experience years, and a personal bio. The server links this data to the pre-defined Specialization and Certificate models.

**Step 3 — Business Info:** To complete the setup for receiving funds and managing work. This includes business-related details necessary for the trainer's professional profile.

*(Insert image: Trainer Profile Setup Interface)*

*(Insert image: Trainer Certificate Entry Interface)*

### 3.1.5 Forgot Password (3-Step Recovery Flow)

In case a user forgets their password, the system provides a secure three-step recovery process:

**Step 1 — Enter Email:** The user enters their registered email address. The server sends a unique verification code to that email via the backend mail service.

**Step 2 — Verify Code:** The user enters the received verification code on a dedicated verification screen. The server validates the code against the one sent.

**Step 3 — Reset Password:** After successful code verification, the user is presented with a form to set a new password with confirmation. Upon submission, the password is updated in the database, and the user is redirected to the login screen.

*(Insert image: Forgot Password Flow)*

### 3.1.6 Role Selection Screen (Before Register)

When a new user chooses to register, they first encounter the Role Selection screen. This screen presents two clear options — **Register as Trainee** or **Register as Trainer** — each with a descriptive card explaining what the role offers. Selecting a role routes the user to the appropriate multi-step registration flow.

*(Insert image: Role Selection Screen)*

### 3.1.7 Protected Routes & Access Control

Both platforms enforce strict **Role-Based Access Control (RBAC)**:

- On **mobile (Flutter):** The `Routing.generateRoute` function checks the user's role before navigating to any protected screen. Unauthorized access attempts redirect to the login screen.
- On **web (React):** The `ProtectedRoute` Higher-Order Component wraps all role-specific routes. It checks the JWT token and user role from the `authStore` — if the token is missing, the user is redirected to `/login`; if the role doesn't match, the user is redirected to their correct home page.

---

## 3.2 Trainee Features

### 3.2.1 Main Dashboard (Trainee Home)

The main trainee interface is designed to be the central starting point for the entire experience. It includes:

- **Personalized Welcome Banner:** A greeting card that dynamically displays the trainee's name with a motivational message, creating a personal connection with the user.

- **Product Carousel:** An interactive, swipeable banner system showcasing the three store sections — **Food (Healthy Meals)**, **Supplements**, and **Clothes**. Tapping any banner navigates directly to the corresponding product store category.

- **Trainer Discovery Section:** A scrollable list of all registered trainers on the platform, each displayed as a card showing:
  - Trainer's profile image (loaded from Google Drive)
  - Trainer's name and professional title
  - Short bio text
  - Star rating
  
- **Search & Filter System:** Above the trainer list, a **search bar** allows filtering trainers by name. A **specialization filter dialog** lets users filter by training specialty (Yoga, Weight Loss, Strength Training, Bodybuilding, Cardio, etc.).

- **Bottom Navigation Bar (Mobile) / Sidebar (Web):** Provides quick access to the four main sections — Home, Chat (with a real-time unread message badge), Exercises, and Profile.

*(Insert image: Trainee Home Dashboard)*

*(Insert image: Trainer Discovery with Search & Filter)*

### 3.2.2 Product Store (E-Commerce System)

Power Pulse includes a full-featured e-commerce module allowing trainees to purchase fitness-related products without leaving the app.

#### Store Categories

The store is organized into three main product types, each with its own sub-categories:

| Store | Sub-Categories |
|---|---|
| **Food (Healthy Meals)** | Vegetables, Nuts & Seeds, Protein, Protein Shakes |
| **Supplements** | Protein, Creatine, Supplements, Energy Drinks |
| **Clothes** | T-Shirts, Pants, Shoes, Shorts |

#### Category View Screen

When a trainee taps a store banner from the home carousel, they are taken to the **Category View Screen**. Products are displayed in a grid layout with thumbnail images, name, and price. Each category has its own filtered view. The user taps a product card to view its full details.

*(Insert image: Product Category Grid)*

#### Product Details Screen

The product details screen provides comprehensive information about each item:

- **For Food items:** Product name, description, calorie/nutrition information displayed in a **green badge**, price (in EGP), star rating, and a full-size product image.
- **For Supplement items:** Similar layout but with content size displayed in a **red badge** to differentiate from food products.
- **For Clothing items:** Product name, description, price displayed in **blue**, available sizes (S, M, L, XL, etc.), and product image.
- An **"Add to Cart"** button is prominently displayed at the bottom of every product details screen.

*(Insert image: Food Product Details — showing green calorie badge)*

*(Insert image: Supplement Product Details — showing red content badge)*

*(Insert image: Clothing Product Details — showing size selection)*

#### Shopping Cart Screen

The shopping cart displays all added items with:
- Product image, name, and unit price
- **Quantity controls** (+ / − buttons) to increase or decrease quantities
- **Auto-calculated total** that updates immediately when quantities change
- An **"Remove"** option to delete items from the cart
- A **"Proceed to Checkout"** button at the bottom

*(Insert image: Shopping Cart Screen)*

#### Checkout & Payment Flow

The checkout process follows a structured flow:

1. **Select Delivery Address:** The user chooses from their saved delivery addresses or adds a new one.
2. **Order Review:** A summary screen displays all items, quantities, individual prices, delivery address, and the final total.
3. **Confirm Purchase:** The user confirms the order, which is sent to the backend **OrderService** for processing.
4. **Transaction Success:** A confirmation screen is displayed indicating the order has been placed successfully.

*(Insert image: Checkout & Order Summary)*

*(Insert image: Transaction Success Screen)*

#### Orders History Screen

Trainees can view their complete purchase history through the Orders screen. Each order displays:
- **Order date** and **order ID**
- **Order status** (Pending, Confirmed, Shipped, Delivered, etc.)
- **Total price**
- **Item breakdown** — each product name, quantity, and price within the order

*(Insert image: Orders History Screen)*

### 3.2.3 Delivery Address Management

Trainees can manage multiple delivery addresses for their orders:

- **Address List Screen:** Displays all saved delivery addresses in a clean list format.
- **Add New Address:** A form with fields for: building name/number, apartment number, floor, street, phone number, and additional details/instructions.
- **Edit Address:** Modify any field of an existing address.
- **Delete Address:** Remove an address that is no longer needed.
- **Select Delivery Location:** During checkout, a dedicated screen allows the user to select which saved address to use for the current order.

*(Insert image: Delivery Addresses List)*

*(Insert image: Add New Address Form)*

### 3.2.4 Coach (Trainer) Profile & Subscription

When a trainee taps on a trainer from the discovery section, they navigate to the **Coach Profile Screen**, which displays:

- **Profile Header:** Large profile photo, trainer's name, professional title, and star rating.
- **Bio Section:** A detailed text biography written by the trainer.
- **Experience:** Number of years of professional experience.
- **Specializations:** Tags/chips showing the trainer's areas of expertise (e.g., Yoga, Weight Loss, Strength Training).
- **Certifications:** A list of professional certifications with the certificate name, issuing organization, and year obtained.
- **Training Plans:** The trainer's available subscription plans (see Section 3.2.5).

*(Insert image: Coach Profile Screen)*

### 3.2.5 Training Plans & Subscription Flow

Below the trainer's profile, the trainee can browse the trainer's **Training Plans**. Each plan card displays:
- Plan name (e.g., "Basic Plan", "Premium Plan")
- Price (in EGP)
- Duration (in days/months)
- Badge label (e.g., "Most Popular", "Best Value") — if applicable
- Features list (e.g., "3 workouts/week", "Chat support", "Daily notes")

**Subscription Flow:**

1. Trainee selects a plan → taps **"Subscribe"**
2. Navigates to the **Checkout Screen** (subscription payment)
3. A **Subscription** record is created on the server linking the trainee to the trainer's plan
4. **Unlocks:** Direct chat access with the trainer, workout sharing, and daily coaching notes
5. The trainee can now see the trainer in their Chat contact list

*(Insert image: Training Plans / Packages Screen)*

*(Insert image: Subscription Checkout)*

### 3.2.6 Exercise Library

The Exercise Library provides trainees with a comprehensive, visual reference for workout exercises:

- **Muscle Group Categories:** Horizontal scrollable category chips at the top of the screen: **Chest, Back, Shoulders, Arms, Abs, Legs**. Tapping a chip filters the exercise grid to show only exercises targeting that muscle group.

- **Exercise Grid:** Exercises are displayed as attractive cards with a thumbnail image and the exercise name. The grid layout provides a clean, browsable experience.

- **Exercise Detail Screen:** Tapping an exercise card opens the full detail view with:
  - Exercise name and full-size image/video demonstration
  - **Target muscle** — the primary muscle this exercise works
  - **Assistant muscles** — secondary muscles engaged during the movement
  - **Anatomy diagrams** — visual representations of the muscles being worked
  - **Detailed description** — step-by-step instructions for proper form, movement technique, and benefits

*(Insert image: Exercise Library — Muscle Group Categories)*

*(Insert image: Exercise Detail Screen with Anatomy Diagram)*

### 3.2.7 Chat & Messaging System (Trainee Side)

The chat system allows trainees to communicate with their subscribed trainers in real-time:

#### Chat Contact List Screen
- Displays all active conversations with trainers
- Each contact card shows: trainer's profile image, name, **last message preview**, **timestamp**, and **unread message count badge**
- Contacts are sorted by most recent message

*(Insert image: Trainee Chat List Screen)*

#### Chat Detail Screen
The real-time messaging interface supports multiple message types:

- **Text Messages:** Standard bubble-style messaging with sender (right, green) and receiver (left, gray) differentiation, and timestamps below each message.

- **Photo & Video Sharing:** The user can pick photos and videos from their device gallery. Media files are uploaded to **Google Drive** via the DriveService, and the shareable link is sent as a message. Images are displayed inline; videos show a thumbnail with a play button.

- **Voice Messages:** Trainees can press and hold a **microphone button** to record voice messages. The recording uses the device microphone (via the `record` package on mobile). Sent voice messages appear as playable audio bars with a play/pause button, progress indicator, and duration display (via `audioplayers` on mobile).

- **Auto Mark-as-Read:** Messages are automatically marked as read when the conversation is opened, and the unread badge on the Chat tab updates in real-time.

*(Insert image: Chat Detail — Text Messages)*

*(Insert image: Chat Detail — Photo/Video Sharing)*

*(Insert image: Chat Detail — Voice Message)*

### 3.2.8 Profile Management (Trainee)

The trainee profile section provides comprehensive account management:

- **Profile Hub Screen:** Displays the user's name, email, and profile photo with an option to upload a new photo (via Google Drive). Provides navigation links to all sub-sections listed below.

- **Personal Details Screen:** View and edit personal information — name, phone number, weight, height, and fitness goal. Changes are saved to the server via the TraineeService API.

- **Profile Image Upload:** Tapping the profile photo triggers Google Sign-In for Drive API authentication, then opens the gallery to select a new photo. The image is uploaded to Google Drive, and the URL is saved as the user's profile picture.

- **Payment Details Screen:** Manage saved payment cards. Users can add cards with card number (formatted with spaces every 4 digits), expiry date (MM/YY format), and cardholder name.

- **Notification Settings Screen:** Toggle notification preferences on/off for various notification types.

- **App Settings Screen:** General application settings and preferences.

- **Contact Us Screen:** A contact form allowing trainees to reach platform support with their questions or issues.

- **Terms & Privacy Screen:** Displays the platform's Terms of Service and Privacy Policy in a scrollable text view.

*(Insert image: Trainee Profile Hub)*

*(Insert image: Personal Details Edit Screen)*

*(Insert image: Payment Details Screen)*

---

## 3.3 Trainer Features

### 3.3.1 Trainer Home Dashboard

The trainer dashboard is designed as a professional command center displaying key business metrics and quick actions:

- **Statistics Overview Cards:**
  - **Total Clients** — The number of currently active subscribers
  - **Today's Amount** — Revenue earned today (in EGP)
  - **Total Amount** — Lifetime cumulative revenue

- **Quick Action Buttons:** Navigation shortcuts that allow the trainer to quickly jump to:
  - Subscribers list
  - Training Plans management
  - Exercise Library
  - Add Workout

- **Bottom Navigation Bar (Mobile) / Sidebar (Web):** Home, Chat (with real-time unread badge), Exercises, and Profile tabs.

*(Insert image: Trainer Home Dashboard — Statistics Cards)*

### 3.3.2 Training Plans Management (Full CRUD)

Trainers can create and manage their own training plans through a complete CRUD interface:

#### View Plans Screen
Displays all training plans created by the trainer in a card-based list. Each card shows:
- Plan name and description
- Price (in EGP) and duration (days/months)
- Badge label (if set, e.g., "Most Popular")
- Features list
- **Edit** and **Delete** action buttons

*(Insert image: Trainer Plans List)*

#### Create / Edit Plan Screen
A comprehensive form allowing the trainer to define:
- **Plan Name** — The title displayed to trainees
- **Description** — Detailed text about what the plan includes
- **Price** — Cost in EGP
- **Duration** — In days, months, or weekly training hours
- **Badge** — Optional label (e.g., "Most Popular", "Best Value") for marketing
- **Features List** — Free-text items listing plan benefits (e.g., "3 workouts/week", "Chat support")
- **Is Active** — Toggle to make the plan available or unavailable for subscription

When editing, all fields are pre-populated with the existing plan data.

*(Insert image: Create/Edit Training Plan Form)*

#### Delete Plan
Trainers can permanently remove a plan. A confirmation dialog is shown before deletion to prevent accidental removal.

### 3.3.3 Workout / Exercise Management

Trainers can build a personal exercise library of custom workouts:

#### Trainer Exercise Library Screen
- Browse all workouts the trainer has created
- Organized by **target muscle group** with horizontal scrollable category chips (Chest, Back, Shoulders, Arms, Abs, Legs)
- Exercise cards display thumbnail image and exercise name

*(Insert image: Trainer Exercise Library)*

#### Exercise Detail Screen
- View complete workout details: title, description, video URL (with embedded player), image, target muscle, and assistant muscles

#### Add Workout Screen
A comprehensive form to create a new exercise:
- **Title** — Exercise name
- **Description** — Detailed instructions for proper form and technique
- **Video URL** — Link to a demonstration video
- **Image URL** — Link to an exercise image
- **Target Muscle** — Primary muscle group selection
- **Assistant Muscles** — Secondary muscle groups engaged
- **Replacement Workout IDs** — Optional alternative exercises

*(Insert image: Add Workout Form)*

### 3.3.4 Subscriber Management

#### Subscribers List Screen
Trainers can view all trainees who have subscribed to their plans:
- **Trainee name** and profile image
- **Plan name** they subscribed to
- **Subscription details** (start date, duration, status)

This screen helps trainers keep track of their active client base and manage coaching relationships.

*(Insert image: Subscribers List Screen)*

### 3.3.5 Daily Notes

Daily notes allow trainers to write personalized coaching comments for each subscriber:

#### Notes Home Screen
For each subscriber, the trainer can view a chronological list of daily notes they have written. Notes are linked via the **Subscription ID**.

#### Note Editor Screen
A rich text editor that allows the trainer to write and save notes with:
- **Title** — A short subject line for the note
- **Body Text** — Detailed content (coaching feedback, diet recommendations, progress observations, etc.)
- Notes are timestamp-linked and sorted chronologically

**Platform Note:** The dedicated Notes list/editor UI with full management capabilities is available as a **web-exclusive** feature with its own pages. On the mobile app, trainers can create and view notes through the chat detail screen interface.

*(Insert image: Daily Notes List)*

*(Insert image: Note Editor Screen)*

### 3.3.6 Chat & Messaging System (Trainer Side)

The trainer's chat system mirrors the trainee chat but from the coach's perspective:

#### Chat Contact List Screen
- All **subscribed trainees** automatically appear as chat contacts
- Each contact shows: trainee's profile image, name, last message preview, timestamp, and unread message count badge

#### Chat Detail Screen
The trainer has all the same messaging capabilities as the trainee:
- **Text messages** with bubble layout
- **Photo & Video sharing** via Google Drive
- **Voice messages** recording and playback

**Additionally, trainers have a unique capability:**
- **Workout Sharing:** Trainers can share exercises from their workout library directly in the chat. The shared workout appears as a rich card with the exercise image, name, and details, allowing the trainee to view the full exercise information.

*(Insert image: Trainer Chat List)*

*(Insert image: Trainer Chat — Workout Sharing)*

### 3.3.7 Trainer Profile Management

#### Profile Screen
Displays the trainer's complete professional profile:
- Profile photo (uploaded via Google Drive)
- Name, professional title, and star rating
- Bio text, experience years
- Specializations (as tags/chips)
- Certifications list (name, organization, year)

*(Insert image: Trainer Profile Screen)*

#### Edit Profile Screen
Allows the trainer to update:
- **Specializations** — Add or remove areas of expertise
- **Certifications** — Add new certificates (with name, organization, year, and optional image), edit existing ones, or delete them
- **Bio** — Update the personal biography text

*(Insert image: Trainer Edit Profile Screen)*

#### Additional Profile Screens
- **Account Screen:** Overview of account details with navigation links to all sub-sections
- **Information Screen:** A detailed, read-only view of all trainer information
- **Payment Details, Contact Us, Terms & Privacy:** Same functionality as the trainee interface

---

## 3.4 Admin Features

### 3.4.1 Admin Dashboard

The admin dashboard provides a clean, category-based management interface:

- **Category Grid:** The admin home screen displays the product categories available for management — **Food**, **Supplements**, and **Clothes** — each as a tappable card.
- Tapping a category opens the **Category Management Screen** for that specific product type.

*(Insert image: Admin Dashboard — Category Grid)*

### 3.4.2 Product Management (Full CRUD)

Admins have complete control over the product catalog that trainees browse and purchase from:

#### Category Items List Screen
- Displays all products within the selected category in a scrollable list
- Each product shows: image thumbnail, name, price, and category
- **Edit** and **Delete** action buttons on each product card

#### Add Product Screen
A form to create a new product with the following fields:
- **Product Name** — Display name in the store
- **Description** — Detailed product description
- **Price** — Cost in EGP
- **Calories / Nutrition Info** — For food and supplement items
- **Image** — Product image (URL or upload)
- **Product Type** — Category assignment
- **Available Sizes** — For clothing items (S, M, L, XL, etc.)

#### Edit Product
Modify any field of an existing product. The form is pre-populated with the current product data.

#### Delete Product
Remove a product from the catalog permanently. A confirmation step prevents accidental deletions.

> **Important:** The Admin role is responsible for managing the product catalog. Products must be added by the Admin before they appear in the Trainee's store. Without admin-added products, the store sections will be empty.

*(Insert image: Admin Category Items List)*

*(Insert image: Admin Add Product Form)*

---

# Chapter 4: Cross-Platform Comparison & Statistics

## 4.1 Feature Parity Table

| Feature | Mobile (Flutter) | Web (React) |
|---|---|---|
| Splash Screen & Auto-Login | ✅ | ✅ |
| Login & Registration | ✅ | ✅ |
| Forgot Password (3-step) | ✅ | ✅ |
| Role-Based Protected Routes | ✅ | ✅ |
| Trainee Home Dashboard | ✅ | ✅ |
| Product Store (Food/Supplements/Clothes) | ✅ | ✅ |
| Product Details (Calorie/Size badges) | ✅ | ✅ |
| Shopping Cart & Checkout | ✅ | ✅ |
| Orders History | ✅ | ✅ |
| Delivery Address Management (CRUD) | ✅ | ✅ |
| Coach Profile & Subscription | ✅ | ✅ |
| Exercise Library (Muscle Groups) | ✅ | ✅ |
| Real-Time Chat (Text) | ✅ | ✅ |
| Chat — Photo/Video Sharing | ✅ | ✅ |
| Chat — Voice Messages | ✅ | ✅ |
| Unread Message Badges | ✅ | ✅ |
| Trainee Profile Management | ✅ | ✅ |
| Profile Image Upload (Google Drive) | ✅ | ✅ |
| Trainer Home Dashboard (Stats) | ✅ | ✅ |
| Training Plans CRUD | ✅ | ✅ |
| Workout/Exercise Management | ✅ | ✅ |
| Subscriber Management | ✅ | ✅ |
| Trainer Chat + Workout Sharing | ✅ | ✅ |
| Trainer Profile Management | ✅ | ✅ |
| Daily Notes — Dedicated UI (List/Editor) | ❌ | ✅ |
| Daily Notes — via Chat | ✅ | ✅ |
| Admin Product Management (CRUD) | ✅ | ✅ |
| Offline Connectivity Detection | ✅ | — |
| Navigation Style | Bottom Nav Bar | Sidebar |

## 4.2 Platform Statistics

| Metric | Mobile (Flutter) | Web (React) | Combined |
|---|---|---|---|
| Total Screens / Pages | 48 | 48 | 96 |
| Auth Screens | 6 | 11 | 17 |
| Trainee Screens | 27 | 22 | 49 |
| Trainer Screens | 18 | 15 | 33 |
| Admin Screens | 3 | 3 | 6 |
| Reusable Widgets / Components | 10 | 7 | 17 |
| State Managers | 4 Providers | 5 Zustand Stores | 9 |
| API Repositories / Services | 4 | 7 | 11 |
| Data Models | 6 | — (inline) | 6 |
| URL Routes | — | 55 | 55 |
| Third-Party Libraries | 30+ | 12 | 42+ |

---

# Chapter 5: Key User Flows

## 5.1 Flow 1: Trainee → Discover & Subscribe to a Trainer

```
Trainee Home → Browse Trainer Cards → Tap Trainer → Coach Profile
→ View Training Plans → Select Plan → Checkout (Payment)
→ Subscription Created → Chat with Trainer Unlocked
```

This flow represents the core value proposition of Power Pulse — connecting trainees with trainers through a structured subscription model.

## 5.2 Flow 2: Trainee → Shop for Products

```
Home Carousel → Tap Food/Supplements/Clothes Banner
→ Category Grid View → Tap Product → Product Details
→ Add to Cart → Shopping Cart → Select Delivery Address
→ Checkout → Confirm Order → Transaction Success
```

## 5.3 Flow 3: Trainer → Create & Manage Content

```
Trainer Dashboard → Create Training Plan (name, price, features)
→ Add Workout Exercise (title, video, muscles)
→ View Subscribers → Open Chat with Trainee
→ Share Workout in Chat → Send Voice Message
→ Write Daily Coaching Notes
```

## 5.4 Flow 4: Password Recovery

```
Login Screen → Tap "Forgot Password" → Enter Email
→ Check Email for Verification Code → Enter Code
→ Set New Password → Redirect to Login
```

## 5.5 Flow 5: Admin → Manage Product Catalog

```
Admin Dashboard → Select Category (Food/Supplements/Clothes)
→ View All Items → Add New Product (name, price, image, details)
→ Edit Existing Products → Delete Unwanted Products
```

---

# Chapter 6: Deployment & Configuration

## 6.1 Mobile App Deployment

| Item | Configuration |
|---|---|
| **App Icon** | Generated from `assets/images/app_icon.png` via flutter_launcher_icons |
| **Splash Screen** | Native splash with logo, white background (#FFFFFF), dark mode support (#121212) |
| **Android 12+** | Adaptive splash with icon background color |
| **Min Android SDK** | 21 (Lollipop) |
| **Design Reference** | 375 × 812 pixels |
| **Primary Font** | Montserrat Alternates (bundled in assets/fonts/) |

## 6.2 Web App Deployment

| Item | Configuration |
|---|---|
| **Hosting** | Vercel (automatic CI/CD from Git) |
| **Dev Server** | Vite with Hot Module Replacement (HMR) |
| **API Proxy (Dev)** | `/api/*` → `http://powerpuls.runasp.net` |
| **WebSocket Proxy** | `/chathub` → `http://powerpuls.runasp.net` (ws: true) |
| **SPA Fallback** | All non-API routes → `index.html` |
| **Environment Variables** | `VITE_GOOGLE_CLIENT_ID` for Google OAuth |

### Vercel Production Rewrites

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://powerpuls.runasp.net/api/:path*" },
    { "source": "/chathub", "destination": "http://powerpuls.runasp.net/chathub" },
    { "source": "/((?!api|chathub).*)", "destination": "/index.html" }
  ]
}
```

## 6.3 NPM Scripts (Web)

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` directory |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

---

# Chapter 7: Conclusion

**Power Pulse** represents a comprehensive, production-ready fitness ecosystem that successfully addresses the core challenges facing the modern fitness industry. By unifying personal training management, real-time communication, e-commerce, and educational fitness content into a single, cross-platform solution, Power Pulse delivers a seamless and premium experience for all its users.

## 7.1 Key Achievements

1. **Full Cross-Platform Parity:** The platform is available as both a Flutter mobile application (iOS & Android) and a React web application, sharing the same ASP.NET Core backend API and delivering a consistent user experience across all devices. Together, the two platforms encompass **96 screens/pages**.

2. **Three-Role Architecture:** A well-defined role system (Trainee, Trainer, Admin) with tailored interfaces, JWT-based authentication, role-based protected routes, and role-specific feature sets ensures each user type has exactly the tools they need.

3. **Real-Time Communication Engine:** The integrated chat system — powered by Firebase Firestore and SignalR WebSockets — supports text messaging, photo/video sharing (via Google Drive), and voice messages with recording and playback. Real-time unread message badges keep users informed across all navigation screens.

4. **Subscription-Based Coaching Model:** Trainers can create customized training plans with flexible pricing, durations, and marketing badges. Subscribing unlocks the full coaching experience including direct chat, workout sharing, and daily coaching notes — creating a monetizable, structured coaching pipeline.

5. **Integrated E-Commerce Platform:** A complete shopping experience with three product categories (Food, Supplements, Clothes), product details with nutrition/size information, a full cart system with quantity management, delivery address management, checkout, and order history — all seamlessly integrated within the fitness platform.

6. **Comprehensive Exercise Library:** A visual, muscle-group-organized exercise library with videos, images, anatomy diagrams, target and assistant muscle identification, and detailed movement descriptions serves as both a training tool for subscribers and an educational resource for all trainees.

7. **Professional Trainer Tools:** Trainers have access to a full suite of content management tools — training plans CRUD, workout exercise creation, subscriber management, daily coaching notes, revenue statistics, and profile management — enabling them to run their coaching business entirely within the platform.

8. **Scalable, Clean Architecture:** Both applications follow clean layered architectures with clear separation of concerns (presentation, business logic, data layers), centralized state management (Provider on mobile, Zustand on web), abstracted API service layers, and reusable component libraries — making the codebase maintainable, testable, and extensible.

9. **Modern Technology Stack:** Leveraging cutting-edge technologies including Flutter 3.9, React 19, Vite 6, Firebase, SignalR, Google Drive API, Leaflet Maps, and ASP.NET Core ensures the platform is built on a solid, future-proof, and industry-standard foundation.

## 7.2 Future Enhancements

The Power Pulse platform has been designed with extensibility in mind. Potential future enhancements include:
- Push notifications for real-time alerts
- Video calling for remote training sessions
- AI-powered workout recommendations based on trainee goals
- Payment gateway integration for real financial transactions
- Advanced analytics and progress tracking dashboards
- Trainer rating and review system

---

*Power Pulse — Empowering Fitness, Connecting People.*
