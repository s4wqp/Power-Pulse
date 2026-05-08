# Power Pulse — Complete Platform Features Documentation

Power Pulse is a **fitness ecosystem** that connects **Trainees** (clients) with **Trainers** (coaches) and is managed by an **Admin**. It is available as a **Flutter mobile application** (iOS & Android) and a **React web platform**, both sharing the same backend API.

---

## 1. User Roles

| Role | Description |
|---|---|
| **Trainee** | End-user / client who browses trainers, subscribes to plans, shops for products, chats with coaches, and accesses an exercise library. |
| **Trainer** | Fitness coach who manages their profile, creates training plans, builds workout exercises, communicates with subscribers, and writes daily notes. |
| **Admin** | Platform administrator who manages the product catalog (food, supplements, clothes). |

---

## 2. Authentication & Registration (Shared – All Roles)

Available on **both** mobile and web.

| Feature | How It Works |
|---|---|
| **Splash Screen** | Animated landing page with auto-login attempt. If a valid token is stored, the user is redirected to their role-appropriate home screen. |
| **Login** | Email + password authentication. Returns a JWT token and role identifier used for role-based routing. |
| **Role Selection** | "Before Register" screen where the user chooses to register as a **Trainee** or **Trainer**. |
| **Trainee Registration** | Multi-step flow: personal details (name, email, phone, password, goal) → height & weight entry → account creation. |
| **Trainer Registration** | Three-step flow: basic details (name, email, phone, password) → profile setup (professional title, specializations, certifications, experience years, bio) → business information. |
| **Forgot Password** | User enters their email → receives a verification code → enters the code on a verification screen → sets a new password on the reset screen. |
| **Protected Routes** | Both platforms enforce role-based access. Unauthorized users are redirected to login or their own home screen. |

---

## 3. Trainee Features

### 3.1 Home Dashboard
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Welcome Banner** – Personalized greeting with the trainee's name and a motivational message.
- **Product Carousel** – Swipeable banners for **Food**, **Supplements**, and **Clothes** store sections. Tapping a banner opens the corresponding store.
- **Trainer Discovery** – Scrollable list of all registered trainers showing their name, bio, profile image, and star rating. Includes a **search bar** (filter by name) and a **specialization filter** dialog (e.g., Yoga, Weight Loss, Strength Training, Bodybuilding, etc.).

---

### 3.2 Product Store (E-Commerce)
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

#### Store Categories
| Store | Categories |
|---|---|
| **Food (Healthy Meals)** | Vegetables, Nuts & Seeds, Protein, Protein Shakes |
| **Supplements** | Protein, Creatine, Supplements, Energy Drinks |
| **Clothes** | T-Shirts, Pants, Shoes, Shorts |

#### How It Works
1. **Category View** – Products are grouped by category with thumbnail images. User taps a category to see items within it.
2. **Product Details** – Each product displays: name, description, calorie/nutrition info (or size for clothes), price (in EGP), star rating, and a product image. Food items show calories in green; supplements show content size in red.
3. **Shopping Cart** – Users add items to the cart with quantity adjustments. Cart shows individual prices and an automatic total calculation.
4. **Checkout Flow** – Select / add a delivery address → review order summary → confirm purchase → transaction success screen.
5. **Orders History** – View past orders with order date, status (Pending, Confirmed, etc.), total price, and item breakdown.

---

### 3.3 Delivery Address Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Address List** – View all saved delivery addresses.
- **Add New Address** – Form with building, apartment, floor, street, phone, and additional details.
- **Edit / Delete Address** – Modify or remove existing addresses.
- **Select Delivery Location** – Choose an address during checkout.

---

### 3.4 Coach (Trainer) Profile & Subscription
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Coach Profile** – View a trainer's full profile: bio, professional title, experience years, profile photo, specializations list, certifications (with organization and year), and star rating.
- **Training Plans / Packages** – Browse the trainer's available plans (see [Section 6: Training Plans](#6-training-plans--packages) below).
- **Subscribe to Plan** – Select a plan → proceed to checkout (subscription payment) → subscription is created linking the trainee to the trainer.

---

### 3.5 Exercise Library
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Muscle Group Categories** – Horizontal scrollable category chips: Chest, Back, Shoulders, Arms, Abs, Legs.
- **Exercise Grid** – Filtered exercises displayed as cards with image thumbnails and exercise name.
- **Exercise Detail** – Full detail view with: exercise name, video/image, target muscle, assistant muscles, anatomy diagrams, and a detailed description of the exercise movement and benefits.

---

### 3.6 Chat / Messaging
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Chat Contact List** – Shows all conversations with trainers, including the trainer's name, profile image, last message preview, timestamp, and unread message count.
- **Chat Detail** – Real-time messaging interface. Users can send text messages. Messages are displayed in a bubble layout with sender/receiver differentiation and timestamps.
- **Mark as Read** – Messages are automatically marked as read when the chat is opened.

---

### 3.7 Profile Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Profile Screen** – Displays user's name, email, profile photo, and provides navigation links to all profile sub-sections.
- **Personal Details** – View/edit name, phone, weight, height, and goal.
- **Profile Image Upload** – Upload a profile photo (uses Google Drive integration for image storage).
- **Payment Details** – Manage saved payment cards (card number, expiry, cardholder name).
- **Notification Settings** – Toggle notification preferences.
- **App Settings** – General application settings.
- **Contact Us** – Contact form to reach platform support.
- **Terms & Privacy** – View the platform's terms of service and privacy policy.

---

## 4. Trainer Features

### 4.1 Home Dashboard
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Statistics Overview** – Dashboard cards showing:
  - **Total Clients** – Number of active subscribers
  - **Today's Amount** – Revenue earned today
  - **Total Amount** – Lifetime revenue
- **Quick Action Buttons** – Navigation shortcuts to Subscribers, Plans, Exercise Library, etc.

---

### 4.2 Training Plans Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **View Plans** – List of all training plans created by the trainer, with name, price, duration, badge, and features list.
- **Create Plan** – Form to define: plan name, description, price, duration (in days/months/hours), badge label, feature list (free-text items), and active status.
- **Edit Plan** – Modify any field of an existing plan.
- **Delete Plan** – Remove a plan permanently.

---

### 4.3 Workout / Exercise Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Exercise Library** – Browse all workouts the trainer has created, organized by target muscle group with horizontal scrollable category chips.
- **Exercise Detail** – View workout details including title, description, video URL, image, target & assistant muscles.
- **Add Workout** – Comprehensive form to create a new exercise: title, description, video URL, image URL, target muscle selection, assistant muscle selection, and optional replacement workout IDs.

---

### 4.4 Subscriber Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Subscribers List** – View all trainees who have subscribed to the trainer's plans, showing trainee name, plan name, and subscription details.
- **Subscription Details** – View the full details of a specific subscription.

---

### 4.5 Daily Notes (Web Only)
| Platform | ❌ Mobile | ✅ Web |
|---|---|---|

- **Notes List** – For each subscriber, the trainer can view a list of daily notes.
- **Note Editor** – Rich text editor to create and manage notes for individual subscribers, linked via subscription ID. Notes have a title and body text.

> [!NOTE]
> Daily notes can also be added from the **mobile chat detail** screen, but the dedicated notes list/editor UI is web-only.

---

### 4.6 Chat / Messaging
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- Works identically to the trainee chat but from the trainer's perspective.
- **Contact List** – All subscribed trainees appear as chat contacts.
- **Chat Detail** – Real-time messaging with each trainee.
- **Workout Sharing** – Trainers can share workouts with trainees through the chat channel.

---

### 4.7 Profile Management
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Profile Screen** – Displays trainer's name, professional title, bio, experience years, specializations, certifications list, and profile photo.
- **Edit Profile** – Update specializations, certifications (add/edit/delete with name, organization, year, image), and bio text.
- **Profile Image Upload** – Upload a profile photo via Google Drive integration.
- **Account Screen** – View account details and navigation to sub-sections.
- **Information Screen** – Detailed read-only view of trainer information.
- **Payment Details, Contact Us, Terms & Privacy** – Same as trainee.

---

## 5. Admin Features

### 5.1 Admin Dashboard
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Category Grid** – The admin home screen displays product categories the admin can manage (e.g. Food, Supplements, Clothes).
- Tapping a category opens the **Category Management** screen.

---

### 5.2 Product Management (CRUD)
| Platform | ✅ Mobile | ✅ Web |
|---|---|---|

- **Category Items List** – View all products within the selected category.
- **Add Product** – Form to create a new product with: name, description, price, calories/nutrition info, image, type, and available sizes (for clothes).
- **Edit Product** – Modify any field of an existing product.
- **Delete Product** – Remove a product from the catalog.

> [!IMPORTANT]
> The Admin role manages the product catalog that Trainees browse and purchase from. Products must be added by the Admin before they appear in the store.

---

## 6. Training Plans / Packages

Training plans are **created by individual Trainers** and are specific to each trainer. They are **not** platform-wide packages.

### Plan Structure

| Field | Description |
|---|---|
| **Name** | Plan title (e.g., "Basic Plan", "Premium Plan") |
| **Description** | What the plan includes |
| **Price** | Cost in EGP |
| **Duration (Days)** | Duration in days |
| **Duration (Months)** | Optional, duration expressed in months |
| **Duration (Hours)** | Optional, weekly training hours |
| **Badge** | Optional label (e.g., "Most Popular", "Best Value") |
| **Features** | List of included benefits (free-text strings) |
| **Is Active** | Whether the plan is currently available for subscription |

### How Subscriptions Work

1. Trainee browses a **Trainer's profile** → views available **Training Plans**.
2. Trainee selects a plan → proceeds to **Checkout** (subscription payment).
3. A **Subscription** record is created linking the trainee to the trainer's plan.
4. The subscription enables: **chat access** between trainee and trainer, **workout sharing**, and **daily notes**.
5. The trainer can view all subscribers in their **Subscribers** screen with plan names and manage their subscriptions.

### Example Plans (trainer-defined)

Since plans are custom per trainer, here is an example of what a trainer might create:

| Plan | Price | Duration | Badge | Features |
|---|---|---|---|---|
| Basic Training | 500 EGP | 30 days | — | 1 workout/week, Chat support |
| Standard Training | 1000 EGP | 30 days | Most Popular | 3 workouts/week, Chat support, Daily notes |
| Premium Training | 2000 EGP | 30 days | Best Value | 5 workouts/week, Chat support, Daily notes, Nutrition plan |

---

## 7. Cross-Platform Comparison

| Feature | Mobile (Flutter) | Web (React) |
|---|---|---|
| Authentication & Registration | ✅ | ✅ |
| Trainee Home Dashboard | ✅ | ✅ |
| Product Store (Food/Supplements/Clothes) | ✅ | ✅ |
| Shopping Cart & Checkout | ✅ | ✅ |
| Orders History | ✅ | ✅ |
| Delivery Address Management | ✅ | ✅ |
| Coach Profile & Subscription | ✅ | ✅ |
| Exercise Library | ✅ | ✅ |
| Trainee Chat | ✅ | ✅ |
| Trainee Profile Management | ✅ | ✅ |
| Trainer Home Dashboard | ✅ | ✅ |
| Training Plans CRUD | ✅ | ✅ |
| Workout Management | ✅ | ✅ |
| Subscriber Management | ✅ | ✅ |
| Trainer Chat | ✅ | ✅ |
| Trainer Profile Management | ✅ | ✅ |
| Trainer Daily Notes (Dedicated UI) | ❌ | ✅ |
| Admin Product Management | ✅ | ✅ |
| Google Drive Image Upload | ✅ | ✅ |
| Bottom Navigation Bar | ✅ | ✅ (Sidebar on web) |

---

## 8. Technology Stack

| Layer | Technology |
|---|---|
| **Mobile App** | Flutter (Dart) with Provider state management, Dio HTTP client, Firebase integration |
| **Web Platform** | React (Vite) with Zustand state management, Axios HTTP client, React Router |
| **Backend API** | ASP.NET Core REST API (shared by both platforms) |
| **Image Storage** | Google Drive API |
| **Deployment (Web)** | Vercel |
