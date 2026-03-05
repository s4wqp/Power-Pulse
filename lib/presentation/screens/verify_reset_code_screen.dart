import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:dio/dio.dart';

class VerifyResetCodeScreen extends StatefulWidget {
  final String email;

  const VerifyResetCodeScreen({super.key, required this.email});

  @override
  State<VerifyResetCodeScreen> createState() => _VerifyResetCodeScreenState();
}

class _VerifyResetCodeScreenState extends State<VerifyResetCodeScreen> {
  final TextEditingController _codeController = TextEditingController();
  bool _isLoading = false;

  Future<void> _verifyCode() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the 6-digit code')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiClient().dio.post(
        '/api/auth/verify-reset-code',
        data: {'email': widget.email, 'code': code},
      );

      if (!mounted) return;
      if (response.statusCode == 200) {
        String msg = 'Code verified successfully.';
        if (response.data is Map && response.data['message'] != null) {
          msg = response.data['message'];
        }
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(msg)));

        Navigator.pushNamed(
          context,
          Routing.resetPasswordScreen,
          arguments: {'email': widget.email, 'code': code},
        );
      }
    } on DioException catch (e) {
      if (!mounted) return;
      String errorMsg = 'Invalid or expired code.';
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Invalid or expired code.')));
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
          'Verify Code',
          style: TextStyle(color: Custom().colors().black),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter the 6-digit code sent to ${widget.email}',
              style: TextStyle(color: Custom().colors().black, fontSize: 16),
            ),
            const SizedBox(height: 20),
            Custom().subMainText('Verification Code'),
            const SizedBox(height: 8),
            TextField(
              controller: _codeController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              decoration: InputDecoration(
                prefixIcon: Icon(Icons.numbers, color: Custom().colors().black),
                hintText: '123456',
                counterText: "",
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
                      onPressed: _verifyCode,
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
                        'Verify Code',
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
