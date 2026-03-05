import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';

class RichTextFun extends StatelessWidget {
  const RichTextFun({super.key});

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        text: "If you don't have an account register\nYou can   ",
        style: TextStyle(
          fontSize: 16,
          color: Colors.black87,
          fontWeight: FontWeight.normal,
          height: 1.5,
        ),
        children: [
          TextSpan(
            text: 'Register here !',
            style: TextStyle(
              color: Custom().colors().primaryButton,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
