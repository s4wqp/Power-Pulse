import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/chat_provider.dart';

/// A widget that wraps a chat icon with a red unread-count badge.
/// Listens to [ChatProvider.totalUnreadCount] and updates reactively.
class ChatBadgeIcon extends StatelessWidget {
  final Widget child;

  const ChatBadgeIcon({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final unread = context.select<ChatProvider, int>((p) => p.totalUnreadCount);

    if (unread == 0) return child;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          right: -6.w,
          top: -4.h,
          child: Container(
            padding: EdgeInsets.all(4.w),
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            constraints: BoxConstraints(minWidth: 16.w, minHeight: 16.w),
            child: Center(
              child: Text(
                unread > 99 ? '99+' : '$unread',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 9.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
