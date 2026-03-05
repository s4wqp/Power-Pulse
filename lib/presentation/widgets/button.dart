import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  const CustomButton({
    super.key,
    required this.onPressed,
    required this.text,
    required this.color,
    required this.fontWeight,
  });
  final VoidCallback onPressed;
  final String text;
  final Color color;
  final FontWeight fontWeight;
  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Text(
        text,
        style: TextStyle(color: color, fontWeight: fontWeight),
      ),
    );
  }
}
