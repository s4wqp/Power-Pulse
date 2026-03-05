import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/presentation/widgets/text_field.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';

import 'package:flutter_screenutil/flutter_screenutil.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isPasswordVisible = false;
  bool _rememberMe = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call login
    final success = await authProvider.login(email, password);

    if (!mounted) return;

    if (success) {
      final role = authProvider.role;
      if (role == 'Trainee') {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.traineeHomeScreen,
          (route) => false,
        );
      } else if (role == 'Trainer') {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.trainerHomeScreen,
          (route) => false,
        );
      } else if (role == 'Admin') {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.adminHomeScreen,
          (route) => false,
        );
      } else {
        // Fallback or handle unknown role
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.traineeHomeScreen,
          (route) => false,
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.errorMessage ?? 'Login failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 30.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                SizedBox(height: 20.h),
                Image.asset('assets/images/nav.png', height: 100.h),
                SizedBox(height: 20.h),
                // Title
                Custom().mainText('Sign in'),
                SizedBox(height: 16.h),
                // Subtitle
                RichText(
                  text: TextSpan(
                    text: "If you don't have an account register\nYou can   ",
                    style: TextStyle(
                      fontSize: 16.sp,
                      color: Colors.black87,
                      fontWeight: FontWeight.normal,
                      height: 1.5,
                    ),
                    children: [
                      TextSpan(
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            Navigator.pushNamed(
                              context,
                              Routing.beforRegisterScreen,
                            );
                          },
                        text: 'Register here !',
                        style: TextStyle(
                          color: Custom().colors().primaryButton,
                          fontWeight: FontWeight.bold,
                          fontSize: 16.sp,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 40.h),
                // Email Field
                Custom().subMainText('Email'),
                SizedBox(height: 8.h),
                CustomTextField(
                  hintText: 'Enter your email address',
                  icon: Icons.email_outlined,
                  controller: _emailController,
                  obscureText: false,
                  filled: false,
                ),
                SizedBox(height: 24.h),
                // Password Field
                Custom().subMainText('Password'),
                SizedBox(height: 8.h),
                TextField(
                  controller: _passwordController,
                  obscureText: !_isPasswordVisible,
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      Icons.lock_outline,
                      color: Custom().colors().black,
                      size: 24.sp,
                    ),
                    hintText: 'Enter your Password',
                    hintStyle: TextStyle(
                      color: Custom().colors().secondTextf,
                      fontSize: 14.sp,
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible
                            ? Icons.visibility
                            : Icons.visibility_off,
                        color: Custom().colors().black,
                        size: 24.sp,
                      ),
                      onPressed: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                    ),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Custom().colors().black),
                    ),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(
                        color: Custom().colors().primaryButton,
                      ),
                    ),
                  ),
                  style: TextStyle(fontSize: 16.sp),
                ),
                SizedBox(height: 16.h),
                // Remember Me & Forgot Password
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          SizedBox(
                            height: 24.w,
                            width: 24.w,
                            child: Checkbox(
                              value: _rememberMe,
                              activeColor: Custom().colors().primaryButton,
                              onChanged: (value) {
                                setState(() {
                                  _rememberMe = value ?? false;
                                });
                              },
                              side: const BorderSide(color: Colors.black54),
                            ),
                          ),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Text(
                              'Remember me',
                              style: TextStyle(
                                color: Colors.black54,
                                fontSize: 14.sp,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(
                          context,
                          Routing.forgetPasswordScreen,
                        );
                      },
                      child: Text(
                        'Forgot Password',
                        style: TextStyle(
                          color: Custom().colors().primaryButton,
                          fontWeight: FontWeight.bold,
                          fontSize: 14.sp,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 60.h),
                // Login Button
                SizedBox(
                  width: double.infinity,
                  height: 56.h,
                  child: Provider.of<AuthProvider>(context).isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : ElevatedButton(
                          onPressed: _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Custom().colors().primaryButton,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30.r),
                            ),
                            elevation: 5,
                            shadowColor: Custom()
                                .colors()
                                .primaryButton
                                .withOpacity(0.4),
                          ),
                          child: Text(
                            'Login',
                            style: TextStyle(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                ),
                SizedBox(height: 20.h),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
