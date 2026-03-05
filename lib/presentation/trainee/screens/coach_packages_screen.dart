import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';

class CoachPackagesScreen extends StatefulWidget {
  final Trainer trainer;

  const CoachPackagesScreen({super.key, required this.trainer});

  @override
  State<CoachPackagesScreen> createState() => _CoachPackagesScreenState();
}

class _CoachPackagesScreenState extends State<CoachPackagesScreen> {
  int _selectedPlanIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TrainerProvider>().fetchTrainerPlans(widget.trainer.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Select Plan',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: 20.sp,
          ),
        ),
        centerTitle: true,
      ),
      body: Consumer<TrainerProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final Map<int, TrainingPlan> uniquePlansMap = {};
          for (var plan in provider.currentTrainerPlans) {
            if (plan.isActive) {
              uniquePlansMap[plan.id] = plan;
            }
          }
          final plans = uniquePlansMap.values.toList();

          if (plans.isEmpty) {
            return Center(
              child: Text(
                'No active plans available.',
                style: TextStyle(fontSize: 16.sp, color: Colors.grey),
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: 20.w,
                    vertical: 10.h,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        'Choose Your Transformation',
                        style: TextStyle(
                          fontSize: 22.sp,
                          fontWeight: FontWeight.bold,
                          color: Custom().colors().lightGreen,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'Select a package that fits your goals.',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 30.h),
                      ...List.generate(
                        plans.length,
                        (index) => _buildPlanCard(index, plans[index]),
                      ),
                    ],
                  ),
                ),
              ),
              _buildBottomBar(plans),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPlanCard(int index, TrainingPlan plan) {
    bool isSelected = _selectedPlanIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPlanIndex = index;
        });
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 20.h),
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected
                ? Custom().colors().lightGreen
                : Colors.grey.withOpacity(0.2),
            width: isSelected ? 2.w : 1.w,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Custom().colors().lightGreen.withOpacity(0.2),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    plan.name,
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (plan.badge != null && plan.badge!.isNotEmpty)
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 10.w,
                      vertical: 4.h,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Text(
                      plan.badge!,
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.green[700],
                      ),
                    ),
                  ),
                if (isSelected)
                  Icon(
                    Icons.check_circle,
                    color: Custom().colors().lightGreen,
                    size: 24.sp,
                  ),
              ],
            ),
            SizedBox(height: 10.h),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${plan.price.toStringAsFixed(0)} EGP',
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                    color: Custom().colors().lightGreen,
                  ),
                ),
                SizedBox(width: 4.w),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: 4.h),
                    child: Text(
                      '/ ${plan.durationMonths != null && plan.durationMonths! > 0
                          ? '${plan.durationMonths!.toStringAsFixed(plan.durationMonths! % 1 == 0 ? 0 : 1)} ${plan.durationMonths == 1 ? "Month" : "Months"}'
                          : plan.durationHours != null && plan.durationHours! > 0
                          ? '${plan.durationHours!.toStringAsFixed(plan.durationHours! % 1 == 0 ? 0 : 2)} ${plan.durationHours == 1 ? "Hour" : "Hours"}'
                          : '${plan.durationDays.toStringAsFixed(plan.durationDays % 1 == 0 ? 0 : 1)} ${plan.durationDays == 1 ? "Day" : "Days"}'}',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Colors.grey[500],
                        fontWeight: FontWeight.w500,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
            if (plan.description.isNotEmpty) ...[
              SizedBox(height: 8.h),
              Text(
                plan.description,
                style: TextStyle(fontSize: 13.sp, color: Colors.grey[600]),
              ),
            ],
            SizedBox(height: 15.h),
            Divider(color: Colors.grey[200]),
            SizedBox(height: 10.h),
            ...List.generate(
              plan.features.length,
              (fIndex) => Padding(
                padding: EdgeInsets.only(bottom: 6.h),
                child: Row(
                  children: [
                    Icon(Icons.check, size: 16.sp, color: Colors.green),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        plan.features[fIndex],
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: Colors.grey[700],
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

  Widget _buildBottomBar(List<TrainingPlan> plans) {
    if (plans.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(30.r),
          topRight: Radius.circular(30.r),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 52.h,
          child: ElevatedButton(
            onPressed: () {
              if (_selectedPlanIndex >= plans.length) return;
              final selectedPlan = plans[_selectedPlanIndex];

              Navigator.pushNamed(
                context,
                Routing.checkoutScreen,
                arguments: <String, dynamic>{
                  'isSubscription': true,
                  'subscriptionPrice': selectedPlan.price.toInt(),
                  'planId': selectedPlan.id,
                  'planName': selectedPlan.name,
                },
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Custom().colors().primaryButton,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              elevation: 4,
            ),
            child: Text(
              'Continue to Payment',
              style: TextStyle(
                fontSize: 16.sp,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
