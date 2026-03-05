import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:geolocator/geolocator.dart';
import 'package:power_pulse/custom.dart';
import 'package:power_pulse/routing.dart';

class SelectDeliveryLocationScreen extends StatefulWidget {
  const SelectDeliveryLocationScreen({super.key});

  @override
  State<SelectDeliveryLocationScreen> createState() =>
      _SelectDeliveryLocationScreenState();
}

class _SelectDeliveryLocationScreenState
    extends State<SelectDeliveryLocationScreen> {
  // Default to Cairo, Egypt as a starting point if location not found yet
  static const LatLng _initialPosition = LatLng(30.0444, 31.2357);
  final MapController _mapController = MapController();
  LatLng _selectedPosition = _initialPosition;

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return;
    }

    // When we reach here, permissions are granted and we can
    // continue accessing the position of the device.
    Position position = await Geolocator.getCurrentPosition();
    _goToPosition(LatLng(position.latitude, position.longitude));
  }

  void _goToPosition(LatLng latLng) {
    _mapController.move(latLng, 17);
    setState(() {
      _selectedPosition = latLng;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Custom().colors().lightGreen,
      appBar: AppBar(
        backgroundColor: Custom().colors().lightGreen,
        elevation: 0,
        leading: const SizedBox.shrink(),
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(40.h),
          child: Padding(
            padding: EdgeInsets.only(left: 20.w, bottom: 20.h),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Select Delivery Location',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          // FlutterMap (OpenStreetMap)
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _initialPosition,
              initialZoom: 15.0,
              onTap: (_, point) {
                setState(() {
                  _selectedPosition = point;
                });
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.power_pulse',
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _selectedPosition,
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

          // Search Bar (Visual only for now)
          Positioned(
            top: 20.h,
            left: 20.w,
            right: 20.w,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 10.w),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Search...',
                  prefixIcon: Icon(Icons.search, color: Colors.grey),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),

          // Confirm Button
          Positioned(
            bottom: 30.h,
            left: 50.w,
            right: 50.w,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pushReplacementNamed(
                  context,
                  Routing.newAddressScreen,
                  arguments: {
                    'lat': _selectedPosition.latitude,
                    'lng': _selectedPosition.longitude,
                  },
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 12.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25.r),
                ),
              ),
              child: Text(
                'Confirm',
                style: TextStyle(
                  fontSize: 18.sp,
                  color: Custom().colors().lightGreen,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          // My Location Button
          Positioned(
            bottom: 100.h,
            right: 20.w,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: Colors.white,
              onPressed: _determinePosition,
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
