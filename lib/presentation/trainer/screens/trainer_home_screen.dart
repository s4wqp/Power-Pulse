import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';
import 'package:power_pulse/presentation/widgets/chat_badge_icon.dart';

class TrainerHomeScreen extends StatefulWidget {
  const TrainerHomeScreen({super.key});

  @override
  State<TrainerHomeScreen> createState() => _TrainerHomeScreenState();
}

class _TrainerHomeScreenState extends State<TrainerHomeScreen> {
  int _currentIndex = 0;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.userId != null) {
        final trainerProvider = Provider.of<TrainerProvider>(
          context,
          listen: false,
        );
        trainerProvider.fetchCurrentTrainer(authProvider.userId!);
        trainerProvider.fetchTrainerStats(authProvider.userId!);
        trainerProvider.fetchTrainerSubscriptions(authProvider.userId!);

        // Fetch contacts to use as subscribers
        Provider.of<ChatProvider>(
          context,
          listen: false,
        ).fetchContacts(authProvider.userId!, 'Trainer');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 10.h),
                    _buildWelcome(),
                    SizedBox(height: 24.h),
                    _buildStatsCards(),
                    SizedBox(height: 24.h),
                    Text(
                      'Resume Trainees Plan',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: Custom().colors().lightGreen,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    _buildTraineesList(),
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 150.h, // Reduced height
      width: double.infinity,
      decoration: BoxDecoration(
        color: Custom()
            .colors()
            .primaryButton, // Or any solid color if needed, or just remove image
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30.r),
          bottomRight: Radius.circular(30.r),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(height: 30.h), // Reduced top padding
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              height: 50.h,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3), // Semi-transparent
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: Custom().colors().lightGreen,
                  width: 1,
                ), // Green border
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.search,
                    color: Colors.black54,
                    size: 24.sp,
                  ), // Dark Icon
                  SizedBox(width: 12.w),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value.toLowerCase();
                        });
                      },
                      style: TextStyle(color: Colors.white, fontSize: 14.sp),
                      decoration: InputDecoration(
                        hintText: 'Search for a trainee',
                        hintStyle: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 14.sp,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
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

  Widget _buildWelcome() {
    return Consumer2<AuthProvider, TrainerProvider>(
      builder: (context, authProvider, trainerProvider, child) {
        final name =
            trainerProvider.currentTrainer?.name ??
            authProvider.fullName ??
            'Trainer';
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, $name',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Custom().colors().lightGreen,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              'Everything you need is right here',
              style: TextStyle(
                fontSize: 11.sp,
                color: Custom().colors().lightGreen, // Green subtitle
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatsCards() {
    return Consumer2<TrainerProvider, ChatProvider>(
      builder: (context, trainerProvider, chatProvider, child) {
        // De-duplicate contacts (same logic as the list below)
        final Map<int, ChatContact> uniqueContacts = {};
        for (var contact in chatProvider.contacts) {
          uniqueContacts[contact.userId] = contact;
        }
        final int activeContactsCount = uniqueContacts.length;

        // Use active contacts count as the primary reliable source of truth
        // since it is deduplicated and actively filtered by the backend.
        int clientsCount = activeContactsCount;
        if (clientsCount == 0) {
          clientsCount = (trainerProvider.stats?.totalClients ?? 0);
        }

        // Total amount from stats endpoint
        double totalAmount = trainerProvider.stats?.totalAmount ?? 0.0;

        // Fallback: if stats endpoint returned 0 and there are active subscribers,
        // compute from plans. Each subscriber is on a plan, so sum up one active
        // plan price per subscriber. If only 1 active plan exists, multiply by count.
        if (totalAmount == 0.0 && activeContactsCount > 0) {
          final plans = trainerProvider.currentTrainerPlans;
          if (plans.isNotEmpty) {
            // Get active plans only; if none are active, use all plans
            final activePlans = plans.where((p) => p.isActive).toList();
            final relevantPlans = activePlans.isNotEmpty ? activePlans : plans;

            if (relevantPlans.length == 1) {
              // If only one plan, each subscriber is on that plan
              totalAmount = relevantPlans.first.price * activeContactsCount;
            } else {
              // Sum all active plan prices as a reasonable estimate
              // (each subscriber likely on a different plan)
              double totalPlanPrices = 0;
              for (final plan in relevantPlans) {
                totalPlanPrices += plan.price;
              }
              // If more subscribers than plans, at minimum use the total of plan prices
              totalAmount = totalPlanPrices > 0 ? totalPlanPrices : 0.0;
            }
          }
        }

        return Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: "Today Client's",
                value: "$clientsCount",
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildStatCard(
                title: "Total Amount",
                value: "${totalAmount.toStringAsFixed(0)} EGP",
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatCard({required String title, required String value}) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30.r), // More rounded stats card
        border: Border.all(color: Custom().colors().lightGreen, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF344955), // Dark grey/blue
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: Custom().colors().lightGreen,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTraineesList() {
    return Consumer<ChatProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        // De-duplicate contacts by userId (same logic as ChatList)
        final Map<int, ChatContact> uniqueContacts = {};
        for (var contact in provider.contacts) {
          uniqueContacts[contact.userId] = contact;
        }
        final contacts = uniqueContacts.values
            .where(
              (c) =>
                  _searchQuery.isEmpty ||
                  c.name.toLowerCase().contains(_searchQuery),
            )
            .toList();

        if (contacts.isEmpty) {
          return Padding(
            padding: EdgeInsets.symmetric(vertical: 20.h),
            child: Center(
              child: Text(
                'No active trainees found.',
                style: TextStyle(fontSize: 14.sp, color: Colors.grey),
              ),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: contacts.length,
          itemBuilder: (context, index) {
            final contact = contacts[index];
            return GestureDetector(
              onTap: () {
                Navigator.pushNamed(
                  context,
                  Routing.trainerChatDetailScreen,
                  arguments: {
                    'id': contact.userId,
                    'name': contact.name,
                    'image': contact.profileImageUrl,
                    'role': contact.role,
                  },
                );
              },
              child: Container(
                margin: EdgeInsets.only(bottom: 12.h),
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.r),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 5,
                      offset: const Offset(0, 2),
                    ),
                  ],
                  border: Border.all(color: Colors.grey.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10.r),
                      child: contact.profileImageUrl != null
                          ? CachedImage(
                              imageUrl: contact.profileImageUrl!,
                              width: 40.w,
                              height: 40.w,
                              fit: BoxFit.cover,
                              errorWidget: _buildAvatarPlaceholder(),
                            )
                          : _buildAvatarPlaceholder(),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Text(
                              contact.name,
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.bold,
                                color: Custom().colors().lightGreen,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          SizedBox(width: 8.w),
                          Builder(
                            builder: (context) {
                              final subs = context.select(
                                (TrainerProvider p) => p.subscriptions,
                              );
                              final traineeSubs = subs
                                  .where(
                                    (s) => s['traineeId'] == contact.userId,
                                  )
                                  .toList();
                              traineeSubs.sort(
                                (a, b) => (b['id'] as int? ?? 0).compareTo(
                                  a['id'] as int? ?? 0,
                                ),
                              );

                              final status = traineeSubs.isNotEmpty
                                  ? (traineeSubs.first['status'] ?? 'Active')
                                  : 'Active';
                              final isActive = status == 'Active';
                              final text = isActive
                                  ? 'Active'
                                  : (status == 'Expired'
                                        ? 'Expired'
                                        : 'Subscriber');
                              final color = isActive
                                  ? Custom().colors().lightGreen
                                  : (status == 'Expired'
                                        ? Colors.red
                                        : Colors.grey);

                              return Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 8.w,
                                  vertical: 4.h,
                                ),
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12.r),
                                ),
                                child: Text(
                                  text,
                                  style: TextStyle(
                                    fontSize: 10.sp,
                                    color: color,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAvatarPlaceholder() {
    return Container(
      width: 40.w,
      height: 40.w,
      color: Colors.grey[200],
      child: Icon(Icons.person, color: Colors.grey, size: 24.w),
    );
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        setState(() {
          _currentIndex = index;
        });
        // Implement navigation logic here when other screens are ready
        if (index == 0) {
          // Stay here
        } else if (index == 1) {
          Navigator.pushNamed(context, Routing.trainerChatListScreen);
        } else if (index == 2) {
          // Navigate to Trainer Exercise Library
          Navigator.pushNamed(context, Routing.trainerExerciseLibraryScreen);
        } else if (index == 3) {
          Navigator.pushNamed(context, Routing.trainerProfileScreen);
        }
      },
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: ChatBadgeIcon(
            child: Image.asset(
              'assets/icons/chat.png',
              width: 20.w,
              color: _currentIndex == 1
                  ? Custom().colors().lightGreen
                  : Colors.grey,
            ),
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 20.w,
            color: _currentIndex == 2
                ? Custom().colors().lightGreen
                : Colors.grey,
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 20.w,
            color:
                _currentIndex ==
                    3 // Updated index
                ? Custom().colors().lightGreen
                : Colors.grey,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
