import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';

class TrainerInformationScreen extends StatefulWidget {
  const TrainerInformationScreen({super.key});

  @override
  State<TrainerInformationScreen> createState() =>
      _TrainerInformationScreenState();
}

class _TrainerInformationScreenState extends State<TrainerInformationScreen> {
  final int _currentIndex = 3;
  Trainer? _trainer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchTrainerProfile();
    });
  }

  Future<void> _fetchTrainerProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final trainerProvider = Provider.of<TrainerProvider>(
      context,
      listen: false,
    );
    final userId = authProvider.userId;

    if (userId != null) {
      // Fetch details using provider
      final trainer = await trainerProvider.getTrainerDetails(userId);
      // Wait, getTrainerDetails updates provider state too? Yes.
      // But setState here updates local _trainer variable.
      if (mounted) {
        setState(() {
          _trainer = trainer;
        });
      }
    } else {
      // Handle missing userId (should not happen if logged in)
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error: User ID not found')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: false,
        child: Consumer<TrainerProvider>(
          builder: (context, trainerProvider, child) {
            if (trainerProvider.isLoading) {
              return Center(
                child: CircularProgressIndicator(
                  color: Custom().colors().lightGreen,
                ),
              );
            }

            if (trainerProvider.errorMessage != null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Error loading profile',
                      style: TextStyle(fontSize: 18.sp, color: Colors.red),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      trainerProvider.errorMessage!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                    SizedBox(height: 16.h),
                    ElevatedButton(
                      onPressed: _fetchTrainerProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Custom().colors().lightGreen,
                      ),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              );
            }

            // Update local _trainer if provider has it
            if (trainerProvider.currentTrainer != null) {
              _trainer = trainerProvider.currentTrainer;
            }

            return Column(
              children: [
                _buildHeader(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.symmetric(horizontal: 24.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 20.h),
                        _buildProfileInfo(),
                        SizedBox(height: 24.h),
                        if (_trainer?.bio.isNotEmpty ?? false) ...[
                          _buildSectionTitle('About Me:'),
                          SizedBox(height: 8.h),
                          Text(
                            _trainer!.bio,
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey[600],
                            ),
                          ),
                          Divider(height: 32.h, color: Colors.grey[300]),
                        ],
                        _buildSectionTitle('Specialization:'),
                        SizedBox(height: 8.h),
                        Text(
                          _trainer?.specializations
                                  .map((e) => e.name)
                                  .join(', ') ??
                              'None',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                        Divider(height: 32.h, color: Colors.grey[300]),
                        _buildSectionTitle('Certifications:'),
                        SizedBox(height: 8.h),
                        _buildCertificationsList(_trainer?.certificates ?? []),
                        Divider(height: 32.h, color: Colors.grey[300]),
                        // Skills might need to be added to Trainer model if not present, assuming they are part of bio or specializations for now
                        // Or we can assume they are not supported by backend yet, but we will keep UI structure
                        // For now, let's just not show skills section if model doesn't support it or show empty
                        // Skills section removed
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 120.h,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Custom().colors().lightGreen,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30.r),
          bottomRight: Radius.circular(30.r),
        ),
      ),
      child: Stack(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: EdgeInsets.only(top: 40.h, left: 20.w),
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Icon(
                  Icons.arrow_back_ios_new,
                  color: Colors.white,
                  size: 20.sp,
                ),
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: EdgeInsets.only(top: 40.h),
              child: Text(
                'Trainer Information',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: EdgeInsets.only(top: 40.h, right: 20.w),
              child: GestureDetector(
                onTap: () async {
                  if (_trainer == null) return;

                  final currentSpecs = _trainer!.specializations
                      .map((e) => e.name)
                      .toList();
                  final currentCerts = _trainer!.certificates
                      .map(
                        (c) => TrainerCertification(
                          id: c.id,
                          name: c.name,
                          organization: c.organization,
                          year: c.year.toString(),
                          imageUrl: c.imageUrl,
                        ),
                      )
                      .toList();

                  final result = await Navigator.pushNamed(
                    context,
                    Routing.trainerEditProfileScreen,
                    arguments: {
                      'specializations': currentSpecs,
                      'certifications': currentCerts,
                      'about': _trainer!.bio,
                    },
                  );

                  if (result != null && result is Map<String, dynamic>) {
                    final authProvider = Provider.of<AuthProvider>(
                      context,
                      listen: false,
                    );
                    final trainerProvider = Provider.of<TrainerProvider>(
                      context,
                      listen: false,
                    );

                    // Transform result to backend format
                    // Note: This needs careful mapping depending on API expectations
                    // For now sending raw map and hoping repository/backend handles it or I'll implement mapping in repo

                    final success = await trainerProvider.updateProfile(
                      authProvider.userId!,
                      result,
                    );
                    if (success) {
                      _fetchTrainerProfile(); // Refresh
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Profile updated')),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            trainerProvider.errorMessage ?? 'Update failed',
                          ),
                        ),
                      );
                    }
                  }
                },
                child: Icon(Icons.edit, color: Colors.white, size: 20.sp),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificationsList(List<Certificate> items) {
    if (items.isEmpty) {
      return Text(
        'No certifications added',
        style: TextStyle(color: Colors.grey[500], fontSize: 14.sp),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items
          .map(
            (item) => Padding(
              padding: EdgeInsets.only(bottom: 12.h),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () {
                      if (item.imageUrl != null && item.imageUrl!.isNotEmpty) {
                        showDialog(
                          context: context,
                          builder: (_) => Dialog(
                            backgroundColor: Colors.transparent,
                            insetPadding: EdgeInsets.all(10),
                            child: InteractiveViewer(
                              child: Image.network(
                                item.imageUrl!,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        );
                      }
                    },
                    child: Container(
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8.r),
                        image:
                            item.imageUrl != null && item.imageUrl!.isNotEmpty
                            ? DecorationImage(
                                image: NetworkImage(item.imageUrl!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: item.imageUrl == null || item.imageUrl!.isEmpty
                          ? Icon(
                              Icons.workspace_premium, // Certificate icon
                              size: 24.sp,
                              color: Custom().colors().lightGreen,
                            )
                          : null,
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.w600, // Semibold
                            color: Colors.black87,
                            height: 1.2,
                          ),
                        ),
                        SizedBox(height: 4.h),
                        if (item.organization.isNotEmpty || item.year != 0)
                          Text(
                            '${item.organization}${item.organization.isNotEmpty && item.year != 0 ? ' • ' : ''}${item.year != 0 ? item.year : ''}',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildProfileInfo() {
    return Column(
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
          child: ClipOval(
            child: _trainer?.profileImageUrl != null
                ? Image.network(
                    _trainer!.profileImageUrl!,
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
                : Image.asset('assets/images/image.png', fit: BoxFit.cover),
          ),
        ),
        SizedBox(height: 16.h),
        Text(
          _trainer?.name ?? 'Trainer',
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          _trainer?.professionalTitle ?? 'Personal Trainer',
          style: TextStyle(
            fontSize: 14.sp,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: 8.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${_trainer?.experienceYears ?? 0} Years of experience',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
            SizedBox(width: 4.w),
            Icon(
              Icons.star,
              size: 16.sp,
              color: Colors.yellow[700],
            ), // Yellow star
          ],
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 18.sp, // Slightly bigger
        fontWeight: FontWeight.bold,
        color: Colors.black,
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
