import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';

class AdminCategoryScreen extends StatefulWidget {
  final String categoryType;

  const AdminCategoryScreen({super.key, required this.categoryType});

  @override
  State<AdminCategoryScreen> createState() => _AdminCategoryScreenState();
}

class _AdminCategoryScreenState extends State<AdminCategoryScreen> {
  // Mock Data
  List<Map<String, dynamic>> items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    try {
      String storeType = 'HealthyMeals';
      if (widget.categoryType == 'Supplements') storeType = 'Supplements';
      if (widget.categoryType == 'Clothes') storeType = 'Apparel';

      final apiClient = ApiClient();
      final response = await apiClient.dio.get(
        '/api/Products?storeType=$storeType',
      );

      if (response.statusCode == 200 && response.data is List) {
        final List<dynamic> data = response.data;
        if (mounted) {
          setState(() {
            items = data.map((json) {
              return {
                'id': json['id'] ?? 0,
                'name': json['name'] ?? 'Unknown',
                'price': '${json['price'] ?? 0} EGP',
                'image':
                    json['imageUrls'] != null &&
                        json['imageUrls'] is List &&
                        json['imageUrls'].isNotEmpty
                    ? json['imageUrls'][0]
                    : null,
                'calories': json['calories']?.toString() ?? '',
                'measure': json['measure']?.toString(),
                'unit': json['unit']?.toString() ?? '',
                'type': json['type']?.toString() ?? '',
              };
            }).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _deleteProduct(int index) async {
    final item = items[index];
    final productId = item['id'];
    if (productId == 0) return;

    try {
      final adminId = Provider.of<AuthProvider>(context, listen: false).userId;
      final response = await ApiClient().dio.delete(
        '/api/Products/$productId?adminId=$adminId',
      );
      if (response.statusCode == 200 || response.statusCode == 204) {
        if (mounted) {
          setState(() {
            items.removeAt(index);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Item deleted successfully')),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete item: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          '${widget.categoryType} Management',
          style: const TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : items.isEmpty
          ? const Center(child: Text('No items found'))
          : ListView.builder(
              padding: EdgeInsets.all(16.w),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return Card(
                  margin: EdgeInsets.only(bottom: 16.h),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15.r),
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.all(12.w),
                    leading: Container(
                      width: 60.w,
                      height: 60.w,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10.r),
                        child:
                            item['image'] != null &&
                                item['image'].toString().startsWith('http')
                            ? Image.network(
                                item['image'],
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(
                                      Icons.image_not_supported,
                                      color: Colors.grey,
                                    ),
                              )
                            : Image.asset(
                                item['image'] ??
                                    'assets/images/placeholder.png',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(
                                      Icons.image_not_supported,
                                      color: Colors.grey,
                                    ),
                              ),
                      ),
                    ),
                    title: Text(
                      item['name'],
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['price'],
                          style: TextStyle(
                            fontSize: 16.sp,
                            color: Custom().colors().lightGreen,
                          ),
                        ),
                        if (widget.categoryType == 'Food')
                          Text(
                            'Calories: ${item['calories']}${RegExp(r"^\\d+$").hasMatch(item['calories'] ?? '') ? ' kcal' : ''}',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey,
                            ),
                          ),
                        if (widget.categoryType == 'Supplements')
                          Text(
                            item['measure'] != null && item['measure'] != ''
                                ? '${item['type'] ?? 'Supplement'}: ${item['measure']}${item['unit']}'
                                : '${item['calories']}', // Fallback
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey,
                            ),
                          ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Delete Item'),
                            content: const Text(
                              'Are you sure you want to delete this item?',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  _deleteProduct(index);
                                },
                                child: const Text(
                                  'Delete',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.pushNamed(
            context,
            Routing.adminAddItemScreen,
            arguments: widget.categoryType,
          );

          if (result != null) {
            _isLoading = true;
            setState(() {});
            _fetchProducts();
          }
        },
        backgroundColor: Custom().colors().lightGreen,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
