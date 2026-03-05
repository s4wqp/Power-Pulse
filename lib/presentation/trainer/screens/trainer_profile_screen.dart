import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';

import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:power_pulse/services/drive_service.dart';

class TrainerProfileScreen extends StatefulWidget {
  const TrainerProfileScreen({super.key});

  @override
  State<TrainerProfileScreen> createState() => _TrainerProfileScreenState();
}

class _TrainerProfileScreenState extends State<TrainerProfileScreen> {
  final int _currentIndex = 3; // Profile is now the 4th item (index 3)
  bool _isUploading = false;

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 50,
      maxWidth: 1024,
    );

    if (pickedFile != null) {
      setState(() {
        _isUploading = true;
      });

      try {
        final driveService = DriveService();
        debugPrint('Starting Image Upload...');
        final url = await driveService.uploadFile(file: File(pickedFile.path));
        debugPrint('Uploaded Image URL: $url');

        if (url != null && mounted) {
          final authProvider = Provider.of<AuthProvider>(
            context,
            listen: false,
          );
          final trainerProvider = Provider.of<TrainerProvider>(
            context,
            listen: false,
          );

          if (authProvider.userId != null) {
            debugPrint('Updating Trainer Profile Image with URL: $url');

            final success = await trainerProvider.updateProfileImage(
              authProvider.userId!,
              url,
            );
            debugPrint('Profile Image Update Result: $success');
          }
        }
      } catch (e) {
        debugPrint('Upload Error: $e');
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error uploading image: $e')));
        }
      } finally {
        debugPrint('Upload Complete');
        if (mounted) {
          setState(() {
            _isUploading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(height: 40.h),
            _buildProfileHeader(),
            SizedBox(height: 40.h),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Column(
                  children: [
                    _buildMenuItem(
                      icon: Icons.person_outline,
                      title: 'My Account',
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          Routing.trainerAccountScreen,
                        );
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.credit_card_outlined,
                      title: 'Payment Details',
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          Routing.paymentDetailsScreen,
                        );
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.people_outline,
                      title: 'Subscribers',
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          Routing.trainerSubscribersScreen,
                        );
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.monetization_on_outlined,
                      title: 'Manage Plans',
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          Routing.trainerManagePlansScreen,
                        );
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.headset_mic_outlined,
                      title: 'Contact us',
                      onTap: () {
                        Navigator.pushNamed(context, Routing.contactUsScreen);
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.shield_outlined,
                      title: 'Privacy Policy',
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          Routing.termsAndPrivacyScreen,
                        );
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.logout,
                      title: 'Logout',
                      onTap: () {
                        context.read<ChatProvider>().disconnectSignalR();
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          Routing.loginScreen,
                          (route) => false,
                        );
                      },
                      color: Colors.red,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildProfileHeader() {
    return Consumer2<AuthProvider, TrainerProvider>(
      builder: (context, authProvider, trainerProvider, child) {
        final name =
            trainerProvider.currentTrainer?.name ??
            authProvider.fullName ??
            'Trainer';
        // Profile image logic could be added here later using trainerProvider.currentTrainer?.profileImage
        return Column(
          children: [
            GestureDetector(
              onTap: _isUploading ? null : _pickAndUploadImage,
              child: Stack(
                children: [
                  Container(
                    width: 100.w,
                    height: 100.w,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.2),
                          blurRadius: 10,
                          offset: Offset(0, 5),
                        ),
                      ],
                    ),
                    child: _isUploading
                        ? Center(
                            child: CircularProgressIndicator(
                              color: Custom().colors().lightGreen,
                            ),
                          )
                        : ClipOval(
                            child:
                                trainerProvider
                                        .currentTrainer
                                        ?.profileImageUrl !=
                                    null
                                ? Image.network(
                                    trainerProvider
                                        .currentTrainer!
                                        .profileImageUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: Colors.grey[300],
                                        child: Icon(
                                          Icons.person,
                                          size: 50.sp,
                                          color: Colors.grey[500],
                                        ),
                                      );
                                    },
                                  )
                                : Container(
                                    color: Colors.grey[300],
                                    child: Icon(
                                      Icons.add_a_photo,
                                      size: 40.sp,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                          ),
                  ),
                  if (!_isUploading)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: EdgeInsets.all(4.w),
                        decoration: BoxDecoration(
                          color: Custom().colors().lightGreen,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: Icon(
                          Icons.edit,
                          size: 14.sp,
                          color: Colors.white,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            SizedBox(height: 16.h),
            Text(
              name,
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: Custom().colors().lightGreen,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? color,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 24.h), // Spacing between items
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            Icon(
              icon,
              size: 24.sp,
              color:
                  color ??
                  Colors.grey[400], // Icon color looks light grey in design
            ),
            SizedBox(width: 20.w),
            Text(
              title,
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color:
                    color ??
                    Colors.grey[400], // Text color looks similar to icon
              ),
            ),
          ],
        ),
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
          // Stay here
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 20.w,
            color: Colors.grey,
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
