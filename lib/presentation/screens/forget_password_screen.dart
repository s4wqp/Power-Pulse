import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:dio/dio.dart';

class ForgetPasswordScreen extends StatefulWidget {
  const ForgetPasswordScreen({super.key});

  @override
  State<ForgetPasswordScreen> createState() => _ForgetPasswordScreenState();
}

class _ForgetPasswordScreenState extends State<ForgetPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  bool _isLoading = false;

  Future<void> _sendResetCode() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter your email')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiClient().dio.post(
        '/api/auth/forgot-password',
        data: {'email': email},
      );

      if (!mounted) return;
      if (response.statusCode == 200) {
        String msg = 'Verification code sent to your email.';
        if (response.data is Map && response.data['message'] != null) {
          msg = response.data['message'];
        }
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(msg)));

        Navigator.pushNamed(
          context,
          Routing.verifyResetCodeScreen,
          arguments: email,
        );
      }
    } on DioException catch (e) {
      if (!mounted) return;
      String errorMsg = 'Failed to request password reset.';
      if (e.response != null && e.response!.data != null) {
        if (e.response!.data is Map && e.response!.data['message'] != null) {
          errorMsg = e.response!.data['message'];
        } else if (e.response!.data is String) {
          errorMsg = e.response!.data;
        }
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(errorMsg)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to request password reset.')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Custom().colors().black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Forgot Password',
          style: TextStyle(color: Custom().colors().black),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your email address to reset your password.',
              style: TextStyle(color: Custom().colors().black, fontSize: 16),
            ),
            const SizedBox(height: 20),
            Custom().subMainText('Email'),
            const SizedBox(height: 8),
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                prefixIcon: Icon(
                  Icons.email_outlined,
                  color: Custom().colors().black,
                ),
                hintText: 'Enter your email address',
                hintStyle: TextStyle(color: Custom().colors().secondTextf),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Custom().colors().black),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                    color: Custom().colors().primaryButton,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _sendResetCode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Custom().colors().primaryButton,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 5,
                        shadowColor: Custom()
                            .colors()
                            .primaryButton
                            .withOpacity(0.4),
                      ),
                      child: const Text(
                        'Send Reset Code',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
