class DashboardData {
  // --- FOOD DATA ---
  static const List<Map<String, String>> foodCategories = [
    {'name': 'Vegetables', 'image': 'assets/images/meal1.png'},
    {'name': 'Nuts & Seeds', 'image': 'assets/images/meal2.png'},
    {'name': 'Protein', 'image': 'assets/images/meal3.png'},
    {'name': 'Protein Shakes', 'image': 'assets/images/meal4.png'},
  ];

  static const List<Map<String, dynamic>> foodItems = [
    {
      'id': 12,
      'name': 'French Green Salad',
      'description':
          'Grilled chicken salad with quail eggs and fresh greens. This light yet filling salad is packed with protein and vitamins. The quail adds a unique twist to the classic greens, making it a perfect lunch option for health-conscious individuals.',
      'calories': '125 kcal',
      'price': '200 EGP',
      'image': 'assets/images/green salad.png',
      'rating': 4.0,
      'type': 'food',
    },
    {
      'id': 13,
      'name': 'Green Veggies',
      'description':
          'A clean, high-protein meal of chicken and rice. This meal prep staple combines lean grilled chicken breast with fluffy white rice and steamed broccoli. It provides sustained energy and muscle-building amino acids without excess fat.',
      'calories': '715 kcal',
      'price': '350 EGP',
      'image': 'assets/images/green veggies.png',
      'rating': 4.5,
      'type': 'food',
    },
    {
      'id': 14,
      'name': 'Mixed Salad',
      'description':
          'Fresh mixed vegetables with dressing. Enjoy a vibrant mix of cherry tomatoes, cucumbers, bell peppers, and lettuce tossed in a light vinaigrette. It is a refreshing side dish or a light snack that aids hydration and provides essential fiber.',
      'calories': '221 kcal',
      'price': '150 EGP',
      'image': 'assets/images/mixed salad.png',
      'rating': 4.2,
      'type': 'food',
    },
    {
      'id': 15,
      'name': 'Salmon Salad',
      'description':
          'Fresh salmon fillet on a bed of greens. Rich in omega-3 fatty acids and high-quality protein.',
      'calories': '450 kcal',
      'price': '400 EGP',
      'image': 'assets/images/meal1.png', // Reusing asset for demo
      'rating': 4.8,
      'type': 'food',
    },
  ];

  // --- SUPPLEMENTS DATA ---
  static const List<Map<String, String>> supplementCategories = [
    {'name': 'Protein', 'image': 'assets/images/supplement1.png'},
    {'name': 'Creatine', 'image': 'assets/images/supplement2.png'},
    {'name': 'Supplements', 'image': 'assets/images/supplement3.png'},
    {'name': 'Energy Drinks', 'image': 'assets/images/supplement4.png'},
  ];

  static const List<Map<String, dynamic>> supplementItems = [
    {
      'id': 16,
      'name': 'Whey Protein',
      'description':
          'High-quality whey protein designed to support muscle recovery, strength, and growth. Each serving delivers 24g of premium protein with 5.5g of BCAAs. It mixes instantly and tastes great, making it the perfect post-workout partner.',
      'calories':
          '25g', // Using calories field for main stat (e.g., protein content)
      'price': '1200 EGP',
      'image': 'assets/images/whey protien.png',
      'rating': 4.8,
      'type': 'supplement',
    },
    {
      'id': 17,
      'name': 'Creatine Monohydrate',
      'description':
          'Pure creatine monohydrate for increased strength and muscle performance. This micronized formula ensures fast absorption and supports ATP recycling for explosive power during your workouts. Unflavored and easy to stack.',
      'calories': '30g',
      'price': '950 EGP',
      'image': 'assets/images/Creatine Monohydrat.png',
      'rating': 4.9,
      'type': 'supplement',
    },
    {
      'id': 18,
      'name': 'Vitamin D3',
      'description':
          'Essential vitamin for bone health and immune system support. Vitamin D3 aids in calcium absorption and supports muscle function. This high-potency liquid formula is easy to consume and perfect for maintaining optimal levels year-round.',
      'calories': '60ml',
      'price': '450 EGP',
      'image': 'assets/images/vitamin v3.png',
      'rating': 4.7,
      'type': 'supplement',
    },
  ];

  // --- CLOTHES DATA ---
  static const List<Map<String, String>> clothesCategories = [
    {'name': 'T-Shirts', 'image': 'assets/images/t-shirt.png'},
    {'name': 'Pants', 'image': 'assets/images/pants.png'},
    {'name': 'Shoes', 'image': 'assets/images/shoes.png'},
    {'name': 'Shorts', 'image': 'assets/images/shorts.png'},
  ];

  static const List<Map<String, dynamic>> clothesItems = [
    {
      'id': 19,
      'name': 'T-Shirt Nike Orange',
      'description':
          'Orange t-shirt with a bold Nike Swoosh logo filled with a colorful, geometric pattern.',
      'calories': 'Men', // Using calories field for gender/category
      'price': '250 EGP',
      'image': 'assets/images/nike1.png',
      'rating': 4.6,
      'type': 'clothes',
      'sizes': ['S', 'M', 'L', 'XXL'],
    },
    {
      'id': 20,
      'name': 'T-Shirt Nike Blue',
      'description': 'Blue t-shirt with a classic Nike logo.',
      'calories': 'Women',
      'price': '250 EGP',
      'image': 'assets/images/nike2.png',
      'rating': 4.5,
      'type': 'clothes',
      'sizes': ['S', 'M', 'L', 'XXL'],
    },
  ];

  // --- EXERCISE DATA ---
  static const List<Map<String, String>> exerciseCategories = [
    {'name': 'Chest', 'icon': 'assets/images/chest.png'},
    {'name': 'Back', 'icon': 'assets/images/back.png'},
    {'name': 'Shoulders', 'icon': 'assets/images/shoulder.png'},
    {'name': 'Arms', 'icon': 'assets/images/arms.png'},
    {'name': 'Abs', 'icon': 'assets/images/abs.png'},
    {'name': 'Legs', 'icon': 'assets/images/legs.png'},
  ];

  static Map<String, List<Map<String, dynamic>>> exerciseItems = {
    'Chest': [
      {
        'name': 'Incline Bench press',
        'image': 'assets/images/ex1.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Upper Chest. The incline bench press is a variation of the bench press and an exercise used to build the muscles of the chest. The shoulders and triceps will be indirectly involved as well.',
      },
      {
        'name': 'Incline Dumbbell press',
        'image': 'assets/images/ex2.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Upper Chest. A compound exercise that primarily targets the upper chest, shoulders, and triceps.',
      },
      {
        'name': 'Barbell Flat Bench Press',
        'image': 'assets/images/ex3.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Middle Chest. A classic compound exercise for building overall chest mass and strength.',
      },
      {
        'name': 'Dumbbell Flat Press',
        'image': 'assets/images/ex4.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Middle Chest. Similar to the barbell press but allows for a greater range of motion and individual arm isolation.',
      },
      {
        'name': 'Decline Bench Press',
        'image': 'assets/images/ex5.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Lower Chest. Targets the lower pectoral muscles and reduces stress on the shoulders.',
      },
      {
        'name': 'High Cable Crossover',
        'image': 'assets/images/ex6.png',
        'videoUrl': '...',
        'anatomy': ['assets/images/chest.png', 'assets/images/trai.png'],
        'description':
            'Lower Chest. An isolation exercise that provides constant tension on the chest muscles.',
      },
    ],
    'Back': [],
    'Shoulders': [],
    'Arms': [],
    'Abs': [],
    'Legs': [],
  };
}
