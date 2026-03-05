import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:power_pulse/custom.dart';

class CustomTextField extends StatelessWidget {
  const CustomTextField({
    super.key,
    required this.hintText,
    required this.icon,
    required this.controller,
    required this.obscureText,
    this.suffixIcon,
    this.onTap,
    this.hintStyle,
    this.enabledBorder,
    this.focusedBorder,
    this.filled,
    this.fillColor,
    this.keyboardType,
    this.inputFormatters,
  });
  final String hintText;
  final IconData icon;
  final TextEditingController controller;
  final bool obscureText;
  final Widget? suffixIcon;
  final Function()? onTap;
  final TextStyle? hintStyle;
  final InputBorder? enabledBorder;
  final InputBorder? focusedBorder;
  final bool? filled;
  final Color? fillColor;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      onTap: onTap,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: Custom().colors().black),
        hintText: hintText,
        hintStyle: hintStyle,
        enabledBorder: enabledBorder,
        focusedBorder: focusedBorder,
        filled: filled ?? true,
        fillColor: fillColor ?? Custom().colors().textField,
        suffixIcon: suffixIcon,
      ),
    );
  }
}
