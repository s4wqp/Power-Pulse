import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart' as custom_theme;
import 'package:power_pulse/data/dashboard_data.dart';
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:provider/provider.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:path_provider/path_provider.dart';

class ExerciseLibraryScreen extends StatefulWidget {
  const ExerciseLibraryScreen({super.key});

  @override
  State<ExerciseLibraryScreen> createState() => _ExerciseLibraryScreenState();
}

class _ExerciseLibraryScreenState extends State<ExerciseLibraryScreen> {
  String selectedCategory = 'Chest';
  final Map<String, String> _thumbnailCache = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.userId != null) {
        context.read<TraineeProvider>().fetchTrainerWorkouts(auth.userId!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
          SizedBox(height: 10.h),
          _buildCategorySelector(),
          Expanded(child: _buildExerciseList()),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 120.h,
      width: double.infinity,
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/images/bg_appbar.png'),
          fit: BoxFit.cover,
        ),
      ),
      child: Center(
        child: Padding(
          padding: EdgeInsets.only(top: 20.h),
          child: Text(
            'Exercise Library',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategorySelector() {
    return Container(
      height: 45.h,
      margin: EdgeInsets.symmetric(horizontal: 16.w),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: DashboardData.exerciseCategories.length,
        separatorBuilder: (_, __) => SizedBox(width: 10.w),
        itemBuilder: (context, index) {
          final category = DashboardData.exerciseCategories[index];
          final isSelected = category['name'] == selectedCategory;
          return GestureDetector(
            onTap: () {
              setState(() {
                selectedCategory = category['name']!;
              });
            },
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: isSelected
                    ? custom_theme.Custom().colors().lightGreen
                    : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(25.r),
              ),
              child: Row(
                children: [
                  Image.asset(
                    category['icon']!,
                    width: 24.w,
                    height: 24.h,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        Icons.fitness_center,
                        size: 20.sp,
                        color: isSelected ? Colors.white : Colors.grey,
                      );
                    },
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    category['name']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.black54,
                      fontWeight: FontWeight.w600,
                      fontSize: 14.sp,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildExerciseList() {
    final trainerWorkouts = context.watch<TraineeProvider>().trainerWorkouts;

    // Debug: log all workouts and their targetMuscle to identify the issue
    for (var w in trainerWorkouts) {
      debugPrint(
        'Workout: "${w.title}" | targetMuscle: "${w.targetMuscle}" | id: ${w.id}',
      );
    }

    // Only show exercises uploaded by the trainer, filtered by selected category
    final chatProvider = context.watch<ChatProvider>();
    final String? trainerImage = chatProvider.contacts.isNotEmpty
        ? chatProvider.contacts.first.profileImageUrl
        : null;

    final seenIds = <int>{};
    final matchingTrainerWorkouts = trainerWorkouts
        .where((w) {
          if (w.targetMuscle == null || w.targetMuscle!.isEmpty) return false;
          final matches =
              w.targetMuscle!.trim().toLowerCase() ==
              selectedCategory.trim().toLowerCase();
          if (!matches) return false;
          // Filter out replacements based on title suffix
          if (w.title.endsWith('(Alt 1)') || w.title.endsWith('(Alt 2)')) {
            return false;
          }

          // Deduplicate by ID
          if (!seenIds.add(w.id)) {
            return false;
          }
          return true;
        })
        .map((w) {
          Map<String, dynamic>? repl1;
          Map<String, dynamic>? repl2;

          if (w.replacementWorkoutIds != null &&
              w.replacementWorkoutIds!.isNotEmpty) {
            try {
              final r1Workout = trainerWorkouts.firstWhere(
                (tw) => tw.id == w.replacementWorkoutIds![0],
              );
              repl1 = {
                'name': r1Workout.title,
                'image': r1Workout.imageUrl,
                'videoUrl': r1Workout.videoUrl,
                'description': r1Workout.description,
                'targetMuscle': r1Workout.targetMuscle,
                'assistantMuscle': r1Workout.assistantMuscle,
              };
            } catch (_) {}

            if (w.replacementWorkoutIds!.length > 1) {
              try {
                final r2Workout = trainerWorkouts.firstWhere(
                  (tw) => tw.id == w.replacementWorkoutIds![1],
                );
                repl2 = {
                  'name': r2Workout.title,
                  'image': r2Workout.imageUrl,
                  'videoUrl': r2Workout.videoUrl,
                  'description': r2Workout.description,
                  'targetMuscle': r2Workout.targetMuscle,
                  'assistantMuscle': r2Workout.assistantMuscle,
                };
              } catch (_) {}
            }
          }

          return <String, dynamic>{
            'name': w.title.isNotEmpty ? w.title : 'Exercise #${w.id}',
            'image':
                w.imageUrl ??
                trainerImage ??
                'assets/images/trainee photo1.jpg',
            'videoUrl': w.videoUrl,
            'description': w.description,
            'targetMuscle': w.targetMuscle ?? selectedCategory,
            'assistantMuscle': w.assistantMuscle,
            'replacement1': repl1,
            'replacement2': repl2,
          };
        })
        .toList();

    if (matchingTrainerWorkouts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.fitness_center, size: 60.sp, color: Colors.grey[400]),
            SizedBox(height: 16.h),
            Text(
              'No exercises yet',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Your trainer hasn\'t added $selectedCategory exercises yet.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14.sp, color: Colors.grey[500]),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: EdgeInsets.all(16.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16.w,
        mainAxisSpacing: 16.h,
        childAspectRatio: 0.85,
      ),
      itemCount: matchingTrainerWorkouts.length,
      itemBuilder: (context, index) {
        final exercise = matchingTrainerWorkouts[index];
        return _buildExerciseCard(exercise);
      },
    );
  }

  // _buildCategoryItem removed because My Trainer static category was removed.

  Widget _buildExerciseCard(Map<String, dynamic> exercise) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          Routing.exerciseDetailScreen,
          arguments: exercise,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15.r),
          color: Colors.black,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15.r),
          child: Column(
            children: [
              // Image / Thumbnail area
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Builder(
                      builder: (context) {
                        final videoUrl = exercise['videoUrl'] as String?;
                        if (videoUrl != null &&
                            videoUrl.isNotEmpty &&
                            videoUrl.startsWith('http')) {
                          if (_thumbnailCache.containsKey(videoUrl)) {
                            return Image.file(
                              File(_thumbnailCache[videoUrl]!),
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Image.asset(
                                    'assets/images/bg_appbar.png',
                                    fit: BoxFit.cover,
                                  ),
                            );
                          } else {
                            return FutureBuilder<String?>(
                              future: _getThumbnail(videoUrl),
                              builder: (context, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return Container(
                                    color: Colors.grey[800],
                                    child: Center(
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  );
                                }
                                if (snapshot.hasData && snapshot.data != null) {
                                  return Image.file(
                                    File(snapshot.data!),
                                    fit: BoxFit.cover,
                                    errorBuilder:
                                        (context, error, stackTrace) =>
                                            Image.asset(
                                              'assets/images/bg_appbar.png',
                                              fit: BoxFit.cover,
                                            ),
                                  );
                                }
                                return Container(
                                  color: Colors.grey[800],
                                  child: Icon(
                                    Icons.fitness_center,
                                    color: Colors.white,
                                  ),
                                );
                              },
                            );
                          }
                        } else {
                          return Container(
                            color: Colors.grey[800],
                            child: Icon(
                              Icons.fitness_center,
                              color: Colors.white,
                              size: 40.sp,
                            ),
                          );
                        }
                      },
                    ),
                    // Play Button Overlay
                    Center(
                      child: Container(
                        padding: EdgeInsets.all(8.r),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.7),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.play_arrow,
                          size: 30.sp,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Exercise Name below the image
              Container(
                width: double.infinity,
                color: Colors.black,
                padding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 8.w),
                child: Text(
                  exercise['name'] ?? 'Unnamed Exercise',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13.sp,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<String?> _getThumbnail(String videoUrl) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final uniquePath = '${tempDir.path}/thumb_${videoUrl.hashCode}.webp';
      final fileName = await VideoThumbnail.thumbnailFile(
        video: videoUrl,
        thumbnailPath: uniquePath,
        imageFormat: ImageFormat.WEBP,
        maxHeight: 256,
        quality: 75,
      );
      if (fileName != null) {
        _thumbnailCache[videoUrl] = fileName;
      }
      return fileName;
    } catch (e) {
      debugPrint("Error generating thumbnail for $videoUrl: $e");
      // video_thumbnail often fails on Google Drive view links. Return null to trigger fallback image.
      return null;
    }
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: 2, // 'Exercise' tab is index 2
      type: BottomNavigationBarType.fixed,
      selectedItemColor: custom_theme.Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushReplacementNamed(context, Routing.traineeHomeScreen);
        } else if (index == 1) {
          Navigator.pushReplacementNamed(context, Routing.chatListScreen);
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
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().bottomNavigationBar,
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().lightGreen, // Active color
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/cart.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().bottomNavigationBar,
          ),
          label: 'Card',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().bottomNavigationBar,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
