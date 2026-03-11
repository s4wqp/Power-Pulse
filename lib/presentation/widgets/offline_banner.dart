import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// A widget that monitors internet connectivity and displays
/// a professional offline banner when the user loses connection.
///
/// Wrap your MaterialApp's builder with this widget to show
/// the banner globally across all screens.
class OfflineBanner extends StatefulWidget {
  final Widget child;

  const OfflineBanner({super.key, required this.child});

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner>
    with SingleTickerProviderStateMixin {
  late StreamSubscription<List<ConnectivityResult>> _subscription;
  bool _isOffline = false;
  late AnimationController _animController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );

    _slideAnimation =
        Tween<Offset>(
          begin: const Offset(0, -1), // Start above the screen
          end: Offset.zero,
        ).animate(
          CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
        );

    // Check initial connectivity (wrapped in try-catch for hot-restart safety)
    try {
      Connectivity()
          .checkConnectivity()
          .then((results) {
            _updateStatus(results);
          })
          .catchError((_) {});
    } catch (_) {}

    // Listen for changes
    try {
      _subscription = Connectivity().onConnectivityChanged.listen((results) {
        _updateStatus(results);
      });
    } catch (_) {
      // Plugin not available (e.g. hot restart before native rebuild)
      _subscription = const Stream<List<ConnectivityResult>>.empty().listen(
        (_) {},
      );
    }
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final offline = results.contains(ConnectivityResult.none);
    if (offline != _isOffline && mounted) {
      setState(() {
        _isOffline = offline;
      });
      if (_isOffline) {
        _animController.forward();
      } else {
        _animController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _subscription.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        // The offline banner slides in from the top
        if (_isOffline)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SlideTransition(
              position: _slideAnimation,
              child: Material(
                elevation: 6,
                child: Container(
                  width: double.infinity,
                  padding: EdgeInsets.only(
                    top: MediaQuery.of(context).padding.top + 8.h,
                    bottom: 12.h,
                    left: 16.w,
                    right: 16.w,
                  ),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFFE53935), Color(0xFFD32F2F)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.wifi_off_rounded,
                        color: Colors.white,
                        size: 20.sp,
                      ),
                      SizedBox(width: 10.w),
                      Flexible(
                        child: Text(
                          'You are offline — Check your connection',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.2,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
