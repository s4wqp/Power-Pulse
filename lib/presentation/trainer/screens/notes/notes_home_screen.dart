import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/trainer_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'note_editor_screen.dart';
import 'note_model.dart';

class NotesHomeScreen extends StatefulWidget {
  final int? traineeId;
  const NotesHomeScreen({super.key, this.traineeId});

  @override
  State<NotesHomeScreen> createState() => _NotesHomeScreenState();
}

class _NotesHomeScreenState extends State<NotesHomeScreen> {
  List<Note> notes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotes();
  }

  Future<void> _fetchNotes() async {
    if (widget.traineeId == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    final trainerProvider = context.read<TrainerProvider>();
    final authProvider = context.read<AuthProvider>();

    if (authProvider.userId != null) {
      final fetchedData = await trainerProvider.fetchNotesForTrainee(
        authProvider.userId!,
        widget.traineeId!,
      );

      if (mounted) {
        setState(() {
          notes = fetchedData.map((e) => Note.fromJson(e)).toList();
          _isLoading = false;
        });
      }
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _navigateAndDisplaySelection(BuildContext context) async {
    // Navigator.push returns a Future that completes after calling
    // Navigator.pop on the Selection Screen.
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NoteEditorScreen(traineeId: widget.traineeId),
      ),
    );

    // After the Selection Screen returns a result, hide any previous snackbars
    // and show the new result.
    if (!mounted) return;

    if (result != null && result is Note) {
      setState(() {
        notes.add(result);
      });
    }
  }

  void _navigateToEdit(BuildContext context, Note note) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            NoteEditorScreen(note: note, traineeId: widget.traineeId),
      ),
    );

    if (!mounted) return;

    if (result != null && result is Note) {
      setState(() {
        // Find index and update
        final index = notes.indexWhere((n) => n.id == result.id);
        if (index != -1) {
          notes[index] = result;
        } else {
          // If id changed (unlikely) or new, add it
          notes.add(result);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leadingWidth: 0,
        titleSpacing: 20.w,
        automaticallyImplyLeading: true, // Allow going back to chat
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.black, size: 20.sp),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Notes',
          style: TextStyle(
            color: Custom().colors().lightGreen,
            fontSize: 28.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: EdgeInsets.only(right: 20.w),
            child: Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: Custom().colors().lightGreen,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(10.r), // Rounded rectangle
              ),
              child: Icon(Icons.search, color: Colors.white, size: 24.sp),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: Custom().colors().lightGreen,
              ),
            )
          : (notes.isEmpty ? _buildEmptyState() : _buildNotesList()),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateAndDisplaySelection(context),
        backgroundColor: Custom().colors().lightGreen, // Green
        child: Icon(Icons.add, color: Colors.white, size: 30.sp),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Illustration
          Image.asset(
            'assets/images/notes_illustration.png', // Assuming this name, will fallback or be replaced
            width: 250.w,
            height: 250.h,
            errorBuilder: (context, error, stackTrace) {
              // Return a placeholder if image missing
              return Icon(
                Icons.edit_note,
                size: 150.sp,
                color: Colors.grey[300],
              );
            },
          ),
          SizedBox(height: 30.h),
          Text(
            'Create your first note !',
            style: TextStyle(
              color: Colors.black54,
              fontSize: 16.sp,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesList() {
    // Based on screenshot 1, there is a list item visible "Book Review : The Design of..."
    // It looks like a card with light background.
    return ListView.builder(
      padding: EdgeInsets.all(20.w),
      itemCount: notes.length,
      itemBuilder: (context, index) {
        final note = notes[index];
        return Container(
          margin: EdgeInsets.only(bottom: 15.h),
          padding: EdgeInsets.all(15.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: Colors.grey[300]!),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 5,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: InkWell(
            onTap: () => _navigateToEdit(context, note),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  note.title,
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  note.content,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 14.sp, color: Colors.black54),
                ),
                SizedBox(height: 10.h),
                Text(
                  "${note.date.day}/${note.date.month}/${note.date.year}", // formatted date
                  style: TextStyle(fontSize: 12.sp, color: Colors.grey),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
