import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';

class TrainerPlansScreen extends StatefulWidget {
  const TrainerPlansScreen({super.key});

  @override
  State<TrainerPlansScreen> createState() => _TrainerPlansScreenState();
}

class _TrainerPlansScreenState extends State<TrainerPlansScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchPlans();
    });
  }

  Future<void> _fetchPlans() async {
    final auth = context.read<AuthProvider>();
    if (auth.userId != null) {
      await context.read<TrainerProvider>().fetchTrainerPlans(auth.userId!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Consumer<TrainerProvider>(
        builder: (context, provider, child) {
          // Remove potential duplicates by plan ID
          final Map<int, TrainingPlan> uniquePlans = {};
          for (var plan in provider.currentTrainerPlans) {
            uniquePlans[plan.id] = plan;
          }
          final plans = uniquePlans.values.toList();

          return Stack(
            children: [
              // Background Header
              Container(
                height: 120.h,
                width: double.infinity,
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage('assets/images/trainer_bg_appbar.png'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              SafeArea(
                child: Column(
                  children: [
                    _buildHeader(context),
                    Expanded(
                      child: provider.isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : plans.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.assignment_outlined,
                                    size: 64.sp,
                                    color: Colors.grey[300],
                                  ),
                                  SizedBox(height: 16.h),
                                  Text(
                                    'No plans found.\nAdd your first coaching plan!',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: Colors.grey[400],
                                      fontSize: 16.sp,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.separated(
                              padding: EdgeInsets.symmetric(
                                horizontal: 16.w,
                                vertical: 20.h,
                              ),
                              itemCount: plans.length,
                              separatorBuilder: (_, __) =>
                                  SizedBox(height: 16.h),
                              itemBuilder: (context, index) {
                                return _buildPlanCard(plans[index]);
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.pushNamed(
            context,
            Routing.trainerAddPlanScreen,
          );

          if (result == true) {
            _fetchPlans();
          }
        },
        backgroundColor: Custom().colors().lightGreen,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: EdgeInsets.all(8.w),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
            ),
          ),
          SizedBox(width: 16.w),
          Text(
            'Manage Plans',
            style: TextStyle(
              fontSize: 22.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(TrainingPlan plan) {
    bool isActive = plan.isActive;

    return Opacity(
      opacity: isActive ? 1.0 : 0.6,
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
          border: Border.all(
            color: isActive
                ? Custom().colors().lightGreen.withOpacity(0.5)
                : Colors.grey.shade300,
            width: 1.5,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title and Badge
              Row(
                children: [
                  Expanded(
                    child: Text(
                      plan.name,
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: isActive ? Colors.black87 : Colors.grey[600],
                      ),
                    ),
                  ),
                  if (plan.badge != null) ...[
                    SizedBox(width: 8.w),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 8.w,
                        vertical: 4.h,
                      ),
                      decoration: BoxDecoration(
                        color: Custom().colors().lightGreen.withOpacity(
                          isActive ? 0.1 : 0.05,
                        ),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        plan.badge!,
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.bold,
                          color: isActive
                              ? Custom().colors().lightGreen
                              : Colors.grey,
                        ),
                      ),
                    ),
                  ],
                  // Delete Button
                  IconButton(
                    icon: Icon(
                      Icons.delete_outline,
                      color: Colors.red[300],
                      size: 20.sp,
                    ),
                    onPressed: () => _confirmDeletePlan(plan),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
              SizedBox(height: 4.h),
              Text(
                plan.description,
                style: TextStyle(
                  fontSize: 12.sp,
                  color: isActive ? Colors.grey[600] : Colors.grey[400],
                ),
              ),
              SizedBox(height: 8.h),

              // Price and Duration
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    '${plan.price.toStringAsFixed(0)} EGP',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: isActive
                          ? Custom().colors().lightGreen
                          : Colors.grey[400],
                    ),
                  ),
                  SizedBox(width: 4.w),
                  Text(
                    '/ ${plan.durationMonths != null && plan.durationMonths! > 0
                        ? '${plan.durationMonths! % 1 == 0 ? plan.durationMonths!.toInt() : plan.durationMonths} ${plan.durationMonths == 1 ? "Month" : "Months"}'
                        : plan.durationHours != null && plan.durationHours! > 0
                        ? (plan.durationHours! < 1.0 ? '${(plan.durationHours! * 60).toInt()} ${((plan.durationHours! * 60).toInt()) == 1 ? "Minute" : "Minutes"}' : '${plan.durationHours! % 1 == 0 ? plan.durationHours!.toInt() : plan.durationHours} ${plan.durationHours == 1 ? "Hour" : "Hours"}')
                        : '${plan.durationDays % 1 == 0 ? plan.durationDays.toInt() : plan.durationDays} ${plan.durationDays == 1 ? "Day" : "Days"}'}',
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: isActive ? Colors.grey[500] : Colors.grey[400],
                    ),
                  ),
                ],
              ),

              SizedBox(height: 12.h),
              Divider(color: Colors.grey[200]),
              SizedBox(height: 12.h),
              ...List.generate(
                plan.features.length,
                (index) => Padding(
                  padding: EdgeInsets.only(bottom: 6.h),
                  child: Row(
                    children: [
                      Icon(
                        Icons.check, // Using simpler check icon as per design
                        size: 16.sp,
                        color: Custom().colors().lightGreen,
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        // Added Expanded to handle long text
                        child: Text(
                          plan.features[index],
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Transform.scale(
                        scale: 0.8,
                        child: Switch(
                          value: isActive,
                          activeThumbColor: Custom().colors().lightGreen,
                          onChanged: (val) async {
                            final auth = context.read<AuthProvider>();
                            if (auth.userId != null) {
                              final provider = context.read<TrainerProvider>();
                              final data = {
                                'name': plan.name,
                                'description': plan.description,
                                'price': plan.price,
                                'durationDays': plan.durationDays,
                                if (plan.durationMonths != null)
                                  'durationMonths': plan.durationMonths,
                                if (plan.durationHours != null)
                                  'durationHours': plan.durationHours,
                                'badge': plan.badge,
                                'features': plan.features,
                                'isActive': val,
                              };
                              final success = await provider.updatePlan(
                                auth.userId!,
                                plan.id,
                                data,
                              );

                              if (!success && mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      provider.errorMessage ??
                                          'Failed to update status',
                                    ),
                                  ),
                                );
                              }
                            }
                          },
                        ),
                      ),
                      Text(
                        isActive ? 'Active' : 'Inactive',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: isActive ? Colors.black87 : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () async {
                      final result = await Navigator.pushNamed(
                        context,
                        Routing.trainerAddPlanScreen,
                        arguments: plan,
                      );
                      if (result == true) {
                        _fetchPlans();
                      }
                    },
                    child: Text(
                      'Edit',
                      style: TextStyle(
                        color: Custom().colors().lightGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDeletePlan(TrainingPlan plan) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete Plan'),
        content: Text('Are you sure you want to delete "${plan.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext); // pop dialog context properly
              // Capture outer context properties before async gaps if needed,
              // but since outer context is State.context it remains active mostly,
              // though for safety we should check screen mounted state.
              if (!mounted) return;

              final auth = context.read<AuthProvider>();
              if (auth.userId != null) {
                final success = await context
                    .read<TrainerProvider>()
                    .deletePlan(auth.userId!, plan.id);
                if (success && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Plan deleted successfully')),
                  );
                } else if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete plan')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
