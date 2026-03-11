import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';

import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';

class PersonalDetailsScreen extends StatefulWidget {
  const PersonalDetailsScreen({super.key});

  @override
  State<PersonalDetailsScreen> createState() => _PersonalDetailsScreenState();
}

class _PersonalDetailsScreenState extends State<PersonalDetailsScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      final userId = context.read<AuthProvider>().userId;
      if (userId != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            context.read<TraineeProvider>().fetchProfile(userId).then((_) {
              if (mounted) {
                final trainee = context.read<TraineeProvider>().trainee;
                if (trainee != null) {
                  _nameController.text = trainee.name;
                  _phoneController.text = trainee.phone;
                  _emailController.text = trainee.email;
                }
              }
            });
          }
        });
      }
      _isInit = false;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final traineeProvider = Provider.of<TraineeProvider>(
      context,
      listen: false,
    );
    final userId = authProvider.userId;

    if (userId == null) return;

    final nameTrimmed = _nameController.text.trim();
    final phoneTrimmed = _phoneController.text.trim();

    if (nameTrimmed.isEmpty || phoneTrimmed.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    if (phoneTrimmed.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Phone number must be exactly 10 digits')),
      );
      return;
    }

    final data = {
      'name': nameTrimmed,
      'phone': phoneTrimmed,
      // 'email': _emailController.text, // Usually email is not editable or requires verification
    };

    final success = await traineeProvider.updateProfile(userId, data);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(traineeProvider.errorMessage ?? 'Update failed'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Custom().colors().lightGreen,
      appBar: AppBar(
        backgroundColor: Custom().colors().lightGreen,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Personal Details',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        margin: EdgeInsets.only(top: 20.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30.r),
            topRight: Radius.circular(30.r),
          ),
        ),
        child: Consumer<TraineeProvider>(
          builder: (context, traineeProvider, child) {
            if (traineeProvider.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            return CustomScrollView(
              slivers: [
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Padding(
                    padding: EdgeInsets.all(20.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 20.h),
                        _buildLabel('Name'),
                        _buildTextField(_nameController),
                        SizedBox(height: 15.h),
                        Row(
                          children: [
                            Expanded(
                              flex: 1,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('Country'),
                                  // Country code handling might need a separate widget/logic
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 12.h,
                                      horizontal: 15.w,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[200],
                                      borderRadius: BorderRadius.circular(5.r),
                                    ),
                                    child: Text(
                                      '+20',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(width: 15.w),
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildLabel('Mobile Number'),
                                  _buildTextField(_phoneController),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 15.h),
                        _buildLabel('Email Addresses'),
                        _buildTextField(_emailController, readOnly: true),
                        const Spacer(),
                        Center(
                          child: SizedBox(
                            width: 150.w,
                            child: ElevatedButton(
                              onPressed: _saveProfile,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Custom().colors().lightGreen,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(25.r),
                                ),
                                padding: EdgeInsets.symmetric(vertical: 12.h),
                              ),
                              child: Text(
                                'Save',
                                style: TextStyle(
                                  fontSize: 16.sp,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 30.h),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller, {
    bool readOnly = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(5.r),
      ),
      child: TextFormField(
        controller: controller,
        readOnly: readOnly,
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 15.w,
            vertical: 12.h,
          ),
          isDense: true,
        ),
        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
      ),
    );
  }
}
