import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/data/dashboard_data.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/presentation/widgets/cached_image.dart';
import 'package:power_pulse/presentation/widgets/chat_badge_icon.dart';

class TraineeHomeScreen extends StatefulWidget {
  const TraineeHomeScreen({super.key});

  @override
  State<TraineeHomeScreen> createState() => _TraineeHomeScreenState();
}

class _TraineeHomeScreenState extends State<TraineeHomeScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  String _searchQuery = '';
  String _selectedSpecialization = 'All';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _dashboardPages = [
    {
      'title': 'Food',
      'image': 'assets/images/food_container.png',
      'route': Routing.genericCategoryScreen,
      'args': {
        'pageTitle': 'Food category',
        'appBarImage': 'assets/images/bg_appbar.png',
        'categories': DashboardData.foodCategories,
        'items': DashboardData.foodItems,
        'storeType': 'HealthyMeals',
      },
    },
    {
      'title': 'Supplements',
      'image': 'assets/images/supplements_container.png',
      'route': Routing.genericCategoryScreen,
      'args': {
        'pageTitle': 'Supplements',
        'appBarImage': 'assets/images/bg_appbar2.png',
        'categories': DashboardData.supplementCategories,
        'items': DashboardData.supplementItems,
        'storeType': 'Supplements',
      },
    },
    {
      'title': 'Clothes',
      'image': 'assets/images/clothes_container.png',
      'route': Routing.clothingCategoryScreen,
      'args': null,
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final traineeProvider = Provider.of<TraineeProvider>(
        context,
        listen: false,
      );

      Provider.of<TrainerProvider>(context, listen: false).fetchTrainers();

      if (authProvider.userId != null) {
        traineeProvider.fetchProfile(authProvider.userId!);

        // Fetch chat contacts so the unread badge on the nav bar has data
        Provider.of<ChatProvider>(
          context,
          listen: false,
        ).fetchContacts(authProvider.userId!, 'Trainee');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _buildHeader()),
          SliverPadding(
            padding: EdgeInsets.all(14.w),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildWelcomeSection(),
                  SizedBox(height: 16.h),
                  _buildBannerSection(),
                  SizedBox(height: 16.h),
                ],
              ),
            ),
          ),
          _buildTrainerSliverList(),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildHeader() {
    return Stack(
      children: [
        Image.asset(
          'assets/images/bg_appbar.png',
          height: 120.h,
          width: double.infinity,
          fit: BoxFit.cover,
        ),

        Positioned(
          top: 50.h,
          left: 20.w,
          right: 16.w,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Search for a trainer',
                    hintStyle: TextStyle(
                      color: Custom().colors().search,
                      fontSize: 12.sp,
                    ),
                    prefixIcon: Icon(
                      Icons.search,
                      color: Custom().colors().search,
                      size: 20.sp,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Custom().colors().bgContainer.withOpacity(0.63),
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 0,
                      horizontal: 8.w,
                    ),
                  ),
                  style: TextStyle(
                    color: Custom().colors().black,
                    fontSize: 12.sp,
                  ),
                ),
              ),
              SizedBox(width: 8.w),
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.r),
                  color: Custom().colors().bgContainer.withOpacity(0.63),
                ),
                child: IconButton(
                  icon: Icon(
                    Icons.filter_list,
                    size: 24.sp,
                    color: Custom().colors().black,
                  ),
                  onPressed: () {
                    _showFilterDialog();
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showFilterDialog() {
    final trainerProvider = Provider.of<TrainerProvider>(
      context,
      listen: false,
    );
    final trainers = trainerProvider.trainers;

    final Set<String> specializations = {
      'All',
      'Yoga',
      'Weight Loss',
      'Strength Training',
      'Bodybuilding',
      'Rehabilitation',
      'Senior Fitness',
      'Athletic Performance',
    };
    for (var trainer in trainers) {
      if (trainer.specializations.isNotEmpty) {
        specializations.addAll(trainer.specializations.map((s) => s.name));
      } else if (trainer.professionalTitle.isNotEmpty) {
        specializations.add(trainer.professionalTitle);
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.all(20.w),
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.7,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Filter by Specialization',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    Wrap(
                      spacing: 8.w,
                      runSpacing: 8.h,
                      children: specializations.map((spec) {
                        final isSelected = _selectedSpecialization == spec;
                        return ChoiceChip(
                          label: Text(spec),
                          selected: isSelected,
                          onSelected: (selected) {
                            setModalState(() {
                              _selectedSpecialization = selected ? spec : 'All';
                            });
                            setState(() {
                              _selectedSpecialization = selected ? spec : 'All';
                            });
                            Navigator.pop(context);
                          },
                          selectedColor: Custom().colors().lightGreen,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                          ),
                        );
                      }).toList(),
                    ),
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildWelcomeSection() {
    return Consumer2<AuthProvider, TraineeProvider>(
      builder: (context, authProvider, traineeProvider, child) {
        final name =
            traineeProvider.trainee?.name ?? authProvider.fullName ?? 'User';
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Custom().mainText(
              'Welcome, $name',
              fontSize: 22.sp,
              color: Custom().colors().lightGreen,
            ),
            Custom().subMainText(
              'Ready to crush Your fitness goals today?',
              fontSize: 14.sp,
              color: Custom().colors().lightGreen.withOpacity(0.8),
              fontWeight: FontWeight.w400,
            ),
          ],
        );
      },
    );
  }

  Widget _buildBannerSection() {
    return Column(
      children: [
        SizedBox(
          height: 130.h,
          child: PageView.builder(
            controller: _pageController,
            itemCount: _dashboardPages.length,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemBuilder: (context, index) {
              final page = _dashboardPages[index];
              return GestureDetector(
                onTap: () {
                  Routing.navigateTo(
                    context,
                    page['route'],
                    arguments: page['args'],
                  );
                },
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 4.w),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.r),
                    image: DecorationImage(
                      image: AssetImage(page['image']),
                      fit: BoxFit.cover,
                      onError: (exception, stackTrace) {},
                    ),
                    color: Colors.grey[300], // Placeholder color
                  ),
                  child: null,
                ),
              );
            },
          ),
        ),
        SizedBox(height: 10.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            _dashboardPages.length,
            (index) => _buildDot(index == _currentPage),
          ),
        ),
      ],
    );
  }

  Widget _buildTrainerSliverList() {
    return Consumer<TrainerProvider>(
      builder: (context, trainerProvider, child) {
        if (trainerProvider.isLoading) {
          return const SliverToBoxAdapter(
            child: Center(child: CircularProgressIndicator()),
          );
        }

        if (trainerProvider.errorMessage != null) {
          return SliverToBoxAdapter(
            child: Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20.h),
                child: Text(
                  trainerProvider.errorMessage!,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.red.shade400,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        }

        var trainers = trainerProvider.trainers;

        if (_searchQuery.isNotEmpty) {
          trainers = trainers
              .where(
                (t) =>
                    t.name.toLowerCase().contains(_searchQuery.toLowerCase()),
              )
              .toList();
        }

        if (_selectedSpecialization != 'All') {
          trainers = trainers.where((t) {
            final specs = t.specializations.map((s) => s.name).toList();
            if (specs.isEmpty) {
              return t.professionalTitle == _selectedSpecialization;
            }
            return specs.contains(_selectedSpecialization);
          }).toList();
        }

        if (trainers.isEmpty) {
          return const SliverToBoxAdapter(
            child: Center(child: Text('No trainers found.')),
          );
        }

        return SliverPadding(
          padding: EdgeInsets.symmetric(horizontal: 14.w),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              if (index == 0) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Custom().mainText(
                      'Find Your Trainer',
                      fontSize: 18.sp,
                      color: Custom().colors().lightGreen,
                    ),
                    SizedBox(height: 8.h),
                    _buildTrainerCard(trainers[0]),
                  ],
                );
              }
              return _buildTrainerCard(trainers[index]);
            }, childCount: trainers.length),
          ),
        );
      },
    );
  }

  // ... (keep _buildDot)

  Widget _buildDot(bool isActive) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 2.5.w),
      width: 8.w,
      height: 8.h,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? Custom().colors().lightGreen : Colors.grey.shade300,
      ),
    );
  }

  Widget _buildTrainerCard(Trainer trainer) {
    return GestureDetector(
      onTap: () {
        Routing.navigateTo(
          context,
          Routing.coachProfileScreen,
          arguments: trainer,
        );
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        padding: EdgeInsets.all(8.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4.r,
              offset: Offset(0, 2.h),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8.r),
              child: SizedBox(
                width: 50.w,
                height: 50.h,
                child: trainer.profileImageUrl != null
                    ? CachedImage(
                        imageUrl: trainer.profileImageUrl!,
                        width: 50.w,
                        height: 50.h,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: Colors.grey[300],
                        child: Icon(Icons.person),
                      ),
              ),
            ),
            SizedBox(width: 10.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Custom().mainText(
                    trainer.name,
                    fontSize: 14.sp,
                    color: Custom().colors().lightGreen,
                  ),
                  Text(
                    trainer.bio.length > 50
                        ? '${trainer.bio.substring(0, 50)}...'
                        : trainer.bio,
                    style: TextStyle(
                      fontSize: 10.sp,
                      color: Custom().colors().lightGreen,
                    ),
                  ),
                  Row(
                    children: List.generate(
                      5,
                      (index) => Icon(
                        index < trainer.rating ? Icons.star : Icons.star_border,
                        color: Colors.yellow,
                        size: 12.sp,
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

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 1) {
          Navigator.pushReplacementNamed(context, Routing.chatListScreen);
        } else if (index == 2) {
          Navigator.pushReplacementNamed(
            context,
            Routing.exerciseLibraryScreen,
          );
        } else if (index == 3) {
          Navigator.pushReplacementNamed(context, Routing.shoppingCartScreen);
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
          icon: ChatBadgeIcon(
            child: Image.asset(
              'assets/icons/chat.png',
              width: 18.w,
              height: 18.h,
              color: Custom().colors().bottomNavigationBar,
            ),
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
            color: Custom().colors().bottomNavigationBar,
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
}
