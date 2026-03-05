// --- Custom Widgets ---

import 'package:flutter/material.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/models/trainee_registration_data.dart';
import 'package:power_pulse/routing.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/data/models/auth_models.dart';
import 'package:power_pulse/presentation/widgets/elevated_button.dart';

class ProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const ProgressBar({
    super.key,
    required this.currentStep,
    this.totalSteps = 2,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(totalSteps, (index) {
        bool isActive = index + 1 == currentStep;
        return Container(
          width: 40,
          height: 4,
          margin: EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: isActive ? Color(0xFF00A981) : Color(0xFFE0E0E0),
            borderRadius: BorderRadius.circular(2),
          ),
        );
      }),
    );
  }
}

class UnitToggle extends StatelessWidget {
  final String value;
  final List<String> options;
  final ValueChanged<String> onChanged;

  const UnitToggle({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: options.map((option) {
          bool isSelected = value == option;
          return GestureDetector(
            onTap: () => onChanged(option),
            child: AnimatedContainer(
              duration: Duration(milliseconds: 200),
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? Color(0xFF00A981) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                option,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.grey[400],
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class RulerPicker extends StatefulWidget {
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;
  final String unit;

  const RulerPicker({
    super.key,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    required this.unit,
  });

  @override
  _RulerPickerState createState() => _RulerPickerState();
}

class _RulerPickerState extends State<RulerPicker> {
  late ScrollController _scrollController;
  final double _itemWidth = 10.0; // Space between ticks

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController(
      initialScrollOffset: (widget.value - widget.min) * _itemWidth,
    );
  }

  @override
  void didUpdateWidget(RulerPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value && !_scrollController.hasClients) {
      // Handle external updates if needed, but usually we drive from scroll
    }
    if (oldWidget.unit != widget.unit) {
      // Reset scroll position when unit changes significantly
      // This is a bit tricky as we need to jump to the new converted value
      // But the parent usually handles the value conversion.
      // We just need to update the scroll position to match the new value.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo((widget.value - widget.min) * _itemWidth);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    int itemCount = (widget.max - widget.min).round() + 1;

    return SizedBox(
      height: 100,
      child: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          if (notification is ScrollUpdateNotification) {
            double offset = _scrollController.offset;
            double newValue = widget.min + (offset / _itemWidth);
            if (newValue != widget.value) {
              // Clamp value
              newValue = newValue.clamp(widget.min, widget.max);
              widget.onChanged(newValue);
            }
          }
          return true;
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              physics: BouncingScrollPhysics(),
              itemCount: itemCount,
              padding: EdgeInsets.symmetric(
                horizontal: MediaQuery.of(context).size.width / 2,
              ),
              itemBuilder: (context, index) {
                int value = widget.min.round() + index;
                bool isMajor = value % 10 == 0;

                return SizedBox(
                  width: _itemWidth,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (isMajor) ...[
                        FittedBox(
                          fit: BoxFit.none,
                          clipBehavior: Clip.none,
                          child: Text(
                            '$value',
                            style: TextStyle(
                              fontSize: 12,
                              color: Custom().colors().black,
                            ),
                          ),
                        ),
                        SizedBox(height: 4),
                      ],
                      Container(
                        height: isMajor ? 30 : 15,
                        width: 1,
                        color: Custom().colors().black,
                      ),
                      if (!isMajor) SizedBox(height: 15), // Align ticks
                    ],
                  ),
                );
              },
            ),
            // Center Indicator
            Positioned(
              top: 40, // Adjust based on layout
              child: Container(
                height: 40,
                width: 2,
                color: Custom().colors().black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Screens ---

class WeightSelectionScreen extends StatefulWidget {
  final TraineeRegistrationData data;

  const WeightSelectionScreen({super.key, required this.data});

  @override
  _WeightSelectionScreenState createState() => _WeightSelectionScreenState();
}

class _WeightSelectionScreenState extends State<WeightSelectionScreen> {
  String selectedUnit = 'kg';
  double selectedWeight = 70.0;

  void _convertWeight(String newUnit) {
    setState(() {
      if (newUnit == 'kg' && selectedUnit == 'lb') {
        selectedWeight = selectedWeight * 0.453592;
      } else if (newUnit == 'lb' && selectedUnit == 'kg') {
        selectedWeight = selectedWeight * 2.20462;
      }
      selectedUnit = newUnit;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.top -
                  MediaQuery.of(context).padding.bottom,
            ),
            child: IntrinsicHeight(
              child: Column(
                children: [
                  SizedBox(height: 20),
                  ProgressBar(currentStep: 1),
                  SizedBox(height: 40),
                  Text(
                    'What is your\nweight?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                      fontFamily: 'Montserrat_Alternates',
                    ),
                  ),
                  SizedBox(height: 30),
                  UnitToggle(
                    value: selectedUnit,
                    options: ['kg', 'lb'],
                    onChanged: _convertWeight,
                  ),
                  SizedBox(height: 40),

                  // Display Area
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.symmetric(horizontal: 24),
                      padding: EdgeInsets.symmetric(vertical: 20),
                      decoration: BoxDecoration(
                        color: Custom()
                            .colors()
                            .widthAndHight, // Light teal background
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            selectedWeight.toStringAsFixed(0),
                            style: TextStyle(
                              fontSize: 64,
                              fontWeight: FontWeight.bold,
                              color: Custom().colors().black,
                            ),
                          ),
                          SizedBox(height: 40),
                          RulerPicker(
                            value: selectedWeight,
                            min: selectedUnit == 'kg' ? 30 : 66,
                            max: selectedUnit == 'kg' ? 200 : 440,
                            unit: selectedUnit,
                            onChanged: (val) {
                              setState(() {
                                selectedWeight = val;
                              });
                            },
                          ),
                          SizedBox(height: 10),
                          Text(
                            selectedUnit,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Custom().colors().black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 40),

                  // Navigation
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24.0,
                      vertical: 20.0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildBackButton(context),
                        _buildNextButton(context, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => HeightSelectionScreen(
                                data: widget.data
                                  ..weight = selectedWeight
                                  ..weightUnit = selectedUnit,
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HeightSelectionScreen extends StatefulWidget {
  final TraineeRegistrationData data;

  const HeightSelectionScreen({super.key, required this.data});

  @override
  _HeightSelectionScreenState createState() => _HeightSelectionScreenState();
}

class _HeightSelectionScreenState extends State<HeightSelectionScreen> {
  String selectedUnit = 'cm';
  double selectedHeight = 170.0;
  bool _isLoading = false;

  Future<void> _registerUser() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final request = RegisterTraineeRequest(
        name: widget.data.name,
        email: widget.data.email,
        password: widget.data.password,
        phone: widget.data.phoneNumber,
        weight: widget.data.weight ?? 0.0,
        height: selectedHeight,
      );

      final success = await authProvider.registerTrainee(request);

      if (!mounted) return;

      if (success) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routing.traineeHomeScreen,
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage ?? 'Registration failed'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('An error occurred: $e')));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _convertHeight(String newUnit) {
    setState(() {
      if (newUnit == 'cm' && selectedUnit == 'inches') {
        selectedHeight = selectedHeight * 2.54;
      } else if (newUnit == 'inches' && selectedUnit == 'cm') {
        selectedHeight = selectedHeight * 0.393701;
      }
      selectedUnit = newUnit;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.top -
                  MediaQuery.of(context).padding.bottom,
            ),
            child: IntrinsicHeight(
              child: Column(
                children: [
                  SizedBox(height: 20),
                  ProgressBar(currentStep: 2),
                  SizedBox(height: 40),
                  Text(
                    'What is your\nheight?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Custom().colors().black,
                    ),
                  ),
                  SizedBox(height: 30),
                  UnitToggle(
                    value: selectedUnit,
                    options: ['inches', 'cm'],
                    onChanged: _convertHeight,
                  ),
                  SizedBox(height: 40),

                  // Display Area
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.symmetric(horizontal: 24),
                      padding: EdgeInsets.symmetric(vertical: 20),
                      decoration: BoxDecoration(
                        color: Custom()
                            .colors()
                            .widthAndHight, // Light teal background
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            selectedHeight.toStringAsFixed(0),
                            style: TextStyle(
                              fontSize: 64,
                              fontWeight: FontWeight.bold,
                              color: Custom().colors().black,
                            ),
                          ),
                          SizedBox(height: 40),
                          RulerPicker(
                            value: selectedHeight,
                            min: selectedUnit == 'cm' ? 100 : 40,
                            max: selectedUnit == 'cm' ? 250 : 100,
                            unit: selectedUnit,
                            onChanged: (val) {
                              setState(() {
                                selectedHeight = val;
                              });
                            },
                          ),
                          SizedBox(height: 10),
                          Text(
                            selectedUnit,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Custom().colors().black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 40),

                  // Navigation
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24.0,
                      vertical: 20.0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildBackButton(context),
                        _isLoading
                            ? const CircularProgressIndicator()
                            : CustomElevatedButton(
                                onPressed: _registerUser,
                                backgroundColor: Custom()
                                    .colors()
                                    .primaryButton,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 40,
                                  vertical: 16,
                                ),
                                text: 'start now',
                                style: const TextStyle(
                                  fontSize: 19,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// --- Helper Widgets ---

Widget _buildBackButton(BuildContext context) {
  return Container(
    decoration: BoxDecoration(
      border: Border.all(color: Custom().colors().black),
      shape: BoxShape.circle,
    ),
    child: IconButton(
      icon: Icon(
        Icons.arrow_back_ios_new,
        size: 20,
        color: Custom().colors().black,
      ),
      onPressed: () => Navigator.pop(context),
    ),
  );
}

Widget _buildNextButton(BuildContext context, VoidCallback onPressed) {
  return ElevatedButton(
    onPressed: onPressed,
    style: ElevatedButton.styleFrom(
      backgroundColor: Color(0xFF00A981),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
    ),
    child: Row(
      children: [
        Text(
          'Next',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(width: 8),
        Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white),
        Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.white.withOpacity(0.5),
        ),
        Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.white.withOpacity(0.3),
        ),
      ],
    ),
  );
}
