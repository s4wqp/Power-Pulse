import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:path_provider/path_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';

class TrainerExerciseLibraryScreen extends StatefulWidget {
  final bool isSelectionMode;
  final int? maxSelection;

  const TrainerExerciseLibraryScreen({
    super.key,
    this.isSelectionMode = false,
    this.maxSelection,
  });

  @override
  State<TrainerExerciseLibraryScreen> createState() =>
      _TrainerExerciseLibraryScreenState();
}

class _TrainerExerciseLibraryScreenState
    extends State<TrainerExerciseLibraryScreen> {
  String _selectedMuscle = 'Chest';
  final Set<Workout> _selectedExercises = {};

  final List<Map<String, String>> _muscles = [
    {'name': 'Chest', 'image': 'assets/images/chest.png'},
    {'name': 'Back', 'image': 'assets/images/back.png'},
    {'name': 'Shoulders', 'image': 'assets/images/shoulder.png'},
    {'name': 'Arms', 'image': 'assets/images/arms.png'},
    {'name': 'Legs', 'image': 'assets/images/legs.png'},
    {'name': 'Abs', 'image': 'assets/images/abs.png'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.userId != null) {
        context.read<TrainerProvider>().fetchCurrentTrainer(auth.userId!);
      }
    });
  }

  void _toggleSelection(Workout workout) {
    setState(() {
      if (_selectedExercises.any((w) => w.id == workout.id)) {
        _selectedExercises.removeWhere((w) => w.id == workout.id);
      } else {
        if (widget.maxSelection != null &&
            _selectedExercises.length >= widget.maxSelection!) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'You can only select up to ${widget.maxSelection} exercises',
              ),
            ),
          );
          return;
        }
        _selectedExercises.add(workout);
      }
    });
  }

  void _sendSelectedExercises() {
    Navigator.pop(context, _selectedExercises.toList());
  }

  final Map<String, String> _thumbnailCache = {};

  Future<String?> _getThumbnail(String videoUrl) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final uniquePath = '${tempDir.path}/thumb_${videoUrl.hashCode}.webp';
      if (File(uniquePath).existsSync()) {
        _thumbnailCache[videoUrl] = uniquePath;
        return uniquePath;
      }

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
      return null;
    }
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
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 20.h),
                    _buildMuscleFilter(),
                    if (!widget.isSelectionMode) ...[
                      SizedBox(height: 24.h),
                      _buildAddWorkoutCard(),
                    ],
                    SizedBox(height: 24.h),
                    ..._buildExerciseSections(),
                    SizedBox(height: 80.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: widget.isSelectionMode
          ? null
          : _buildBottomNavigationBar(),
      floatingActionButton:
          widget.isSelectionMode && _selectedExercises.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: _sendSelectedExercises,
              backgroundColor: Custom().colors().lightGreen,
              icon: Icon(Icons.send, color: Colors.white),
              label: Text(
                "Send (${_selectedExercises.length})",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 100.h,
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/images/trainer_bg_appbar.png'),
          fit: BoxFit.cover,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30.r),
          bottomRight: Radius.circular(30.r),
        ),
      ),
      child: Center(
        child: Padding(
          padding: EdgeInsets.only(top: 30.h),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.isSelectionMode)
                Padding(
                  padding: EdgeInsets.only(right: 10.w),
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.arrow_back_ios,
                      color: Colors.white,
                      size: 22.sp,
                    ),
                  ),
                ),
              Icon(
                Icons.flash_on,
                color: Custom().colors().lightGreen,
                size: 28.sp,
              ),
              SizedBox(width: 8.w),
              Text(
                widget.isSelectionMode
                    ? 'Select Exercises'
                    : 'Exercise Library',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMuscleFilter() {
    return SizedBox(
      height: 48.h,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _muscles.length,
        separatorBuilder: (_, __) => SizedBox(width: 12.w),
        itemBuilder: (context, index) {
          final muscle = _muscles[index];
          final isSelected = muscle['name'] == _selectedMuscle;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedMuscle = muscle['name']!;
              });
            },
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: isSelected ? Custom().colors().lightGreen : Colors.white,
                borderRadius: BorderRadius.circular(30.r),
                border: Border.all(
                  color: isSelected
                      ? Colors.transparent
                      : Colors.grey.withOpacity(0.3),
                ),
                boxShadow: [
                  if (!isSelected)
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(muscle['image']!, width: 20.w, height: 20.w),
                  SizedBox(width: 8.w),
                  Text(
                    muscle['name']!,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.black,
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

  Widget _buildAddWorkoutCard() {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, Routing.addWorkoutScreen).then((_) {
          // Refresh workouts from API after adding a new one
          final auth = context.read<AuthProvider>();
          if (auth.userId != null) {
            context.read<TrainerProvider>().fetchCurrentTrainer(auth.userId!);
          }
        });
      },
      child: Container(
        height: 180.h,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey[400],
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add, color: Colors.white, size: 40.sp),
            SizedBox(height: 8.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(20.r),
              ),
              child: Text(
                'Add Workout',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12.sp,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildExerciseSections() {
    final trainerProvider = context.watch<TrainerProvider>();
    final trainer = trainerProvider.currentTrainer;

    if (trainerProvider.isLoading) {
      return [
        Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 40.h),
            child: CircularProgressIndicator(
              color: Custom().colors().lightGreen,
            ),
          ),
        ),
      ];
    }

    // Get workouts from the trainer's profile (fetched from API)
    final allWorkouts = trainer?.workouts ?? [];

    // Filter by selected muscle category and deduplicate by ID
    final seenIds = <int>{};
    final exercises = allWorkouts.where((w) {
      if (w.targetMuscle == null || w.targetMuscle!.isEmpty) return false;
      final matches =
          w.targetMuscle!.trim().toLowerCase() ==
          _selectedMuscle.trim().toLowerCase();
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
    }).toList();

    if (exercises.isEmpty) {
      return [
        Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 40.h),
            child: Column(
              children: [
                Icon(
                  Icons.fitness_center,
                  size: 60.sp,
                  color: Colors.grey[400],
                ),
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
                  'Add $_selectedMuscle exercises using the button above.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14.sp, color: Colors.grey[500]),
                ),
              ],
            ),
          ),
        ),
      ];
    }

    return [
      GridView.builder(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16.w,
          mainAxisSpacing: 16.h,
          childAspectRatio: 0.85,
        ),
        itemCount: exercises.length,
        itemBuilder: (context, index) {
          final workout = exercises[index];
          final name = workout.title.isNotEmpty
              ? workout.title
              : 'Exercise #${workout.id}';
          final image =
              workout.imageUrl ??
              trainer?.profileImageUrl ??
              'assets/images/trainee photo1.jpg';
          final isNetworkImage = image.startsWith('http');
          final isSelected = _selectedExercises.any((w) => w.id == workout.id);

          Map<String, dynamic>? repl1;
          Map<String, dynamic>? repl2;

          if (workout.replacementWorkoutIds != null &&
              workout.replacementWorkoutIds!.isNotEmpty) {
            try {
              final r1Workout = allWorkouts.firstWhere(
                (tw) => tw.id == workout.replacementWorkoutIds![0],
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

            if (workout.replacementWorkoutIds!.length > 1) {
              try {
                final r2Workout = allWorkouts.firstWhere(
                  (tw) => tw.id == workout.replacementWorkoutIds![1],
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

          final exerciseMap = <String, dynamic>{
            'name': name,
            'image': image,
            'videoUrl': workout.videoUrl,
            'description': workout.description,
            'targetMuscle': workout.targetMuscle ?? _selectedMuscle,
            'assistantMuscle': workout.assistantMuscle,
            'replacement1': repl1,
            'replacement2': repl2,
          };

          return GestureDetector(
            onTap: () {
              if (widget.isSelectionMode) {
                _toggleSelection(workout);
              } else {
                Navigator.pushNamed(
                  context,
                  Routing.exerciseDetailScreen,
                  arguments: exerciseMap,
                );
              }
            },
            child: Stack(
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.r),
                    color: Colors.black,
                    border: widget.isSelectionMode && isSelected
                        ? Border.all(
                            color: Custom().colors().lightGreen,
                            width: 3,
                          )
                        : null,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(17.r),
                    child: Column(
                      children: [
                        // Image area
                        Expanded(
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Builder(
                                builder: (context) {
                                  final videoUrl = workout.videoUrl;

                                  Widget fallbackImage() {
                                    return isNetworkImage
                                        ? Image.network(
                                            image,
                                            fit: BoxFit.cover,
                                            errorBuilder:
                                                (context, error, stackTrace) {
                                                  return Container(
                                                    color: Colors.grey[800],
                                                    child: Icon(
                                                      Icons.broken_image,
                                                      color: Colors.white,
                                                    ),
                                                  );
                                                },
                                          )
                                        : Image.asset(
                                            image,
                                            fit: BoxFit.cover,
                                            errorBuilder:
                                                (context, error, stackTrace) {
                                                  return Container(
                                                    color: Colors.grey[800],
                                                    child: Icon(
                                                      Icons.image,
                                                      color: Colors.white,
                                                    ),
                                                  );
                                                },
                                          );
                                  }

                                  if (videoUrl != null &&
                                      videoUrl.isNotEmpty &&
                                      videoUrl.startsWith('http')) {
                                    if (_thumbnailCache.containsKey(videoUrl)) {
                                      return Image.file(
                                        File(_thumbnailCache[videoUrl]!),
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                fallbackImage(),
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
                                                child:
                                                    CircularProgressIndicator(
                                                      color: Custom()
                                                          .colors()
                                                          .lightGreen,
                                                      strokeWidth: 2,
                                                    ),
                                              ),
                                            );
                                          }
                                          if (snapshot.hasData &&
                                              snapshot.data != null) {
                                            return Image.file(
                                              File(snapshot.data!),
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (
                                                    context,
                                                    error,
                                                    stackTrace,
                                                  ) => fallbackImage(),
                                            );
                                          }
                                          return fallbackImage();
                                        },
                                      );
                                    }
                                  } else {
                                    return fallbackImage();
                                  }
                                },
                              ),
                              if (!widget.isSelectionMode)
                                Center(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.3),
                                      shape: BoxShape.circle,
                                    ),
                                    padding: EdgeInsets.all(8.w),
                                    child: Icon(
                                      Icons.play_arrow,
                                      color: Colors.white,
                                      size: 24.sp,
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
                          padding: EdgeInsets.symmetric(
                            horizontal: 8.w,
                            vertical: 10.h,
                          ),
                          child: Text(
                            name,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13.sp,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (widget.isSelectionMode && isSelected)
                  Positioned(
                    top: 10.h,
                    right: 10.w,
                    child: Container(
                      padding: EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Custom().colors().lightGreen,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 16.sp,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    ];
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: 2,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushNamed(context, Routing.trainerHomeScreen);
        } else if (index == 1) {
          Navigator.pushNamed(context, Routing.trainerChatListScreen);
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
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 20.w,
            color: Colors.grey,
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 20.w,
            color: Custom().colors().lightGreen,
          ),
          label: 'Exercise',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/profile.png',
            width: 20.w,
            color: Colors.grey,
          ),
          label: 'Profile',
        ),
      ],
    );
  }
}
