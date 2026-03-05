import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/presentation/widgets/card_input_formatters.dart';
import 'package:flutter/services.dart';

class TrainerAddPlanScreen extends StatefulWidget {
  final TrainingPlan? plan;
  const TrainerAddPlanScreen({super.key, this.plan});

  @override
  State<TrainerAddPlanScreen> createState() => _TrainerAddPlanScreenState();
}

class _TrainerAddPlanScreenState extends State<TrainerAddPlanScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();
  final TextEditingController _badgeController = TextEditingController();
  String _durationUnit = 'Months';
  final List<TextEditingController> _featureControllers = [
    TextEditingController(),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.plan != null) {
      _titleController.text = widget.plan!.name;
      _descriptionController.text = widget.plan!.description;
      _priceController.text = widget.plan!.price.toString();

      _durationUnit =
          widget.plan!.durationMonths != null &&
              widget.plan!.durationMonths! > 0
          ? 'Months'
          : widget.plan!.durationDays > 0
          ? 'Days'
          : widget.plan!.durationHours != null &&
                widget.plan!.durationHours! > 0
          ? (widget.plan!.durationHours! < 1.0 ? 'Minutes' : 'Hours')
          : 'Months';

      _durationController.text = _durationUnit == 'Months'
          ? widget.plan!.durationMonths?.toString() ?? '0'
          : _durationUnit == 'Hours'
          ? widget.plan!.durationHours?.toString() ?? '0'
          : _durationUnit == 'Minutes'
          ? ((widget.plan!.durationHours ?? 0) * 60).toInt().toString()
          : widget.plan!.durationDays.toString();

      _badgeController.text = widget.plan!.badge ?? '';

      if (widget.plan!.features.isNotEmpty) {
        _featureControllers.clear();
        for (var feature in widget.plan!.features) {
          _featureControllers.add(TextEditingController(text: feature));
        }
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _durationController.dispose();
    _badgeController.dispose();
    for (var controller in _featureControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _addFeatureField() {
    setState(() {
      _featureControllers.add(TextEditingController());
    });
  }

  void _removeFeatureField(int index) {
    setState(() {
      _featureControllers[index].dispose();
      _featureControllers.removeAt(index);
    });
  }

  void _savePlan() async {
    if (_formKey.currentState!.validate()) {
      final features = _featureControllers
          .map((c) => c.text.trim())
          .where((text) => text.isNotEmpty)
          .toList();

      final provider = context.read<TrainerProvider>();
      final auth = context.read<AuthProvider>();

      final durationValue =
          double.tryParse(_durationController.text.trim()) ?? 0.0;
      final planData = {
        'name': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'price': double.tryParse(_priceController.text.trim()) ?? 0.0,
        'badge': _badgeController.text.isNotEmpty
            ? _badgeController.text.trim()
            : null,
        'features': features,
        'isActive': true,
      };

      if (_durationUnit == 'Months') {
        planData['durationMonths'] = durationValue;
        planData['durationDays'] = 0.0;
        planData['durationHours'] = 0.0;
      } else if (_durationUnit == 'Days') {
        planData['durationMonths'] = 0.0;
        planData['durationDays'] = durationValue;
        planData['durationHours'] = 0.0;
      } else if (_durationUnit == 'Hours') {
        planData['durationMonths'] = 0.0;
        planData['durationDays'] = 0.0;
        planData['durationHours'] = durationValue;
      } else if (_durationUnit == 'Minutes') {
        planData['durationMonths'] = 0.0;
        planData['durationDays'] = 0.0;
        // Convert minutes to fractional hours
        planData['durationHours'] = durationValue / 60.0;
      }

      if (auth.userId == null) return;

      final bool success;
      if (widget.plan != null) {
        // preserve isActive status during manual edit unless we add a toggle here too
        planData['isActive'] = widget.plan!.isActive;
        success = await provider.updatePlan(
          auth.userId!,
          widget.plan!.id,
          planData,
        );
      } else {
        success = await provider.createPlan(auth.userId!, planData);
      }

      if (success && mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.plan != null
                  ? 'Plan updated successfully'
                  : 'Plan created successfully',
            ),
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              provider.errorMessage ??
                  (widget.plan != null
                      ? 'Failed to update plan'
                      : 'Failed to create plan'),
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.plan != null ? 'Edit Plan' : 'Add New Plan',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabel('Plan Title'),
              _buildTextField(
                controller: _titleController,
                hint: 'e.g., 1 Month Coaching',
                validator: (v) => v!.isEmpty ? 'Title is required' : null,
              ),
              SizedBox(height: 16.h),
              _buildLabel('Description'),
              _buildTextField(
                controller: _descriptionController,
                hint: 'Enter plan description',
                maxLines: 3,
                validator: (v) => v!.isEmpty ? 'Description is required' : null,
              ),
              SizedBox(height: 16.h),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Price'),
                        _buildTextField(
                          controller: _priceController,
                          hint: 'e.g., 100\$',
                          validator: (v) =>
                              v!.isEmpty ? 'Price is required' : null,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Duration'),
                        Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: _buildTextField(
                                controller: _durationController,
                                hint: 'e.g., 1',
                                validator: (v) =>
                                    v!.isEmpty ? 'Required' : null,
                              ),
                            ),
                            SizedBox(width: 8.w),
                            Expanded(
                              flex: 3,
                              child: DropdownButtonFormField<String>(
                                initialValue: _durationUnit,
                                isExpanded: true,
                                decoration: InputDecoration(
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 8.w,
                                    vertical: 14.h,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10.r),
                                    borderSide: BorderSide(
                                      color: Colors.grey.shade300,
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10.r),
                                    borderSide: BorderSide(
                                      color: Colors.grey.shade300,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10.r),
                                    borderSide: BorderSide(
                                      color: Custom().colors().lightGreen,
                                    ),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey.shade50,
                                ),
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.w500,
                                ),
                                icon: const Icon(
                                  Icons.arrow_drop_down,
                                  color: Colors.grey,
                                ),
                                items: ['Months', 'Days', 'Hours', 'Minutes']
                                    .map(
                                      (unit) => DropdownMenuItem(
                                        value: unit,
                                        child: Text(
                                          unit,
                                          style: TextStyle(fontSize: 13.sp),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() => _durationUnit = value);
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16.h),
              _buildLabel('Badge (Optional)'),
              _buildTextField(
                controller: _badgeController,
                hint: 'e.g., Save 20',
                inputFormatters: [PercentInputFormatter()],
              ),
              SizedBox(height: 24.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildLabel('Features'),
                  TextButton.icon(
                    onPressed: _addFeatureField,
                    icon: Icon(
                      Icons.add_circle_outline,
                      color: Custom().colors().lightGreen,
                      size: 20.sp,
                    ),
                    label: Text(
                      'Add Feature',
                      style: TextStyle(color: Custom().colors().lightGreen),
                    ),
                  ),
                ],
              ),
              ..._generateFeatureFields(),
              SizedBox(height: 40.h),
              SizedBox(
                width: double.infinity,
                height: 50.h,
                child: ElevatedButton(
                  onPressed: _savePlan,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                  ),
                  child: Text(
                    widget.plan != null ? 'Update Plan' : 'Create Plan',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _generateFeatureFields() {
    return List.generate(_featureControllers.length, (index) {
      return Padding(
        padding: EdgeInsets.only(bottom: 12.h),
        child: Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _featureControllers[index],
                hint: 'Enter feature description',
                validator: (v) => v!.isEmpty ? 'Feature cannot be empty' : null,
              ),
            ),
            if (_featureControllers.length > 1)
              IconButton(
                icon: Icon(Icons.remove_circle, color: Colors.red[400]),
                onPressed: () => _removeFeatureField(index),
              ),
          ],
        ),
      );
    });
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14.sp,
          fontWeight: FontWeight.w600,
          color: Colors.grey[700],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    String? Function(String?)? validator,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      maxLines: maxLines,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14.sp),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.r),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.r),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.r),
          borderSide: BorderSide(color: Custom().colors().lightGreen),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
    );
  }
}
