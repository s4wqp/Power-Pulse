import 'dart:math';
import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:power_pulse/data/network/api_client.dart';

class GenericCategoryScreen extends StatefulWidget {
  final String pageTitle;
  final String appBarImage; // Added generic generic app bar image
  final List<Map<String, String>> categories;
  final List<Map<String, dynamic>> items;
  final String storeType;

  const GenericCategoryScreen({
    super.key,
    required this.pageTitle,
    required this.appBarImage,
    required this.categories,
    required this.items,
    required this.storeType,
  });

  @override
  State<GenericCategoryScreen> createState() => _GenericCategoryScreenState();
}

class _GenericCategoryScreenState extends State<GenericCategoryScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _fetchedItems = [];
  bool _isLoadingCategories = true;
  List<Map<String, dynamic>> _fetchedCategories = [];
  String _selectedCategoryName = 'All';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _fetchProducts();
  }

  Future<void> _fetchCategories() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.dio.get(
        '/api/referencedata/productcategories?storeType=${widget.storeType}',
      );
      if (response.statusCode == 200 && response.data is List) {
        if (!mounted) return;
        setState(() {
          _fetchedCategories = [
            {'id': 0, 'name': 'All'},
            ...List<Map<String, dynamic>>.from(response.data),
          ];
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoadingCategories = false);
    }
  }

  Future<void> _fetchProducts() async {
    try {
      final apiClient = ApiClient();
      final response = await apiClient.dio.get(
        '/api/Products?storeType=${widget.storeType}',
      );

      if (response.statusCode == 200 && response.data is List) {
        final List<dynamic> data = response.data;
        _fetchedItems = data.map((json) {
          String badgeText = '';
          String detailsBadgeText = '';
          String typeAttr = '';
          String gramAttr = '';
          if (json['attributes'] != null && json['attributes'] is List) {
            for (var attr in json['attributes']) {
              if (attr['attrName'] == 'Calories') {
                badgeText = '${attr['attrValue']} ${attr['attrUnit'] ?? ''}'
                    .trim();
              } else if (attr['attrName'] == 'Type') {
                typeAttr = attr['attrValue']; // Protein, etc.
              } else if (attr['attrName'] == 'Grams') {
                gramAttr = '${attr['attrValue']} ${attr['attrUnit'] ?? ''}'
                    .trim();
              }
            }

            if (widget.storeType == 'Supplements') {
              if (typeAttr.isNotEmpty && gramAttr.isNotEmpty) {
                badgeText = typeAttr;
                detailsBadgeText = '$typeAttr ($gramAttr)';
              } else if (typeAttr.isNotEmpty) {
                badgeText = typeAttr;
                detailsBadgeText = typeAttr;
              } else if (gramAttr.isNotEmpty) {
                badgeText = gramAttr;
                detailsBadgeText = gramAttr;
              }
            }
          }

          if (badgeText.isEmpty) {
            badgeText = widget.storeType == 'HealthyMeals'
                ? 'Meal'
                : 'Supplement';
          }
          if (detailsBadgeText.isEmpty) {
            detailsBadgeText = badgeText;
          }

          int id = json['id'] ?? 0;
          String type = widget.storeType == 'HealthyMeals'
              ? 'food'
              : 'supplement';

          // Generate a repeatable random rating between 4.0 and 5.0
          final random = Random(id);
          double rating = 4.0 + (random.nextInt(11) / 10.0);

          return {
            'id': id,
            'name': json['name'] ?? 'Unknown',
            'calories': badgeText,
            'detailsBadge': detailsBadgeText,
            'price': '${json['price'] ?? 0} EGP',
            'image':
                json['imageUrls'] != null &&
                    json['imageUrls'] is List &&
                    json['imageUrls'].isNotEmpty
                ? json['imageUrls'][0]
                : 'assets/images/Power_Pulse.png',
            'imagesList':
                json['imageUrls'] != null &&
                    json['imageUrls'] is List &&
                    json['imageUrls'].isNotEmpty
                ? List<String>.from(json['imageUrls'])
                : ['assets/images/Power_Pulse.png'],
            'description': json['description'] ?? 'No description available',
            'type': type,
            'isFavorite': false,
            'subCategory': json['productCategoryName'] ?? '',
            'rating': rating,
          };
        }).toList();
      } else {
        _fetchedItems = List.from(widget.items);
      }
    } catch (e) {
      print('Error fetching products: $e');
      _fetchedItems = List.from(widget.items);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false,
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16.0.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Custom().mainText(widget.pageTitle, fontSize: 22.sp),
                  SizedBox(height: 20.h),
                  _buildCategories(),
                  SizedBox(height: 10.h),
                  _buildFoodList(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Stack(
      children: [
        Image.asset(
          widget.appBarImage,
          height: 120.h,
          width: double.infinity,
          fit: BoxFit.cover,
        ),
        Positioned(
          top: 50.h,
          left: 16.w,
          right: 16.w,
          child: Row(
            children: [
              IconButton(
                icon: Icon(Icons.arrow_back, color: Colors.white, size: 28.sp),
                onPressed: () => Navigator.pop(context),
              ),
              Expanded(
                child: TextField(
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value.toLowerCase();
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Search for a product',
                    hintStyle: TextStyle(
                      color: Custom().colors().search,
                      fontSize: 12.sp,
                    ),
                    prefixIcon: Icon(
                      Icons.search,
                      color: Custom().colors().search,
                      size: 20.sp,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Custom().colors().bgContainer.withOpacity(0.63),
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 0,
                      horizontal: 8.w,
                    ),
                  ),
                  style: TextStyle(
                    color: Custom().colors().black,
                    fontSize: 12.sp,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategories() {
    if (_isLoadingCategories) {
      return SizedBox(
        height: 125.h,
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_fetchedCategories.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 125.h,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _fetchedCategories.length,
        separatorBuilder: (_, __) => SizedBox(width: 24.w),
        itemBuilder: (context, index) {
          final isSelected =
              _selectedCategoryName == _fetchedCategories[index]['name'];
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategoryName = _fetchedCategories[index]['name'];
              });
            },
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.all(2.w),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? Custom().colors().lightGreen
                          : Colors.transparent,
                      width: 2.w,
                    ),
                  ),
                  child: index == 0
                      ? CircleAvatar(
                          radius: 28.r,
                          backgroundColor: Colors.white,
                          backgroundImage: AssetImage(
                            widget.storeType == 'HealthyMeals'
                                ? 'assets/images/food.png'
                                : 'assets/images/supplement.png',
                          ),
                        )
                      : CircleAvatar(
                          radius: 28.r,
                          backgroundColor: Colors.white,
                          backgroundImage: AssetImage(
                            widget.storeType == 'HealthyMeals'
                                ? 'assets/images/meal${index > 0 && index <= 4 ? index : 1}.png'
                                : 'assets/images/supplement${index > 0 && index <= 4 ? index : 1}.png',
                          ),
                        ),
                ),
                SizedBox(height: 8.h),
                Text(
                  _fetchedCategories[index]['name'],
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? Custom().colors().lightGreen
                        : Colors.black87,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFoodList(BuildContext context) {
    if (_isLoading) {
      return Padding(
        padding: EdgeInsets.only(top: 50.h),
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    List<Map<String, dynamic>> displayedItems = _selectedCategoryName == 'All'
        ? _fetchedItems
        : _fetchedItems
              .where((i) => i['subCategory'] == _selectedCategoryName)
              .toList();

    if (_searchQuery.isNotEmpty) {
      displayedItems = displayedItems.where((item) {
        final name = (item['name'] as String? ?? '').toLowerCase();
        final desc = (item['description'] as String? ?? '').toLowerCase();
        return name.contains(_searchQuery) || desc.contains(_searchQuery);
      }).toList();
    }

    if (displayedItems.isEmpty) {
      return Padding(
        padding: EdgeInsets.only(top: 50.h),
        child: const Center(
          child: Text("No items available for this category."),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: displayedItems.length,
      separatorBuilder: (_, __) => SizedBox(height: 30.h),
      itemBuilder: (context, index) {
        return _buildFoodCard(context, displayedItems[index]);
      },
    );
  }

  Widget _buildFoodCard(BuildContext context, Map<String, dynamic> item) {
    Color badgeColor;
    Color textColor = Colors.white;

    switch (item['type']) {
      case 'food':
        badgeColor = Custom().colors().lightGreen;
        textColor = Colors.white;
        break;
      case 'supplement':
        // 'subblement' in user request, matching generic 'supplement' type here
        badgeColor = Custom().colors().gramsColor;
        textColor = Colors.white;
        break;
      case 'clothes':
        badgeColor = Custom().colors().clothesPrice;
        textColor = Colors.white;
        break;
      default:
        badgeColor = Custom().colors().lightGreen;
    }

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          Routing.genericDetailsScreen,
          arguments: item,
        );
      },
      child: SizedBox(
        height: 220.h, // Increased height to prevent overflow
        child: Stack(
          children: [
            // Card Background
            Positioned(
              top: 30.h,
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24.r),
                  border: Border.all(
                    color: badgeColor.withOpacity(0.5),
                    width: 1.w,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.12),
                      blurRadius: 20.r,
                      offset: Offset(0, 4.h),
                    ),
                  ],
                ),
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 16.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge (Calories or Type)
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          color: badgeColor,
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (item['type'] == 'food' ||
                                item['type'] == 'supplement')
                              Icon(
                                Icons.local_fire_department_outlined,
                                size: 16.sp,
                                color: textColor,
                              ),
                            if (item['type'] == 'food' ||
                                item['type'] == 'supplement')
                              SizedBox(width: 4.w),
                            Text(
                              item['calories'], // This field holds the badge text
                              style: TextStyle(
                                fontSize: 13.sp,
                                fontWeight: FontWeight.bold,
                                color: textColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 12.h),
                      // Title
                      SizedBox(
                        width: 200.w,
                        child: Text(
                          item['name'],
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      SizedBox(height: 6.h),
                      // Description
                      SizedBox(
                        width: 180.w,
                        child: Text(
                          item['description'],
                          style: TextStyle(
                            fontSize: 11.sp,
                            color: Colors.grey[600],
                            height: 1.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            Positioned(
              right: 0,
              top: 0,
              child: Hero(
                tag: '${item['name']}_${item['id']}',
                child: Container(
                  child: CircleAvatar(
                    radius: 65.r,
                    backgroundColor: Colors.transparent,
                    backgroundImage: item['image'].startsWith('http')
                        ? NetworkImage(item['image']) as ImageProvider
                        : AssetImage(item['image']),
                  ),
                ),
              ),
            ),

            // Price
            Positioned(
              bottom: 20.h,
              right: 20.w,
              child: Text(
                item['price'],
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: badgeColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
