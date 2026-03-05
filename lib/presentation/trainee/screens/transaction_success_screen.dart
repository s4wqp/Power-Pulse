import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';

class TransactionSuccessScreen extends StatefulWidget {
  const TransactionSuccessScreen({super.key});

  @override
  State<TransactionSuccessScreen> createState() =>
      _TransactionSuccessScreenState();
}

class _TransactionSuccessScreenState extends State<TransactionSuccessScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _checkAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.elasticOut),
      ),
    );

    _checkAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 0.8, curve: Curves.easeOut),
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.8, 1.0, curve: Curves.easeIn),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Animated Checkmark
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Transform.scale(
                  scale: _scaleAnimation.value,
                  child: CustomPaint(
                    painter: CheckMarkPainter(progress: _checkAnimation.value),
                    size: Size(100.r, 100.r),
                  ),
                );
              },
            ),
            SizedBox(height: 30.h),

            // Text Fade In
            FadeTransition(
              opacity: _opacityAnimation,
              child: Column(
                children: [
                  Text(
                    'Success!',
                    style: TextStyle(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.bold,
                      color: Custom().colors().lightGreen,
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Text(
                    'Transaction Confirmed',
                    style: TextStyle(fontSize: 16.sp, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),

            SizedBox(height: 50.h),

            // Button Fade In
            FadeTransition(
              opacity: _opacityAnimation,
              child: SizedBox(
                width: 200.w,
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate back to Home and remove all previous routes
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      Routing.traineeHomeScreen,
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25.r),
                    ),
                    elevation: 5,
                  ),
                  child: Text(
                    'Back to Home',
                    style: TextStyle(
                      fontSize: 16.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CheckMarkPainter extends CustomPainter {
  final double progress;

  CheckMarkPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint circlePaint = Paint()
      ..color = Custom().colors().lightGreen
      ..style = PaintingStyle.fill;

    final Paint checkPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Draw Circle
    canvas.drawCircle(
      Offset(size.width / 2, size.height / 2),
      size.width / 2,
      circlePaint,
    );

    // Draw Checkmark
    if (progress > 0) {
      final Path path = Path();
      // Start point
      final double startX = size.width * 0.25;
      final double startY = size.height * 0.5;
      // Mid point
      final double midX = size.width * 0.45;
      final double midY = size.height * 0.7;
      // End point
      final double endX = size.width * 0.75;
      final double endY = size.height * 0.35;

      path.moveTo(startX, startY);

      if (progress < 0.5) {
        // Drawing first leg
        double t = progress * 2; // Normalize to 0-1
        path.lineTo(startX + (midX - startX) * t, startY + (midY - startY) * t);
      } else {
        // Finished first leg, draw full first leg and part of second
        path.lineTo(midX, midY);
        double t = (progress - 0.5) * 2; // Normalize to 0-1
        path.lineTo(midX + (endX - midX) * t, midY + (endY - midY) * t);
      }

      canvas.drawPath(path, checkPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CheckMarkPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
