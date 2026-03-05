# PowerPulse - React Web App

This is a complete conversion of the PowerPulse fitness Flutter application to a React Single Page Application (SPA).

## Technology Stack
- **React 18** (Vite)
- **Zustand** (State Management, replacing Provider)
- **Axios** (API Client, replacing Dio)
- **React Router v6** (Routing, replacing Navigator)
- **SignalR** (`@microsoft/signalr` for real-time chat)
- **Vanilla CSS Modules** (Styling, matching Flutter CustomColors)

---

## Setup & Installation

**Prerequisites:** Node.js v18+ 

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The app will typically be available at `http://localhost:5173`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Key Architectural Differences from Flutter

### Routing
The Flutter app used `Navigator.push` and a switch statement for named routes.
This React version utilizes **react-router-dom** with nested routes and a `ProtectedRoute` wrapper for Auth checking.

### State Management
Instead of `ChangeNotifierProvider`s, the application uses **Zustand** stores (`useAuthStore`, `useTrainerStore`, `useTraineeStore`, `useChatStore`) which provide a cleaner, hook-based immutable state management system.

### Networking
The `Dio` interceptors are replicated in `src/services/apiClient.js` using **Axios**. Tokens are automatically injected into `Authorization: Bearer` headers.

### Real-Time Chat
The SignalR core library is ported to the official npm package `@microsoft/signalr`. A fallback polling system is also implemented within `chatStore` in case the websocket handshake fails on older browsers.

### Images & Assets
Images are loaded using the built `CachedImage` component, which replaces `CachedNetworkImage` with a standard `<img>` tag and loading placeholder styling.

### Device Specifics
- **Geolocation/Maps**: Handled by web APIs or placeholder maps instead of `google_maps_flutter`.
- **Camera/File Uploads**: Mapped to standard `<input type="file">` flows.

---

## API Base URL
The base URL is hardcoded in `src/services/apiClient.js` to `http://powerpuls.runasp.net` to match the Flutter configuration.
