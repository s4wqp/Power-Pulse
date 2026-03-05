import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/presentation/trainee/screens/coach_packages_screen.dart';
import 'package:power_pulse/routing.dart';

import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';

class CoachProfileScreen extends StatelessWidget {
  final Trainer trainer;

  const CoachProfileScreen({super.key, required this.trainer});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                // Header Background
                Container(
                  height: 180.h,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage('assets/images/bg_appbar.png'),
                      fit: BoxFit.cover,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(30.r),
                      bottomRight: Radius.circular(30.r),
                    ),
                  ),
                ),
                // AppBar Content (Back Button & Title)
                Positioned(
                  top: 40.h,
                  left: 10.w,
                  right: 10.w,
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          Icons.arrow_back,
                          color: Colors.white,
                          size: 28.sp,
                        ),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Expanded(
                        child: Text(
                          'Trainer Profile',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      SizedBox(width: 48.w), // Balance for back button
                    ],
                  ),
                ),
                // Trainer Profile Card (Overlapping)
                Positioned(
                  top: 130.h,
                  child: Container(
                    width: 340.w,
                    padding: EdgeInsets.all(20.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Custom().colors().lightGreen,
                              width: 3.w,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 45.r,
                            backgroundImage: trainer.profileImageUrl != null
                                ? NetworkImage(trainer.profileImageUrl!)
                                : AssetImage('assets/images/trainer.jpeg')
                                      as ImageProvider,
                            backgroundColor: Colors.grey[200],
                          ),
                        ),
                        SizedBox(height: 12.h),
                        Text(
                          trainer.name,
                          style: TextStyle(
                            fontSize: 22.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          trainer.professionalTitle,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Custom().colors().lightGreen,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 10.h),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 12.w,
                            vertical: 6.h,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(20.r),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 18.sp,
                              ),
                              SizedBox(width: 6.w),
                              Text(
                                '${trainer.experienceYears} Years Exp.',
                                style: TextStyle(
                                  fontSize: 13.sp,
                                  color: Colors.black87,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 220.h), // Spacing for the overlapping card
            // Details Section
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (trainer.specializations.isNotEmpty) ...[
                    _buildSectionTitle('Specialization'),
                    SizedBox(height: 10.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(color: Colors.grey.withOpacity(0.1)),
                      ),
                      child: Text(
                        trainer.specializations.map((e) => e.name).join(', '),
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: Colors.grey[700],
                          height: 1.4,
                        ),
                      ),
                    ),
                    SizedBox(height: 24.h),
                  ],

                  if (trainer.certificates.isNotEmpty) ...[
                    _buildSectionTitle('Certifications'),
                    SizedBox(height: 10.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(color: Colors.grey.withOpacity(0.1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: trainer.certificates
                            .map(
                              (cert) => _buildCertificationItem(context, cert),
                            )
                            .toList(),
                      ),
                    ),
                  ],

                  SizedBox(height: 40.h),

                  // Subscribe Button
                  SizedBox(
                    width: double.infinity,
                    height: 52.h,
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to Package Selection
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                CoachPackagesScreen(trainer: trainer),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Custom().colors().primaryButton,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        elevation: 4,
                        shadowColor: Custom()
                            .colors()
                            .primaryButton
                            .withOpacity(0.4),
                      ),
                      child: Text(
                        'Subscribe with Coach',
                        style: TextStyle(
                          fontSize: 16.sp,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 40.h),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18.sp,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildCertificationItem(BuildContext context, Certificate cert) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Certification Image with Zoom functionality
          GestureDetector(
            onTap: () {
              if (cert.imageUrl != null && cert.imageUrl!.isNotEmpty) {
                _showZoomedImage(context, cert.imageUrl!);
              }
            },
            child: Container(
              width: 50.w,
              height: 50.w,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8.r),
                border: Border.all(color: Colors.grey.withOpacity(0.1)),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8.r),
                child: cert.imageUrl != null && cert.imageUrl!.isNotEmpty
                    ? CachedImage(
                        imageUrl: cert.imageUrl!,
                        width: 50.w,
                        height: 50.w,
                        fit: BoxFit.cover,
                        errorWidget: Icon(
                          Icons.workspace_premium,
                          color: Custom().colors().lightGreen,
                          size: 24.sp,
                        ),
                      )
                    : Icon(
                        Icons.workspace_premium,
                        color: Custom().colors().lightGreen,
                        size: 24.sp,
                      ),
              ),
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cert.name,
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                if (cert.organization.isNotEmpty)
                  Text(
                    cert.organization,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                if (cert.year != 0)
                  Text(
                    'Year: ${cert.year}',
                    style: TextStyle(fontSize: 12.sp, color: Colors.grey[500]),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showZoomedImage(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: EdgeInsets.zero,
        child: Stack(
          alignment: Alignment.center,
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                color: Colors.black.withOpacity(0.9),
                width: double.infinity,
                height: double.infinity,
              ),
            ),
            InteractiveViewer(
              panEnabled: true,
              minScale: 0.5,
              maxScale: 4.0,
              child: CachedImage(
                imageUrl: imageUrl,
                fit: BoxFit.contain,
                placeholder: Center(
                  child: CircularProgressIndicator(
                    color: Custom().colors().lightGreen,
                  ),
                ),
              ),
            ),
            Positioned(
              top: 40.h,
              right: 20.w,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: 0,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushNamed(context, Routing.traineeHomeScreen);
        } else if (index == 1) {
          Navigator.pushNamed(context, Routing.chatListScreen);
        } else if (index == 2) {
          Navigator.pushNamed(context, Routing.exerciseLibraryScreen);
        } else if (index == 3) {
          Navigator.pushNamed(context, Routing.shoppingCartScreen);
        } else if (index == 4) {
          Navigator.pushNamed(context, Routing.profileScreen);
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home, size: 22.sp),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/cart.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Card',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
