import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:dio/dio.dart';
import 'package:power_pulse/presentation/widgets/card_input_formatters.dart';
import 'package:flutter/services.dart';

class PaymentDetailsScreen extends StatefulWidget {
  const PaymentDetailsScreen({super.key});

  @override
  State<PaymentDetailsScreen> createState() => _PaymentDetailsScreenState();
}

class _PaymentDetailsScreenState extends State<PaymentDetailsScreen> {
  List<dynamic> _cards = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCards();
  }

  Future<void> _fetchCards() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userId = authProvider.userId;

      if (userId == null) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      final userRole = authProvider.role?.toLowerCase();
      final String endpoint = userRole == 'trainer'
          ? '/api/trainers/$userId/cards'
          : '/api/trainees/$userId/cards';

      final response = await ApiClient().dio.get(endpoint);
      if (response.statusCode == 200 && response.data is List) {
        setState(() {
          _cards = response.data;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load bank cards')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showAddCardDialog() {
    final TextEditingController cardNumberController = TextEditingController();
    final TextEditingController cvvController = TextEditingController();
    final TextEditingController expiryController = TextEditingController();
    bool isAdding = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Add New Card'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: cardNumberController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        CardNumberFormatter(),
                      ],
                      decoration: const InputDecoration(
                        labelText: 'Card Number',
                        hintText: '4111222233334444',
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: expiryController,
                            keyboardType: TextInputType.number,
                            inputFormatters: [CardMonthYearFormatter()],
                            decoration: const InputDecoration(
                              labelText: 'Expiry Date',
                              hintText: '12/26',
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: cvvController,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              CardCvvFormatter(),
                            ],
                            decoration: const InputDecoration(
                              labelText: 'CVV',
                              hintText: '123',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isAdding ? null : () => Navigator.pop(context),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                isAdding
                    ? const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Custom().colors().lightGreen,
                        ),
                        onPressed: () async {
                          final cardNumber = cardNumberController.text.trim();
                          final cvv = cvvController.text.trim();
                          final expiry = expiryController.text.trim();

                          if (cardNumber.isEmpty ||
                              cvv.isEmpty ||
                              expiry.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Please fill all fields'),
                              ),
                            );
                            return;
                          }

                          if (cardNumber.length != 16) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Card number must be 16 digits'),
                              ),
                            );
                            return;
                          }

                          if (expiry.length != 5) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Expiry date must be MM/YY'),
                              ),
                            );
                            return;
                          }

                          if (cvv.length != 3) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('CVV must be 3 digits'),
                              ),
                            );
                            return;
                          }

                          setDialogState(() {
                            isAdding = true;
                          });

                          try {
                            final authProvider = Provider.of<AuthProvider>(
                              context,
                              listen: false,
                            );
                            final userId = authProvider.userId;
                            final userRole = authProvider.role?.toLowerCase();
                            final String endpoint = userRole == 'trainer'
                                ? '/api/trainers/$userId/cards'
                                : '/api/trainees/$userId/cards';
                            final response = await ApiClient().dio.post(
                              endpoint,
                              data: {
                                "cardNumber": cardNumber,
                                "cvv": cvv,
                                "expiryDate": expiry,
                              },
                            );

                            if (!mounted) return;
                            if (response.statusCode == 200 ||
                                response.statusCode == 201) {
                              Navigator.pop(context);
                              _fetchCards();
                            } else {
                              throw Exception('Failed');
                            }
                          } on DioException catch (e) {
                            if (!mounted) return;
                            String errorMsg =
                                "Failed to add card: ${e.response?.statusCode ?? 'Unknown Error'}";
                            if (e.response != null &&
                                e.response!.data != null) {
                              try {
                                if (e.response!.data is Map &&
                                    e.response!.data['message'] != null) {
                                  errorMsg = e.response!.data['message'];
                                } else if (e.response!.data is String &&
                                    e.response!.data.toString().isNotEmpty) {
                                  errorMsg = e.response!.data;
                                }
                              } catch (_) {}
                            }
                            ScaffoldMessenger.of(
                              context,
                            ).showSnackBar(SnackBar(content: Text(errorMsg)));
                            setDialogState(() {
                              isAdding = false;
                            });
                          } catch (e) {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Failed to add card'),
                              ),
                            );
                            setDialogState(() {
                              isAdding = false;
                            });
                          }
                        },
                        child: const Text(
                          'Add',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Payment Details',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(24.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your Cards',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  if (_cards.isEmpty)
                    Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 30.h),
                        child: const Text(
                          'No saved cards',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._cards.map((card) {
                      final cardNumber =
                          card['cardNumberLast4']?.toString() ?? '';
                      final isVisa = cardNumber.startsWith('4');
                      final brand = isVisa ? 'Visa' : 'Mastercard';
                      final color = isVisa
                          ? const Color(0xFF1A1F71)
                          : const Color(0xFFEB001B);

                      return Padding(
                        padding: EdgeInsets.only(bottom: 16.h),
                        child: _buildCardItem(
                          brand: brand,
                          last4: cardNumber.isEmpty ? '****' : cardNumber,
                          expiry: card['expiryDate']?.toString() ?? 'MM/YY',
                          color: color,
                        ),
                      );
                    }),
                  SizedBox(height: 32.h),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _showAddCardDialog,
                      icon: const Icon(Icons.add),
                      label: const Text('Add New Card'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Custom().colors().lightGreen,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildCardItem({
    required String brand,
    required String last4,
    required String expiry,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(Icons.credit_card, color: Colors.white, size: 32.sp),
              Text(
                brand,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          SizedBox(height: 30.h),
          Text(
            '**** **** **** $last4',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22.sp,
              letterSpacing: 2,
            ),
          ),
          SizedBox(height: 20.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Card Holder',
                    style: TextStyle(color: Colors.white70, fontSize: 12.sp),
                  ),
                  Text(
                    'Power Pulse Member',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Expires',
                    style: TextStyle(color: Colors.white70, fontSize: 12.sp),
                  ),
                  Text(
                    expiry,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
