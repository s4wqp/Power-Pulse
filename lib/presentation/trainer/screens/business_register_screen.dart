import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart'; // Added
import 'package:image_picker/image_picker.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';
import 'package:power_pulse/presentation/widgets/elevated_button.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/data/models/auth_models.dart';
import 'package:power_pulse/services/drive_service.dart';

class BusinessRegisterScreen extends StatefulWidget {
  final TrainerRegistrationData data;

  const BusinessRegisterScreen({super.key, required this.data});

  @override
  State<BusinessRegisterScreen> createState() => _BusinessRegisterScreenState();
}

class _CertificationData {
  TextEditingController nameController = TextEditingController();
  TextEditingController orgController = TextEditingController();
  TextEditingController yearController = TextEditingController();
  File? image;
}

class _BusinessRegisterScreenState extends State<BusinessRegisterScreen> {
  final TextEditingController _aboutController = TextEditingController();
  final List<_CertificationData> _certifications = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _addCertificate();
  }

  void _addCertificate() {
    setState(() {
      _certifications.add(_CertificationData());
    });
  }

  bool _isPickingImage = false;

  Future<void> _pickImage(int index) async {
    if (_isPickingImage) return;

    setState(() {
      _isPickingImage = true;
    });

    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 50,
        maxWidth: 1024,
      );

      if (pickedFile != null) {
        setState(() {
          _certifications[index].image = File(pickedFile.path);
        });
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    } finally {
      setState(() {
        _isPickingImage = false;
      });
    }
  }

  Future<void> _selectYear(BuildContext context, int index) async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Select Year"),
          content: SizedBox(
            width: 300.w,
            height: 300.h,
            child: YearPicker(
              firstDate: DateTime(DateTime.now().year - 100, 1),
              lastDate: DateTime(DateTime.now().year + 100, 1),
              selectedDate: DateTime.now(),
              onChanged: (DateTime dateTime) {
                setState(() {
                  _certifications[index].yearController.text = dateTime.year
                      .toString();
                });
                Navigator.pop(context);
              },
            ),
          ),
        );
      },
    );
  }

  Future<void> _registerUser() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final specializationMap = {
        'Weight Loss': 1,
        'Strength Training': 2,
        'Bodybuilding': 3,
        'Rehabilitation': 4,
        'Senior Fitness': 5,
        'Yoga': 6,
        'Athletic Performance': 7,
      };

      final List<int> specializationIds = [];
      for (var specName in widget.data.specializations) {
        if (specializationMap.containsKey(specName)) {
          specializationIds.add(specializationMap[specName]!);
        }
      }

      if (specializationIds.isEmpty) {
        specializationIds.add(1);
      }

      // Prepare certificates
      List<Map<String, dynamic>> certificatesList = [];
      final driveService = DriveService();

      for (var cert in _certifications) {
        if (cert.nameController.text.isNotEmpty) {
          String? imageUrl;

          if (cert.image != null) {
            imageUrl = await driveService.uploadFile(file: cert.image!);
            debugPrint('Certificate Image URL: $imageUrl');
          }

          certificatesList.add({
            'certName': cert.nameController.text,
            'issuer': cert.orgController.text.isNotEmpty
                ? cert.orgController.text
                : null,
            'year': int.tryParse(cert.yearController.text) ?? 2023,
            'imageUrl': imageUrl,
          });
        }
      }

      final request = RegisterTrainerRequest(
        name: widget.data.name,
        email: widget.data.email,
        password: widget.data.password,
        phone: widget.data.phone,
        professionalTitle: widget.data.professionalTitle.isNotEmpty
            ? widget.data.professionalTitle
            : 'Personal Trainer',
        specializationIds: specializationIds,
        certificates: certificatesList,
        experienceYears:
            int.tryParse(
              widget.data.experience.replaceAll(RegExp(r'[^0-9]'), ''),
            ) ??
            0,
        bio: _aboutController.text,
      );

      final success = await authProvider.registerTrainer(request);

      if (!mounted) return;

      if (success) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.trainerHomeScreen,
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage ?? 'Registration failed'),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('An error occurred: $e')));
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _aboutController.dispose();
    for (var cert in _certifications) {
      cert.nameController.dispose();
      cert.orgController.dispose(); // Fixed typo if any, usually copy paste
      cert.yearController.dispose();
    }
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
                  icon: const Icon(Icons.arrow_back, color: Colors.black),
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
                    Custom().mainText('Business', fontSize: 30.sp),
                    SizedBox(height: 8.h),
                    Custom().subMainText(
                      'Your Business',
                      fontSize: 16.sp,
                      color: Custom().colors().black,
                    ),
                    SizedBox(height: 32.h),
                    Custom().buildLabel(
                      'About you',
                      color: Custom().colors().black,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _aboutController,
                      maxLines: 3,
                      style: TextStyle(fontSize: 14.sp),
                      decoration: InputDecoration(
                        hintText:
                            'tell us your story, philosophy,\nand what makes you unique.',
                        hintStyle: TextStyle(
                          color: Custom().colors().black,
                          fontSize: 14.sp,
                        ),
                        enabledBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: Custom().colors().gray),
                        ),
                        focusedBorder: UnderlineInputBorder(
                          borderSide: BorderSide(
                            color: Custom().colors().black,
                          ),
                        ),
                      ),
                    ),

                    SizedBox(height: 32.h),
                    Text(
                      'Certifications',
                      style: TextStyle(
                        color: Custom().colors().black,
                        fontSize: 20.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _certifications.length,
                      itemBuilder: (context, index) {
                        final cert = _certifications[index];
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (index > 0) ...[
                              SizedBox(height: 24.h),
                              const Divider(),
                              SizedBox(height: 24.h),
                            ],
                            Text(
                              'Certification information ${index + 1}',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w500,
                                color: Custom().colors().black,
                              ),
                            ),
                            SizedBox(height: 16.h),
                            GestureDetector(
                              onTap: () => _pickImage(index),
                              child: Container(
                                width: 60.w,
                                height: 60.w,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Custom().colors().black,
                                  ),
                                  borderRadius: BorderRadius.circular(8.r),
                                  image: cert.image != null
                                      ? DecorationImage(
                                          image: FileImage(cert.image!),
                                          fit: BoxFit.cover,
                                        )
                                      : null,
                                ),
                                child: cert.image == null
                                    ? Icon(Icons.add, size: 24.sp)
                                    : null,
                              ),
                            ),
                            SizedBox(height: 16.h),
                            Custom().buildLabel(
                              'Name',
                              color: Custom().colors().black,
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                            ),
                            SizedBox(height: 8.h),
                            TextField(
                              controller: cert.nameController,
                              style: TextStyle(fontSize: 14.sp),
                              decoration: const InputDecoration(
                                enabledBorder: UnderlineInputBorder(),
                                focusedBorder: UnderlineInputBorder(),
                              ),
                            ),
                            SizedBox(height: 16.h),
                            Custom().buildLabel(
                              'Organization',
                              color: Custom().colors().black,
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                            ),
                            SizedBox(height: 8.h),
                            TextField(
                              controller: cert.orgController,
                              style: TextStyle(fontSize: 14.sp),
                              decoration: const InputDecoration(
                                enabledBorder: UnderlineInputBorder(),
                                focusedBorder: UnderlineInputBorder(),
                              ),
                            ),
                            SizedBox(height: 16.h),
                            Custom().buildLabel(
                              'Year',
                              color: Custom().colors().black,
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                            ),
                            SizedBox(height: 8.h),
                            SizedBox(
                              width: 100.w,
                              child: TextField(
                                controller: cert.yearController,
                                readOnly: true,
                                style: TextStyle(fontSize: 14.sp),
                                onTap: () => _selectYear(context, index),
                                decoration: InputDecoration(
                                  suffixIcon: Icon(
                                    Icons.keyboard_arrow_down,
                                    size: 20.sp,
                                  ),
                                  border: const OutlineInputBorder(),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    SizedBox(height: 24.h),
                    GestureDetector(
                      onTap: _addCertificate,
                      child: Row(
                        children: [
                          Icon(
                            Icons.add_circle,
                            color: Custom().colors().lightGreen,
                            size: 24.sp,
                          ),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Text(
                              'Add more Certifications if found',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Custom().colors().black,
                                fontSize: 14.sp,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 32.h),
                    SizedBox(
                      width: double.infinity,
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : CustomElevatedButton(
                              onPressed: _registerUser,
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
