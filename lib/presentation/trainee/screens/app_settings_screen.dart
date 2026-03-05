import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';

class AppSettingsScreen extends StatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  State<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends State<AppSettingsScreen> {
  final String _selectedLanguage = 'English';
  bool _darkMode = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Settings',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          children: [
            _buildSettingItem(
              icon: Icons.language,
              title: 'Language',
              trailing: Text(
                _selectedLanguage,
                style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
              ),
              onTap: () {
                // Mock language selection
              },
            ),
            Divider(height: 32.h),
            _buildSettingItem(
              icon: Icons.dark_mode_outlined,
              title: 'Dark Mode',
              trailing: Switch(
                value: _darkMode,
                onChanged: (val) {
                  setState(() {
                    _darkMode = val;
                  });
                },
                activeThumbColor: Custom().colors().lightGreen,
              ),
              onTap: () {},
            ),
            Divider(height: 32.h),
            _buildSettingItem(
              icon: Icons.lock_outline,
              title: 'Change Password',
              trailing: Icon(
                Icons.arrow_forward_ios,
                size: 16.sp,
                color: Colors.grey,
              ),
              onTap: () {
                // Mock change password navigation
              },
            ),
            Divider(height: 32.h),
            _buildSettingItem(
              icon: Icons.delete_outline,
              title: 'Delete Account',
              titleColor: Colors.red,
              trailing: Icon(
                Icons.arrow_forward_ios,
                size: 16.sp,
                color: Colors.grey,
              ),
              onTap: () {
                // Mock delete account
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    Widget? trailing,
    required VoidCallback onTap,
    Color? titleColor,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 8.h),
        child: Row(
          children: [
            Icon(icon, size: 24.sp, color: titleColor ?? Colors.black),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w500,
                  color: titleColor ?? Colors.black,
                ),
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }
}
