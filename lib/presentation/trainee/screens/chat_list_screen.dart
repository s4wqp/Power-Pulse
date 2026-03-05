import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/custom.dart' as custom_theme;
import 'package:power_pulse/routing.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/data/models/trainer_models.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.userId != null) {
        context.read<ChatProvider>().fetchContacts(auth.userId!, 'Trainee');
      }
    });
  }

  /// Formats an ISO 8601 timestamp into a short readable string.
  /// Shows "HH:mm" if today, "Yesterday" if yesterday, or "dd/MM" otherwise.
  String _formatTime(String? isoTime) {
    if (isoTime == null || isoTime.isEmpty) return '';
    try {
      final dateTime = DateTime.parse(isoTime).toLocal();
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final dateDay = DateTime(dateTime.year, dateTime.month, dateTime.day);

      if (dateDay == today) {
        // Format as "h:mm AM/PM"
        final hour = dateTime.hour == 0
            ? 12
            : (dateTime.hour > 12 ? dateTime.hour - 12 : dateTime.hour);
        final minute = dateTime.minute.toString().padLeft(2, '0');
        final period = dateTime.hour >= 12 ? 'PM' : 'AM';
        return '$hour:$minute $period';
      } else if (dateDay == today.subtract(const Duration(days: 1))) {
        return 'Yesterday';
      } else {
        // Format as "dd/MM/yy"
        final day = dateTime.day.toString().padLeft(2, '0');
        final month = dateTime.month.toString().padLeft(2, '0');
        final year = (dateTime.year % 100).toString().padLeft(2, '0');
        return '$day/$month/$year';
      }
    } catch (_) {
      return isoTime.length > 10 ? isoTime.substring(0, 10) : isoTime;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final Map<int, ChatContact> uniqueContacts = {};
                for (var contact in provider.contacts) {
                  uniqueContacts[contact.userId] = contact;
                }
                final contacts = uniqueContacts.values.toList();

                if (contacts.isEmpty) {
                  return Center(
                    child: Text(
                      'No active chats found.',
                      style: TextStyle(fontSize: 14.sp, color: Colors.grey),
                    ),
                  );
                }

                return ListView.separated(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 20.h,
                  ),
                  itemCount: contacts.length,
                  separatorBuilder: (_, __) => SizedBox(height: 16.h),
                  itemBuilder: (context, index) {
                    final contact = contacts[index];
                    return GestureDetector(
                      onTap: () {
                        context.read<ChatProvider>().markChatAsRead(
                          contact.userId,
                        );
                        Navigator.pushNamed(
                          context,
                          Routing.chatDetailScreen,
                          arguments: {
                            'id': contact.userId,
                            'name': contact.name,
                            'image': contact.profileImageUrl,
                            'role': contact.role,
                          },
                        );
                      },
                      child: Container(
                        padding: EdgeInsets.all(12.w),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30.r),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 25.r,
                              backgroundImage: contact.profileImageUrl != null
                                  ? NetworkImage(contact.profileImageUrl!)
                                  : const AssetImage(
                                          'assets/images/trainee photo1.jpg',
                                        )
                                        as ImageProvider,
                              backgroundColor: Colors.grey[200],
                            ),
                            SizedBox(width: 15.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    contact.name,
                                    style: TextStyle(
                                      fontSize: 16.sp,
                                      fontWeight: FontWeight.bold,
                                      color: custom_theme.Custom()
                                          .colors()
                                          .lightGreen,
                                    ),
                                  ),
                                  SizedBox(height: 4.h),
                                  Text(
                                    contact.lastMessage ?? 'No messages yet',
                                    style: TextStyle(
                                      fontSize: 12.sp,
                                      color: custom_theme.Custom()
                                          .colors()
                                          .lightGreen
                                          .withOpacity(0.8),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  _formatTime(contact.lastMessageTime),
                                  style: TextStyle(
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.w600,
                                    color: custom_theme.Custom()
                                        .colors()
                                        .lightGreen,
                                  ),
                                ),
                                if (contact.unreadCount > 0) ...[
                                  SizedBox(height: 4.h),
                                  Container(
                                    padding: EdgeInsets.all(6.w),
                                    decoration: BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${contact.unreadCount}',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
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
            'Chats',
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

  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 1, // Chat tab is index 1
      type: BottomNavigationBarType.fixed,
      selectedItemColor: custom_theme.Custom().colors().lightGreen,
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushReplacementNamed(context, Routing.traineeHomeScreen);
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
          icon: Image.asset(
            'assets/icons/chat.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().lightGreen, // Active
          ),
          label: 'Chat',
        ),
        BottomNavigationBarItem(
          icon: Image.asset(
            'assets/icons/exercise.png',
            width: 18.w,
            height: 18.h,
            color: custom_theme.Custom().colors().bottomNavigationBar,
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
