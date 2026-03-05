import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class BeforRegister extends StatefulWidget {
  const BeforRegister({super.key});

  @override
  State<BeforRegister> createState() => _BeforRegisterState();
}

class _BeforRegisterState extends State<BeforRegister> {
  String _selectedRole = ''; // 'Coach' or 'Trainee'

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: 40.h),
              // Logo
              Image.asset('assets/images/nav.png', height: 80.h),
              SizedBox(height: 40.h),
              // Title
              Custom().mainText('Who you are?'),
              SizedBox(height: 16.h),
              // Subtitle
              Custom().subMainText('We should know you are'),
              SizedBox(height: 60.h),
              // Selection Area
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Coach Option
                  _buildRoleOption(
                    role: 'Trainer',
                    imagePath: 'assets/images/trainer.jpeg',
                  ),
                  SizedBox(width: 20.w),
                  Text(
                    'Or',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w500,
                      color: Colors.black54,
                    ),
                  ),
                  SizedBox(width: 20.w),
                  // Trainee Option
                  _buildRoleOption(
                    role: 'Trainee',
                    imagePath: 'assets/images/trainee.jpeg',
                  ),
                ],
              ),
              const Spacer(),
              // Next Button
              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: _selectedRole.isNotEmpty
                      ? () {
                          if (_selectedRole == 'Trainee') {
                            Navigator.pushNamed(
                              context,
                              Routing.traineeRegisterScreen,
                            );
                          } else {
                            Navigator.pushNamed(
                              context,
                              Routing.trainerRegisterScreen,
                            );
                          }
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().primaryButton,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey[300],
                    disabledForegroundColor: Colors.grey[500],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.r),
                    ),
                    elevation: _selectedRole.isNotEmpty ? 5 : 0,
                    shadowColor: Custom().colors().primaryButton.withOpacity(
                      0.4,
                    ),
                  ),
                  child: Text(
                    'Next',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 40.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleOption({required String role, required String imagePath}) {
    final isSelected = _selectedRole == role;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected
                    ? Custom().colors().primaryButton
                    : Colors.transparent,
                width: 3.w,
              ),
            ),
            child: CircleAvatar(
              radius: 50.r,
              backgroundColor: Colors.grey[100],
              backgroundImage: AssetImage(imagePath),
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            role,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: isSelected
                  ? Custom().colors().primaryButton
                  : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}
