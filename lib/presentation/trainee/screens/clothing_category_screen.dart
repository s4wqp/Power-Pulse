import 'dart:math';
import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/network/api_client.dart';

class ClothingCategoryScreen extends StatefulWidget {
  const ClothingCategoryScreen({super.key});

  @override
  State<ClothingCategoryScreen> createState() => _ClothingCategoryScreenState();
}

class _ClothingCategoryScreenState extends State<ClothingCategoryScreen> {
  final List<Map<String, String>> categories = [
    {'name': 'T-Shirts', 'image': 'assets/images/t-shirt.png'},
    {'name': 'Pants', 'image': 'assets/images/pants.png'},
    {'name': 'Shoes', 'image': 'assets/images/shoes.png'},
    {'name': 'Short', 'image': 'assets/images/shorts.png'},
  ];

  final List<Map<String, dynamic>> _mockFallbackProducts = [
    {
      'id': 8,
      'name': 'T-Shirt Nike',
      'collection': "Men's collection",
      'price': '250 EGP',
      'image': 'assets/images/nike1.png',
      'isFavorite': false,
      'type': 'clothes',
      'rating': 4.5,
      'description':
          'Orange t-shirt with a bold Nike Swoosh logo filled with a colorful, geometric pattern. The soft cotton fabric ensures all-day comfort, while the vibrant design adds a modern touch to your casual wardrobe.',
      'calories': 'Men', // Using calories field for badge text
    },
    {
      'id': 9,
      'name': 'T-Shirt Nike',
      'collection': "women's collection",
      'price': '250 EGP',
      'image': 'assets/images/nike2.png',
      'isFavorite': false,
      'type': 'clothes',
      'rating': 4.8,
      'description':
          'Stylish and breathable fabric for active women. This top features moisture-wicking technology to keep you dry and comfortable. The tailored fit ensures a flattering look whether you are at the gym or running errands.',
      'calories': 'Women',
    },
    {
      'id': 10,
      'name': 'Nike Air Force',
      'collection': "Men's Shoes",
      'price': '4500 EGP',
      'image': 'assets/images/nike shoes1.png',
      'isFavorite': false,
      'type': 'clothes',
      'rating': 4.9,
      'description':
          'Classic style meets modern comfort in these iconic sneakers. Featuring premium leather upper and Air-Sole unit for cushioning, these shoes offer timeless style and all-day comfort for casual wear or light activities.',
      'calories': "Men's Shoes",
    },
    {
      'id': 11,
      'name': 'Nike Zoom',
      'collection': "Running Shoes",
      'price': '3200 EGP',
      'image': 'assets/images/nike shoes2.png',
      'isFavorite': true,
      'type': 'clothes',
      'rating': 4.7,
      'description':
          'Designed for speed and responsiveness on every run. The Zoom Air unit delivers a propulsive feel, while the engineered mesh upper maps breathability where you need it most. Experience a lightweight ride with durable traction.',
      'calories': 'Running Shoes',
    },
  ];

  bool _isLoading = true;
  List<Map<String, dynamic>> _fetchedItems = [];
  bool _isLoadingCategories = true;
  List<Map<String, dynamic>> _fetchedCategories = [];
  String _selectedCategoryName = 'All';

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
        '/api/referencedata/productcategories?storeType=Apparel',
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
        '/api/Products?storeType=Apparel',
      );

      if (response.statusCode == 200 && response.data is List) {
        final List<dynamic> data = response.data;
        _fetchedItems = data.map((json) {
          int id = json['id'] ?? 0;
          List<String> sizes = [];
          String gender = 'Apparel';
          if (json['attributes'] != null && json['attributes'] is List) {
            for (var attr in json['attributes']) {
              if (attr['attrName'] == 'Size') {
                sizes.add(attr['attrValue']?.toString() ?? '');
                if (attr['attrUnit'] != null &&
                    attr['attrUnit'].toString().isNotEmpty) {
                  gender = attr['attrUnit'].toString();
                }
              }
            }
          }

          // Generate a repeatable random rating between 4.0 and 5.0
          final random = Random(id);
          double rating = 4.0 + (random.nextInt(11) / 10.0);

          return {
            'id': id,
            'name': json['name'] ?? 'Unknown',
            'collection': json['productCategoryName'] ?? "Apparel",
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
            'isFavorite': false,
            'type': 'clothes',
            'rating': rating,
            'description': json['description'] ?? 'No description available.',
            'calories': gender,
            'sizes': sizes,
          };
        }).toList();
      } else {
        _fetchedItems = List.from(_mockFallbackProducts);
      }
    } catch (e) {
      print('Error fetching products: $e');
      _fetchedItems = List.from(_mockFallbackProducts);
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
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 20.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Custom().mainText('Clothing category', fontSize: 22.sp),
                  SizedBox(height: 20.h),
                  _buildCategories(),
                  SizedBox(height: 25.h),
                  _buildMostPopularHeader(),
                  SizedBox(height: 15.h),
                  _buildProductGrid(),
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
          'assets/images/bg_appbar3.png',
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
        height: 100.h,
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_fetchedCategories.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 100.h,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _fetchedCategories.length,
        separatorBuilder: (_, __) => SizedBox(width: 34.5.w),
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
                  height: 60.r,
                  width: 60.r,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected
                        ? Custom().colors().lightGreen
                        : const Color(0xFF3A4968),
                    border: Border.all(
                      color: isSelected
                          ? Custom().colors().lightGreen
                          : Colors.transparent,
                      width: 2.w,
                    ),
                  ),
                  child: ClipOval(
                    child: index == 0
                        ? Image.asset(
                            'assets/images/clothes.png',
                            fit: BoxFit.cover,
                            width: 60.r,
                            height: 60.r,
                          )
                        : Image.asset(
                            _fetchedCategories[index]['name']
                                    .toString()
                                    .toLowerCase()
                                    .contains('shirt')
                                ? 'assets/images/t-shirt.png'
                                : _fetchedCategories[index]['name']
                                      .toString()
                                      .toLowerCase()
                                      .contains('pant')
                                ? 'assets/images/pants.png'
                                : _fetchedCategories[index]['name']
                                      .toString()
                                      .toLowerCase()
                                      .contains('shoe')
                                ? 'assets/images/shoes.png'
                                : _fetchedCategories[index]['name']
                                      .toString()
                                      .toLowerCase()
                                      .contains('short')
                                ? 'assets/images/shorts.png'
                                : 'assets/images/t-shirt.png',
                            fit: BoxFit.cover,
                            width: 60.r,
                            height: 60.r,
                          ),
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  _fetchedCategories[index]['name'],
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
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

  Widget _buildMostPopularHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Most Popular',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: Colors.grey[400],
          ),
        ),
        Row(
          children: [
            Text(
              'Sort by',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
            Icon(Icons.keyboard_arrow_down, size: 20.sp),
          ],
        ),
      ],
    );
  }

  Widget _buildProductGrid() {
    if (_isLoading) {
      return Padding(
        padding: EdgeInsets.only(top: 50.h),
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    final List<Map<String, dynamic>> displayedItems =
        _selectedCategoryName == 'All'
        ? _fetchedItems
        : _fetchedItems
              .where((i) => i['collection'] == _selectedCategoryName)
              .toList();

    if (displayedItems.isEmpty) {
      return Padding(
        padding: EdgeInsets.only(top: 50.h),
        child: const Center(
          child: Text("No clothing available for this category."),
        ),
      );
    }

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.58, // Increased height per card
        crossAxisSpacing: 15.w,
        mainAxisSpacing: 15.h,
      ),
      itemCount: displayedItems.length,
      itemBuilder: (context, index) {
        return _buildProductCard(displayedItems[index]);
      },
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          Routing.genericDetailsScreen,
          arguments: product,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15.r),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
          border: Border.all(color: Colors.grey.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(15.r),
                        topRight: Radius.circular(15.r),
                      ),
                      color: Colors.grey[100],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(15.r),
                        topRight: Radius.circular(15.r),
                      ),
                      child: product['image'].startsWith('http')
                          ? Image.network(
                              product['image'],
                              fit: BoxFit.cover,
                              errorBuilder: (c, o, s) => Container(
                                color: Colors.grey[200],
                                child: Icon(
                                  Icons.image_not_supported,
                                  color: Colors.grey,
                                ),
                              ),
                            )
                          : Image.asset(
                              product['image'],
                              fit: BoxFit.cover,
                              errorBuilder: (c, o, s) => Container(
                                color: Colors.grey[200],
                                child: Icon(
                                  Icons.image_not_supported,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                    ),
                  ),
                  if (product['calories'] == 'Men' ||
                      product['calories'] == 'Women')
                    Positioned(
                      top: 10.h,
                      right: 10.w,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 4.h,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Text(
                          product['calories'],
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Info Section
            Expanded(
              flex: 2,
              child: Padding(
                padding: EdgeInsets.all(10.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product['name'],
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          product['collection'],
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey,
                            fontWeight: FontWeight.w400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        product['price'],
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: Custom().colors().clothesColor,
                        ),
                      ),
                    ),
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
