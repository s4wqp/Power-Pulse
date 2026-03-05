import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart'; // Added
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';
import 'package:power_pulse/presentation/widgets/elevated_button.dart';
import 'package:power_pulse/presentation/widgets/text_field.dart';
import 'package:power_pulse/routing.dart';

class ProfileRegisterScreen extends StatefulWidget {
  final TrainerRegistrationData data;

  const ProfileRegisterScreen({super.key, required this.data});

  @override
  State<ProfileRegisterScreen> createState() => _ProfileRegisterScreenState();
}

class _ProfileRegisterScreenState extends State<ProfileRegisterScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _experienceController = TextEditingController();
  final TextEditingController _otherController = TextEditingController();

  bool _weightLoss = false;
  bool _strengthTraining = false;
  bool _bodybuilding = false;
  bool _rehabilitation = false;
  bool _seniorFitness = false;
  bool _yoga = false;
  bool _athleticPerformance = false;

  @override
  void dispose() {
    _titleController.dispose();
    _experienceController.dispose();
    _otherController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.only(top: 20.h, left: 16.w),
              child: Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  icon: Icon(
                    Icons.arrow_back,
                    color: Colors.black,
                    size: 24.sp,
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            SizedBox(height: 20.h),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 30.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 16.h),
                    Custom().mainText('Profile', fontSize: 30.sp),
                    SizedBox(height: 8.h),
                    Custom().subMainText(
                      'Your Profile',
                      fontSize: 16.sp,
                      color: Custom().colors().black,
                    ),
                    SizedBox(height: 32.h),
                    Custom().buildLabel(
                      'Professional Title',
                      color: Custom().colors().black,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: 'Example: "Certified Personal Trainer..."',
                      icon: Icons.work_outline,
                      controller: _titleController,
                      obscureText: false,
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    Custom().buildLabel(
                      'Years of Experience',
                      color: Custom().colors().black,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(height: 8.h),
                    CustomTextField(
                      hintText: '',
                      icon: Icons.calendar_today_outlined,
                      controller: _experienceController,
                      obscureText: false,
                      fillColor: Colors.transparent,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Custom().colors().black),
                      ),
                    ),
                    SizedBox(height: 32.h),
                    Custom().buildLabel(
                      'Areas of Specialization',
                      color: Custom().colors().black,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(height: 16.h),
                    Wrap(
                      spacing: 20.w,
                      runSpacing: 8.h,
                      children: [
                        Custom().buildCheckbox(
                          'Weight Loss',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _weightLoss,
                          (v) {
                            setState(() => _weightLoss = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          'Strength Training',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _strengthTraining,
                          (v) {
                            setState(() => _strengthTraining = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          'Bodybuilding',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _bodybuilding,
                          (v) {
                            setState(() => _bodybuilding = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          'Rehabilitation',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _rehabilitation,
                          (v) {
                            setState(() => _rehabilitation = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          'Senior Fitness',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _seniorFitness,
                          (v) {
                            setState(() => _seniorFitness = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          'Yoga',
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          _yoga,
                          (v) {
                            setState(() => _yoga = v!);
                          },
                        ),
                        Custom().buildCheckbox(
                          fontSize: 17.sp,
                          fontWeight: FontWeight.w500,
                          'Athletic Performance',
                          _athleticPerformance,
                          (v) {
                            setState(() => _athleticPerformance = v!);
                          },
                        ),
                      ],
                    ),
                    SizedBox(height: 25.h),
                    Custom().buildLabel('Other'),
                    TextField(
                      controller: _otherController,
                      style: TextStyle(fontSize: 14.sp),
                      decoration: const InputDecoration(
                        enabledBorder: UnderlineInputBorder(),
                        focusedBorder: UnderlineInputBorder(),
                      ),
                    ),
                    SizedBox(height: 32.h),
                    SizedBox(
                      width: double.infinity,
                      child: CustomElevatedButton(
                        onPressed: () {
                          final title = _titleController.text.trim();
                          final experience = _experienceController.text.trim();
                          final other = _otherController.text.trim();

                          if (title.isEmpty || experience.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Please fill in required fields'),
                              ),
                            );
                            return;
                          }

                          final specializations = <String>[];
                          if (_weightLoss) specializations.add('Weight Loss');
                          if (_strengthTraining) {
                            specializations.add('Strength Training');
                          }
                          if (_bodybuilding) {
                            specializations.add('Bodybuilding');
                          }
                          if (_rehabilitation) {
                            specializations.add('Rehabilitation');
                          }
                          if (_seniorFitness) {
                            specializations.add('Senior Fitness');
                          }
                          if (_yoga) specializations.add('Yoga');
                          if (_athleticPerformance) {
                            specializations.add('Athletic Performance');
                          }

                          widget.data.professionalTitle = title;
                          widget.data.experience = experience;
                          widget.data.specializations = specializations;
                          widget.data.otherSpecialization = other;

                          Navigator.pushNamed(
                            context,
                            Routing.businessRegisterScreen,
                            arguments: widget.data,
                          );
                        },
                        text: 'Next',
                        backgroundColor: Custom().colors().lightGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
