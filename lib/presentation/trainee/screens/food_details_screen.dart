import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/cart_service.dart';
import 'package:power_pulse/routing.dart';

class FoodDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> food;

  const FoodDetailsScreen({super.key, required this.food});

  @override
  State<FoodDetailsScreen> createState() => _FoodDetailsScreenState();
}

class _FoodDetailsScreenState extends State<FoodDetailsScreen> {
  int quantity = 1;

  String _calculateTotalPrice() {
    try {
      final priceStr = widget.food['price'].toString();
      final numericPart = priceStr.replaceAll(RegExp(r'[^0-9.]'), '');
      if (numericPart.isEmpty) return priceStr;
      final price = double.parse(numericPart);
      final total = price * quantity;
      return '${total % 1 == 0 ? total.toInt() : total.toStringAsFixed(2)} EGP';
    } catch (_) {
      return widget.food['price'].toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black, size: 28),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: Column(
        children: [
          const SizedBox(height: 100), // Space for app bar
          Center(
            child: Hero(
              tag: widget.food['name'],
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 130,
                  backgroundColor: Colors.transparent,
                  backgroundImage: AssetImage(widget.food['image']),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDot(true),
              const SizedBox(width: 8),
              _buildDot(false),
              const SizedBox(width: 8),
              _buildDot(false),
            ],
          ),
          const SizedBox(height: 30),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(40),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.15),
                  blurRadius: 30,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        widget.food['name'],
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Custom().colors().caloriesColor.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.local_fire_department_outlined,
                            size: 18,
                            color: Colors.black87,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            widget.food['calories'],
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                RichText(
                  text: TextSpan(
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                      height: 1.5,
                    ),
                    children: [
                      TextSpan(text: widget.food['description']),
                      const TextSpan(text: ' '),
                      TextSpan(
                        text: 'Read More',
                        style: TextStyle(
                          color: Colors.grey[400],
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                Row(
                  children: [
                    ...List.generate(
                      4,
                      (index) => const Icon(
                        Icons.star,
                        color: Color(0xFFFFD700),
                        size: 20,
                      ),
                    ),
                    const Icon(
                      Icons.star_border,
                      color: Color(0xFFFFD700),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${widget.food['rating']}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Custom().mainText('Total Amount', fontSize: 20),
                        const SizedBox(height: 10),
                        Text(
                          _calculateTotalPrice(),
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Custom().colors().lightGreen,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        _buildQuantityButton(
                          icon: Icons.remove,
                          onPressed: () {
                            if (quantity > 1) setState(() => quantity--);
                          },
                        ),
                        SizedBox(
                          width: 40,
                          child: Center(
                            child: Text(
                              '$quantity',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ),
                        ),
                        _buildQuantityButton(
                          icon: Icons.add,
                          color: Custom().colors().lightGreen,
                          iconColor: Colors.white,
                          onPressed: () {
                            setState(() => quantity++);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 70),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      print('Debugging: Add to Cart button pressed');
                      try {
                        final priceStr = widget.food['price'].toString();
                        print('Debugging: Raw price string: $priceStr');

                        // Remove non-numeric characters except decimal point
                        final numericPart = priceStr.replaceAll(
                          RegExp(r'[^0-9.]'),
                          '',
                        );
                        print(
                          'Debugging: Numeric part extracted: $numericPart',
                        );

                        double price = double.tryParse(numericPart) ?? 0;
                        if (price == 0) {
                          print('Debugging: Warning - Parsed price is 0');
                        }
                        print('Debugging: Final parsed price: $price');

                        final item = {
                          'id': widget.food['id'],
                          'title': widget.food['name'],
                          'price': price.toInt(),
                          'quantity': quantity,
                          'image': widget.food['image'],
                        };
                        print('Debugging: Constructing item object: $item');

                        CartService().addItem(item);
                        print('Debugging: addItem called successfully');

                        if (!mounted) {
                          print(
                            'Debugging: Context not mounted, skipping navigation',
                          );
                          return;
                        }

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              '${widget.food['name']} added to cart',
                            ),
                            backgroundColor: Custom().colors().lightGreen,
                            duration: const Duration(seconds: 1),
                          ),
                        );
                        print('Debugging: SnackBar displayed');

                        // Navigate to Shopping Cart after a short delay
                        Future.delayed(const Duration(milliseconds: 500), () {
                          if (mounted) {
                            print(
                              'Debugging: Navigating to ShoppingCartScreen',
                            );
                            Navigator.pushNamed(
                              context,
                              Routing.shoppingCartScreen,
                            ).then(
                              (_) => print(
                                'Debugging: Returned from ShoppingCartScreen',
                              ),
                            );
                          }
                        });
                      } catch (e, stack) {
                        print('Debugging: EXCEPTION in Add to Cart: $e');
                        print(stack);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2D2D2D),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'ADD TO CART',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(bool isActive) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive
            ? Custom().colors().lightGreen
            : const Color(0xFFE0E0E0),
      ),
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onPressed,
    Color? color,
    Color? iconColor,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color ?? const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, size: 20, color: iconColor ?? Colors.black),
        onPressed: onPressed,
      ),
    );
  }
}
