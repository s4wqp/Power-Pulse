import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';

// Common pages
import SplashPage from './pages/auth/SplashPage';
import LoginPage from './pages/auth/LoginPage';
import BeforeRegisterPage from './pages/auth/BeforeRegisterPage';
import TraineeRegisterPage from './pages/auth/TraineeRegisterPage';
import HeightWeightPage from './pages/auth/HeightWeightPage';
import TrainerRegisterPage from './pages/auth/TrainerRegisterPage';
import ProfileRegisterPage from './pages/auth/ProfileRegisterPage';
import BusinessRegisterPage from './pages/auth/BusinessRegisterPage';
import ForgetPasswordPage from './pages/auth/ForgetPasswordPage';
import VerifyResetCodePage from './pages/auth/VerifyResetCodePage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Trainee Pages
import TraineeHomePage from './pages/trainee/TraineeHomePage';
import GenericCategoryPage from './pages/trainee/GenericCategoryPage';
import GenericDetailsPage from './pages/trainee/GenericDetailsPage';
import ExerciseLibraryPage from './pages/trainee/ExerciseLibraryPage';
import ExerciseDetailPage from './pages/trainee/ExerciseDetailPage';
import ChatListPage from './pages/trainee/ChatListPage';
import ChatDetailPage from './pages/trainee/ChatDetailPage';
import ProfilePage from './pages/trainee/ProfilePage';
import PersonalDetailsPage from './pages/trainee/PersonalDetailsPage';
import ShoppingCartPage from './pages/trainee/ShoppingCartPage';
import CheckoutPage from './pages/trainee/CheckoutPage';
import DeliveryAddressesPage from './pages/trainee/DeliveryAddressesPage';
import NewAddressPage from './pages/trainee/NewAddressPage';
import SelectDeliveryLocationPage from './pages/trainee/SelectDeliveryLocationPage';
import PaymentDetailsPage from './pages/trainee/PaymentDetailsPage';
import OrdersPage from './pages/trainee/OrdersPage';
import TransactionSuccessPage from './pages/trainee/TransactionSuccessPage';
import CoachProfilePage from './pages/trainee/CoachProfilePage';
import AppSettingsPage from './pages/trainee/AppSettingsPage';
import NotificationSettingsPage from './pages/trainee/NotificationSettingsPage';
import ContactUsPage from './pages/trainee/ContactUsPage';
import TermsAndPrivacyPage from './pages/trainee/TermsAndPrivacyPage';

// Trainer Pages
import TrainerHomePage from './pages/trainer/TrainerHomePage';
import TrainerExerciseLibraryPage from './pages/trainer/TrainerExerciseLibraryPage';
import TrainerExerciseDetailPage from './pages/trainer/TrainerExerciseDetailPage';
import AddWorkoutPage from './pages/trainer/AddWorkoutPage';
import TrainerChatListPage from './pages/trainer/TrainerChatListPage';
import TrainerChatDetailPage from './pages/trainer/TrainerChatDetailPage';
import TrainerProfilePage from './pages/trainer/TrainerProfilePage';
import TrainerEditProfilePage from './pages/trainer/TrainerEditProfilePage';
import TrainerAccountPage from './pages/trainer/TrainerAccountPage';
import TrainerInformationPage from './pages/trainer/TrainerInformationPage';
import TrainerPlansPage from './pages/trainer/TrainerPlansPage';
import TrainerAddPlanPage from './pages/trainer/TrainerAddPlanPage';
import TrainerSubscribersPage from './pages/trainer/TrainerSubscribersPage';
import TrainerNotesPage from './pages/trainer/TrainerNotesPage';
import TrainerNoteEditorPage from './pages/trainer/TrainerNoteEditorPage';

// Admin Pages
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminAddItemPage from './pages/admin/AdminAddItemPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but wrong role, redirect to appropriate home
    switch (user?.role) {
      case 'Trainee': return <Navigate to="/trainee/home" replace />;
      case 'Trainer': return <Navigate to="/trainer/home" replace />;
      case 'Admin': return <Navigate to="/admin/home" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const App = () => {
  const { tryAutoLogin } = useAuthStore();

  useEffect(() => {
    tryAutoLogin();
  }, [tryAutoLogin]);

  return (
    <Router>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Auth / Public */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<BeforeRegisterPage />} />
        <Route path="/register/trainee" element={<TraineeRegisterPage />} />
        <Route path="/register/trainee/height-weight" element={<HeightWeightPage />} />
        <Route path="/register/trainer" element={<TrainerRegisterPage />} />
        <Route path="/register/trainer/profile" element={<ProfileRegisterPage />} />
        <Route path="/register/trainer/business" element={<BusinessRegisterPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/verify-code" element={<VerifyResetCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Trainee Routes */}
        <Route path="/trainee/home" element={<ProtectedRoute allowedRoles={['Trainee']}><TraineeHomePage /></ProtectedRoute>} />
        <Route path="/trainee/food" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericCategoryPage /></ProtectedRoute>} />
        <Route path="/trainee/supplements" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericCategoryPage /></ProtectedRoute>} />
        <Route path="/trainee/clothes" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericCategoryPage /></ProtectedRoute>} />
        <Route path="/trainee/category" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericCategoryPage /></ProtectedRoute>} />
        <Route path="/trainee/category/details" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericDetailsPage /></ProtectedRoute>} />
        <Route path="/trainee/product/:id" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericDetailsPage /></ProtectedRoute>} />
        <Route path="/trainee/clothing" element={<ProtectedRoute allowedRoles={['Trainee']}><GenericCategoryPage /></ProtectedRoute>} />
        <Route path="/trainee/exercises" element={<ProtectedRoute allowedRoles={['Trainee']}><ExerciseLibraryPage /></ProtectedRoute>} />
        <Route path="/trainee/exercises/details" element={<ProtectedRoute allowedRoles={['Trainee']}><ExerciseDetailPage /></ProtectedRoute>} />
        <Route path="/trainee/chat" element={<ProtectedRoute allowedRoles={['Trainee']}><ChatListPage /></ProtectedRoute>} />
        <Route path="/trainee/chat/:id" element={<ProtectedRoute allowedRoles={['Trainee']}><ChatDetailPage /></ProtectedRoute>} />
        <Route path="/trainee/profile" element={<ProtectedRoute allowedRoles={['Trainee']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/trainee/personal-details" element={<ProtectedRoute allowedRoles={['Trainee']}><PersonalDetailsPage /></ProtectedRoute>} />
        <Route path="/trainee/cart" element={<ProtectedRoute allowedRoles={['Trainee']}><ShoppingCartPage /></ProtectedRoute>} />
        <Route path="/trainee/checkout" element={<ProtectedRoute allowedRoles={['Trainee']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/trainee/addresses" element={<ProtectedRoute allowedRoles={['Trainee']}><DeliveryAddressesPage /></ProtectedRoute>} />
        <Route path="/trainee/addresses/new" element={<ProtectedRoute allowedRoles={['Trainee']}><NewAddressPage /></ProtectedRoute>} />
        <Route path="/trainee/addresses/select" element={<ProtectedRoute allowedRoles={['Trainee']}><SelectDeliveryLocationPage /></ProtectedRoute>} />
        <Route path="/trainee/payment-details" element={<ProtectedRoute allowedRoles={['Trainee']}><PaymentDetailsPage /></ProtectedRoute>} />
        <Route path="/trainee/orders" element={<ProtectedRoute allowedRoles={['Trainee']}><OrdersPage /></ProtectedRoute>} />
        <Route path="/trainee/success" element={<ProtectedRoute allowedRoles={['Trainee']}><TransactionSuccessPage /></ProtectedRoute>} />
        <Route path="/trainee/coach/:id" element={<ProtectedRoute allowedRoles={['Trainee']}><CoachProfilePage /></ProtectedRoute>} />
        <Route path="/trainee/settings" element={<ProtectedRoute allowedRoles={['Trainee']}><AppSettingsPage /></ProtectedRoute>} />
        <Route path="/trainee/notification-settings" element={<ProtectedRoute allowedRoles={['Trainee']}><NotificationSettingsPage /></ProtectedRoute>} />
        <Route path="/trainee/contact-us" element={<ProtectedRoute allowedRoles={['Trainee']}><ContactUsPage /></ProtectedRoute>} />
        <Route path="/trainee/terms" element={<ProtectedRoute allowedRoles={['Trainee']}><TermsAndPrivacyPage /></ProtectedRoute>} />

        {/* Trainer Routes */}
        <Route path="/trainer/home" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerHomePage /></ProtectedRoute>} />
        <Route path="/trainer/exercises" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerExerciseLibraryPage /></ProtectedRoute>} />
        <Route path="/trainer/exercises/details" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerExerciseDetailPage /></ProtectedRoute>} />
        <Route path="/trainer/add-workout" element={<ProtectedRoute allowedRoles={['Trainer']}><AddWorkoutPage /></ProtectedRoute>} />
        <Route path="/trainer/chat" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerChatListPage /></ProtectedRoute>} />
        <Route path="/trainer/chat/:id" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerChatDetailPage /></ProtectedRoute>} />
        <Route path="/trainer/chat/:traineeId/notes" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerNotesPage /></ProtectedRoute>} />
        <Route path="/trainer/chat/:traineeId/notes/:noteId" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerNoteEditorPage /></ProtectedRoute>} />
        <Route path="/trainer/profile" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerProfilePage /></ProtectedRoute>} />
        <Route path="/trainer/edit-profile" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerEditProfilePage /></ProtectedRoute>} />
        <Route path="/trainer/account" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerAccountPage /></ProtectedRoute>} />
        <Route path="/trainer/information" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerInformationPage /></ProtectedRoute>} />
        <Route path="/trainer/plans" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerPlansPage /></ProtectedRoute>} />
        <Route path="/trainer/add-plan" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerAddPlanPage /></ProtectedRoute>} />
        <Route path="/trainer/subscribers" element={<ProtectedRoute allowedRoles={['Trainer']}><TrainerSubscribersPage /></ProtectedRoute>} />
        <Route path="/trainer/payment-details" element={<ProtectedRoute allowedRoles={['Trainer']}><PaymentDetailsPage /></ProtectedRoute>} />
        <Route path="/trainer/contact-us" element={<ProtectedRoute allowedRoles={['Trainer']}><ContactUsPage /></ProtectedRoute>} />
        <Route path="/trainer/terms" element={<ProtectedRoute allowedRoles={['Trainer']}><TermsAndPrivacyPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/home" element={<ProtectedRoute allowedRoles={['Admin']}><AdminHomePage /></ProtectedRoute>} />
        <Route path="/admin/category/:categoryId" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCategoryPage /></ProtectedRoute>} />
        <Route path="/admin/category/:categoryId/add" element={<ProtectedRoute allowedRoles={['Admin']}><AdminAddItemPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
