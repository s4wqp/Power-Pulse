import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Admin Dashboard',
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black),
            onPressed: () {
              Navigator.pushNamedAndRemoveUntil(
                context,
                Routing.loginScreen,
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          children: [
            _buildCategoryCard(
              context,
              'Food Category',
              Icons.restaurant_menu,
              Routing.adminCategoryScreen,
              'Food',
            ),
            SizedBox(height: 16.h),
            _buildCategoryCard(
              context,
              'Supplements Category',
              Icons.healing,
              Routing.adminCategoryScreen,
              'Supplements',
            ),
            SizedBox(height: 16.h),
            _buildCategoryCard(
              context,
              'Clothes Category',
              Icons.checkroom,
              Routing.adminCategoryScreen,
              'Clothes',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(
    BuildContext context,
    String title,
    IconData icon,
    String routeName,
    String categoryType,
  ) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, routeName, arguments: categoryType);
      },
      child: Container(
        height: 100.h,
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15.r),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: Custom().colors().lightGreen.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: Custom().colors().lightGreen,
                size: 30.sp,
              ),
            ),
            SizedBox(width: 20.w),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),
            const Spacer(),
            Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 20.sp),
          ],
        ),
      ),
    );
  }
}
