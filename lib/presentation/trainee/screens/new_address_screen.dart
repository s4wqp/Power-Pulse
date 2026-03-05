import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/services.dart'; // Added for TextInputFormatter
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:power_pulse/custom.dart';
import 'package:provider/provider.dart';
import 'package:power_pulse/business_logic/providers/auth_provider.dart';
import 'package:power_pulse/business_logic/providers/trainee_provider.dart';
import 'package:power_pulse/data/models/trainee_models.dart';

class NewAddressScreen extends StatefulWidget {
  final Address? address;
  const NewAddressScreen({super.key, this.address});

  @override
  State<NewAddressScreen> createState() => _NewAddressScreenState();
}

class _NewAddressScreenState extends State<NewAddressScreen> {
  final TextEditingController _buildingController = TextEditingController();
  final TextEditingController _apartmentController = TextEditingController();
  final TextEditingController _floorController = TextEditingController();
  final TextEditingController _streetController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _detailsController = TextEditingController();

  String _detectedAddress = 'Locating...';
  double _currentLat = 30.0444; // Default Cairo
  double _currentLng = 31.2357;
  final MapController _mapController = MapController();
  bool _isEditing = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (widget.address != null) {
      _isEditing = true;
      _buildingController.text = widget.address!.building;
      _apartmentController.text = widget.address!.apartment ?? '';
      _floorController.text = widget.address!.floor ?? '';
      _streetController.text = widget.address!.street;
      _detailsController.text = widget.address!.additionalDetails ?? '';

      var phone = widget.address!.phone ?? '';
      if (phone.startsWith('+20')) {
        _phoneController.text = phone.substring(3);
      } else {
        _phoneController.text = phone;
      }

      // Skip geolocation if we have an address
      _detectedAddress = widget.address!.street;
    } else {
      final args =
          ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      if (args != null && args.containsKey('lat') && args.containsKey('lng')) {
        _currentLat = args['lat'];
        _currentLng = args['lng'];
        _getAddressFromLatLng(_currentLat, _currentLng, moveMap: true);
      } else {
        _useCurrentLocation();
      }
    }
  }

  Future<void> _getAddressFromLatLng(
    double lat,
    double lng, {
    bool moveMap = false,
  }) async {
    try {
      if (moveMap) {
        // Small delay to ensure controller is ready if called during init
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) _mapController.move(LatLng(lat, lng), 17);
        });
      }

      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          _currentLat = lat;
          _currentLng = lng;

          // Construct a readable address string
          List<String> addressParts = [];
          if (place.street != null) addressParts.add(place.street!);
          if (place.subLocality != null) addressParts.add(place.subLocality!);
          if (place.locality != null) addressParts.add(place.locality!);
          _detectedAddress = addressParts.join(', ');

          // Auto-fill fields
          // Street
          if (place.thoroughfare != null && place.thoroughfare!.isNotEmpty) {
            _streetController.text = place.thoroughfare!;
          } else if (place.street != null) {
            _streetController.text = place.street!;
          }

          // Building / House Number
          if (place.subThoroughfare != null &&
              place.subThoroughfare!.isNotEmpty) {
            _buildingController.text = place.subThoroughfare!;
          } else if (place.name != null && place.name != place.thoroughfare) {
            // Sometimes name contains the building number involved
            _buildingController.text = place.name!;
          }
        });
      }
    } catch (e) {
      debugPrint('Error getting address: $e');
      setState(() {
        _detectedAddress = 'Address not found';
      });
    }
  }

  Future<void> _useCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location services are disabled.')),
      );
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are denied')),
        );
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location permissions are permanently denied'),
        ),
      );
      return;
    }

    Position position = await Geolocator.getCurrentPosition();
    await _getAddressFromLatLng(
      position.latitude,
      position.longitude,
      moveMap: true,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Address updated from current location'),
        backgroundColor: Custom().colors().lightGreen,
      ),
    );
  }

  @override
  void dispose() {
    _buildingController.dispose();
    _apartmentController.dispose();
    _floorController.dispose();
    _streetController.dispose();
    _phoneController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Custom().colors().lightGreen,
      appBar: AppBar(
        backgroundColor: Custom().colors().lightGreen,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _isEditing ? 'Edit Address' : 'New Address',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Container(
        margin: EdgeInsets.only(top: 20.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30.r),
            topRight: Radius.circular(30.r),
          ),
        ),
        child: SingleChildScrollView(
          padding: EdgeInsets.all(20.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Map View
              Container(
                height: 150.h,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15.r),
                  color: Colors.grey[200],
                  border: Border.all(color: Colors.grey.shade300),
                ),
                clipBehavior: Clip.hardEdge,
                child: FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: LatLng(_currentLat, _currentLng),
                    initialZoom: 16.0,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                    ),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.example.power_pulse',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(_currentLat, _currentLng),
                          width: 40.0,
                          height: 40.0,
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.red,
                            size: 40.0,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(height: 15.h),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Detected Address',
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                            color: Custom().colors().lightGreen,
                          ),
                        ),
                        SizedBox(height: 5.h),
                        Row(
                          children: [
                            Icon(
                              Icons.location_on_outlined,
                              size: 14.sp,
                              color: Custom().colors().lightGreen,
                            ),
                            SizedBox(width: 4.w),
                            Expanded(
                              child: Text(
                                _detectedAddress,
                                style: TextStyle(
                                  fontSize: 12.sp,
                                  color: Colors.black87,
                                ),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 2,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context); // Go back to map to change
                    },
                    child: Text(
                      'Change',
                      style: TextStyle(
                        color: Custom().colors().lightGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 10.h),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: _useCurrentLocation,
                  icon: const Icon(
                    Icons.my_location,
                    size: 16,
                    color: Colors.white,
                  ),
                  label: const Text(
                    "Use My Current Location",
                    style: TextStyle(color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                ),
              ),

              SizedBox(height: 20.h),

              // Form Fields
              _buildTextField('Building name', _buildingController),
              SizedBox(height: 15.h),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      'Apartment number',
                      _apartmentController,
                    ),
                  ),
                  SizedBox(width: 15.w),
                  Expanded(child: _buildTextField('Floor', _floorController)),
                ],
              ),
              SizedBox(height: 15.h),
              _buildTextField('Street', _streetController),
              SizedBox(height: 15.h),
              Row(
                children: [
                  Container(
                    width: 60.w,
                    padding: EdgeInsets.symmetric(vertical: 14.h),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: const Text(
                      '+20',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Expanded(
                    child: _buildTextField(
                      'Phone number',
                      _phoneController,
                      keyboardType: TextInputType.phone,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 15.h),
              _buildTextField(
                'Additional details (optional)',
                _detailsController,
                maxLines: 3,
              ),

              SizedBox(height: 30.h),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (_buildingController.text.trim().isEmpty ||
                        _streetController.text.trim().isEmpty ||
                        _phoneController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Building, Street and Phone are required.',
                          ),
                        ),
                      );
                      return;
                    }

                    var phoneVal = _phoneController.text.trim();
                    if (phoneVal.isNotEmpty) {
                      // Remove leading 0 if present
                      if (phoneVal.startsWith('0')) {
                        phoneVal = phoneVal.substring(1);
                      }

                      if (phoneVal.length != 10) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Phone number must be exactly 10 digits (e.g. 11xxxxxxxx)',
                            ),
                          ),
                        );
                        return;
                      }
                    } else {
                      return;
                    }

                    final addressData = {
                      'building': _buildingController.text.trim(),
                      'apartment': _apartmentController.text.trim(),
                      'floor': _floorController.text.trim(),
                      'street': _streetController.text.trim(),
                      'phone': phoneVal.isNotEmpty ? '+20$phoneVal' : null,
                      'additionalDetails': _detailsController.text.trim(),
                    };

                    final traineeId = context.read<AuthProvider>().userId;
                    if (traineeId != null) {
                      final traineeProvider = context.read<TraineeProvider>();
                      final bool success;

                      if (_isEditing && widget.address != null) {
                        success = await traineeProvider.updateAddress(
                          traineeId,
                          widget.address!.id,
                          addressData,
                        );
                      } else {
                        success = await traineeProvider.addAddress(
                          traineeId,
                          addressData,
                        );
                      }

                      if (success) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                _isEditing
                                    ? 'Address updated successfully!'
                                    : 'Address saved successfully!',
                              ),
                            ),
                          );
                          Navigator.pop(context); // Go back
                        }
                      } else {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Failed to save address.'),
                            ),
                          );
                        }
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Custom().colors().lightGreen,
                    padding: EdgeInsets.symmetric(vertical: 15.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25.r),
                    ),
                  ),
                  child: Text(
                    _isEditing ? 'Update' : 'Save',
                    style: TextStyle(
                      fontSize: 16.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    String hint,
    TextEditingController controller, {
    int maxLines = 1,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 14.sp),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 15.w,
            vertical: 12.h,
          ),
        ),
      ),
    );
  }
}
