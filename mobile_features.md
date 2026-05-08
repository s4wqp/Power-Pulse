# Power Pulse — Final Project Documentation (Mobile App)

Power Pulse is a **fitness ecosystem** built with **Flutter (Dart)** connecting three user roles: **Trainees** (clients), **Trainers** (coaches), and **Admins**. The mobile app communicates with a shared **ASP.NET Core REST API** backend, uses **Firebase** for real-time features, and **Google Drive** for file storage.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Project Structure](#2-architecture--project-structure)
3. [Technology Stack & Libraries](#3-technology-stack--libraries)
4. [Design System](#4-design-system)
5. [Authentication & Registration](#5-authentication--registration)
6. [Trainee Features](#6-trainee-features)
7. [Trainer Features](#7-trainer-features)
8. [Admin Features](#8-admin-features)
9. [Training Plans & Subscriptions](#9-training-plans--subscriptions)
10. [Shared Widgets](#10-shared-widgets)
11. [State Management](#11-state-management)
12. [Data Layer](#12-data-layer)
13. [Key User Flows](#13-key-user-flows)
14. [Assets & Resources](#14-assets--resources)

---

## 1. Project Overview

| Item | Detail |
|---|---|
| **App Name** | Power Pulse |
| **Version** | 1.0.0+1 |
| **Dart SDK** | ^3.9.2 |
| **Platforms** | Android, iOS, Windows, macOS, Linux, Web |
| **Design Size** | 375 × 812 (standard mobile) |
| **Primary Font** | Montserrat Alternates (Regular, Medium, SemiBold, Bold) |

### Stats at a Glance

| Metric | Count |
|---|---|
| Total Screens | 48 |
| Auth / Shared Screens | 6 |
| Trainee Screens | 27 |
| Trainer Screens | 18 (incl. 3 notes) |
| Admin Screens | 3 |
| Shared Widgets | 10 |
| State Providers | 4 |
| Data Repositories | 4 |
| User Roles | 3 (Trainee · Trainer · Admin) |

---

## 2. Architecture & Project Structure

The project follows a **layered architecture** with clear separation between presentation, business logic, and data layers.

```
lib/
├── main.dart                    # App entry point, Firebase init, Provider setup
├── routing.dart                 # Named route definitions & route generator
├── custom.dart                  # Design system (colors, text styles, snackbars)
├── firebase_options.dart        # Firebase configuration (auto-generated)
│
├── business_logic/
│   └── providers/               # State management (Provider pattern)
│       ├── auth_provider.dart       # Auth state, login, register, auto-login
│       ├── chat_provider.dart       # Chat state, messages, unread counts
│       ├── trainee_provider.dart    # Trainee data (products, orders, exercises)
│       └── trainer_provider.dart    # Trainer data (plans, workouts, subscribers)
│
├── data/
│   ├── cart_service.dart            # Local shopping cart management
│   ├── dashboard_data.dart          # Dashboard configuration data
│   ├── models/                      # Data models (DTOs)
│   │   ├── auth_models.dart             # User, LoginResponse, etc.
│   │   ├── order_models.dart            # Order, OrderItem
│   │   ├── trainee_models.dart          # Trainee, Address, Product
│   │   └── trainer_models.dart          # Trainer, TrainingPlan, Workout, etc.
│   ├── repositories/               # API call abstractions
│   │   ├── auth_repository.dart         # Login, register, password reset APIs
│   │   ├── chat_repository.dart         # Message, conversation, read-receipt APIs
│   │   ├── trainee_repository.dart      # Product, order, address, exercise APIs
│   │   └── trainer_repository.dart      # Plan, workout, subscriber, note APIs
│   └── network/                     # Network layer (Dio HTTP client config)
│
├── models/                      # Registration flow data models
│   ├── trainee_registration_data.dart
│   └── trainer_registration_data.dart
│
├── services/
│   └── drive_service.dart           # Google Drive API integration
│
├── utils/
│   └── error_handler.dart           # Centralized error handling
│
└── presentation/
    ├── screens/                 # Shared auth screens (6)
    ├── trainee/
    │   ├── screens/             # Trainee screens (27)
    │   └── widgets/             # Trainee-specific widgets
    ├── trainer/
    │   ├── screens/             # Trainer screens (15 + 3 notes)
    │   └── widgets/             # Trainer-specific widgets
    ├── admin/
    │   ├── screens/             # Admin screens (3)
    │   └── widgets/
    └── widgets/                 # Shared reusable widgets (10)
```

### App Entry Point ([main.dart](file:///d:/power_pulse/lib/main.dart))

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  // Transparent status bar with dark icons
  SystemChrome.setSystemUIOverlayStyle(...);
  runApp(const MyApp());
}
```

The [MyApp](file:///d:/power_pulse/lib/main.dart#26-59) widget wraps the entire app with:
1. **ScreenUtilInit** — Responsive sizing (375×812 design)
2. **MultiProvider** — 4 global state providers (Auth, Trainer, Trainee, Chat)
3. **MaterialApp** — Named routing via `Routing.generateRoute`
4. **OfflineBanner** — Global connectivity monitor overlay

---

## 3. Technology Stack & Libraries

### Core Framework

| Package | Version | Purpose |
|---|---|---|
| **Flutter SDK** | 3.9.2+ | Cross-platform UI framework |
| **Dart SDK** | ^3.9.2 | Programming language |

### UI & Design

| Package | Version | Purpose |
|---|---|---|
| **cupertino_icons** | ^1.0.8 | iOS-style icons for CupertinoWidgets |
| **flutter_svg** | ^2.0.7 | Render SVG images/icons as widgets |
| **lottie** | ^3.1.2 | Lottie JSON animations (splash screen, loading states) |
| **google_fonts** | latest | Access Google Fonts library (e.g., Inter, Roboto) |
| **flutter_screenutil** | ^5.9.3 | Responsive sizing — adapts layouts to different screen sizes using a 375×812 design reference |
| **cached_network_image** | ^3.3.1 | Download and cache network images with placeholder/error widgets |

### Firebase Integration

| Package | Version | Purpose |
|---|---|---|
| **firebase_core** | ^4.2.1 | Initialize Firebase services |
| **firebase_auth** | ^6.1.2 | Firebase Authentication (used alongside custom JWT) |
| **firebase_storage** | ^13.0.4 | Firebase Cloud Storage for file uploads |
| **cloud_firestore** | ^6.1.0 | Firestore real-time database — powers the chat system with instant message sync |

### Networking & API

| Package | Version | Purpose |
|---|---|---|
| **dio** | ^5.4.0 | HTTP client for REST API calls — supports interceptors, token injection, error handling |
| **signalr_netcore** | ^1.4.4 | SignalR real-time WebSocket connection for instant chat messaging |
| **connectivity_plus** | ^7.0.0 | Monitor network connectivity — shows offline banner when disconnected |

### State Management & Storage

| Package | Version | Purpose |
|---|---|---|
| **provider** | ^6.1.1 | State management — ChangeNotifier pattern for reactive UI updates |
| **shared_preferences** | ^2.2.2 | Persistent key-value storage — stores JWT tokens, user preferences, and session data for auto-login |

### Google Services

| Package | Version | Purpose |
|---|---|---|
| **google_sign_in** | ^6.2.1 | Google OAuth sign-in for Drive API authentication |
| **googleapis** | ^16.0.0 | Google APIs client — used for Google Drive file operations |
| **extension_google_sign_in_as_googleapis_auth** | ^2.0.7 | Bridge that converts Google Sign-In credentials to googleapis auth client |

### Maps & Location

| Package | Version | Purpose |
|---|---|---|
| **google_maps_flutter** | ^2.14.0 | Google Maps widget for map display |
| **flutter_map** | ^8.2.2 | OpenStreetMap-based map widget (alternative to Google Maps) |
| **geolocator** | ^14.0.2 | Get device GPS location (current position, location stream) |
| **geocoding** | ^4.0.0 | Convert between addresses and geographic coordinates |
| **latlong2** | ^0.9.1 | Latitude/longitude data types and distance calculations |

### Media & Files

| Package | Version | Purpose |
|---|---|---|
| **image_picker** | latest | Pick photos/videos from device gallery or camera |
| **file_picker** | ^10.3.8 | Pick files from device storage |
| **video_player** | ^2.10.1 | Play video files (exercise demos, shared media) |
| **chewie** | ^1.13.0 | Material Design video player controls wrapping video_player |
| **video_thumbnail** | ^0.5.6 | Generate thumbnail images from video files |
| **video_compress** | ^3.1.4 | Compress videos before upload to reduce file size and bandwidth |
| **path_provider** | ^2.1.5 | Access device file system paths (temp, documents, cache directories) |

### Audio (Voice Messages)

| Package | Version | Purpose |
|---|---|---|
| **record** | ^6.1.2 | Record audio from device microphone — used for voice messages in chat |
| **audioplayers** | ^6.1.0 | Play audio files — used for voice message playback |

### Utilities

| Package | Version | Purpose |
|---|---|---|
| **permission_handler** | ^12.0.1 | Request and check runtime permissions (camera, microphone, storage, location) |
| **url_launcher** | ^6.3.2 | Open URLs in external browser (links, phone calls, emails) |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| **flutter_test** | SDK | Unit and widget testing framework |
| **flutter_lints** | ^5.0.0 | Recommended Dart/Flutter lint rules for code quality |
| **flutter_launcher_icons** | ^0.14.3 | Auto-generate app icons for all platforms from a single image |
| **flutter_native_splash** | ^2.4.0 | Generate native splash screens (Android 12+ support, light/dark modes) |

---

## 4. Design System

Defined in [custom.dart](file:///d:/power_pulse/lib/custom.dart) — provides a centralized design system used across the entire app.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primaryButton` | `#17A073` | Primary buttons, active states |
| `lightGreen` | `#17A073` | Success accents, green highlights |
| `black` | `#000000` | Primary text |
| `gray` | `#9B9B9B` | Secondary text |
| `textField` | `#000842` | Input field text |
| `ratingColor` | `#EEE720` | Star ratings |
| `caloriesColor` | `#93D8A2` | Calorie info badges (green) |
| `gramsColor` | `#D83F49` | Supplement content size (red) |
| `clothesPrice` | `#49A4FF` | Clothing price tags (blue) |
| `saveColor` | `#30BE71` | Save/success actions |
| `dicardColor` | `#FF0000` | Discard/delete actions |
| `secondryTextCHat` | `#10B981` | Chat accent color |

### Text Helpers

| Method | Purpose |
|---|---|
| [mainText()](file:///d:/power_pulse/lib/custom.dart#40-50) | Bold headings (25sp default) |
| [subMainText()](file:///d:/power_pulse/lib/custom.dart#51-66) | Sub-headings (19.6sp) |
| [buildLabel()](file:///d:/power_pulse/lib/custom.dart#67-82) | Form labels (12sp, medium weight) |
| [buildCheckbox()](file:///d:/power_pulse/lib/custom.dart#84-114) | Labeled checkbox rows |

### Snackbar System

| Method | Style |
|---|---|
| [showSuccessSnackBar()](file:///d:/power_pulse/lib/custom.dart#155-163) | Green floating snackbar with ✓ icon |
| [showErrorSnackBar()](file:///d:/power_pulse/lib/custom.dart#164-172) | Red floating snackbar with ⚠ icon |
| [showInfoSnackBar()](file:///d:/power_pulse/lib/custom.dart#173-181) | Dark floating snackbar with ℹ icon |

---

## 5. Authentication & Registration

All roles share these 6 screens before entering their role-specific dashboards.

### 5.1 Splash Screen
**File:** [splash_screen.dart](file:///d:/power_pulse/lib/presentation/screens/splash_screen.dart)
Animated landing page with auto-login. Checks for a stored JWT token — if valid, redirects to the role home screen; otherwise shows login.

### 5.2 Login
**File:** [login_screen.dart](file:///d:/power_pulse/lib/presentation/screens/login_screen.dart)
Email + password form. Returns JWT token and role identifier → role-based routing to Trainee/Trainer/Admin dashboard.

### 5.3 Role Selection
**File:** [befor_register.dart](file:///d:/power_pulse/lib/presentation/screens/befor_register.dart)
Choose to register as **Trainee** or **Trainer** → routes to the appropriate registration flow.

### 5.4 Forgot Password (3-step flow)

| Step | File | Action |
|---|---|---|
| 1. Enter Email | [forget_password_screen.dart](file:///d:/power_pulse/lib/presentation/screens/forget_password_screen.dart) | Submit email → backend sends verification code |
| 2. Verify Code | [verify_reset_code_screen.dart](file:///d:/power_pulse/lib/presentation/screens/verify_reset_code_screen.dart) | Enter received code for validation |
| 3. Reset Password | [reset_password_screen.dart](file:///d:/power_pulse/lib/presentation/screens/reset_password_screen.dart) | Set new password after verified |

### 5.5 Trainee Registration (2 steps)

| Step | File | Action |
|---|---|---|
| 1. Personal Details | [trainee_register_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/trainee_register_screen.dart) | Name, email, phone, password, fitness goal |
| 2. Body Metrics | [height_weight.dart](file:///d:/power_pulse/lib/presentation/widgets/height_weight.dart) | Interactive height/weight picker → creates account |

### 5.6 Trainer Registration (3 steps)

| Step | File | Action |
|---|---|---|
| 1. Basic Details | [trainer_register_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_register_screen.dart) | Name, email, phone, password |
| 2. Profile Setup | [profile_register_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/profile_register_screen.dart) | Title, specializations, certifications, experience, bio |
| 3. Business Info | [business_register_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/business_register_screen.dart) | Business details to complete profile |

---

## 6. Trainee Features (27 screens)

### 6.1 Home Dashboard
**File:** [trainee_home_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/trainee_home_screen.dart)

- **Welcome Banner** — Personalized greeting with trainee's name
- **Product Carousel** — Swipeable banners for Food, Supplements, Clothes stores
- **Trainer Discovery** — Scrollable list with name, bio, photo, star rating
- **Search & Filter** — Name search bar + specialization filter dialog
- **Bottom Nav Bar** — Home, Chat (with unread badge), Exercises, Profile

### 6.2 Product Store (E-Commerce)

#### Store Categories

| Store | Sub-Categories |
|---|---|
| **Food** | Vegetables, Nuts & Seeds, Protein, Protein Shakes |
| **Supplements** | Protein, Creatine, Supplements, Energy Drinks |
| **Clothes** | T-Shirts, Pants, Shoes, Shorts |

#### Screens

| Screen | File | Function |
|---|---|---|
| Food/Supplement Category | [generic_category_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/generic_category_screen.dart) | Browse products by category with thumbnails |
| Clothing Category | [clothing_category_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/clothing_category_screen.dart) | Clothing-specific category with size options |
| Food Details | [food_details_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/food_details_screen.dart) | Name, description, calories (green), price, rating, image |
| Generic Details | [generic_details_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/generic_details_screen.dart) | Supplements (red content size) and clothes (sizes) |
| Shopping Cart | [shopping_cart_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/shopping_cart_screen.dart) | Items, quantity adjustments, auto-calculated total |
| Select Address | [select_delivery_location_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/select_delivery_location_screen.dart) | Choose from saved delivery addresses |
| Checkout | [checkout_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/checkout_screen.dart) | Order summary → confirm purchase (also handles subscriptions) |
| Success | [transaction_success_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/transaction_success_screen.dart) | Purchase/subscription confirmation |
| Orders History | [orders_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/orders_screen.dart) | Past orders with date, status, total, item breakdown |

### 6.3 Delivery Address Management

| Screen | File | Function |
|---|---|---|
| Address List | [delivery_addresses_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/delivery_addresses_screen.dart) | View all saved addresses |
| Add/Edit Address | [new_address_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/new_address_screen.dart) | Form: building, apartment, floor, street, phone, details |

### 6.4 Coach Profile & Subscription

| Screen | File | Function |
|---|---|---|
| Coach Profile | [coach_profile_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/coach_profile_screen.dart) | Bio, title, experience, photo, specializations, certifications, rating |
| Training Plans | [coach_packages_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/coach_packages_screen.dart) | Browse plans: name, price, duration, badge, features |

Subscription: select plan → checkout → subscription created → **unlocks chat, workout sharing, daily notes**.

### 6.5 Exercise Library

| Screen | File | Function |
|---|---|---|
| Library | [exercise_library_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/exercise_library_screen.dart) | Muscle-group chips (Chest, Back, Shoulders, Arms, Abs, Legs), exercise cards with images |
| Detail | [exercise_detail_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/exercise_detail_screen.dart) | Name, video/image, target muscle, assistant muscles, anatomy diagrams, description |

### 6.6 Chat / Messaging

| Screen | File | Function |
|---|---|---|
| Chat List | [chat_list_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/chat_list_screen.dart) | Contacts: trainer name, photo, last message, timestamp, unread count |
| Chat Detail | [chat_detail_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/chat_detail_screen.dart) | Real-time messaging: text, **photo/video** (gallery → Google Drive), **voice messages** (record → play). Messages auto-marked as read |

### 6.7 Profile Management

| Screen | File | Function |
|---|---|---|
| Profile Hub | [profile_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/profile_screen.dart) | Name, email, photo (upload via Drive), nav to sub-sections |
| Personal Details | [personal_details_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/personal_details_screen.dart) | Edit name, phone, weight, height, goal |
| Payment Details | [payment_details_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/payment_details_screen.dart) | Manage saved cards (number, expiry, holder) |
| Notifications | [notification_settings_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/notification_settings_screen.dart) | Toggle notification preferences |
| App Settings | [app_settings_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/app_settings_screen.dart) | General settings |
| Contact Us | [contact_us_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/contact_us_screen.dart) | Contact form for platform support |
| Terms & Privacy | [terms_and_privacy_screen.dart](file:///d:/power_pulse/lib/presentation/trainee/screens/terms_and_privacy_screen.dart) | Terms of service and privacy policy |

---

## 7. Trainer Features (18 screens)

### 7.1 Home Dashboard
**File:** [trainer_home_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_home_screen.dart)

- **Statistics Cards** — Total Clients, Today's Revenue, Lifetime Revenue
- **Quick Action Buttons** — Shortcuts to Subscribers, Plans, Exercise Library
- **Bottom Nav Bar** — Home, Chat (with unread badge), Exercises, Profile

### 7.2 Training Plans Management (CRUD)

| Screen | File | Function |
|---|---|---|
| View Plans | [trainer_plans_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_plans_screen.dart) | List all plans with name, price, duration, badge, features |
| Create/Edit Plan | [trainer_add_plan_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_add_plan_screen.dart) | Form: name, description, price, duration, badge, features, active status |

### 7.3 Workout / Exercise Management

| Screen | File | Function |
|---|---|---|
| Exercise Library | [trainer_exercise_library_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_exercise_library_screen.dart) | Browse own workouts by muscle group, view details |
| Add Workout | [add_workout_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/add_workout_screen.dart) | Title, description, video URL, image URL, target/assistant muscles, replacement IDs |

### 7.4 Subscriber Management
**File:** [trainer_subscribers_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_subscribers_screen.dart)
View all subscribed trainees — trainee name, plan name, subscription details.

### 7.5 Daily Notes

| Screen | File | Function |
|---|---|---|
| Notes Home | [notes/notes_home_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/notes/notes_home_screen.dart) | List of daily notes per subscriber |
| Note Editor | [notes/note_editor_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/notes/note_editor_screen.dart) | Rich text editor, title + body, linked via subscription ID |
| Note Model | [notes/note_model.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/notes/note_model.dart) | Data model for note objects |

### 7.6 Chat / Messaging

| Screen | File | Function |
|---|---|---|
| Chat List | [trainer_chat_list_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_chat_list_screen.dart) | Subscribed trainees as contacts, unread counts |
| Chat Detail | [trainer_chat_detail_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_chat_detail_screen.dart) | Real-time messaging + **photo/video sharing**, **voice messages**, **workout sharing** |

### 7.7 Profile Management

| Screen | File | Function |
|---|---|---|
| Profile | [trainer_profile_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_profile_screen.dart) | Name, title, bio, experience, specializations, certifications, photo |
| Account | [trainer_account_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_account_screen.dart) | Account overview with nav links |
| Information | [trainer_information_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_information_screen.dart) | Read-only detailed trainer info |
| Edit Profile | [trainer_edit_profile_screen.dart](file:///d:/power_pulse/lib/presentation/trainer/screens/trainer_edit_profile_screen.dart) | Update specializations, certifications, bio |

---

## 8. Admin Features (3 screens)

### 8.1 Admin Dashboard
**File:** [admin_home_screen.dart](file:///d:/power_pulse/lib/presentation/admin/screens/admin_home_screen.dart)
Category grid (Food, Supplements, Clothes) → tap to manage products.

### 8.2 Product Management (CRUD)

| Screen | File | Function |
|---|---|---|
| Category Items | [admin_category_screen.dart](file:///d:/power_pulse/lib/presentation/admin/screens/admin_category_screen.dart) | View/edit/delete products in a category |
| Add Product | [admin_add_item_screen.dart](file:///d:/power_pulse/lib/presentation/admin/screens/admin_add_item_screen.dart) | Name, description, price, calories, image, type, sizes |

> [!IMPORTANT]
> Products must be added by the Admin before they appear in the Trainee store.

---

## 9. Training Plans & Subscriptions

Plans are **created by individual Trainers** and are trainer-specific.

### Plan Structure

| Field | Description |
|---|---|
| Name | Title (e.g., "Basic Plan", "Premium Plan") |
| Description | What the plan includes |
| Price | Cost in EGP |
| Duration (Days) | Validity in days |
| Duration (Months) | Optional, in months |
| Duration (Hours) | Optional, weekly training hours |
| Badge | Optional ("Most Popular", "Best Value") |
| Features | List of benefits (free-text) |
| Is Active | Whether available for subscription |

### Subscription Flow

1. Trainee browses Trainer's profile → views plans
2. Selects a plan → checkout (payment)
3. Subscription created (trainee ↔ trainer link)
4. **Unlocks:** chat access, workout sharing, daily notes
5. Trainer views all subscribers in Subscribers screen

---

## 10. Shared Widgets

| Widget | File | Purpose |
|---|---|---|
| Custom Button | [button.dart](file:///d:/power_pulse/lib/presentation/widgets/button.dart) | Styled button |
| Elevated Button | [elevated_button.dart](file:///d:/power_pulse/lib/presentation/widgets/elevated_button.dart) | Material elevated variant |
| Text Field | [text_field.dart](file:///d:/power_pulse/lib/presentation/widgets/text_field.dart) | Styled input field |
| Rich Text | [rich_text.dart](file:///d:/power_pulse/lib/presentation/widgets/rich_text.dart) | Formatted text rendering |
| Cached Image | [cached_image.dart](file:///d:/power_pulse/lib/presentation/widgets/cached_image.dart) | Network image with cache + fallback |
| Chat Badge Icon | [chat_badge_icon.dart](file:///d:/power_pulse/lib/presentation/widgets/chat_badge_icon.dart) | Icon with real-time unread message count |
| Card Formatters | [card_input_formatters.dart](file:///d:/power_pulse/lib/presentation/widgets/card_input_formatters.dart) | Credit card number / expiry formatting |
| Height & Weight | [height_weight.dart](file:///d:/power_pulse/lib/presentation/widgets/height_weight.dart) | Interactive body metrics picker |
| Offline Banner | [offline_banner.dart](file:///d:/power_pulse/lib/presentation/widgets/offline_banner.dart) | Banner when device loses connectivity |
| Voice Player | [voice_message_player.dart](file:///d:/power_pulse/lib/presentation/widgets/voice_message_player.dart) | Audio playback for voice messages |

---

## 11. State Management

Uses **Provider** (ChangeNotifier pattern) with 4 global providers initialized in [main.dart](file:///d:/power_pulse/lib/main.dart):

| Provider | File | Responsibilities |
|---|---|---|
| **AuthProvider** | [auth_provider.dart](file:///d:/power_pulse/lib/business_logic/providers/auth_provider.dart) | Login, registration, token storage, auto-login, role detection, logout |
| **ChatProvider** | [chat_provider.dart](file:///d:/power_pulse/lib/business_logic/providers/chat_provider.dart) | Real-time message polling, conversation list, unread counts, send/receive messages, mark-as-read |
| **TraineeProvider** | [trainee_provider.dart](file:///d:/power_pulse/lib/business_logic/providers/trainee_provider.dart) | Load products, manage cart, orders, addresses, exercise library, trainer list |
| **TrainerProvider** | [trainer_provider.dart](file:///d:/power_pulse/lib/business_logic/providers/trainer_provider.dart) | Manage plans (CRUD), workouts (CRUD), subscribers, notes, profile updates |

---

## 12. Data Layer

### Repositories (API Abstraction)

| Repository | File | API Endpoints Covered |
|---|---|---|
| **AuthRepository** | [auth_repository.dart](file:///d:/power_pulse/lib/data/repositories/auth_repository.dart) | Login, register (trainee/trainer), forgot password, verify code, reset password |
| **ChatRepository** | [chat_repository.dart](file:///d:/power_pulse/lib/data/repositories/chat_repository.dart) | Get conversations, get messages, send message, mark read |
| **TraineeRepository** | [trainee_repository.dart](file:///d:/power_pulse/lib/data/repositories/trainee_repository.dart) | Products (by type), orders (list/create), addresses (CRUD), exercises, trainers, subscriptions |
| **TrainerRepository** | [trainer_repository.dart](file:///d:/power_pulse/lib/data/repositories/trainer_repository.dart) | Plans (CRUD), workouts (CRUD), subscribers, notes (CRUD), profile update, dashboard stats |

### Services

| Service | File | Purpose |
|---|---|---|
| **DriveService** | [drive_service.dart](file:///d:/power_pulse/lib/services/drive_service.dart) | Upload/download files via Google Drive API (profile photos, chat media) |
| **CartService** | [cart_service.dart](file:///d:/power_pulse/lib/data/cart_service.dart) | Local in-memory shopping cart |
| **ErrorHandler** | [error_handler.dart](file:///d:/power_pulse/lib/utils/error_handler.dart) | Centralized Dio error parsing → user-friendly messages |

### Data Models

| Model File | Contents |
|---|---|
| [auth_models.dart](file:///d:/power_pulse/lib/data/models/auth_models.dart) | User, LoginResponse, RegisterRequest |
| [trainee_models.dart](file:///d:/power_pulse/lib/data/models/trainee_models.dart) | Trainee, Address, Product |
| [trainer_models.dart](file:///d:/power_pulse/lib/data/models/trainer_models.dart) | Trainer, TrainingPlan, Workout, Certification, Specialization |
| [order_models.dart](file:///d:/power_pulse/lib/data/models/order_models.dart) | Order, OrderItem |
| [trainee_registration_data.dart](file:///d:/power_pulse/lib/models/trainee_registration_data.dart) | Multi-step registration state |
| [trainer_registration_data.dart](file:///d:/power_pulse/lib/models/trainer_registration_data.dart) | Multi-step registration state |

---

## 13. Key User Flows

### Flow 1: Trainee → Discover & Subscribe to Trainer
```
Home → Browse Trainers → Tap Card → Coach Profile → View Plans → Select Plan → Checkout → Success → Chat Unlocked
```

### Flow 2: Trainee → Shop for Products
```
Home Carousel → Food/Supplements/Clothes → Category View → Product Details → Add to Cart → Cart → Select Address → Checkout → Success
```

### Flow 3: Trainer → Create & Manage Content
```
Dashboard → Create Plan / Add Workout / View Subscribers → Chat with Trainee → Share Workout / Send Voice Message → Write Daily Notes
```

### Flow 4: Password Recovery
```
Login → Forgot Password → Enter Email → Verify Code → Reset Password → Login
```

### Flow 5: Admin → Manage Products
```
Admin Dashboard → Select Category → View Items → Add/Edit/Delete Product
```

---

## 14. Assets & Resources

### Directories

| Directory | Contents |
|---|---|
| `assets/images/` | App icons, splash logos (light/dark), product images, banners |
| `assets/icons/` | SVG icons used throughout the app |
| `assets/fonts/` | Montserrat Alternates font family (4 weights) |
| `assets/videos/` | Video assets |

### App Branding

| Item | Configuration |
|---|---|
| **App Icon** | Generated from `assets/images/app_icon.png` via flutter_launcher_icons |
| **Splash Screen** | Native splash with logo, white background (#FFFFFF), dark mode support (#121212) |
| **Android 12+** | Adaptive splash with icon background color |
| **Min SDK** | Android 21 (Lollipop) |
