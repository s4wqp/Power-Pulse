import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/cart_service.dart';
import 'package:power_pulse/routing.dart';

class GenericDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> item;

  const GenericDetailsScreen({super.key, required this.item});

  @override
  State<GenericDetailsScreen> createState() => _GenericDetailsScreenState();
}

class _GenericDetailsScreenState extends State<GenericDetailsScreen> {
  int quantity = 1;
  String selectedSize = 'M';
  final List<String> sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  bool isExpanded = false;
  int _currentImageIndex = 0;
  late List<String> _images;

  @override
  void initState() {
    super.initState();
    _images = widget.item['imagesList'] != null
        ? List<String>.from(widget.item['imagesList'])
        : [widget.item['image']];
  }

  @override
  Widget build(BuildContext context) {
    bool isClothing = widget.item['type'] == 'clothes';
    Color badgeColor;
    Color textColor = Colors.white;

    switch (widget.item['type']) {
      case 'food':
        badgeColor = Custom().colors().lightGreen;
        textColor = Colors.white;
        break;
      case 'supplement':
        badgeColor = Custom().colors().gramsColor;
        textColor = Colors.white;
        break;
      case 'clothes':
        badgeColor = Custom().colors().clothesColor;
        textColor = Colors.white;
        break;
      default:
        badgeColor = Custom().colors().lightGreen;
    }

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
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 100), // Space for app bar
            Center(
              child: Hero(
                tag: widget.item['name'],
                child: SizedBox(
                  height: isClothing ? 300 : 260,
                  width: double.infinity,
                  child: PageView.builder(
                    itemCount: _images.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentImageIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      final imageUrl = _images[index];
                      if (isClothing) {
                        return Container(
                          alignment: Alignment.center,
                          child: imageUrl.startsWith('http')
                              ? Image.network(
                                  imageUrl,
                                  fit: BoxFit.contain,
                                  errorBuilder: (c, e, s) => const Icon(
                                    Icons.image_not_supported,
                                    size: 50,
                                    color: Colors.grey,
                                  ),
                                )
                              : Image.asset(
                                  imageUrl,
                                  fit: BoxFit.contain,
                                  errorBuilder: (c, e, s) => const Icon(
                                    Icons.image_not_supported,
                                    size: 50,
                                    color: Colors.grey,
                                  ),
                                ),
                        );
                      } else {
                        return Container(
                          alignment: Alignment.center,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                          ),
                          child: CircleAvatar(
                            radius: 130,
                            backgroundColor: Colors.transparent,
                            backgroundImage: imageUrl.startsWith('http')
                                ? NetworkImage(imageUrl) as ImageProvider
                                : AssetImage(imageUrl),
                          ),
                        );
                      }
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (_images.length > 1)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_images.length, (index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: _buildDot(_currentImageIndex == index),
                  );
                }),
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
                          widget.item['name'],
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: badgeColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            if (!isClothing)
                              const Icon(
                                Icons.local_fire_department_outlined,
                                size: 18,
                                color: Colors.black87,
                              ),
                            const SizedBox(width: 4),
                            Text(
                              widget.item['detailsBadge'] ??
                                  widget.item['calories'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: textColor,
                                fontSize: 12, // Minimized text
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Size Selector for Clothes
                  if (isClothing) ...[
                    const Text(
                      'Select Size',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: sizes.map((size) {
                        bool isSelected = size == selectedSize;
                        return GestureDetector(
                          onTap: () => setState(() => selectedSize = size),
                          child: Container(
                            margin: const EdgeInsets.only(right: 12),
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Custom().colors().clothesColor
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? Custom().colors().clothesColor
                                    : Colors.grey.shade300,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: Custom()
                                            .colors()
                                            .clothesColor
                                            .withOpacity(0.4),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ]
                                  : null,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              size,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  GestureDetector(
                    onTap: () {
                      setState(() {
                        isExpanded = !isExpanded;
                      });
                    },
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: isExpanded
                                ? widget.item['description']
                                : (widget.item['description'].length > 100
                                      ? widget.item['description'].substring(
                                              0,
                                              100,
                                            ) +
                                            '... '
                                      : widget.item['description']),
                          ),
                          if (widget.item['description'].length > 100)
                            TextSpan(
                              text: isExpanded ? ' Read Less' : ' Read More',
                              style: TextStyle(
                                color:
                                    badgeColor, // Dynamic color based on type
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
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
                        '${widget.item['rating'] != null ? (widget.item['rating'] is double ? widget.item['rating'].toStringAsFixed(1) : widget.item['rating']) : '4.5'}',
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
                            widget.item['price'],
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: badgeColor,
                            ),
                          ),
                        ],
                      ),
                      // Quantity Selector (Only if not clothes, or both? Design usually implies one or the other, but let's keep quantity for all for now or hide it for clothes if size is the main selector. Let's keep it for all as you might buy 2 shirts)
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
                            color: badgeColor,
                            iconColor: textColor,
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
                          final priceStr = widget.item['price'].toString();
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

                          final cartItem = {
                            'id': widget.item['id'],
                            'title': widget.item['name'],
                            'price': price.toInt(),
                            'quantity': quantity,
                            'image': widget.item['image'],
                            'size': isClothing ? selectedSize : null,
                          };
                          print(
                            'Debugging: Constructing item object: $cartItem',
                          );

                          CartService().addItem(cartItem);
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
                                '${widget.item['name']} added to cart',
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
