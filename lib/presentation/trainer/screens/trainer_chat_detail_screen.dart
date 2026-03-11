import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/custom.dart' as custom_theme;
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/services/drive_service.dart';
import 'notes/notes_home_screen.dart';
import 'trainer_exercise_library_screen.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:power_pulse/presentation/widgets/voice_message_player.dart';
import 'dart:async';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/routing.dart';
import 'package:url_launcher/url_launcher_string.dart';

class TrainerChatDetailScreen extends StatefulWidget {
  final Map<String, dynamic> chatUser;

  const TrainerChatDetailScreen({super.key, required this.chatUser});

  @override
  State<TrainerChatDetailScreen> createState() =>
      _TrainerChatDetailScreenState();
}

class _TrainerChatDetailScreenState extends State<TrainerChatDetailScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  int _recordDuration = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      final chatProvider = context.read<ChatProvider>();
      final targetId = widget.chatUser['id'] is int
          ? widget.chatUser['id'] as int
          : int.tryParse(widget.chatUser['id']?.toString() ?? '') ?? 0;

      chatProvider.fetchMessages(
        auth.userId ?? 0,
        targetId,
        user1Role: auth.role,
      );
      chatProvider.markChatAsRead(targetId);

      // Start polling for real-time updates as a fallback to SignalR
      chatProvider.startPolling(auth.userId ?? 0, targetId, myRole: auth.role);
    });
  }

  late ChatProvider _chatProvider;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _chatProvider = context.read<ChatProvider>();
  }

  @override
  void dispose() {
    // Stop polling when leaving the chat screen
    _chatProvider.stopPolling();
    _controller.dispose();
    _scrollController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 50,
        maxWidth: 1024,
      );
      if (image != null) {
        _sendMessage(
          messageContent: 'Photo',
          type: 'image',
          filePath: image.path,
        );
        Navigator.pop(context);
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  Future<void> _pickDocument() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles();

      if (result != null && result.files.single.path != null) {
        _sendMessage(
          messageContent: result.files.single.name,
          type: 'file',
          filePath: result.files.single.path,
        );
        if (mounted) Navigator.pop(context);
      }
    } catch (e) {
      debugPrint('Error picking document: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to attach document. Please try again.'),
          ),
        );
      }
    }
  }

  Future<void> _startRecording() async {
    debugPrint('Recording: _startRecording called');
    try {
      final hasPermission = await _audioRecorder.hasPermission();
      debugPrint('Recording: hasPermission = $hasPermission');
      if (hasPermission) {
        final directory = await getTemporaryDirectory();
        final path =
            '${directory.path}/voice_msg_${DateTime.now().millisecondsSinceEpoch}.m4a';

        const config = RecordConfig();
        await _audioRecorder.start(config, path: path);
        debugPrint('Recording: recorder started');

        setState(() {
          _isRecording = true;
          _recordDuration = 0;
        });
        _startTimer();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Microphone permission denied')),
        );
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _cancelRecording() async {
    debugPrint('Recording: _cancelRecording called');
    try {
      _timer?.cancel();
      await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
        _recordDuration = 0;
      });
    } catch (e) {
      debugPrint('Error canceling recording: $e');
      setState(() {
        _isRecording = false;
        _recordDuration = 0;
      });
    }
  }

  Future<void> _sendRecording() async {
    debugPrint('Recording: _sendRecording called');
    try {
      _timer?.cancel();
      final path = await _audioRecorder.stop();
      debugPrint('Recording: stopped, path = $path');
      setState(() {
        _isRecording = false;
        _recordDuration = 0;
      });

      if (path != null) {
        _sendMessage(
          messageContent: 'Voice Message',
          type: 'audio',
          filePath: path,
        );
      }
    } catch (e) {
      debugPrint('Error sending recording: $e');
      setState(() {
        _isRecording = false;
        _recordDuration = 0;
      });
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isRecording) {
        timer.cancel();
      } else {
        setState(() {
          _recordDuration++;
        });
      }
    });
  }

  String _formatRecordDuration(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  void _sendMessage({
    String? messageContent,
    String type = 'text',
    String? filePath,
    String? messageContentOverride,
  }) async {
    final text =
        messageContentOverride ?? messageContent ?? _controller.text.trim();
    if (text.isEmpty && filePath == null) return;

    final auth = context.read<AuthProvider>();
    final chatProvider = context.read<ChatProvider>();
    final driveService = DriveService();

    String? fileUrl;
    if (filePath != null) {
      fileUrl = await driveService.uploadFile(file: File(filePath));
    }

    final messageData = {
      'senderId': auth.userId,
      'senderRole': 'Trainer',
      'receiverId': widget.chatUser['id'],
      'content': text,
      'fileUrl': fileUrl,
      'messageType': type == 'text'
          ? 'Text'
          : (type == 'image'
                ? 'Image'
                : (type == 'file'
                      ? 'Document'
                      : (type == 'audio' ? 'Audio' : type.capitalize()))),
      'workoutId': type == 'workout'
          ? int.tryParse(messageContent ?? '')
          : null,
    };

    final success = await chatProvider.sendMessage(messageData);

    if (!mounted) return;

    if (success) {
      if (messageContent == null) _controller.clear();
      // Refresh messages
      chatProvider.fetchMessages(
        auth.userId ?? 0,
        widget.chatUser['id'] is int
            ? widget.chatUser['id'] as int
            : int.tryParse(widget.chatUser['id']?.toString() ?? '') ?? 0,
        user1Role: auth.role,
      );
      _scrollToBottom();
    } else {
      if (chatProvider.errorMessage ==
          "No active subscription between these users.") {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "Subscription expired or not active for this trainee.",
            ),
            backgroundColor: Colors.red,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              chatProvider.errorMessage ?? "Failed to send message",
            ),
          ),
        );
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  String _formatTime(DateTime time) {
    String hour = time.hour > 12
        ? '${time.hour - 12}'
        : '${time.hour == 0 ? 12 : time.hour}';
    String minute = time.minute.toString().padLeft(2, '0');
    String period = time.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  void _showImageZoom(BuildContext context, ImageProvider image) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: EdgeInsets.zero,
        child: Stack(
          alignment: Alignment.center,
          children: [
            InteractiveViewer(
              minScale: 0.5,
              maxScale: 4.0,
              child: Image(
                image: image,
                fit: BoxFit.contain,
                width: double.infinity,
                height: double.infinity,
              ),
            ),
            Positioned(
              top: 40.h,
              right: 20.w,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: Consumer<ChatProvider>(
        builder: (context, chatProvider, child) {
          final messages = chatProvider.messages;
          final int latestStatusIndex = messages.indexWhere((msg) {
            final content = (msg['content']?.toString().toLowerCase() ?? '');
            return (content.contains('subscription') &&
                    (content.contains('ended') ||
                        content.contains('expired'))) ||
                content.contains('ai performance report') ||
                content.contains('welcome to the');
          });

          final bool isSubscriptionEnded =
              latestStatusIndex != -1 &&
              !(messages[latestStatusIndex]['content']
                          ?.toString()
                          .toLowerCase() ??
                      '')
                  .contains('welcome to the');

          return Column(
            children: [
              Expanded(
                child: chatProvider.isLoading && messages.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : messages.isEmpty
                    ? Center(
                        child: Text(
                          'No messages yet',
                          style: TextStyle(color: Colors.grey[400]),
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        reverse: true,
                        padding: EdgeInsets.symmetric(
                          horizontal: 16.w,
                          vertical: 20.h,
                        ),
                        itemCount: messages.length,
                        itemBuilder: (context, index) {
                          final msg = messages[index];
                          final isFirstMessageChronologically =
                              index == messages.length - 1;

                          return Column(
                            children: [
                              if (isFirstMessageChronologically)
                                _buildDateSeparator('Today'),
                              _buildMessageBubble(msg),
                            ],
                          );
                        },
                      ),
              ),
              if (isSubscriptionEnded)
                Container(
                  padding: EdgeInsets.symmetric(
                    vertical: 20.h,
                    horizontal: 16.w,
                  ),
                  width: double.infinity,
                  color: Colors.white,
                  child: Container(
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Chat is closed. Subscription has ended.',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp,
                      ),
                    ),
                  ),
                )
              else
                _buildInputArea(),
            ],
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios, color: Colors.black, size: 20.sp),
        onPressed: () => Navigator.pop(context),
      ),
      titleSpacing: 0,
      title: Row(
        children: [
          GestureDetector(
            onTap: () {
              final imageUrl = widget.chatUser['image'];
              final ImageProvider imageProvider =
                  (imageUrl != null && imageUrl.startsWith('http'))
                  ? NetworkImage(imageUrl)
                  : AssetImage(imageUrl ?? 'assets/images/trainee.jpeg')
                        as ImageProvider;
              _showImageZoom(context, imageProvider);
            },
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 20.r,
                  backgroundImage:
                      (widget.chatUser['image'] != null &&
                          widget.chatUser['image']!.startsWith('http'))
                      ? NetworkImage(widget.chatUser['image']!)
                      : AssetImage(
                              widget.chatUser['image'] ??
                                  'assets/images/trainee.jpeg',
                            )
                            as ImageProvider,
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 10.w,
                    height: 10.w,
                    decoration: BoxDecoration(
                      color: custom_theme.Custom().colors().lightGreen,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 10.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.chatUser['name'] ?? 'Chat',
                style: TextStyle(
                  color: custom_theme.Custom().colors().lightGreen,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Subscription type', // Or 'Bulking' based on data
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDateSeparator(String date) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: Center(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.h),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Text(
            date,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    final auth = context.read<AuthProvider>();
    final isMe = msg['senderId'] == auth.userId;
    // Map backend 'Text', 'Image', 'Document', 'Workout' to local 'text', 'image', 'file', 'workout'
    final backendType = msg['messageType']?.toString().toLowerCase() ?? 'text';
    final type = backendType == 'document' ? 'file' : backendType;
    final content = msg['content'] ?? '';
    final timeStr = msg['timestamp'] ?? msg['sentAt'] ?? msg['time'] ?? '';

    // Simple time extraction if it's ISO string
    String displayTime = timeStr;
    try {
      if (timeStr.contains('T')) {
        final dt = DateTime.parse(timeStr).toLocal();
        displayTime = _formatTime(dt);
      }
    } catch (_) {}

    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Row(
        mainAxisAlignment: isMe
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 16.r,
              backgroundImage:
                  (widget.chatUser['image'] != null &&
                      widget.chatUser['image']!.startsWith('http'))
                  ? NetworkImage(widget.chatUser['image']!)
                  : AssetImage(
                          widget.chatUser['image'] ??
                              'assets/images/trainee.jpeg',
                        )
                        as ImageProvider,
            ),
            SizedBox(width: 8.w),
          ],
          Flexible(
            child: Container(
              constraints: BoxConstraints(maxWidth: 0.75.sw),
              padding: type == 'image'
                  ? EdgeInsets.all(4.w)
                  : EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              decoration: BoxDecoration(
                color: isMe
                    ? const Color(0xFF344955)
                    : custom_theme.Custom().colors().lightGreen,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16.r),
                  topRight: Radius.circular(16.r),
                  bottomLeft: isMe ? Radius.circular(16.r) : Radius.circular(0),
                  bottomRight: isMe
                      ? Radius.circular(0)
                      : Radius.circular(16.r),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (type == 'text')
                    content.startsWith('🏋️ ')
                        ? GestureDetector(
                            onTap: () {
                              final workoutName = content
                                  .replaceFirst('🏋️ ', '')
                                  .trim();
                              final workouts =
                                  context
                                      .read<TrainerProvider>()
                                      .currentTrainer
                                      ?.workouts ??
                                  [];
                              try {
                                final workout = workouts.firstWhere(
                                  (w) => w.title == workoutName,
                                );
                                Navigator.pushNamed(
                                  context,
                                  Routing.exerciseDetailScreen,
                                  arguments: {
                                    'name': workout.title,
                                    'image':
                                        workout.imageUrl ??
                                        'assets/images/Power_Pulse.png',
                                    'videoUrl': workout.videoUrl,
                                    'description': workout.description,
                                    'targetMuscle':
                                        workout.targetMuscle ?? 'Chest',
                                    'assistantMuscle': workout.assistantMuscle,
                                  },
                                );
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Exercise details not found'),
                                  ),
                                );
                              }
                            },
                            child: Text(
                              content,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15.sp,
                                decoration: TextDecoration.underline,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        : Text(
                            content,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15.sp,
                              fontWeight:
                                  content.contains('subscription') &&
                                      content.contains('officially ended')
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          )
                  else if (type == 'image')
                    GestureDetector(
                      onTap: () {
                        final imageProvider = (msg['fileUrl'] != null)
                            ? NetworkImage(msg['fileUrl'])
                            : FileImage(File(msg['filePath'])) as ImageProvider;
                        _showImageZoom(context, imageProvider);
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12.r),
                        child: (msg['fileUrl'] != null)
                            ? Image.network(
                                msg['fileUrl'],
                                fit: BoxFit.cover,
                                height: 200.h,
                                width: double.infinity,
                              )
                            : (msg['filePath'] != null
                                  ? Image.file(
                                      File(msg['filePath']),
                                      fit: BoxFit.cover,
                                      height: 200.h,
                                      width: double.infinity,
                                    )
                                  : const SizedBox()),
                      ),
                    )
                  else if (type == 'file')
                    GestureDetector(
                      onTap: () async {
                        if (msg['fileUrl'] != null) {
                          if (await canLaunchUrlString(msg['fileUrl'])) {
                            await launchUrlString(
                              msg['fileUrl'],
                              mode: LaunchMode.externalApplication,
                            );
                          } else {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Could not open file'),
                                ),
                              );
                            }
                          }
                        }
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: EdgeInsets.all(8.w),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                            child: Icon(
                              Icons.insert_drive_file,
                              color: Colors.white,
                              size: 24.sp,
                            ),
                          ),
                          SizedBox(width: 10.w),
                          Flexible(
                            child: Text(
                              content, // Filename or description
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14.sp,
                                decoration: TextDecoration.underline,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (type == 'audio')
                    VoiceMessagePlayer(url: msg['fileUrl'] ?? '', isMe: isMe)
                  else if (type == 'workout')
                    _buildWorkoutMessage(msg),
                  SizedBox(height: 4.h),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (type == 'image') Spacer(),
                        Text(
                          displayTime,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 10.sp,
                          ),
                        ),
                        if (isMe) ...[
                          SizedBox(width: 4.w),
                          Icon(
                            Icons.done_all,
                            color:
                                (msg['isRead'] == true ||
                                    msg['status'] == 'read')
                                ? Colors.blue[200]
                                : Colors.white70,
                            size: 14.sp,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) ...[
            SizedBox(width: 8.w),
            CircleAvatar(
              radius: 16.r,
              backgroundImage:
                  (context
                              .read<TrainerProvider>()
                              .currentTrainer
                              ?.profileImageUrl !=
                          null &&
                      context
                          .read<TrainerProvider>()
                          .currentTrainer!
                          .profileImageUrl!
                          .startsWith('http'))
                  ? NetworkImage(
                      context
                          .read<TrainerProvider>()
                          .currentTrainer!
                          .profileImageUrl!,
                    )
                  : const AssetImage('assets/images/trainer.jpeg')
                        as ImageProvider,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
      margin: EdgeInsets.fromLTRB(16.w, 0, 16.w, 20.h), // Bottom margin
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30.r),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 10,
            offset: Offset(0, 5),
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        children: [
          if (!_isRecording) ...[
            Icon(
              Icons.emoji_emotions_outlined,
              color: Colors.grey[400],
              size: 26.sp,
            ),
            SizedBox(width: 10.w),
          ],
          Expanded(
            child: _isRecording
                ? Row(
                    children: [
                      GestureDetector(
                        onTap: _cancelRecording,
                        child: Icon(
                          Icons.delete_outline,
                          color: Colors.red,
                          size: 26.sp,
                        ),
                      ),
                      SizedBox(width: 10.w),
                      Icon(Icons.circle, color: Colors.red, size: 12.sp),
                      SizedBox(width: 8.w),
                      Flexible(
                        child: Text(
                          'Recording... ${_formatRecordDuration(_recordDuration)}',
                          style: TextStyle(
                            color: Colors.red,
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  )
                : TextField(
                    controller: _controller,
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: null,
                    decoration: InputDecoration(
                      hintText: 'Start typing...',
                      hintStyle: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 14.sp,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 8.h),
                    ),
                  ),
          ),
          SizedBox(width: 10.w),
          if (!_isRecording) ...[
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: _startRecording,
              child: Icon(Icons.mic_none, color: Colors.grey[400], size: 26.sp),
            ),
            SizedBox(width: 10.w),
            GestureDetector(
              onTap: _showShareContentSheet,
              child: Icon(
                Icons.attach_file,
                color: Colors.grey[400],
                size: 26.sp,
              ),
            ),
            SizedBox(width: 10.w),
          ],
          GestureDetector(
            onTap: () {
              if (_isRecording) {
                _sendRecording();
              } else {
                _sendMessage(type: 'text');
              }
            },
            child: Icon(
              Icons.send,
              color: custom_theme.Custom().colors().lightGreen,
              size: 28.sp,
            ),
          ),
        ],
      ),
    );
  }

  void _showShareContentSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Allow sheet to be taller and scrollable
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (_, controller) => Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(30.r)),
          ),
          child: SingleChildScrollView(
            controller: controller,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2.r),
                  ),
                ),
                SizedBox(height: 20.h),
                Text(
                  'Share Content',
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 30.h),
                _buildShareItem(
                  icon: Icons.camera_alt_outlined,
                  title: 'Camera',
                  onTap: () => _pickImage(ImageSource.camera),
                ),
                SizedBox(height: 20.h),
                _buildShareItem(
                  icon: Icons.description_outlined,
                  title: 'Documents',
                  subtitle: 'Share your files',
                  onTap: () => _pickDocument(),
                ),
                SizedBox(height: 20.h),
                // Workouts
                _buildShareItem(
                  icon: Icons.bar_chart,
                  title: 'Workouts',
                  subtitle: 'Open Library of workout',
                  onTap: () async {
                    Navigator.pop(context);

                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            const TrainerExerciseLibraryScreen(
                              isSelectionMode: true,
                            ),
                      ),
                    );

                    // result is a List<Workout> of selected workouts
                    if (result != null && result is List && result.isNotEmpty) {
                      for (final workout in result) {
                        _sendMessage(
                          messageContent: '🏋️ ${workout.title}',
                          type: 'text',
                        );
                      }
                    }
                  },
                ),
                SizedBox(height: 20.h),
                // Media
                _buildShareItem(
                  icon: Icons.image_outlined,
                  title: 'Media',
                  subtitle: 'Share photos and videos',
                  onTap: () => _pickImage(ImageSource.gallery),
                ),
                SizedBox(height: 20.h),
                // Note
                _buildShareItem(
                  icon: Icons.note_alt_outlined,
                  title: 'Note',
                  subtitle: 'Write notes about trainee',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            NotesHomeScreen(traineeId: widget.chatUser['id']),
                      ),
                    );
                  },
                ),
                SizedBox(height: 20.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildShareItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: custom_theme.Custom().colors().lightGreen.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: custom_theme.Custom().colors().lightGreen,
              size: 24.sp,
            ),
          ),
          SizedBox(width: 16.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
              ),
              if (subtitle != null)
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 12.sp, color: Colors.grey),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutMessage(Map<String, dynamic> msg) {
    final workout = msg['workoutDetails'] ?? msg['workout'];
    final title = workout?['title'] ?? 'Shared Exercise';
    final description = workout?['description'] ?? 'View details to see more';
    final imageUrl = workout?['imageUrl'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (imageUrl != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(8.r),
            child: (imageUrl.startsWith('http'))
                ? Image.network(
                    imageUrl,
                    height: 120.h,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  )
                : Image.asset(
                    imageUrl,
                    height: 120.h,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
          ),
        SizedBox(height: 8.h),
        Text(
          title,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14.sp,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(color: Colors.white70, fontSize: 12.sp),
        ),
      ],
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return "${this[0].toUpperCase()}${substring(1)}";
  }
}
