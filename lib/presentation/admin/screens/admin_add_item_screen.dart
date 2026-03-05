import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:power_pulse/services/drive_service.dart';

class AdminAddItemScreen extends StatefulWidget {
  final String categoryType;

  const AdminAddItemScreen({super.key, required this.categoryType});

  @override
  State<AdminAddItemScreen> createState() => _AdminAddItemScreenState();
}

class _AdminAddItemScreenState extends State<AdminAddItemScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _caloriesController = TextEditingController();
  final TextEditingController _measureController = TextEditingController();
  final List<String> _selectedSizes = [];

  String _selectedSupplementType = 'Protein';
  String _selectedGender = 'Men';
  int? _selectedSubCategoryId;
  List<Map<String, dynamic>> _fetchedCategories = [];
  bool _isLoadingCategories = true;
  final List<File> _imageFiles = [];
  final List<String> _imagePaths = [];
  bool _isUploadingImage = false;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      String storeTypeStr = '';
      if (widget.categoryType == 'Food') storeTypeStr = 'HealthyMeals';
      if (widget.categoryType == 'Supplements') storeTypeStr = 'Supplements';
      if (widget.categoryType == 'Clothes') storeTypeStr = 'Apparel';

      final apiClient = ApiClient();
      final response = await apiClient.dio.get(
        '/api/referencedata/productcategories?storeType=$storeTypeStr',
      );
      if (response.statusCode == 200 && response.data is List) {
        if (!mounted) return;
        setState(() {
          _fetchedCategories = List<Map<String, dynamic>>.from(response.data);
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoadingCategories = false;
      });
      print('Error fetching categories: $e');
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    _descriptionController.dispose();
    _caloriesController.dispose();
    _measureController.dispose();
    super.dispose();
  }

  bool _isLoading = false;

  Future<void> _pickImage() async {
    if (_imageFiles.length >= 3) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Maximum 3 images allowed')));
      return;
    }

    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      if (!mounted) return;
      setState(() {
        _imageFiles.add(File(pickedFile.path));
        _isUploadingImage = true;
      });

      try {
        final driveService = DriveService();
        final url = await driveService.uploadFile(file: _imageFiles.last);
        if (url != null) {
          if (!mounted) return;
          setState(() {
            _imagePaths.add(url);
            _isUploadingImage = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Image uploaded successfully')),
          );
        } else {
          throw Exception('Failed to upload to Drive');
        }
      } catch (e) {
        if (!mounted) return;
        setState(() {
          _imageFiles.removeLast();
          _isUploadingImage = false;
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to upload image: $e')));
      }
    }
  }

  void _removeImage(int index) {
    if (_isUploadingImage) return; // Prevent removing while uploading
    setState(() {
      _imageFiles.removeAt(index);
      if (index < _imagePaths.length) {
        _imagePaths.removeAt(index);
      }
    });
  }

  Future<void> _saveItem() async {
    if (_formKey.currentState!.validate()) {
      if (_imagePaths.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select at least 1 image')),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      String storeTypeStr = '';
      if (widget.categoryType == 'Food') storeTypeStr = 'HealthyMeals';
      if (widget.categoryType == 'Supplements') storeTypeStr = 'Supplements';
      if (widget.categoryType == 'Clothes') storeTypeStr = 'Apparel';

      final priceStr = _priceController.text.trim().replaceAll(
        RegExp(r'[^0-9.]'),
        '',
      );
      final price = double.tryParse(priceStr) ?? 0.0;

      List<Map<String, dynamic>> attributes = [];
      if (widget.categoryType == 'Food') {
        attributes.add({
          "attrName": "Calories",
          "attrValue": _caloriesController.text.trim(),
          "attrUnit": "kcal",
        });
      } else if (widget.categoryType == 'Supplements') {
        attributes.add({
          "attrName": "Type",
          "attrValue": _selectedSupplementType,
        });
        attributes.add({
          "attrName": "Grams",
          "attrValue": _measureController.text.trim(),
          "attrUnit": _selectedSupplementType == 'Protein' ? 'g' : 'ml',
        });
      } else if (widget.categoryType == 'Clothes') {
        for (final size in _selectedSizes) {
          attributes.add({
            "attrName": "Size",
            "attrValue": size,
            "attrUnit": _selectedGender,
          });
        }
      }

      if (_selectedSubCategoryId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a category')),
        );
        return;
      }

      final payload = {
        'name': _nameController.text.trim(),
        'price': price,
        'description': _descriptionController.text.trim().isEmpty
            ? 'No description'
            : _descriptionController.text.trim(),
        'imageUrls': _imagePaths,
        'storeType': storeTypeStr,
        'productCategoryId': _selectedSubCategoryId,
        'attributes': attributes,
      };

      try {
        final apiClient = ApiClient();
        final adminId = Provider.of<AuthProvider>(
          context,
          listen: false,
        ).userId;
        final response = await apiClient.dio.post(
          '/api/Products?adminId=$adminId',
          data: payload,
        );

        if (!mounted) return;

        final dynamic newId =
            response.data['id'] ??
            DateTime.now().millisecondsSinceEpoch % 10000;

        // Return a mock object formatting so the UI can still display it temporarily if needed
        final newItem = {
          'id': newId,
          'name': payload['name'],
          'price': _priceController.text.trim(),
          'description': payload['description'],
          'image': _imagePaths.isNotEmpty ? _imagePaths.first : null,
          'imageUrls': _imagePaths,
          if (widget.categoryType == 'Clothes') ...{
            'sizes': _selectedSizes,
            'calories': _selectedGender,
          },
          if (widget.categoryType == 'Food')
            'calories': _caloriesController.text.trim(),
          if (widget.categoryType == 'Supplements') ...{
            'type': _selectedSupplementType,
            'measure': _measureController.text.trim(),
            'unit': _selectedSupplementType == 'Protein' ? 'g' : 'ml',
          },
          'category': _selectedSubCategoryId,
        };

        Navigator.pop(context, newItem);
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add product: ${e.toString()}')),
        );
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'Add ${widget.categoryType}',
          style: const TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image Picker Placeholder
              Center(
                child: Wrap(
                  spacing: 16.w,
                  runSpacing: 16.h,
                  children: [
                    ...List.generate(_imageFiles.length, (index) {
                      return Stack(
                        children: [
                          Container(
                            height: 100.w,
                            width: 100.w,
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              borderRadius: BorderRadius.circular(15.r),
                              image: DecorationImage(
                                image: FileImage(_imageFiles[index]),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          Positioned(
                            right: 4.w,
                            top: 4.h,
                            child: GestureDetector(
                              onTap: () => _removeImage(index),
                              child: Container(
                                padding: EdgeInsets.all(4.r),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.close,
                                  size: 16.sp,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    }),
                    if (_imageFiles.length < 3)
                      GestureDetector(
                        onTap: _isUploadingImage ? null : _pickImage,
                        child: Container(
                          height: 100.w,
                          width: 100.w,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(15.r),
                          ),
                          child:
                              _isUploadingImage &&
                                  _imageFiles.length ==
                                      _imagePaths
                                          .length // only show spinner if it's currently uploading
                              ? const Center(child: CircularProgressIndicator())
                              : Icon(
                                  Icons.add_a_photo,
                                  size: 30.sp,
                                  color: Colors.grey,
                                ),
                        ),
                      ),
                  ],
                ),
              ),
              SizedBox(height: 24.h),

              _buildCategoryDropdown(),
              SizedBox(height: 16.h),

              _buildLabel('Item Name'),
              _buildTextField(
                controller: _nameController,
                hint: 'Enter item name',
                validator: (v) => v!.isEmpty ? 'Name is required' : null,
              ),
              SizedBox(height: 16.h),

              _buildLabel('Price'),
              _buildTextField(
                controller: _priceController,
                hint: 'Enter item price (e.g., 50\$)',
                validator: (v) => v!.isEmpty ? 'Price is required' : null,
              ),
              SizedBox(height: 16.h),

              _buildLabel('Description'),
              _buildTextField(
                controller: _descriptionController,
                hint: 'Enter item description',
                maxLines: 4,
              ),
              if (widget.categoryType == 'Food') ...[
                SizedBox(height: 16.h),
                _buildLabel('Calories'),
                _buildTextField(
                  controller: _caloriesController,
                  hint: 'Enter calories (e.g. 500)',
                  validator: (v) => v!.isEmpty ? 'Calories is required' : null,
                  keyboardType: TextInputType.number,
                ),
              ],

              if (widget.categoryType == 'Supplements') ...[
                SizedBox(height: 16.h),
                _buildLabel('Type'),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('Protein'),
                        value: 'Protein',
                        groupValue: _selectedSupplementType,
                        activeColor: Custom().colors().lightGreen,
                        onChanged: (value) {
                          setState(() {
                            _selectedSupplementType = value!;
                          });
                        },
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('Supplements'),
                        value: 'Supplements',
                        groupValue: _selectedSupplementType,
                        activeColor: Custom().colors().lightGreen,
                        onChanged: (value) {
                          setState(() {
                            _selectedSupplementType = value!;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                _buildLabel(
                  _selectedSupplementType == 'Protein'
                      ? 'Grams'
                      : 'Volume (ml)',
                ),
                _buildTextField(
                  controller: _measureController,
                  hint: _selectedSupplementType == 'Protein'
                      ? 'Enter grams (e.g. 30)'
                      : 'Enter volume (e.g. 250)',
                  validator: (v) =>
                      v!.isEmpty ? 'This field is required' : null,
                  keyboardType: TextInputType.number,
                ),
              ],

              if (widget.categoryType == 'Clothes') ...[
                SizedBox(height: 16.h),
                _buildLabel('Gender'),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('Men'),
                        value: 'Men',
                        groupValue: _selectedGender,
                        activeColor: Custom().colors().lightGreen,
                        onChanged: (value) {
                          setState(() {
                            _selectedGender = value!;
                          });
                        },
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: const Text('Women'),
                        value: 'Women',
                        groupValue: _selectedGender,
                        activeColor: Custom().colors().lightGreen,
                        onChanged: (value) {
                          setState(() {
                            _selectedGender = value!;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                _buildLabel('Select Sizes'),
                Wrap(
                  spacing: 10.w,
                  children: ['S', 'M', 'L', 'XL', 'XXL'].map((size) {
                    final isSelected = _selectedSizes.contains(size);
                    return ChoiceChip(
                      label: Text(
                        size,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: Custom().colors().lightGreen,
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _selectedSizes.add(size);
                          } else {
                            _selectedSizes.remove(size);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),
              ],
              SizedBox(height: 40.h),

              SizedBox(
                width: double.infinity,
                height: 50.h,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveItem,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Add Item',
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
    String? Function(String?)? validator,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      maxLines: maxLines,
      keyboardType: keyboardType,
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

  Widget _buildCategoryDropdown() {
    if (_isLoadingCategories) {
      return Center(child: CircularProgressIndicator());
    }

    if (_fetchedCategories.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Category'),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(10.r),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<int>(
              value: _selectedSubCategoryId,
              hint: Text(
                'Select Category',
                style: TextStyle(color: Colors.grey[400], fontSize: 14.sp),
              ),
              isExpanded: true,
              icon: Icon(Icons.arrow_drop_down, color: Colors.grey[600]),
              items: _fetchedCategories.map((category) {
                return DropdownMenuItem<int>(
                  value: category['id'],
                  child: Text(
                    category['name'],
                    style: TextStyle(color: Colors.black87, fontSize: 14.sp),
                  ),
                );
              }).toList(),
              onChanged: (newValue) {
                setState(() {
                  _selectedSubCategoryId = newValue;
                });
              },
            ),
          ),
        ),
      ],
    );
  }
}
