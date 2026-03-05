import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainee_registration_data.dart';
import 'package:power_pulse/presentation/widgets/height_weight.dart';
import 'package:power_pulse/presentation/widgets/text_field.dart';
import 'package:power_pulse/routing.dart';

class TraineeRegisterScreen extends StatefulWidget {
  const TraineeRegisterScreen({super.key});

  @override
  State<TraineeRegisterScreen> createState() => _TraineeRegisterScreenState();
}

class _TraineeRegisterScreenState extends State<TraineeRegisterScreen> {
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameController.dispose();
    _phoneNumberController.dispose();
    super.dispose();
  }

  void _onNextPressed() {
    final email = _emailController.text.trim();
    final username = _nameController.text.trim();
    final phoneNumber = _phoneNumberController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (email.isEmpty ||
        username.isEmpty ||
        phoneNumber.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      Custom().showErrorSnackBar(context, 'Please fill in all fields');
      return;
    }

    if (!email.contains('@') || !email.contains('.')) {
      Custom().showErrorSnackBar(context, 'Please enter a valid email address');
      return;
    }

    if (phoneNumber.length != 11) {
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
      Custom().showErrorSnackBar(context, 'Passwords do not match');
      return;
    }

    final registrationData = TraineeRegistrationData(
      email: email,
      name: username,
      phoneNumber: phoneNumber,
      password: password,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WeightSelectionScreen(data: registrationData),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                Image.asset('assets/images/nav.png', height: 100),
                const SizedBox(height: 20),
                // Title
                Custom().mainText('Sign up'),
                const SizedBox(height: 16),
                // Subtitle
                RichText(
                  text: TextSpan(
                    text: "If you already have an account login\nYou can   ",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.black87,
                      fontWeight: FontWeight.normal,
                      height: 1.5,
                    ),
                    children: [
                      TextSpan(
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            Navigator.pushNamed(context, Routing.loginScreen);
                          },
                        text: 'Login here !',
                        style: TextStyle(
                          color: Custom().colors().primaryButton,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                // Email Field
                Custom().subMainText('Email'),
                const SizedBox(height: 8),
                CustomTextField(
                  hintText: 'Enter your email address',
                  icon: Icons.email_outlined,
                  controller: _emailController,
                  obscureText: false,
                  filled: false,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Custom().colors().black),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: Custom().colors().primaryButton,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Username Field
                Custom().subMainText('Username'),
                const SizedBox(height: 8),
                CustomTextField(
                  hintText: 'Enter your User name',
                  icon: Icons.person_outline,
                  controller: _nameController,
                  obscureText: false,
                  filled: false,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Custom().colors().black),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: Custom().colors().primaryButton,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Phone Number Field
                Custom().subMainText('Phone Number'),
                const SizedBox(height: 8),
                CustomTextField(
                  hintText: 'Enter your phone number',
                  icon: Icons.phone_outlined,
                  controller: _phoneNumberController,
                  obscureText: false,
                  filled: false,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(11),
                  ],
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Custom().colors().black),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: Custom().colors().primaryButton,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Password Field
                Custom().subMainText('Password'),
                const SizedBox(height: 8),
                CustomTextField(
                  controller: _passwordController,
                  obscureText: !_isPasswordVisible,
                  icon: Icons.lock_outline,
                  hintText: 'Enter your Password',
                  hintStyle: TextStyle(color: Custom().colors().secondTextf),
                  filled: false,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: Custom().colors().secondTextf,
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
                const SizedBox(height: 24),
                // Confirm Password Field
                Custom().subMainText('Confirm Password'),
                const SizedBox(height: 8),
                CustomTextField(
                  controller: _confirmPasswordController,
                  obscureText: !_isConfirmPasswordVisible,
                  icon: Icons.lock_outline,
                  hintText: 'Confirm your Password',
                  hintStyle: TextStyle(color: Custom().colors().secondTextf),
                  filled: false,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isConfirmPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: Custom().colors().secondTextf,
                    ),
                    onPressed: () {
                      setState(() {
                        _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
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
                const SizedBox(height: 60),
                // Next Button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _onNextPressed,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Custom().colors().primaryButton,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 5,
                      shadowColor: Custom().colors().primaryButton.withOpacity(
                        0.4,
                      ),
                    ),
                    child: Text(
                      'Next',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
