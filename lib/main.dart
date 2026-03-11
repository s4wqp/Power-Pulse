import 'package:flutter/material.dart';
import 'package:power_pulse/routing.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:power_pulse/firebase_options.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/presentation/widgets/offline_banner.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(375, 812), // Standard mobile design size
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => AuthProvider()..tryAutoLogin(),
            ),
            ChangeNotifierProvider(create: (_) => TrainerProvider()),
            ChangeNotifierProvider(create: (_) => TraineeProvider()),
            ChangeNotifierProvider(create: (_) => ChatProvider()),
          ],
          child: MaterialApp(
            debugShowCheckedModeBanner: false,
            initialRoute: Routing.splashScreen,
            onGenerateRoute: Routing.generateRoute,
            builder: (context, child) {
              return OfflineBanner(child: child ?? const SizedBox.shrink());
            },
          ),
        );
      },
    );
  }
}
