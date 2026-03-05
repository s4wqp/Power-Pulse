import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/presentation/trainee/screens/new_address_screen.dart';
import 'package:power_pulse/data/models/trainee_models.dart';

class DeliveryAddressesScreen extends StatefulWidget {
  const DeliveryAddressesScreen({super.key});

  @override
  State<DeliveryAddressesScreen> createState() =>
      _DeliveryAddressesScreenState();
}

class _DeliveryAddressesScreenState extends State<DeliveryAddressesScreen> {
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      final userId = context.read<AuthProvider>().userId;
      if (userId != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            context.read<TraineeProvider>().fetchAddresses(userId);
          }
        });
      }
      _isInit = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Custom().colors().lightGreen,
      appBar: AppBar(
        backgroundColor: Custom().colors().lightGreen,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Delivery Addresses',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
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
        child: Padding(
          padding: EdgeInsets.all(20.w),
          child: Column(
            children: [
              Expanded(
                child: Consumer<TraineeProvider>(
                  builder: (context, provider, child) {
                    if (provider.isLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    if (provider.errorMessage != null &&
                        provider.addresses.isEmpty) {
                      return Center(child: Text(provider.errorMessage!));
                    }
                    if (provider.addresses.isEmpty) {
                      return Center(
                        child: Text(
                          'No delivery addresses added yet.',
                          style: TextStyle(fontSize: 16.sp, color: Colors.grey),
                        ),
                      );
                    }
                    return ListView.builder(
                      itemCount: provider.addresses.length,
                      itemBuilder: (context, index) {
                        final address = provider.addresses[index];

                        List<String> detailsParts = [];
                        if (address.apartment?.isNotEmpty == true) {
                          detailsParts.add('Apt: ${address.apartment}');
                        }
                        if (address.floor?.isNotEmpty == true) {
                          detailsParts.add('Floor: ${address.floor}');
                        }

                        String subtitle = address.street;
                        if (detailsParts.isNotEmpty) {
                          subtitle += ' - ${detailsParts.join(', ')}';
                        }
                        if (address.phone?.isNotEmpty == true) {
                          subtitle += '\nPhone: ${address.phone}';
                        }

                        return _buildAddressItem(address, subtitle, index == 0);
                      },
                    );
                  },
                ),
              ),
              SizedBox(height: 15.h),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, Routing.newAddressScreen);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25.r),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 15.h),
                  ),
                  child: Text(
                    'Add New Address',
                    style: TextStyle(fontSize: 16.sp, color: Colors.white),
                  ),
                ),
              ),
              SizedBox(height: 30.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAddressItem(Address address, String subtitle, bool isSelected) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.location_on_outlined, color: Colors.black, size: 24.sp),
            SizedBox(width: 15.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                      Row(
                        children: [
                          IconButton(
                            icon: Icon(
                              Icons.edit_outlined,
                              color: Colors.grey,
                              size: 20.sp,
                            ),
                            onPressed: () {
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
                              size: 20.sp,
                            ),
                            onPressed: () {
                              _showDeleteConfirmation(context, address);
                            },
                          ),
                          if (isSelected)
                            Icon(Icons.check, color: Colors.black, size: 20.sp),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 5.h),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 14.sp, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 15.h),
        Divider(),
      ],
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
      }
    }
  }
}
