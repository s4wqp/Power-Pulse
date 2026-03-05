import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/cart_service.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';

class CheckoutScreen extends StatefulWidget {
  final Map<String, dynamic>? addressData;
  final bool isSubscription;
  final int? subscriptionPrice;
  final int? planId;

  const CheckoutScreen({
    super.key,
    this.addressData,
    this.isSubscription = false,
    this.subscriptionPrice,
    this.planId,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _selectedPaymentMethod = 0; // 0: ApplePay, 1: Card, 2: PayPal, 3: Fawry

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> addressData = widget.addressData ?? {};
    final bool isSubscription =
        widget.isSubscription; // Use the widget property

    // Extract location or use default (Cairo)
    double lat = 30.0444;
    double lng = 31.2357;

    if (addressData.containsKey('lat') && addressData['lat'] != null) {
      lat = double.tryParse(addressData['lat'].toString()) ?? 30.0444;
    }
    if (addressData.containsKey('lng') && addressData['lng'] != null) {
      lng = double.tryParse(addressData['lng'].toString()) ?? 31.2357;
    }

    final location = LatLng(lat, lng);

    return Scaffold(
      backgroundColor: Custom().colors().lightGreen,
      appBar: AppBar(
        backgroundColor: Custom().colors().lightGreen,
        elevation: 0,
        title: Text(
          isSubscription ? 'Subscription Checkout' : 'Checkout',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        margin: EdgeInsets.only(top: 20.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30.r),
            topRight: Radius.circular(30.r),
          ),
        ),
        child: SingleChildScrollView(
          padding: EdgeInsets.all(20.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Conditionally show Map and Address only if NOT a subscription
              if (!isSubscription) ...[
                // Dynamic Map View
                Container(
                  height: 120.h,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15.r),
                    color: Colors.grey[200],
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: FlutterMap(
                    options: MapOptions(
                      initialCenter: location,
                      initialZoom: 15.0,
                      interactionOptions: const InteractionOptions(
                        flags: InteractiveFlag.none, // Static view
                      ),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate:
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.example.power_pulse',
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: location,
                            width: 40.0,
                            height: 40.0,
                            child: const Icon(
                              Icons.location_on,
                              color: Colors.red,
                              size: 40.0,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 15.h),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            addressData.isEmpty
                                ? 'Apartment (Maadi - Saqr)'
                                : '${addressData['building'] ?? ''} - ${addressData['street'] ?? ''}',
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              color: Custom().colors().lightGreen,
                            ),
                          ),
                          SizedBox(height: 5.h),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on_outlined,
                                size: 14.sp,
                                color: Custom().colors().lightGreen,
                              ),
                              SizedBox(width: 4.w),
                              Expanded(
                                child: Text(
                                  addressData.isEmpty
                                      ? '250 - Street 306, Building 250, Second Floor'
                                      : 'Apt ${addressData['apartment'] ?? '-'}, Floor ${addressData['floor'] ?? '-'}, ${addressData['details'] ?? ''}',
                                  style: TextStyle(
                                    fontSize: 10.sp,
                                    color: Custom().colors().lightGreen,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            addressData.isEmpty
                                ? 'Phone number : +20 0101004564'
                                : 'Phone number : +20 ${addressData['phone'] ?? ''}',
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: Custom().colors().lightGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context); // Go back to edit address
                      },
                      child: Text(
                        'Change',
                        style: TextStyle(
                          color: Custom().colors().lightGreen,
                          fontWeight: FontWeight.bold,
                          fontSize: 12.sp,
                        ),
                      ),
                    ),
                  ],
                ),

                Divider(height: 30.h),
              ] else ...[
                // Subscription details could go here if needed, or just skip to payment
                // For now, we just skip the address section.
              ],

              Text(
                'Payment method',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF354259), // Dark blue/grey
                ),
              ),
              SizedBox(height: 15.h),

              _buildPaymentOption(
                0,
                'Apple Pay',
                assetPath: 'assets/images/ApplePay.png',
              ),
              _buildPaymentOption(
                1,
                'Mastercard / Visa',
                assetPaths: [
                  'assets/images/Mastercard.png',
                  'assets/images/Visa.png',
                ],
              ),
              _buildPaymentOption(
                2,
                'PayPal',
                assetPath: 'assets/images/PayPal_logo.png',
              ),
              _buildPaymentOption(
                3,
                'Fawry',
                assetPath: 'assets/images/Fawry_logo.png',
              ),

              SizedBox(height: 20.h),

              _buildPaymentSummary(),

              SizedBox(height: 30.h),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (isSubscription && widget.planId != null) {
                      final auth = context.read<AuthProvider>();
                      final trainerProvider = context.read<TrainerProvider>();

                      if (auth.userId == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('User not logged in')),
                        );
                        return;
                      }

                      // Show loading dialog or similar if needed, but for now just call
                      final success = await trainerProvider.subscribeToPlan(
                        auth.userId!,
                        widget.planId!,
                      );

                      if (success && mounted) {
                        Navigator.pushNamed(
                          context,
                          Routing.transactionSuccessScreen,
                        );
                      } else if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              trainerProvider.errorMessage ??
                                  'Subscription failed',
                            ),
                          ),
                        );
                      }
                    } else {
                      // Original logic for non-subscriptions (e.g., store orders)
                      final auth = context.read<AuthProvider>();
                      final traineeProvider = context.read<TraineeProvider>();
                      final cartItems = CartService().items;

                      if (auth.userId == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('User not logged in')),
                        );
                        return;
                      }

                      if (cartItems.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Cart is empty')),
                        );
                        return;
                      }

                      // Map cart items to payload
                      final itemsPayload = cartItems.map((item) {
                        return {
                          "productId": item['id'],
                          "quantity": item['quantity'],
                          "selectedOption":
                              item['size'] ??
                              item['subCategory'] ??
                              item['category'],
                        };
                      }).toList();

                      final orderData = {
                        "traineeId": auth.userId!,
                        "deliveryAddressId": widget.addressData?['id'],
                        // We do not have a real bank card ID logic linked yet, let's omit or send null
                        "items": itemsPayload,
                      };

                      // Show loading snackbar
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Placing order...')),
                      );

                      final result = await traineeProvider.placeOrder(
                        orderData,
                      );

                      if (!mounted) return;
                      ScaffoldMessenger.of(context).hideCurrentSnackBar();

                      if (result != null) {
                        // Clear cart
                        CartService().clearCart();
                        // Navigate to Success Screen
                        Navigator.pushNamed(
                          context,
                          Routing.transactionSuccessScreen,
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              traineeProvider.errorMessage ??
                                  'Failed to place order.',
                            ),
                          ),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    padding: EdgeInsets.symmetric(vertical: 15.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(5.r),
                    ),
                  ),
                  child: Text(
                    'Confirm',
                    style: TextStyle(
                      fontSize: 16.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
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

  Widget _buildPaymentOption(
    int value,
    String label, {
    String? assetPath,
    List<String>? assetPaths,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedPaymentMethod = value;
          });
        },
        child: Container(
          color: Colors.transparent,
          child: Row(
            children: [
              Radio(
                value: value,
                groupValue: _selectedPaymentMethod,
                onChanged: (val) {
                  setState(() {
                    _selectedPaymentMethod = val as int;
                  });
                },
                activeColor: Colors.blue,
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 8.h),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(5.r),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (assetPaths != null)
                      ...assetPaths.map(
                        (path) => Padding(
                          padding: EdgeInsets.only(right: 8.w),
                          child: Image.asset(
                            path,
                            height: 24.h,
                            errorBuilder: (context, error, stackTrace) =>
                                Icon(Icons.credit_card, size: 24.h),
                          ),
                        ),
                      )
                    else if (assetPath != null)
                      Image.asset(
                        assetPath,
                        height: 24.h,
                        errorBuilder: (context, error, stackTrace) =>
                            Icon(Icons.image_not_supported, size: 24.h),
                      ),

                    // Removed Text(label) here as requested
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentSummary() {
    int subtotal = 0;
    int deliveryFee = 20;
    int serviceFee = 0;

    if (widget.isSubscription && widget.subscriptionPrice != null) {
      subtotal = widget.subscriptionPrice!;
      deliveryFee = 0; // No delivery fee for subscriptions
    } else {
      for (var item in CartService().items) {
        subtotal += (item['price'] as int) * (item['quantity'] as int);
      }
    }

    int total = subtotal + deliveryFee + serviceFee;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment Summary',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF354259),
          ),
        ),
        SizedBox(height: 15.h),
        _buildSummaryRow('Subtotal', '$subtotal EGP'),
        if (!widget.isSubscription) // Hide delivery fee for subscriptions
          _buildSummaryRow('Delivery fee', '$deliveryFee EGP'),
        _buildSummaryRow('Service fee', '$serviceFee EGP'),
        SizedBox(height: 10.h),
        _buildSummaryRow('Total amount', '$total EGP', isTotal: true),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14.sp,
              color: Custom().colors().lightGreen, // Green color labels
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14.sp,
              color: Custom().colors().lightGreen,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
