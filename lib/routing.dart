import 'package:flutter/material.dart';
import 'package:power_pulse/presentation/screens/befor_register.dart';
import 'package:power_pulse/presentation/screens/forget_password_screen.dart';
import 'package:power_pulse/presentation/screens/verify_reset_code_screen.dart';
import 'package:power_pulse/presentation/screens/reset_password_screen.dart';
import 'package:power_pulse/presentation/screens/login_screen.dart';
import 'package:power_pulse/presentation/screens/splash_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/trainee_register_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/business_register_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/profile_register_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_home_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_register_screen.dart';

import 'package:power_pulse/presentation/widgets/height_weight.dart';
import 'package:power_pulse/presentation/trainee/screens/trainee_home_screen.dart';
import 'package:power_pulse/models/trainee_registration_data.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_exercise_library_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/add_workout_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_chat_list_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_chat_detail_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/transaction_success_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/terms_and_privacy_screen.dart';
import 'package:power_pulse/data/models/trainee_models.dart';

import 'package:power_pulse/presentation/trainee/screens/generic_category_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/generic_details_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/clothing_category_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/exercise_library_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/exercise_detail_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/chat_list_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/chat_detail_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/profile_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/personal_details_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/delivery_addresses_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/shopping_cart_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/select_delivery_location_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/new_address_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/checkout_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/coach_profile_screen.dart';

import 'package:power_pulse/presentation/trainer/screens/trainer_profile_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_subscribers_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_account_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_information_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_plans_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_add_plan_screen.dart';
import 'package:power_pulse/presentation/trainer/screens/trainer_edit_profile_screen.dart';

import 'package:power_pulse/presentation/admin/screens/admin_home_screen.dart';
import 'package:power_pulse/presentation/admin/screens/admin_category_screen.dart';
import 'package:power_pulse/presentation/admin/screens/admin_add_item_screen.dart';

import 'package:power_pulse/presentation/trainee/screens/payment_details_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/notification_settings_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/app_settings_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/contact_us_screen.dart';
import 'package:power_pulse/presentation/trainee/screens/orders_screen.dart';

class Routing {
  static const String splashScreen = 'splash';
  static const String loginScreen = 'loginScreen';
  static const String forgetPasswordScreen = 'forgetPassword';
  static const String verifyResetCodeScreen = 'verifyResetCode';
  static const String resetPasswordScreen = 'resetPassword';
  static const String traineeRegisterScreen = 'traineeRegister';
  static const String beforRegisterScreen = 'beforRegister';
  static const String trainerRegisterScreen = 'trainerRegister';
  static const String profileRegisterScreen = 'profileRegister';
  static const String businessRegisterScreen = 'businessRegister';
  static const String heightAndWeightScreen = 'heightAndWeight';

  static const String traineeHomeScreen = 'traineeHome';
  static const String trainerHomeScreen = 'trainerHome';
  static const String trainerExerciseLibraryScreen =
      'trainerExerciseLibraryScreen';
  static const String trainerProfileScreen = 'trainerProfileScreen';
  static const String trainerSubscribersScreen = 'trainerSubscribersScreen';
  static const String trainerAccountScreen = 'trainerAccountScreen';
  static const String trainerInformationScreen = 'trainerInformationScreen';
  static const String addWorkoutScreen = 'addWorkoutScreen';
  static const String foodDetailsScreen = 'foodDetailsScreen';
  static const String paymentDetailsScreen = 'paymentDetailsScreen';
  static const String notificationSettingsScreen = 'notificationSettingsScreen';
  static const String appSettingsScreen = 'appSettingsScreen';
  static const String trainerManagePlansScreen = 'trainerManagePlansScreen';
  static const String trainerAddPlanScreen = 'trainerAddPlanScreen';
  static const String trainerEditProfileScreen = 'trainerEditProfileScreen';

  // Admin Screens
  static const String adminHomeScreen = 'adminHomeScreen';
  static const String adminCategoryScreen = 'adminCategoryScreen';
  static const String adminAddItemScreen = 'adminAddItemScreen';

  // Generic Screens
  static const String genericCategoryScreen = 'genericCategoryScreen';
  static const String genericDetailsScreen = 'genericDetailsScreen';
  static const String clothingCategoryScreen = 'clothingCategoryScreen';

  // Exercise Screens
  static const String exerciseLibraryScreen = 'exerciseLibraryScreen';
  static const String exerciseDetailScreen = 'exerciseDetailScreen';

  // Chat Screens
  static const String chatListScreen = 'chatListScreen';
  static const String chatDetailScreen = 'chatDetailScreen';
  static const String trainerChatListScreen = 'trainerChatListScreen';
  static const String trainerChatDetailScreen = 'trainerChatDetailScreen';
  static const String profileScreen = 'profileScreen';
  static const String personalDetailsScreen = 'personalDetailsScreen';
  static const String deliveryAddressesScreen = 'deliveryAddressesScreen';
  static const String shoppingCartScreen = 'shoppingCartScreen';
  static const String selectDeliveryLocationScreen =
      'selectDeliveryLocationScreen';
  static const String newAddressScreen = 'newAddressScreen';
  static const String checkoutScreen = 'checkoutScreen';
  static const String coachProfileScreen = 'coachProfileScreen';
  static const String transactionSuccessScreen = 'transactionSuccessScreen';
  static const String termsAndPrivacyScreen = 'termsAndPrivacyScreen';
  static const String contactUsScreen = 'contactUsScreen';
  static const String ordersScreen = 'ordersScreen';

  static void navigateTo(
    BuildContext context,
    String routeName, {
    Object? arguments,
  }) {
    Navigator.pushNamed(context, routeName, arguments: arguments);
  }

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splashScreen:
        return MaterialPageRoute(builder: (_) => SplashScreen());
      case loginScreen:
        return MaterialPageRoute(builder: (_) => LoginScreen());
      case forgetPasswordScreen:
        return MaterialPageRoute(builder: (_) => ForgetPasswordScreen());
      case verifyResetCodeScreen:
        final email = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => VerifyResetCodeScreen(email: email),
        );
      case resetPasswordScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) =>
              ResetPasswordScreen(email: args['email'], code: args['code']),
        );
      case traineeRegisterScreen:
        return MaterialPageRoute(builder: (_) => TraineeRegisterScreen());
      case beforRegisterScreen:
        return MaterialPageRoute(builder: (_) => BeforRegister());
      case trainerRegisterScreen:
        return MaterialPageRoute(builder: (_) => TrainerRegisterScreen());
      case profileRegisterScreen:
        final args = settings.arguments as TrainerRegistrationData;
        return MaterialPageRoute(
          builder: (_) => ProfileRegisterScreen(data: args),
        );
      case businessRegisterScreen:
        final args = settings.arguments as TrainerRegistrationData;
        return MaterialPageRoute(
          builder: (_) => BusinessRegisterScreen(data: args),
        );
      case heightAndWeightScreen:
        final args = settings.arguments as TraineeRegistrationData;
        return MaterialPageRoute(
          builder: (_) => WeightSelectionScreen(data: args),
        );

      case traineeHomeScreen:
        return MaterialPageRoute(builder: (_) => TraineeHomeScreen());
      case trainerHomeScreen:
        return MaterialPageRoute(builder: (_) => TrainerHomeScreen());

      case trainerExerciseLibraryScreen:
        return MaterialPageRoute(
          builder: (_) => TrainerExerciseLibraryScreen(),
        );

      case addWorkoutScreen:
        return MaterialPageRoute(builder: (_) => AddWorkoutScreen());

      case genericCategoryScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => GenericCategoryScreen(
            pageTitle: args['pageTitle'],
            appBarImage: args['appBarImage'],
            categories: args['categories'],
            items: args['items'],
            storeType: args['storeType'],
          ),
        );
      case genericDetailsScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => GenericDetailsScreen(item: args),
        );

      case clothingCategoryScreen:
        return MaterialPageRoute(
          builder: (_) => const ClothingCategoryScreen(),
        );

      case exerciseLibraryScreen:
        return MaterialPageRoute(builder: (_) => const ExerciseLibraryScreen());

      case exerciseDetailScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => ExerciseDetailScreen(exercise: args),
        );

      case chatListScreen:
        return MaterialPageRoute(builder: (_) => const ChatListScreen());

      case chatDetailScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => ChatDetailScreen(chatUser: args),
        );

      case trainerChatListScreen:
        return MaterialPageRoute(builder: (_) => const TrainerChatListScreen());

      case trainerChatDetailScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => TrainerChatDetailScreen(chatUser: args),
        );

      case profileScreen:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      case personalDetailsScreen:
        return MaterialPageRoute(builder: (_) => const PersonalDetailsScreen());

      case deliveryAddressesScreen:
        return MaterialPageRoute(
          builder: (_) => const DeliveryAddressesScreen(),
        );

      case shoppingCartScreen:
        return MaterialPageRoute(builder: (_) => const ShoppingCartScreen());

      case selectDeliveryLocationScreen:
        return MaterialPageRoute(
          builder: (_) => const SelectDeliveryLocationScreen(),
        );

      case newAddressScreen:
        final args = settings.arguments;
        Address? address;
        if (args is Address) {
          address = args;
        }
        return MaterialPageRoute(
          builder: (_) => NewAddressScreen(address: address),
          settings:
              settings, // Pass settings so internal arg lookup works for Maps
        );

      case checkoutScreen:
        final args = settings.arguments as Map<String, dynamic>?;
        final isSubscription = args?['isSubscription'] ?? false;
        final subscriptionPrice = args?['subscriptionPrice'] as int?;
        final planId = args?['planId'] as int?;

        return MaterialPageRoute(
          builder: (_) => CheckoutScreen(
            addressData: args,
            isSubscription: isSubscription,
            subscriptionPrice: subscriptionPrice,
            planId: planId,
          ),
        );
      case coachProfileScreen:
        final args = settings.arguments as Trainer;
        return MaterialPageRoute(
          builder: (_) => CoachProfileScreen(trainer: args),
        );

      case transactionSuccessScreen:
        return MaterialPageRoute(
          builder: (_) => const TransactionSuccessScreen(),
        );

      case ordersScreen:
        return MaterialPageRoute(builder: (_) => const OrdersScreen());

      case termsAndPrivacyScreen:
        return MaterialPageRoute(builder: (_) => const TermsAndPrivacyScreen());

      case trainerProfileScreen:
        return MaterialPageRoute(builder: (_) => const TrainerProfileScreen());

      case trainerSubscribersScreen:
        return MaterialPageRoute(
          builder: (_) => const TrainerSubscribersScreen(),
        );

      case trainerAccountScreen:
        return MaterialPageRoute(builder: (_) => const TrainerAccountScreen());

      case trainerInformationScreen:
        return MaterialPageRoute(
          builder: (_) => const TrainerInformationScreen(),
        );

      case paymentDetailsScreen:
        return MaterialPageRoute(builder: (_) => const PaymentDetailsScreen());

      case notificationSettingsScreen:
        return MaterialPageRoute(
          builder: (_) => const NotificationSettingsScreen(),
        );

      case appSettingsScreen:
        return MaterialPageRoute(builder: (_) => const AppSettingsScreen());

      case trainerManagePlansScreen:
        return MaterialPageRoute(builder: (_) => const TrainerPlansScreen());

      case trainerAddPlanScreen:
        final plan = settings.arguments as TrainingPlan?;
        return MaterialPageRoute(
          builder: (_) => TrainerAddPlanScreen(plan: plan),
        );

      case trainerEditProfileScreen:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => TrainerEditProfileScreen(
            specializations: args['specializations'],
            certifications: args['certifications'],
            about: args['about'],
          ),
        );

      case contactUsScreen:
        return MaterialPageRoute(builder: (_) => const ContactUsScreen());

      // Admin Routes
      case adminHomeScreen:
        return MaterialPageRoute(builder: (_) => const AdminHomeScreen());

      case adminCategoryScreen:
        final categoryType = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => AdminCategoryScreen(categoryType: categoryType),
        );

      case adminAddItemScreen:
        final categoryType = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => AdminAddItemScreen(categoryType: categoryType),
        );

      default:
        return MaterialPageRoute(builder: (_) => Text('Error: Unknown route'));
    }
  }
}
