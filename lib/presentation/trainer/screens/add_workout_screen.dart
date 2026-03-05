import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/data/dashboard_data.dart';
import 'package:power_pulse/services/drive_service.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:path_provider/path_provider.dart';
import 'package:video_compress/video_compress.dart';

import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';

class AddWorkoutScreen extends StatefulWidget {
  const AddWorkoutScreen({super.key});

  @override
  State<AddWorkoutScreen> createState() => _AddWorkoutScreenState();
}

class _AddWorkoutScreenState extends State<AddWorkoutScreen> {
  // Use a map to store muscles for target/assistant slots
  // 0: Main Target, 1: Assistant
  final Map<int, String?> _selectedMuscles = {0: null, 1: null};

  // Use a map to store replacement workouts
  // 0: First replacement, 1: Second replacement
  final Map<int, Workout?> _replacementWorkouts = {0: null, 1: null};

  bool _isVideoSelected = false;
  bool _isUploading = false;
  String? _videoLink;
  String? _localVideoPath;
  String? _thumbnailPath;

  // Replacement 1 vars
  bool _isRep1VideoSelected = false;
  bool _isRep1Uploading = false;
  String? _rep1VideoLink;
  String? _rep1LocalVideoPath;
  String? _rep1ThumbnailPath;
  VideoPlayerController? _rep1VideoController;
  ChewieController? _rep1ChewieController;

  // Replacement 2 vars
  bool _isRep2VideoSelected = false;
  bool _isRep2Uploading = false;
  String? _rep2VideoLink;
  String? _rep2LocalVideoPath;
  String? _rep2ThumbnailPath;
  VideoPlayerController? _rep2VideoController;
  ChewieController? _rep2ChewieController;

  bool _isSubmitting = false;
  final DriveService _driveService = DriveService();

  VideoPlayerController? _videoController;
  ChewieController? _chewieController;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _rep1NameController = TextEditingController();
  final TextEditingController _rep2NameController = TextEditingController();

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    _rep1VideoController?.dispose();
    _rep1ChewieController?.dispose();
    _rep2VideoController?.dispose();
    _rep2ChewieController?.dispose();
    _nameController.dispose();
    _descriptionController.dispose();
    _rep1NameController.dispose();
    _rep2NameController.dispose();
    super.dispose();
  }

  Future<void> _generateThumbnailGeneric(
    String videoPath,
    Function(String) onThumbGenerated,
  ) async {
    try {
      final tempDir = await getTemporaryDirectory();
      final uniquePath = '${tempDir.path}/thumb_${videoPath.hashCode}.png';
      final String? path = await VideoThumbnail.thumbnailFile(
        video: videoPath,
        thumbnailPath: uniquePath,
        imageFormat: ImageFormat.PNG,
        maxHeight: 200,
        quality: 75,
      );

      if (path != null) {
        onThumbGenerated(path);
      }
    } catch (e) {
      debugPrint('Error generating thumbnail: $e');
    }
  }

  void _pickGenericVideo({
    required Function(bool) setVideoSelected,
    required Function(bool) setUploading,
    required Function(String?) setLocalPath,
    required Function(String?) setThumbnailPath,
    required Function(String?) setVideoLink,
    required Function(VideoPlayerController, ChewieController) setControllers,
  }) async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.video,
        allowMultiple: false,
      );

      if (result != null && result.files.single.path != null) {
        File file = File(result.files.single.path!);

        setState(() {
          setLocalPath(file.path);
        });

        await _generateThumbnailGeneric(file.path, (thumbPath) {
          setState(() {
            setThumbnailPath(thumbPath);
          });
        });

        final vpController = VideoPlayerController.file(file);
        await vpController.initialize();

        final cController = ChewieController(
          videoPlayerController: vpController,
          autoPlay: false,
          looping: false,
          aspectRatio: vpController.value.aspectRatio,
          materialProgressColors: ChewieProgressColors(
            playedColor: Custom().colors().lightGreen,
            handleColor: Custom().colors().lightGreen,
            backgroundColor: Colors.grey,
            bufferedColor: Custom().colors().lightBlack,
          ),
          placeholder: Container(
            color: Colors.black,
            child: Center(
              child: CircularProgressIndicator(
                color: Custom().colors().lightGreen,
              ),
            ),
          ),
          autoInitialize: true,
        );

        setState(() {
          setControllers(vpController, cController);
          setVideoSelected(true);
          setUploading(true);
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Compressing and uploading video...')),
        );

        File uploadFile = file;
        try {
          final MediaInfo? info = await VideoCompress.compressVideo(
            file.path,
            quality: VideoQuality.MediumQuality,
            deleteOrigin: false,
            includeAudio: true,
          );
          if (info != null && info.file != null) {
            uploadFile = info.file!;
            debugPrint('Video compressed: ${info.filesize} bytes');
          }
        } catch (e) {
          debugPrint('Video compression failed: $e');
          // Fallback to original file if compression fails
        }

        String? link = await _driveService.uploadFile(file: uploadFile);

        if (mounted) {
          setState(() {
            setUploading(false);
          });

          if (link != null) {
            setState(() {
              setVideoLink(link);
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Video uploaded successfully!')),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Failed to upload video.')),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          setUploading(false);
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _pickVideo() {
    _pickGenericVideo(
      setVideoSelected: (v) => _isVideoSelected = v,
      setUploading: (v) => _isUploading = v,
      setLocalPath: (v) => _localVideoPath = v,
      setThumbnailPath: (v) => _thumbnailPath = v,
      setVideoLink: (v) => _videoLink = v,
      setControllers: (vp, c) {
        _videoController?.dispose();
        _chewieController?.dispose();
        _videoController = vp;
        _chewieController = c;
      },
    );
  }

  void _pickRep1Video() {
    _pickGenericVideo(
      setVideoSelected: (v) => _isRep1VideoSelected = v,
      setUploading: (v) => _isRep1Uploading = v,
      setLocalPath: (v) => _rep1LocalVideoPath = v,
      setThumbnailPath: (v) => _rep1ThumbnailPath = v,
      setVideoLink: (v) => _rep1VideoLink = v,
      setControllers: (vp, c) {
        _rep1VideoController?.dispose();
        _rep1ChewieController?.dispose();
        _rep1VideoController = vp;
        _rep1ChewieController = c;
      },
    );
  }

  void _pickRep2Video() {
    _pickGenericVideo(
      setVideoSelected: (v) => _isRep2VideoSelected = v,
      setUploading: (v) => _isRep2Uploading = v,
      setLocalPath: (v) => _rep2LocalVideoPath = v,
      setThumbnailPath: (v) => _rep2ThumbnailPath = v,
      setVideoLink: (v) => _rep2VideoLink = v,
      setControllers: (vp, c) {
        _rep2VideoController?.dispose();
        _rep2ChewieController?.dispose();
        _rep2VideoController = vp;
        _rep2ChewieController = c;
      },
    );
  }

  final Map<String, String> _muscleImages = {
    'Chest': 'assets/images/chest.png',
    'Back': 'assets/images/back.png',
    'Arms': 'assets/images/arms.png',
    'Shoulders': 'assets/images/shoulder.png',
    'Abs': 'assets/images/abs.png',
    'Legs': 'assets/images/legs.png',
  };

  void _showMusclePicker(int slotIndex) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: 0.7.sh,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(vertical: 16.h, horizontal: 20.w),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(Icons.close, size: 24.sp),
                  ),
                  Text(
                    'Select Muscle',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(width: 24.sp), // Balance
                ],
              ),
            ),
            Divider(height: 1),
            Expanded(
              child: ListView(
                children: _muscleImages.entries.map((entry) {
                  return _buildMuscleOption(slotIndex, entry.key, entry.value);
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMuscleOption(int slotIndex, String name, String iconPath) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Colors.grey[200],
        child: Image.asset(
          iconPath,
          width: 24.w,
          errorBuilder: (c, e, s) =>
              Icon(Icons.fitness_center, size: 20.sp, color: Colors.grey),
        ),
      ),
      title: Text(
        name,
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp),
      ),
      onTap: () {
        setState(() {
          _selectedMuscles[slotIndex] = name;
        });
        Navigator.pop(context);
      },
    );
  }

  Future<void> _submitWorkout() async {
    // Prevent double-tap submissions
    if (_isSubmitting) return;

    // Validate inputs
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a workout name')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    if (_selectedMuscles[0] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a target muscle')),
      );
      return;
    }

    if (_videoLink == null && _isUploading) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please wait for video upload to complete'),
        ),
      );
      return;
    }

    if (_selectedMuscles[0] != null &&
        _selectedMuscles[0] == _selectedMuscles[1]) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Target and Assistant muscles cannot be the same!'),
        ),
      );
      return;
    }

    if (_videoLink == null && !_isVideoSelected) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a video')));
      return;
    }

    final String targetMuscle = _selectedMuscles[0]!;

    // Prepare data to save
    // Use the generated thumbnail path if available, otherwise fallback to muscle icon
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final trainerProvider = Provider.of<TrainerProvider>(
      context,
      listen: false,
    );
    final trainer = trainerProvider.currentTrainer;

    String thumbnailImage =
        _thumbnailPath ??
        _muscleImages[targetMuscle] ??
        trainer?.profileImageUrl ??
        'assets/images/trainee photo1.jpg';

    final Map<String, int> muscleIdMap = {
      'Chest': 1,
      'Back': 2,
      'Arms': 3,
      'Shoulders': 4,
      'Abs': 5,
      'Legs': 6,
    };

    final int targetMuscleId = muscleIdMap[targetMuscle] ?? 1;

    // Map to Workout model structure
    final newWorkoutData = {
      'title': _nameController.text,
      'name':
          _nameController.text, // Backend will use 'name' instead of 'title'
      'description': _descriptionController.text,
      'videoUrl': _videoLink,
      'imageUrl': thumbnailImage,
      'targetMuscle': targetMuscle,
      'assistantMuscle': _selectedMuscles[1],
      'muscles': [
        {
          'muscleId': targetMuscleId,
          'muscleName': targetMuscle,
          'isPrimary': true,
        },
        if (_selectedMuscles[1] != null &&
            _selectedMuscles[1]!.isNotEmpty &&
            _selectedMuscles[1] != targetMuscle)
          {
            'muscleId': muscleIdMap[_selectedMuscles[1]] ?? 1,
            'muscleName': _selectedMuscles[1],
            'isPrimary': false,
          },
      ],
    };

    final userId = authProvider.userId;
    if (userId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('User not logged in')));
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    List<int> replIds = [];

    // Create Rep 1 Workout if selected
    if (_rep1VideoLink != null) {
      final r1Name = _rep1NameController.text.isNotEmpty
          ? _rep1NameController.text
          : '${_nameController.text} (Alt 1)';
      final r1Data = {
        'title': r1Name,
        'name': r1Name,
        'description': 'Alternative to ${_nameController.text}',
        'videoUrl': _rep1VideoLink,
        'imageUrl': _rep1ThumbnailPath,
        'targetMuscle': targetMuscle,
        'muscles': newWorkoutData['muscles'],
      };
      try {
        final r1Id = await trainerProvider.addWorkoutForId(userId, r1Data);
        if (r1Id != null) replIds.add(r1Id);
      } catch (_) {}
    }

    // Create Rep 2 Workout if selected
    if (_rep2VideoLink != null) {
      final r2Name = _rep2NameController.text.isNotEmpty
          ? _rep2NameController.text
          : '${_nameController.text} (Alt 2)';
      final r2Data = {
        'title': r2Name,
        'name': r2Name,
        'description': 'Alternative to ${_nameController.text}',
        'videoUrl': _rep2VideoLink,
        'imageUrl': _rep2ThumbnailPath,
        'targetMuscle': targetMuscle,
        'muscles': newWorkoutData['muscles'],
      };
      try {
        final r2Id = await trainerProvider.addWorkoutForId(userId, r2Data);
        if (r2Id != null) replIds.add(r2Id);
      } catch (_) {}
    }

    newWorkoutData['replacementWorkoutIds'] = replIds;

    final success = await trainerProvider.addWorkout(userId, newWorkoutData);

    if (success) {
      final exerciseName = _nameController.text.trim();

      // Add the new exercise to the in-memory DashboardData so it shows
      // immediately in the exercise library grid without needing a restart.
      final newExerciseEntry = <String, dynamic>{
        'name': exerciseName,
        'image': thumbnailImage,
        'isLocalImage':
            _thumbnailPath != null, // true if thumbnail is a local file
        'videoUrl': _videoLink ?? '...',
        'localVideoPath':
            _localVideoPath, // so ExerciseDetailScreen can play it
        'targetMuscle': targetMuscle,
        'assistantMuscle': _selectedMuscles[1],
        'description': _descriptionController.text,
        'anatomy': [
          _muscleImages[targetMuscle] ?? 'assets/images/chest.png',
          if (_selectedMuscles[1] != null)
            _muscleImages[_selectedMuscles[1]] ?? '',
        ],
        'replacement1': _rep1VideoLink != null
            ? <String, dynamic>{
                'name': _rep1NameController.text.isNotEmpty
                    ? _rep1NameController.text
                    : '${_nameController.text} (Alt 1)',
                'image': _rep1ThumbnailPath,
                'videoUrl': _rep1VideoLink,
                'localVideoPath': _rep1LocalVideoPath,
                'description': 'Alternative to ${_nameController.text}',
                'targetMuscle': targetMuscle,
              }
            : null,
        'replacement2': _rep2VideoLink != null
            ? <String, dynamic>{
                'name': _rep2NameController.text.isNotEmpty
                    ? _rep2NameController.text
                    : '${_nameController.text} (Alt 2)',
                'image': _rep2ThumbnailPath,
                'videoUrl': _rep2VideoLink,
                'localVideoPath': _rep2LocalVideoPath,
                'description': 'Alternative to ${_nameController.text}',
                'targetMuscle': targetMuscle,
              }
            : null,
      };

      // Ensure the target muscle category list exists
      DashboardData.exerciseItems.putIfAbsent(targetMuscle, () => []);

      // Remove any existing nameless / invalid entries (cleanup)
      DashboardData.exerciseItems[targetMuscle]!.removeWhere(
        (e) => e['name'] == null || (e['name'] as String).trim().isEmpty,
      );

      // Prevent duplicate: only add if no exercise with same name exists
      final alreadyExists = DashboardData.exerciseItems[targetMuscle]!.any(
        (e) =>
            (e['name'] as String).toLowerCase() == exerciseName.toLowerCase(),
      );

      if (!alreadyExists) {
        DashboardData.exerciseItems[targetMuscle]!.add(newExerciseEntry);
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Workout Saved Successfully!')),
      );

      Navigator.pop(context);
    } else {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            trainerProvider.errorMessage ?? 'Failed to save workout',
          ),
        ),
      );
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
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 20.h),

                    // Video Player Area
                    Container(
                      height: 220.h,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: _isVideoSelected
                            ? Colors.black
                            : Colors.grey[300],
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      clipBehavior: Clip.hardEdge,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          if (_isVideoSelected && _chewieController != null)
                            Chewie(controller: _chewieController!)
                          else
                            GestureDetector(
                              onTap: _pickVideo,
                              child: Container(
                                color: Custom().colors().addVideo,
                                width: double.infinity,
                                height: double.infinity,
                                child: Center(
                                  child: Container(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 20.w,
                                      vertical: 10.h,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Custom().colors().lightGreen,
                                      borderRadius: BorderRadius.circular(8.r),
                                    ),
                                    child: Text(
                                      'Add Video',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                          // Uploading Overlay
                          if (_isUploading)
                            Container(
                              color: Colors.black54,
                              width: double.infinity,
                              height: double.infinity,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    color: Custom().colors().lightGreen,
                                  ),
                                  SizedBox(height: 10.h),
                                  Text(
                                    'Uploading to Drive...',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          // Edit Button (only if video selected and not uploading)
                          if (_isVideoSelected && !_isUploading)
                            Positioned(
                              top: 10,
                              right: 10,
                              child: GestureDetector(
                                onTap: _pickVideo,
                                child: Container(
                                  padding: EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.black54,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.edit,
                                    color: Colors.white,
                                    size: 20.sp,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    SizedBox(height: 20.h),

                    Text(
                      'Add Muscle target and assistant if found',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Row(
                      mainAxisAlignment:
                          MainAxisAlignment.center, // Center the boxes
                      children: [
                        _buildAddBox(0),
                        SizedBox(width: 20.w),
                        _buildAddBox(1),
                      ],
                    ),
                    SizedBox(height: 20.h),

                    Text(
                      'Name Workout',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        hintText: 'Bench Press',
                        filled: true,
                        fillColor: Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10.r),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),

                    SizedBox(height: 20.h),
                    GestureDetector(
                      onTap: () => _showMusclePicker(0),
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: 'Body part: ',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14.sp,
                              ),
                            ),
                            TextSpan(
                              text: _selectedMuscles[0] ?? 'Select',
                              style: TextStyle(
                                fontWeight: FontWeight.bold, // Bold black
                                fontSize: 14.sp,
                                color: Custom().colors().lightGreen,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    SizedBox(height: 10.h),
                    TextField(
                      controller: _descriptionController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'Add description',
                        filled: true,
                        fillColor: Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10.r),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),

                    SizedBox(height: 20.h),
                    Text(
                      'Add Replacement workout',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Replacement slots
                        Expanded(
                          child: Column(
                            children: [
                              _buildAddBox(2, isMuscle: false),
                              if (_isRep1VideoSelected) ...[
                                SizedBox(height: 8.h),
                                TextField(
                                  controller: _rep1NameController,
                                  decoration: InputDecoration(
                                    hintText: 'Alt name',
                                    filled: true,
                                    fillColor: Colors.grey[100],
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 10.w,
                                      vertical: 8.h,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.r),
                                      borderSide: BorderSide.none,
                                    ),
                                  ),
                                  style: TextStyle(fontSize: 12.sp),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ],
                          ),
                        ),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            children: [
                              _buildAddBox(3, isMuscle: false),
                              if (_isRep2VideoSelected) ...[
                                SizedBox(height: 8.h),
                                TextField(
                                  controller: _rep2NameController,
                                  decoration: InputDecoration(
                                    hintText: 'Alt name',
                                    filled: true,
                                    fillColor: Colors.grey[100],
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 10.w,
                                      vertical: 8.h,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.r),
                                      borderSide: BorderSide.none,
                                    ),
                                  ),
                                  style: TextStyle(fontSize: 12.sp),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: 30.h),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 50.h,
                      child: ElevatedButton(
                        onPressed: _submitWorkout,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Custom().colors().lightGreen,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          'Submit Workout',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                    SizedBox(height: 40.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(Icons.arrow_back_ios, color: Colors.black, size: 20.sp),
            onPressed: () => Navigator.pop(context),
          ),
          SizedBox(width: 40.w), // Balance
        ],
      ),
    );
  }

  Widget _buildReplacementVideoBox({
    required int index,
    required bool isSelected,
    required bool isUploading,
    required String? thumbnailPath,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: isUploading ? null : onTap,
      child: Container(
        width: 100.w,
        height: 100.w,
        decoration: BoxDecoration(
          color: isSelected ? Colors.black : Colors.grey[100],
          borderRadius: BorderRadius.circular(10.r),
          border: isSelected ? null : Border.all(color: Colors.grey[300]!),
        ),
        child: isUploading
            ? Center(
                child: CircularProgressIndicator(
                  color: Custom().colors().lightGreen,
                ),
              )
            : isSelected
            ? Stack(
                alignment: Alignment.center,
                children: [
                  if (thumbnailPath != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10.r),
                      child: Image.file(
                        File(thumbnailPath),
                        width: 100.w,
                        height: 100.w,
                        fit: BoxFit.cover,
                      ),
                    ),
                  Icon(Icons.play_arrow, color: Colors.white, size: 40.sp),
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_a_photo,
                    color: Custom().colors().lightGreen,
                    size: 30.sp,
                  ),
                  SizedBox(height: 5.h),
                  Text(
                    'Video $index',
                    style: TextStyle(
                      color: Custom().colors().lightGreen,
                      fontSize: 12.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildAddBox(int index, {bool isMuscle = true}) {
    if (!isMuscle) {
      if (index == 2) {
        return _buildReplacementVideoBox(
          index: 1,
          isSelected: _isRep1VideoSelected,
          isUploading: _isRep1Uploading,
          thumbnailPath: _rep1ThumbnailPath,
          onTap: _pickRep1Video,
        );
      } else {
        return _buildReplacementVideoBox(
          index: 2,
          isSelected: _isRep2VideoSelected,
          isUploading: _isRep2Uploading,
          thumbnailPath: _rep2ThumbnailPath,
          onTap: _pickRep2Video,
        );
      }
    }

    String? selectedText = _selectedMuscles[index];

    return GestureDetector(
      onTap: () {
        _showMusclePicker(index);
      },
      child: Container(
        width: 100.w,
        height: 100.w,
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(10.r),
          border: Border.all(color: Colors.grey[300]!),
        ),
        child: selectedText != null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    _muscleImages[selectedText] ?? '',
                    width: 50.w,
                    height: 50.w,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) =>
                        Icon(Icons.fitness_center, size: 40.sp),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    selectedText,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12.sp,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              )
            : Center(
                child: Icon(
                  Icons.add,
                  color: Custom().colors().lightGreen,
                  size: 30.sp,
                ),
              ),
      ),
    );
  }
}
