import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';
import 'package:power_pulse/presentation/widgets/chat_badge_icon.dart';

class TrainerAccountScreen extends StatefulWidget {
  const TrainerAccountScreen({super.key});

  @override
  State<TrainerAccountScreen> createState() => _TrainerAccountScreenState();
}

class _TrainerAccountScreenState extends State<TrainerAccountScreen> {
  final int _currentIndex = 3;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final trainerProvider = Provider.of<TrainerProvider>(
        context,
        listen: false,
      );
      if (authProvider.userId != null &&
          trainerProvider.currentTrainer == null) {
        trainerProvider.fetchCurrentTrainer(authProvider.userId!);
      }
    });
  }

  @override
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Consumer2<AuthProvider, TrainerProvider>(
        builder: (context, authProvider, trainerProvider, child) {
          final trainer = trainerProvider.currentTrainer;
          final name = trainer?.name ?? authProvider.fullName ?? 'Trainer';
          final title = trainer?.professionalTitle ?? 'Personal Trainer';
          final years = trainer?.experienceYears ?? 0;
          final rating = trainer?.rating ?? 0.0;
          final certificates = trainer?.certificates ?? [];
          final profileImage = trainer?.profileImageUrl;

          return Stack(
            children: [
              // Background Image
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 0.65.sh, // Takes up 65% of screen height
                child: profileImage != null
                    ? CachedImage(
                        imageUrl: profileImage,
                        width: double.infinity,
                        height: 0.65.sh,
                        fit: BoxFit.cover,
                        errorWidget: Container(
                          color: Colors.grey[300],
                          child: Icon(
                            Icons.person,
                            size: 100.sp,
                            color: Colors.grey[500],
                          ),
                        ),
                      )
                    : Image.asset(
                        'assets/images/image.png', // Placeholder
                        fit: BoxFit.cover,
                      ),
              ),

              // Image Overlay Gradient for Text Readability
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 0.65.sh,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.0),
                        Colors.black.withOpacity(0.1),
                        Colors.black.withOpacity(0.6),
                      ],
                      stops: [0.6, 0.8, 1.0],
                    ),
                  ),
                ),
              ),

              // Back Button
              Positioned(
                top: 40.h,
                left: 20.w,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: EdgeInsets.all(8.w),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 20.sp,
                    ),
                  ),
                ),
              ),

              // Trainer Name and Title Overlay
              Positioned(
                top: 0.5.sh,
                left: 24.w,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 24.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom Sheet / Card
              Positioned(
                top: 0.62.sh,
                left: 0,
                right: 0,
                bottom: 0, // Extend to bottom
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30.r),
                      topRight: Radius.circular(30.r),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: 24.w,
                      vertical: 24.h,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header Row: Title and View All
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'References', // Or Certifications
                              style: TextStyle(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  Routing.trainerInformationScreen,
                                );
                              },
                              child: Row(
                                children: [
                                  Text(
                                    'view all',
                                    style: TextStyle(
                                      fontSize: 14.sp,
                                      color: Custom().colors().lightGreen,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Icon(
                                    Icons.chevron_right,
                                    color: Custom().colors().lightGreen,
                                    size: 20.sp,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 16.h),

                        // Badges Row
                        Row(
                          children: [
                            _buildBadge(
                              icon: Icons.star,
                              text: '(${rating.toStringAsFixed(1)}/5)',
                              color: Colors.yellow[700],
                              bgColor: Colors.grey[200]!,
                            ),
                            SizedBox(width: 12.w),
                            _buildBadge(
                              text: '$years years experience',
                              bgColor: Colors.grey[300]!,
                            ),
                          ],
                        ),
                        SizedBox(height: 20.h),

                        // References List
                        Expanded(
                          child: certificates.isEmpty
                              ? Center(child: Text('No references added yet.'))
                              : ListView.builder(
                                  padding: EdgeInsets.zero,
                                  itemCount: certificates.length,
                                  itemBuilder: (context, index) {
                                    final cert = certificates[index];
                                    return _buildReferenceItem(
                                      '${cert.name} - ${cert.organization} (${cert.year})',
                                    );
                                  },
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildBadge({
    IconData? icon,
    required String text,
    Color? color,
    required Color bgColor,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Text(
              text,
              style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.bold),
            ),
            SizedBox(width: 4.w),
            Icon(icon, size: 14.sp, color: color),
          ] else
            Text(
              text,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildReferenceItem(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Icon(Icons.circle, size: 8.sp, color: Colors.grey[400]),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.grey[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == _currentIndex) return;

        if (index == 0) {
          Navigator.pushReplacementNamed(context, Routing.trainerHomeScreen);
        } else if (index == 1) {
          Navigator.pushReplacementNamed(
            context,
            Routing.trainerChatListScreen,
          );
        } else if (index == 2) {
          Navigator.pushReplacementNamed(
            context,
            Routing.trainerExerciseLibraryScreen,
          );
        } else if (index == 3) {
          Navigator.pushReplacementNamed(context, Routing.trainerProfileScreen);
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: ChatBadgeIcon(
            child: Image.asset(
              'assets/icons/chat.png',
              width: 20.w,
              color: Colors.grey,
            ),
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 20.w,
            color: Colors.grey,
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 20.w,
            color: Custom().colors().lightGreen,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
