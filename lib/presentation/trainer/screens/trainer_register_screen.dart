import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';
import 'package:power_pulse/presentation/widgets/elevated_button.dart';
import 'package:power_pulse/presentation/widgets/text_field.dart';
import 'package:power_pulse/routing.dart';

import 'package:flutter_screenutil/flutter_screenutil.dart';

class TrainerRegisterScreen extends StatefulWidget {
  const TrainerRegisterScreen({super.key});

  @override
  State<TrainerRegisterScreen> createState() => _TrainerRegisterScreenState();
}

class _TrainerRegisterScreenState extends State<TrainerRegisterScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.only(top: 20.h, left: 16.w),
              child: Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  icon: Icon(
                    Icons.arrow_back,
                    color: Colors.black,
                    size: 24.sp,
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            SizedBox(height: 20.h),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 30.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Custom().mainText('Sign up', fontSize: 30.sp),
                    SizedBox(height: 8.h),
                    Row(
                      children: [
                        Expanded(
                          child: Custom().subMainText(
                            'If you already have an account register',
                            fontSize: 16.sp,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Custom().subMainText('You can ', fontSize: 16.sp),
                        GestureDetector(
                          onTap: () {
                            Navigator.pop(context);
                          },
                          child: Text(
                            'Login here !',
                            style: TextStyle(
                              color: Custom().colors().lightGreen,
                              fontWeight: FontWeight.bold,
                              fontSize: 16.sp,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 32.h),
                    _buildLabel('Email'),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Enter your email address',
                      icon: Icons.email_outlined,
                      controller: _emailController,
                      obscureText: false,
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    _buildLabel('Name'),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Enter your Name',
                      icon: Icons.person_outline,
                      controller: _nameController,
                      obscureText: false,
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    _buildLabel('Password'),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Enter your Password',
                      icon: Icons.lock_outline,
                      controller: _passwordController,
                      obscureText: !_isPasswordVisible,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible
                              ? Icons.visibility
                              : Icons.visibility_off,
                          size: 24.sp,
                          color: Custom().colors().black,
                        ),
                        onPressed: () {
                          setState(() {
                            _isPasswordVisible = !_isPasswordVisible;
                          });
                        },
                      ),
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    _buildLabel('Confirm Password'),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Confirm your Password',
                      icon: Icons.lock_outline,
                      controller: _confirmPasswordController,
                      obscureText: !_isConfirmPasswordVisible,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isConfirmPasswordVisible
                              ? Icons.visibility
                              : Icons.visibility_off,
                          size: 24.sp,
                          color: Custom().colors().black,
                        ),
                        onPressed: () {
                          setState(() {
                            _isConfirmPasswordVisible =
                                !_isConfirmPasswordVisible;
                          });
                        },
                      ),
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    _buildLabel('Phone'),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Enter your phone number',
                      icon: Icons.phone_outlined,
                      controller: _phoneController,
                      obscureText: false,
                      fillColor: Colors.transparent,
                      keyboardType: TextInputType.phone,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(11),
                      ],
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 32.h),
                    SizedBox(
                      width: double.infinity,
                      child: CustomElevatedButton(
                        onPressed: () {
                          final email = _emailController.text.trim();
                          final name = _nameController.text.trim();
                          final password = _passwordController.text;
                          final confirmPassword =
                              _confirmPasswordController.text;
                          final phone = _phoneController.text.trim();

                          if (email.isEmpty ||
                              name.isEmpty ||
                              password.isEmpty ||
                              confirmPassword.isEmpty ||
                              phone.isEmpty) {
                            Custom().showErrorSnackBar(
                              context,
                              'Please fill in all fields',
                            );
                            return;
                          }

                          if (!email.contains('@') || !email.contains('.')) {
                            Custom().showErrorSnackBar(
                              context,
                              'Please enter a valid email address',
                            );
                            return;
                          }

                          if (phone.length != 11) {
                            Custom().showErrorSnackBar(
                              context,
                              'Phone number must be exactly 11 digits',
                            );
                            return;
                          }

                          if (password.length < 8) {
                            Custom().showErrorSnackBar(
                              context,
                              'Password must be at least 8 characters long',
                            );
                            return;
                          }

                          if (password != confirmPassword) {
                            Custom().showErrorSnackBar(
                              context,
                              'Passwords do not match',
                            );
                            return;
                          }

                          final data = TrainerRegistrationData(
                            email: email,
                            name: name,
                            password: password,
                            phone: phone,
                          );

                          Navigator.pushNamed(
                            context,
                            Routing.profileRegisterScreen,
                            arguments: data,
                          );
                        },
                        text: 'Next',
                        backgroundColor: Custom().colors().lightGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(color: Custom().colors().gray, fontSize: 12.sp),
    );
  }
}
