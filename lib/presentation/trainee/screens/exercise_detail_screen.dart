import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:power_pulse/routing.dart';

class ExerciseDetailScreen extends StatefulWidget {
  final Map<String, dynamic> exercise;

  const ExerciseDetailScreen({super.key, required this.exercise});

  @override
  State<ExerciseDetailScreen> createState() => _ExerciseDetailScreenState();
}

class _ExerciseDetailScreenState extends State<ExerciseDetailScreen> {
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;

  // Map muscle names to their anatomy image assets
  static const Map<String, String> _muscleAnatomyImages = {
    'Chest': 'assets/images/chest.png',
    'Back': 'assets/images/back.png',
    'Arms': 'assets/images/arms.png',
    'Shoulders': 'assets/images/shoulder.png',
    'Abs': 'assets/images/abs.png',
    'Legs': 'assets/images/legs.png',
  };

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      final String? localVideoPath = widget.exercise['localVideoPath'];
      final String? videoUrl = widget.exercise['videoUrl'];

      if (localVideoPath != null && await File(localVideoPath).exists()) {
        _videoPlayerController = VideoPlayerController.file(
          File(localVideoPath),
        );
      } else if (videoUrl == null || videoUrl == '...') {
        _videoPlayerController = VideoPlayerController.asset(
          'assets/videos/demo_video.mp4',
        );
      } else if (videoUrl.startsWith('http')) {
        _videoPlayerController = VideoPlayerController.networkUrl(
          Uri.parse(videoUrl),
        );
      } else {
        _videoPlayerController = VideoPlayerController.asset(videoUrl);
      }

      await _videoPlayerController.initialize();

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: false,
        looping: true,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        placeholder: Container(
          color: Colors.black,
          child: const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Padding(
              padding: EdgeInsets.all(8.0),
              child: Text(
                "Error playing video",
                style: const TextStyle(color: Colors.white),
              ),
            ),
          );
        },
      );
      setState(() {});
    } catch (e) {
      debugPrint("Error initializing video player: $e");
    }
  }

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  /// Build the two anatomy images (primary muscle + secondary muscle)
  /// exactly like Figma: two rounded cards side by side
  Widget _buildAnatomySection() {
    final String? targetMuscle = widget.exercise['targetMuscle'];
    final String? assistantMuscle = widget.exercise['assistantMuscle'];
    final List<dynamic>? anatomyList =
        widget.exercise['anatomy'] as List<dynamic>?;

    // Determine the two anatomy image paths
    String? primaryImage;
    String? secondaryImage;

    if (anatomyList != null && anatomyList.isNotEmpty) {
      // Static exercises already have anatomy paths
      primaryImage = anatomyList[0] as String?;
      if (anatomyList.length > 1) {
        secondaryImage = anatomyList[1] as String?;
      }
    } else {
      // Trainer workouts: map muscle name -> anatomy image
      if (targetMuscle != null &&
          _muscleAnatomyImages.containsKey(targetMuscle)) {
        primaryImage = _muscleAnatomyImages[targetMuscle];
      }
      if (assistantMuscle != null &&
          _muscleAnatomyImages.containsKey(assistantMuscle)) {
        secondaryImage = _muscleAnatomyImages[assistantMuscle];
      }
    }

    // If no images at all, don't show section
    if (primaryImage == null && secondaryImage == null) {
      return SizedBox.shrink();
    }

    return Row(
      children: [
        if (primaryImage != null)
          Expanded(
            child: Column(
              children: [
                Container(
                  height: 80.h,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: Image.asset(
                      primaryImage,
                      fit: BoxFit.contain,
                      errorBuilder: (c, e, s) => Icon(
                        Icons.fitness_center,
                        size: 30.sp,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 6.h),
                Text(
                  targetMuscle ?? 'Target',
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        if (primaryImage != null && secondaryImage != null)
          SizedBox(width: 12.w),
        if (secondaryImage != null)
          Expanded(
            child: Column(
              children: [
                Container(
                  height: 80.h,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: Image.asset(
                      secondaryImage,
                      fit: BoxFit.contain,
                      errorBuilder: (c, e, s) => Icon(
                        Icons.fitness_center,
                        size: 30.sp,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 6.h),
                Text(
                  assistantMuscle ?? 'Assistant',
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final String targetMuscle = widget.exercise['targetMuscle'] ?? 'General';

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
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 10.h,
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: Text(
                          widget.exercise['name'] ??
                              widget.exercise['title'] ??
                              '',
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(30.r),
                      ),
                    ),
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(16.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Video Player
                          Container(
                            height: 200.h,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(15.r),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(15.r),
                              child:
                                  _chewieController != null &&
                                      _chewieController!
                                          .videoPlayerController
                                          .value
                                          .isInitialized
                                  ? Chewie(controller: _chewieController!)
                                  : const Center(
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                      ),
                                    ),
                            ),
                          ),
                          SizedBox(height: 16.h),

                          // Anatomy Images (Primary + Secondary muscle like Figma)
                          _buildAnatomySection(),
                          SizedBox(height: 16.h),

                          // Exercise Name
                          Text(
                            widget.exercise['name'] ??
                                widget.exercise['title'] ??
                                '',
                            style: TextStyle(
                              fontSize: 22.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          SizedBox(height: 5.h),

                          // Body part label (like Figma: "Body part: Chest")
                          Text(
                            "Body part: $targetMuscle",
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[700],
                            ),
                          ),
                          SizedBox(height: 15.h),

                          // Description
                          Text(
                            widget.exercise['description'] ??
                                "No description available.",
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.grey[600],
                              height: 1.5,
                            ),
                          ),
                          SizedBox(height: 20.h),

                          // Replacements
                          if (widget.exercise['replacement1'] != null ||
                              widget.exercise['replacement2'] != null) ...[
                            Text(
                              "or",
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey[400],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 10.h),
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  if (widget.exercise['replacement1'] != null)
                                    _buildReplacementVideoCard(
                                      widget.exercise['replacement1'],
                                    ),
                                  if (widget.exercise['replacement2'] !=
                                      null) ...[
                                    SizedBox(width: 15.w),
                                    _buildReplacementVideoCard(
                                      widget.exercise['replacement2'],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
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
    );
  }

  Widget _buildReplacementVideoCard(dynamic replacementData) {
    if (replacementData is! Map) {
      return SizedBox.shrink();
    }

    final String name = replacementData['name'] ?? 'Alternative';
    final String? image = replacementData['image'];

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          Routing.exerciseDetailScreen,
          arguments: replacementData,
        );
      },
      child: Container(
        width: 140.w,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15.r),
          color: Colors.black,
        ),
        child: Column(
          children: [
            Container(
              height: 100.h,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(15.r)),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (image != null)
                    ClipRRect(
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(15.r),
                      ),
                      child: image.startsWith('http')
                          ? Image.network(image, fit: BoxFit.cover)
                          : Image.file(
                              File(image),
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  Container(color: Colors.grey[800]),
                            ),
                    )
                  else
                    Container(
                      color: Colors.grey[800],
                      child: Icon(
                        Icons.fitness_center,
                        color: Colors.white,
                        size: 30.sp,
                      ),
                    ),
                  Center(
                    child: Container(
                      padding: EdgeInsets.all(6.r),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.7),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.play_arrow,
                        size: 24.sp,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 8.w),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(15.r),
                ),
              ),
              child: Text(
                name,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12.sp,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
