import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:image_picker/image_picker.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/services/drive_service.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isUploading = false;
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      final userId = context.read<AuthProvider>().userId;
      if (userId != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            context.read<TraineeProvider>().fetchProfile(userId);
          }
        });
      }
      _isInit = false;
    }
  }

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
          final traineeProvider = Provider.of<TraineeProvider>(
            context,
            listen: false,
          );

          if (authProvider.userId != null) {
            debugPrint('Updating Trainee Profile Image with URL: $url');

            final success = await traineeProvider.updateProfileImage(
              authProvider.userId!,
              url,
            );
            debugPrint('Profile Image Update Result: $success');

            if (success && mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Profile image updated successfully'),
                ),
              );
            }
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
      body: Stack(
        children: [
          Image.asset(
            'assets/images/bg_appbar.png',
            height: 150.h,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: 20.w,
                    vertical: 20.h,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'My Account',
                        style: TextStyle(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Navigator.pushNamed(context, Routing.contactUsScreen);
                        },
                        icon: Icon(
                          Icons.headset_mic_outlined,
                          color: Colors.white,
                          size: 28.sp,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30.r),
                        topRight: Radius.circular(30.r),
                      ),
                    ),
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(
                        horizontal: 20.w,
                        vertical: 20.h,
                      ),
                      child: Column(
                        children: [
                          _buildProfileHeader(),
                          SizedBox(height: 20.h),
                          _buildProfileItem(
                            context,
                            icon: Icons.person_outline,
                            title: 'Personal Details',
                            subtitle: 'First name , Last name ,\nmobile number',
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                Routing.personalDetailsScreen,
                              );
                            },
                          ),
                          _buildDivider(),
                          _buildProfileItem(
                            context,
                            icon: Icons.location_on_outlined,
                            title: 'Delivery Addresses',
                            subtitle: 'Add, edit and delete addresses',
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                Routing.deliveryAddressesScreen,
                              );
                            },
                          ),
                          _buildDivider(),
                          _buildProfileItem(
                            context,
                            icon: Icons.local_shipping_outlined,
                            title: 'My Orders',
                            subtitle: 'View your order history',
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                Routing.ordersScreen,
                              );
                            },
                          ),
                          _buildDivider(),
                          _buildProfileItem(
                            context,
                            icon: Icons.credit_card_outlined,
                            title: 'Payment Details',
                            subtitle: 'Add, edit and delete payment\ndetails',
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                Routing.paymentDetailsScreen,
                              );
                            },
                          ),
                          _buildDivider(),

                          _buildProfileItem(
                            context,
                            icon: Icons.shield_outlined,
                            title: 'Terms & Privacy',
                            subtitle: 'Terms of services & Privacy',
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                Routing.termsAndPrivacyScreen,
                              );
                            },
                          ),
                          _buildDivider(),
                          SizedBox(height: 40.h),
                          SizedBox(
                            width: 200.w,
                            child: ElevatedButton(
                              onPressed: () {
                                context
                                    .read<ChatProvider>()
                                    .disconnectSignalR();
                                Navigator.pushReplacementNamed(
                                  context,
                                  Routing.loginScreen,
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Custom().colors().lightGreen,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(25.r),
                                ),
                                padding: EdgeInsets.symmetric(vertical: 12.h),
                              ),
                              child: Text(
                                'Logout',
                                style: TextStyle(
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 20.h),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildProfileHeader() {
    return Consumer2<AuthProvider, TraineeProvider>(
      builder: (context, authProvider, traineeProvider, child) {
        final trainee = traineeProvider.trainee;
        final name = trainee?.name ?? authProvider.fullName ?? 'Trainee';
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
                                trainee?.profileImageUrl != null &&
                                    trainee!.profileImageUrl!.isNotEmpty
                                ? CachedImage(
                                    imageUrl: trainee.profileImageUrl!,
                                    width: 100.w,
                                    height: 100.w,
                                    fit: BoxFit.cover,
                                    errorWidget: Container(
                                      color: Colors.grey[300],
                                      child: Icon(
                                        Icons.person,
                                        size: 50.sp,
                                        color: Colors.grey[500],
                                      ),
                                    ),
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

  Widget _buildProfileItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 12.h),
        child: Row(
          children: [
            Icon(icon, size: 28.sp, color: Colors.black),
            SizedBox(width: 20.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: Colors.grey[600],
                      height: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16.sp, color: Colors.black),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Divider(color: Colors.grey[300], thickness: 1, height: 1);
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 4, // Profile tab is index 4
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushReplacementNamed(context, Routing.traineeHomeScreen);
        } else if (index == 1) {
          Navigator.pushReplacementNamed(context, Routing.chatListScreen);
        } else if (index == 2) {
          Navigator.pushReplacementNamed(
            context,
            Routing.exerciseLibraryScreen,
          );
        } else if (index == 3) {
          Navigator.pushReplacementNamed(context, Routing.shoppingCartScreen);
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
            color: Custom().colors().lightGreen,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
