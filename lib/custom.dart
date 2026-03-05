import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CustomColors {
  final Color black = const Color(0xFF000000);
  final Color gray = const Color(0xFF9B9B9B);
  final Color search = const Color(0xFF535353);
  final Color lightGreen = const Color(0xFF17A073);
  final Color textField = const Color(0xFF000842);
  final Color secondTextf = const Color(0xFFABABAB);
  final Color primaryButton = const Color(0xFF17A073);
  final Color widthAndHight = const Color(0xFFD6EBEB);
  final Color filterAndSearch = const Color(0xFF504F4F);
  final Color bottomNavigationBar = const Color(0xFF9CA3AF);
  final Color backgroundBottomNavigationBar = const Color(
    0xFAFAFAFA,
  ); // 94% opacity approx
  final Color ratingColor = const Color(0xFFEEE720);
  final Color caloriesColor = const Color(0xFF93D8A2);
  final Color gramsColor = const Color(0xFFD83F49);
  final Color clothesPrice = const Color(0xFF49A4FF);
  final Color clothesColor = const Color(0xFF3A4968);
  final Color backGroundMuscle = const Color(0xFFD9D9D9);
  final Color descreptionColor = const Color(0x66000000); // 40% opacity
  final Color secondryTextCHat = const Color(0xFF10B981);
  final Color addVideo = const Color(0xFFC4C4C4);
  final Color dicardColor = const Color(0xFFFF0000);
  final Color saveColor = const Color(0xFF30BE71);
  final Color borderColorNote = const Color(0xFFA4A4A4);
  final Color bgContainer = const Color(0xFFD9D9D9); // 63% opacity
  final Color lightBlack = const Color(0xFF333333);
}

class Custom {
  static final CustomColors _colors = CustomColors();
  CustomColors colors() => _colors;

  fonts() {}

  Widget mainText(String text, {double? fontSize, Color? color}) {
    return Text(
      text,
      style: TextStyle(
        fontSize: (fontSize ?? 25).sp,
        fontWeight: FontWeight.bold,
        color: color ?? colors().black,
      ),
    );
  }

  Widget subMainText(
    String text, {
    double? fontSize,
    Color color = Colors.black,
    FontWeight fontWeight = FontWeight.w100,
  }) {
    return Text(
      text,
      style: TextStyle(
        fontSize: (fontSize ?? 19.6).sp,
        fontWeight: FontWeight.w400,
        color: color,
      ),
    );
  }

  Widget buildLabel(
    String text, {
    Color color = Colors.black,
    double? fontSize,
    FontWeight fontWeight = FontWeight.w500,
  }) {
    return Text(
      text,
      style: TextStyle(
        color: color,
        fontSize: (fontSize ?? 12).sp,
        fontWeight: fontWeight,
      ),
    );
  }

  //profil trainer register screen
  Widget buildCheckbox(
    String label,
    bool value,
    Function(bool?) onChanged, {
    double? fontSize,
    FontWeight fontWeight = FontWeight.w500,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 24.w,
          height: 24.w,
          child: Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: colors().lightGreen,
          ),
        ),
        SizedBox(width: 8.w),
        Text(
          label,
          style: TextStyle(
            fontSize: (fontSize ?? 12).sp,
            fontWeight: fontWeight,
          ),
        ),
      ],
    );
  }

  // snackbars
  void showSnackBar(
    BuildContext context,
    String message, {
    Color? backgroundColor,
    IconData? icon,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: Colors.white, size: 20.sp),
              SizedBox(width: 12.w),
            ],
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor ?? colors().lightGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.r),
        ),
        margin: EdgeInsets.all(20.w),
        duration: duration,
      ),
    );
  }

  void showSuccessSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message,
      backgroundColor: colors().saveColor,
      icon: Icons.check_circle_outline,
    );
  }

  void showErrorSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message,
      backgroundColor: Colors.redAccent,
      icon: Icons.error_outline,
    );
  }

  void showInfoSnackBar(BuildContext context, String message) {
    showSnackBar(
      context,
      message,
      backgroundColor: colors().lightBlack,
      icon: Icons.info_outline,
    );
  }
}
