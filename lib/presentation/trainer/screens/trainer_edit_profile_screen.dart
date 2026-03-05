import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:image_picker/image_picker.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainer_registration_data.dart';

class TrainerEditProfileScreen extends StatefulWidget {
  final List<String> specializations;
  final List<TrainerCertification> certifications;
  final String about;

  const TrainerEditProfileScreen({
    super.key,
    required this.specializations,
    required this.certifications,
    required this.about,
  });

  @override
  State<TrainerEditProfileScreen> createState() =>
      _TrainerEditProfileScreenState();
}

class _CertificationData {
  int? id; // Backend cert ID
  TextEditingController nameController;
  TextEditingController orgController;
  TextEditingController yearController;
  File? image;
  String? imageUrl;

  _CertificationData({
    this.id,
    required String name,
    required String org,
    required String year,
    this.image,
    this.imageUrl,
  }) : nameController = TextEditingController(text: name),
       orgController = TextEditingController(text: org),
       yearController = TextEditingController(text: year);

  void dispose() {
    nameController.dispose();
    orgController.dispose();
    yearController.dispose();
  }
}

class _TrainerEditProfileScreenState extends State<TrainerEditProfileScreen> {
  late TextEditingController _aboutController;
  late List<_CertificationData> _certifications;
  late TextEditingController _otherSpecializationController;

  bool _weightLoss = false;
  bool _strengthTraining = false;
  bool _bodybuilding = false;
  bool _rehabilitation = false;
  bool _seniorFitness = false;
  bool _yoga = false;
  bool _athleticPerformance = false;

  bool _isPickingImage = false;

  @override
  void initState() {
    super.initState();
    _aboutController = TextEditingController(text: widget.about);
    _otherSpecializationController = TextEditingController();

    // Initialize checkboxes based on passed list
    for (var spec in widget.specializations) {
      if (spec == 'Weight Loss') {
        _weightLoss = true;
      } else if (spec == 'Strength Training')
        _strengthTraining = true;
      else if (spec == 'Bodybuilding')
        _bodybuilding = true;
      else if (spec == 'Rehabilitation')
        _rehabilitation = true;
      else if (spec == 'Senior Fitness')
        _seniorFitness = true;
      else if (spec == 'Yoga')
        _yoga = true;
      else if (spec == 'Athletic Performance')
        _athleticPerformance = true;
      else {
        // If not in standard list, append to "Other"
        if (_otherSpecializationController.text.isNotEmpty) {
          _otherSpecializationController.text += ', ';
        }
        _otherSpecializationController.text += spec;
      }
    }

    _certifications = widget.certifications
        .map(
          (c) => _CertificationData(
            id: c.id,
            name: c.name,
            org: c.organization,
            year: c.year,
            image: c.image,
            imageUrl: c.imageUrl,
          ),
        )
        .toList();
  }

  @override
  void dispose() {
    _aboutController.dispose();
    _otherSpecializationController.dispose();
    for (var cert in _certifications) {
      cert.dispose();
    }
    super.dispose();
  }

  void _addCertification() {
    setState(() {
      _certifications.add(
        _CertificationData(
          name: '',
          org: '',
          year: '',
          image: null,
          imageUrl: null,
        ),
      );
    });
  }

  void _removeCertification(int index) {
    setState(() {
      _certifications[index].dispose();
      _certifications.removeAt(index);
    });
  }

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
      if (mounted) {
        setState(() {
          _isPickingImage = false;
        });
      }
    }
  }

  Future<void> _selectYear(BuildContext context, int index) async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Select Year"),
          content: SizedBox(
            width: 300,
            height: 300,
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

  void _saveProfile() {
    final updatedSpecializations = <String>[];
    if (_weightLoss) updatedSpecializations.add('Weight Loss');
    if (_strengthTraining) updatedSpecializations.add('Strength Training');
    if (_bodybuilding) updatedSpecializations.add('Bodybuilding');
    if (_rehabilitation) updatedSpecializations.add('Rehabilitation');
    if (_seniorFitness) updatedSpecializations.add('Senior Fitness');
    if (_yoga) updatedSpecializations.add('Yoga');
    if (_athleticPerformance) {
      updatedSpecializations.add('Athletic Performance');
    }

    if (_otherSpecializationController.text.isNotEmpty) {
      updatedSpecializations.addAll(
        _otherSpecializationController.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty),
      );
    }

    final updatedCertifications = _certifications.map((c) {
      return TrainerCertification(
        id: c.id,
        name: c.nameController.text.trim(),
        organization: c.orgController.text.trim(),
        year: c.yearController.text.trim(),
        image: c.image,
        imageUrl: c.imageUrl,
      );
    }).toList();

    Navigator.pop(context, {
      'specializations': updatedSpecializations,
      'certifications': updatedCertifications,
      'about': _aboutController.text.trim(),
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Edit Profile',
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.check, color: Custom().colors().lightGreen),
            onPressed: _saveProfile,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLabel('About You'),
            TextField(
              controller: _aboutController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText:
                    'Tell us your story, philosophy, and what makes you unique.',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10.r),
                ),
                contentPadding: EdgeInsets.all(16.w),
              ),
            ),
            SizedBox(height: 24.h),

            _buildLabel('Areas of Specialization'),
            SizedBox(height: 16.h),
            Wrap(
              spacing: 20.w,
              runSpacing: 8.h,
              children: [
                _buildCheckbox('Weight Loss', _weightLoss, (v) {
                  setState(() => _weightLoss = v!);
                }),
                _buildCheckbox('Strength Training', _strengthTraining, (v) {
                  setState(() => _strengthTraining = v!);
                }),
                _buildCheckbox('Bodybuilding', _bodybuilding, (v) {
                  setState(() => _bodybuilding = v!);
                }),
                _buildCheckbox('Rehabilitation', _rehabilitation, (v) {
                  setState(() => _rehabilitation = v!);
                }),
                _buildCheckbox('Senior Fitness', _seniorFitness, (v) {
                  setState(() => _seniorFitness = v!);
                }),
                _buildCheckbox('Yoga', _yoga, (v) {
                  setState(() => _yoga = v!);
                }),
                _buildCheckbox('Athletic Performance', _athleticPerformance, (
                  v,
                ) {
                  setState(() => _athleticPerformance = v!);
                }),
              ],
            ),
            SizedBox(height: 16.h),
            _buildLabel('Other'),
            _buildTextField(_otherSpecializationController),
            SizedBox(height: 24.h),

            _buildSectionHeader('Certifications', _addCertification),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _certifications.length,
              itemBuilder: (context, index) {
                final cert = _certifications[index];
                return Stack(
                  children: [
                    Container(
                      margin: EdgeInsets.only(bottom: 24.h),
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Certification information ${index + 1}',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w500,
                              color: Colors.black,
                            ),
                          ),
                          SizedBox(height: 16.h),
                          GestureDetector(
                            onTap: () => _pickImage(index),
                            child: Container(
                              width: 80.w,
                              height: 80.w,
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.shade400),
                                borderRadius: BorderRadius.circular(8.r),
                                image: cert.image != null
                                    ? DecorationImage(
                                        image: FileImage(cert.image!),
                                        fit: BoxFit.cover,
                                      )
                                    : (cert.imageUrl != null &&
                                              cert.imageUrl!.isNotEmpty
                                          ? DecorationImage(
                                              image: NetworkImage(
                                                cert.imageUrl!,
                                              ),
                                              fit: BoxFit.cover,
                                            )
                                          : null),
                              ),
                              child:
                                  cert.image == null &&
                                      (cert.imageUrl == null ||
                                          cert.imageUrl!.isEmpty)
                                  ? Icon(Icons.add_a_photo, color: Colors.grey)
                                  : null,
                            ),
                          ),
                          SizedBox(height: 16.h),
                          _buildLabel('Name'),
                          _buildTextField(cert.nameController),
                          SizedBox(height: 16.h),
                          _buildLabel('Organization'),
                          _buildTextField(cert.orgController),
                          SizedBox(height: 16.h),
                          _buildLabel('Year'),
                          SizedBox(
                            width: 120.w,
                            child: TextField(
                              controller: cert.yearController,
                              readOnly: true,
                              onTap: () => _selectYear(context, index),
                              decoration: InputDecoration(
                                suffixIcon: const Icon(
                                  Icons.keyboard_arrow_down,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10.r),
                                ),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 16.w,
                                  vertical: 12.h,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: IconButton(
                        icon: const Icon(Icons.close, color: Colors.red),
                        onPressed: () => _removeCertification(index),
                      ),
                    ),
                  ],
                );
              },
            ),

            SizedBox(height: 24.h),
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onAdd) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildLabel(title),
        IconButton(
          icon: Icon(
            Icons.add_circle_outline,
            color: Custom().colors().lightGreen,
          ),
          onPressed: onAdd,
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 16.sp,
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10.r)),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      ),
    );
  }

  Widget _buildCheckbox(String label, bool value, Function(bool?) onChanged) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 24.w,
          height: 24.w,
          child: Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: Custom().colors().lightGreen,
          ),
        ),
        SizedBox(width: 8.w),
        Text(
          label,
          style: TextStyle(
            fontSize: 14.sp, // Match design
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
      ],
    );
  }
}
