import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'note_model.dart';

class NoteEditorScreen extends StatefulWidget {
  final Note? note;
  final int? traineeId;
  const NoteEditorScreen({super.key, this.note, this.traineeId});

  @override
  State<NoteEditorScreen> createState() => _NoteEditorScreenState();
}

class _NoteEditorScreenState extends State<NoteEditorScreen> {
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  bool _isDirty = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.note?.title ?? '');
    _contentController = TextEditingController(
      text: widget.note?.content ?? '',
    );

    _titleController.addListener(_markDirty);
    _contentController.addListener(_markDirty);
  }

  void _markDirty() {
    if (!_isDirty) setState(() => _isDirty = true);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<bool> _onWillPop() async {
    if (!_isDirty) return true;

    // Show "Save changes?" dialog if dirty
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        title: Column(
          children: [
            Icon(Icons.info_outline, color: Colors.grey, size: 50.sp),
            SizedBox(height: 10.h),
            Text(
              'Save changes ?',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18.sp),
            ),
          ],
        ),
        content: Text(
          'Your changes will be lost if you don\'t save them.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context, false), // Discard
            style: ElevatedButton.styleFrom(
              backgroundColor: Custom().colors().dicardColor, // Red
              padding: EdgeInsets.symmetric(horizontal: 30.w, vertical: 10.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.r),
              ),
            ),
            child: Text('Discard', style: TextStyle(color: Colors.white)),
          ),
          SizedBox(width: 10.w),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true), // Save
            style: ElevatedButton.styleFrom(
              backgroundColor: Custom().colors().saveColor, // Green
              padding: EdgeInsets.symmetric(horizontal: 30.w, vertical: 10.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.r),
              ),
            ),
            child: Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (result == true) {
      _saveNote();
      return false; // _saveNote will pop
    } else if (result == false) {
      return true; // Just pop (discard)
    }

    return false; // Close dialog, stay on screen
  }

  Future<void> _saveNote() async {
    final newNote = Note(
      id: widget.note?.id ?? DateTime.now().toIso8601String(),
      title: _titleController.text,
      content: _contentController.text,
      date: DateTime.now(),
    );

    if (widget.traineeId != null) {
      final trainerProvider = context.read<TrainerProvider>();
      final authProvider = context.read<AuthProvider>();

      if (authProvider.userId != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saving note to database...')),
        );

        final success = await trainerProvider.saveDailyNote(
          authProvider.userId!,
          widget.traineeId!,
          newNote.title,
          newNote.content,
        );

        if (!mounted) return;

        ScaffoldMessenger.of(context).hideCurrentSnackBar();

        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Note saved successfully!')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                trainerProvider.errorMessage ?? 'Failed to save note.',
              ),
            ),
          );
        }
      }
    }

    if (mounted) {
      Navigator.pop(context, newNote);
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.transparent, // Or white
          elevation: 0,
          leading: Padding(
            padding: EdgeInsets.all(8.0),
            child: Container(
              decoration: BoxDecoration(
                color: Custom().colors().lightGreen,
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_new,
                  size: 18.sp,
                  color: Colors.white,
                ),
                onPressed: () async {
                  if (_isDirty) {
                    // Trigger alert
                    if (await _onWillPop()) {
                      Navigator.pop(context);
                    }
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
            ),
          ),
          actions: [
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Custom().colors().lightGreen,
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: IconButton(
                  icon: Icon(Icons.save_outlined, color: Colors.white),
                  onPressed: _saveNote,
                ),
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 10.h),
              child: TextField(
                controller: _titleController,
                style: TextStyle(fontSize: 30.sp, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  hintText: 'Title',
                  border: InputBorder.none,
                  hintStyle: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: TextField(
                  controller: _contentController,
                  maxLines: null,
                  style: TextStyle(
                    fontSize: 18.sp,
                    height: 1.5,
                    color: Colors.grey[800],
                  ),
                  decoration: InputDecoration(
                    hintText: 'Type something...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: Colors.grey[400]),
                  ),
                ),
              ),
            ),
            // Data footer? Not shown.
            // Formatting Toolbar (Bottom)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
              color: Color(0xFFF5F5F5), // Light gray background
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Icon(Icons.format_bold, color: Colors.grey[600]),
                  Icon(Icons.format_italic, color: Colors.grey[600]),
                  Icon(Icons.format_underline, color: Colors.grey[600]),
                  Icon(Icons.link, color: Colors.grey[600]),
                  Icon(Icons.format_list_bulleted, color: Colors.grey[600]),
                  Icon(Icons.code, color: Colors.grey[600]),
                  Icon(Icons.text_fields, color: Colors.grey[600]),
                  Icon(Icons.functions, color: Colors.grey[600]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
