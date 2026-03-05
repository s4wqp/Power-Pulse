import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/cart_service.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/presentation/trainee/screens/new_address_screen.dart';
import 'package:power_pulse/data/models/trainee_models.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';

class ShoppingCartScreen extends StatefulWidget {
  const ShoppingCartScreen({super.key});

  @override
  State<ShoppingCartScreen> createState() => _ShoppingCartScreenState();
}

class _ShoppingCartScreenState extends State<ShoppingCartScreen> {
  // Get items from global service
  List<Map<String, dynamic>> get cartItems => CartService().items;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Image.asset(
            'assets/images/bg_appbar.png',
            height: 150.h,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 20.h),
                  child: Center(
                    child: Text(
                      'Shopping Cart',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30.r),
                        topRight: Radius.circular(30.r),
                      ),
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(20.w),
                      child: cartItems.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.shopping_cart_outlined,
                                    size: 80.sp,
                                    color: Colors.grey[300],
                                  ),
                                  SizedBox(height: 16.h),
                                  Text(
                                    'Your Cart is Empty',
                                    style: TextStyle(
                                      fontSize: 18.sp,
                                      color: Colors.grey[500],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Requests',
                                  style: TextStyle(
                                    fontSize: 18.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 15.h),
                                Expanded(
                                  child: ListView.separated(
                                    itemCount: cartItems.length,
                                    separatorBuilder: (context, index) =>
                                        Divider(height: 30.h),
                                    itemBuilder: (context, index) {
                                      return _buildCartItem(index);
                                    },
                                  ),
                                ),
                                _buildPaymentSummary(),
                                SizedBox(height: 20.h),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () async {
                                      final auth = context.read<AuthProvider>();
                                      final traineeId = auth.userId;
                                      if (traineeId == null) return;

                                      final traineeProvider = context
                                          .read<TraineeProvider>();
                                      final hasAddress = await traineeProvider
                                          .checkHasAddress(traineeId);
                                      if (hasAddress && context.mounted) {
                                        _showAddressSelectionBottomSheet(
                                          context,
                                          traineeId,
                                        );
                                      } else if (context.mounted) {
                                        Navigator.pushNamed(
                                          context,
                                          Routing.selectDeliveryLocationScreen,
                                        );
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Custom()
                                          .colors()
                                          .lightGreen,
                                      padding: EdgeInsets.symmetric(
                                        vertical: 15.h,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(
                                          25.r,
                                        ),
                                      ),
                                    ),
                                    child: Text(
                                      'Checkout',
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
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildCartItem(int index) {
    final item = cartItems[index];
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10.r),
          child: item['image'].toString().startsWith('http')
              ? CachedImage(
                  imageUrl: item['image'],
                  width: 60.w,
                  height: 60.w,
                  fit: BoxFit.cover,
                  errorWidget: Container(
                    width: 60.w,
                    height: 60.w,
                    color: Colors.grey[300],
                    child: Icon(Icons.image, color: Colors.grey),
                  ),
                )
              : Image.asset(
                  item['image'] ?? 'assets/images/Power_Pulse.png',
                  width: 60.w,
                  height: 60.w,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 60.w,
                    height: 60.w,
                    color: Colors.grey[300],
                    child: Icon(Icons.image, color: Colors.grey),
                  ),
                ),
        ),
        SizedBox(width: 15.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item['title'],
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600),
              ),
              SizedBox(height: 8.h),
              Text(
                '${(item['price'] as int) * (item['quantity'] as int)} EGP',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Custom().colors().lightGreen,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        Row(
          children: [
            IconButton(
              icon: Icon(
                Icons.add,
                color: Custom().colors().lightGreen,
                size: 20.sp,
              ),
              onPressed: () {
                setState(() {
                  item['quantity']++;
                });
              },
            ),
            Text(
              '${item['quantity']}',
              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
            ),
            IconButton(
              icon: Icon(
                Icons.remove,
                color: Custom().colors().lightGreen,
                size: 20.sp,
              ),
              onPressed: () {
                if (item['quantity'] > 0) {
                  setState(() {
                    item['quantity']--;
                  });
                }
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPaymentSummary() {
    int subtotal = 0;
    for (var item in cartItems) {
      subtotal += (item['price'] as int) * (item['quantity'] as int);
    }
    int deliveryFee = 20; // Fixed for now
    int serviceFee = 0;
    int total = subtotal + deliveryFee + serviceFee;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment Summary',
          style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 15.h),
        _buildSummaryRow('Subtotal', '$subtotal EGP'),
        _buildSummaryRow('Delivery fee', '$deliveryFee EGP'),
        _buildSummaryRow('Service fee', '$serviceFee EGP'),
        SizedBox(height: 10.h),
        _buildSummaryRow('Total amount', '$total EGP', isTotal: true),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14.sp,
              color: isTotal ? Custom().colors().lightGreen : Colors.grey[600],
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
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

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 3, // Card tab is index 3
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushReplacementNamed(context, Routing.traineeHomeScreen);
        } else if (index == 1) {
          Navigator.pushReplacementNamed(context, Routing.chatListScreen);
        } else if (index == 2) {
          Navigator.pushReplacementNamed(
            context,
            Routing.exerciseLibraryScreen,
          );
        } else if (index == 4) {
          Navigator.pushReplacementNamed(context, Routing.profileScreen);
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home, size: 22.sp),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/cart.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().lightGreen,
          ),
          label: 'Card',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 18.w,
            height: 18.h,
            color: Custom().colors().bottomNavigationBar,
          ),
          label: 'Profile',
        ),
      ],
    );
  }

  void _showAddressSelectionBottomSheet(BuildContext context, int traineeId) {
    // Make sure we have latest addresses fetched
    context.read<TraineeProvider>().fetchAddresses(traineeId);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent, // Round corners via container
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(30.r),
              topRight: Radius.circular(30.r),
            ),
          ),
          padding: EdgeInsets.all(20.w),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.7,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Where would you like to deliver?',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF354259),
                ),
              ),
              SizedBox(height: 20.h),
              Expanded(
                child: Consumer<TraineeProvider>(
                  builder: (context, provider, child) {
                    if (provider.isLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (provider.addresses.isEmpty) {
                      return const Center(child: Text('No addresses found.'));
                    }
                    return ListView.separated(
                      itemCount: provider.addresses.length,
                      separatorBuilder: (context, index) =>
                          Divider(height: 20.h),
                      itemBuilder: (context, index) {
                        final address = provider.addresses[index];
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Icon(
                            Icons.location_on_outlined,
                            color: Custom().colors().lightGreen,
                            size: 24.sp,
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  address.building,
                                  style: TextStyle(
                                    fontSize: 16.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.edit_outlined,
                                  color: Colors.grey,
                                  size: 18.sp,
                                ),
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) =>
                                          NewAddressScreen(address: address),
                                    ),
                                  );
                                },
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.delete_outline,
                                  color: Colors.red,
                                  size: 18.sp,
                                ),
                                onPressed: () {
                                  _showDeleteConfirmation(ctx, address);
                                },
                              ),
                            ],
                          ),
                          subtitle: Text(
                            address.street,
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey,
                            ),
                          ),
                          trailing: Icon(
                            Icons.arrow_forward_ios,
                            size: 16.sp,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.pop(ctx); // Close sheet
                            final addressData = {
                              'id': address.id,
                              'building': address.building,
                              'apartment': address.apartment,
                              'floor': address.floor,
                              'street': address.street,
                              'phone': address.phone,
                              // No details mapped properly yet but add just in case
                              'additionalDetails': address.additionalDetails,
                            };
                            Navigator.pushNamed(
                              context,
                              Routing.checkoutScreen,
                              arguments: addressData,
                            );
                          },
                        );
                      },
                    );
                  },
                ),
              ),
              SizedBox(height: 20.h),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx); // Close sheet
                    Navigator.pushNamed(
                      context,
                      Routing.selectDeliveryLocationScreen,
                    );
                  },
                  icon: const Icon(Icons.add, color: Colors.white),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    padding: EdgeInsets.symmetric(vertical: 15.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25.r),
                    ),
                  ),
                  label: Text(
                    'Create New Address',
                    style: TextStyle(fontSize: 16.sp, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showDeleteConfirmation(
    BuildContext context,
    Address address,
  ) async {
    final auth = context.read<AuthProvider>();
    final traineeId = auth.userId;
    if (traineeId == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Delete Address'),
          content: Text('Are you sure you want to delete ${address.building}?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Delete', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );

    if (confirm == true && mounted) {
      final success = await context.read<TraineeProvider>().deleteAddress(
        traineeId,
        address.id,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Address deleted' : 'Failed to delete address',
            ),
          ),
        );
        // The bottom sheet remains open and Provider state change will re-render the list automatically
      }
    }
  }
}
