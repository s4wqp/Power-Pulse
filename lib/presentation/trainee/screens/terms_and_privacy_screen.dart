import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';

class TermsAndPrivacyScreen extends StatelessWidget {
  const TermsAndPrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Terms & Privacy',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 10.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              '1. Terms of Service',
              'By accessing and using Power Pulse, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our services.',
            ),
            _buildSection(
              '2. User Accounts',
              'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when registering.',
            ),
            _buildSection(
              '3. Health Disclaimer',
              'Power Pulse provides fitness and nutritional information for educational purposes only. You should consult a physician before beginning any new exercise or nutrition program. Use of our services is at your own risk.',
            ),
            _buildSection(
              '4. Privacy Policy',
              'We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and share information about you when you use our app.',
            ),
            _buildSection(
              '5. Data Collection',
              'We collect information you provide directly to us, such as your name, email, height, weight, and fitness goals. We also collect data about your usage of the app to improve your experience.',
            ),
            _buildSection(
              '6. Data Usage',
              'We use your data to personalize your workout plans, track your progress, and communicate with you. We do not sell your personal data to third parties.',
            ),
            _buildSection(
              '7. Subscriptions & Payments',
              'Subscription fees are billed in advance. You may cancel your subscription at any time, but no refunds will be provided for partial months.',
            ),
            _buildSection(
              '8. Changes to Terms',
              'We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.',
            ),
            SizedBox(height: 30.h),
            Center(
              child: Text(
                'Last Updated: October 2023',
                style: TextStyle(fontSize: 12.sp, color: Colors.grey[500]),
              ),
            ),
            SizedBox(height: 20.h),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: EdgeInsets.only(bottom: 24.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.bold,
              color: Custom().colors().lightGreen,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            content,
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
