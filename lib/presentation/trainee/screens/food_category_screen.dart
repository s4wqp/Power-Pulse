import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';

class FoodCategoryScreen extends StatelessWidget {
  const FoodCategoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Custom().mainText('Food category', fontSize: 22),
                  const SizedBox(height: 20),
                  _buildCategories(),
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
    return ClipPath(
      clipper: HeaderClipper(),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/bg_appbar.png'),
            fit: BoxFit.cover,
          ),
        ),
        padding: const EdgeInsets.only(top: 50, left: 16, right: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search for a product',
                    hintStyle: const TextStyle(
                      color: Colors.black45,
                      fontSize: 16,
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  style: const TextStyle(color: Colors.black87, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategories() {
    final categories = [
      {'name': 'Vegetables', 'image': 'assets/images/meal1.png'},
      {'name': 'Nuts & Seeds', 'image': 'assets/images/meal2.png'},
      {'name': 'Protein', 'image': 'assets/images/meal3.png'},
      {'name': 'Protein Shakes', 'image': 'assets/images/meal4.png'},
      {'name': 'Supplements', 'image': 'assets/images/supplement1.png'},
      {'name': 'Supplements', 'image': 'assets/images/supplement2.png'},
      {'name': 'Supplements', 'image': 'assets/images/supplement3.png'},
      {'name': 'Supplements', 'image': 'assets/images/supplement4.png'},
      {'name': 'Clothes', 'image': 'assets/images/t-shirt.png'},
      {'name': 'Clothes', 'image': 'assets/images/pants.png'},
      {'name': 'Clothes', 'image': 'assets/images/shorts.png'},
      {'name': 'Clothes', 'image': 'assets/images/shoes.png'},
    ];

    return SizedBox(
      height: 110,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 24),
        itemBuilder: (context, index) {
          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.transparent, // Or a subtle border if needed
                    width: 2,
                  ),
                ),
                child: CircleAvatar(
                  radius: 32,
                  backgroundImage: AssetImage(categories[index]['image']!),
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                categories[index]['name']!,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFoodList(BuildContext context) {
    final foods = [
      {
        'id': 1,
        'name': 'French Green Salad',
        'description':
            'Grilled chicken salad with quail eggs and fresh greens.',
        'calories': '125 kcal',
        'price': '200 EGP',
        'image': 'assets/images/green salad.png',
        'rating': 4.0,
      },
      {
        'id': 2,
        'name': 'Green Veggies',
        'description': 'A clean, high-protein meal of chicken and rice',
        'calories': '715 kcal',
        'price': '350 EGP',
        'image': 'assets/images/green veggies.png',
        'rating': 4.5,
      },
      {
        'id': 3,
        'name': 'Mixed Salad',
        'description': 'Fresh mixed vegetables with dressing',
        'calories': '221 kcal',
        'price': '150 EGP',
        'image': 'assets/images/mixed salad.png',
        'rating': 4.2,
      },
      {
        'id': 4,
        'name': 'Whey Protein',
        'description': 'High quality whey protein for muscle recovery.',
        'calories': '120 kcal',
        'price': '800 EGP',
        'image': 'assets/images/whey protien.png',
        'rating': 4.8,
      },
      {
        'id': 5,
        'name': 'Creatine Monohydrate',
        'description': 'Pure creatine for performance boost.',
        'calories': '0 kcal',
        'price': '600 EGP',
        'image': 'assets/images/Creatine Monohydrat.png',
        'rating': 4.9,
      },
      {
        'id': 6,
        'name': 'Nike Running Shoes',
        'description': 'Comfortable running shoes for daily training.',
        'calories': null,
        'price': '3500 EGP',
        'image': 'assets/images/nike shoes1.png',
        'rating': 4.7,
      },
      {
        'id': 7,
        'name': 'Training Shorts',
        'description': 'Breathable fabric shorts for gym workouts.',
        'calories': null,
        'price': '450 EGP',
        'image': 'assets/images/shorts.png',
        'rating': 4.5,
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: foods.length,
      separatorBuilder: (_, __) => const SizedBox(height: 30),
      itemBuilder: (context, index) {
        return _buildFoodCard(context, foods[index]);
      },
    );
  }

  Widget _buildFoodCard(BuildContext context, Map<String, dynamic> food) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          Routing.foodDetailsScreen,
          arguments: food,
        );
      },
      child: SizedBox(
        height: 220, // Increased height
        child: Stack(
          children: [
            // Card Background
            Positioned(
              top: 30,
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Calorie Badge
                      if (food['calories'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Custom().colors().caloriesColor.withOpacity(
                              0.6,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.local_fire_department_outlined,
                                size: 16,
                                color: Colors.black87,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                food['calories'],
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                      if (food['calories'] != null) const SizedBox(height: 16),
                      // Title
                      SizedBox(
                        width: 200,
                        child: Text(
                          food['name'],
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Description
                      SizedBox(
                        width: 180,
                        child: Text(
                          food['description'],
                          style: TextStyle(
                            fontSize: 11,
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

            // Image
            Positioned(
              right: 0,
              top: 0,
              child: Hero(
                tag: food['name'],
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(2, 4),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 65,
                    backgroundColor: Colors.transparent,
                    backgroundImage: AssetImage(food['image']),
                  ),
                ),
              ),
            ),

            // Price
            Positioned(
              bottom: 20,
              right: 20,
              child: Text(
                food['price'],
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Custom().colors().lightGreen,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HeaderClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    var path = Path();
    path.lineTo(0, size.height - 30);

    var firstControlPoint = Offset(size.width / 4, size.height);
    var firstEndPoint = Offset(size.width / 2.25, size.height - 30);
    path.quadraticBezierTo(
      firstControlPoint.dx,
      firstControlPoint.dy,
      firstEndPoint.dx,
      firstEndPoint.dy,
    );

    var secondControlPoint = Offset(
      size.width - (size.width / 3.25),
      size.height - 65,
    );
    var secondEndPoint = Offset(size.width, size.height - 40);
    path.quadraticBezierTo(
      secondControlPoint.dx,
      secondControlPoint.dy,
      secondEndPoint.dx,
      secondEndPoint.dy,
    );

    path.lineTo(size.width, size.height - 40);
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
