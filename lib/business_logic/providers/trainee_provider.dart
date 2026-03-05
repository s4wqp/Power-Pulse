import 'package:flutter/material.dart';
import 'package:power_pulse/data/models/trainee_models.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/data/models/order_models.dart';
import 'package:power_pulse/data/repositories/trainee_repository.dart';

class TraineeProvider with ChangeNotifier {
  final TraineeRepository _traineeRepository = TraineeRepository();
  Trainee? _trainee;
  List<Workout> _trainerWorkouts = [];
  List<Order> _orders = [];
  List<Address> _addresses = [];
  bool _isLoading = false;
  String? _errorMessage;

  Trainee? get trainee => _trainee;
  List<Workout> get trainerWorkouts => _trainerWorkouts;
  List<Order> get orders => _orders;
  List<Address> get addresses => _addresses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchProfile(int id, {bool force = false}) async {
    if (!force && _isLoading && _trainee != null) return;

    _isLoading = true;
    _errorMessage = null;
    // Notify in next microtask to avoid "setState called during build"
    Future.microtask(() => notifyListeners());

    try {
      _trainee = await _traineeRepository.getProfile(id);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<bool> updateProfile(int id, Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _traineeRepository.updateProfile(id, data);
      // fetchProfile already calls notifyListeners
      await fetchProfile(id, force: true);
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProfileImage(int id, String imageUrl) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _traineeRepository.updateProfileImage(id, imageUrl);
      // fetchProfile already calls notifyListeners
      await fetchProfile(id, force: true);
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchAddresses(int traineeId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _addresses = await _traineeRepository.getAddresses(traineeId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<bool> addAddress(
    int traineeId,
    Map<String, dynamic> addressData,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final newAddress = await _traineeRepository.addAddress(
        traineeId,
        addressData,
      );
      _addresses.add(newAddress);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateAddress(
    int traineeId,
    int addressId,
    Map<String, dynamic> addressData,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _traineeRepository.updateAddress(traineeId, addressId, addressData);
      // fetchAddresses already calls notifyListeners
      await fetchAddresses(traineeId);
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAddress(int traineeId, int addressId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _traineeRepository.deleteAddress(traineeId, addressId);
      _addresses.removeWhere((address) => address.id == addressId);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> checkHasAddress(int traineeId) async {
    return await _traineeRepository.checkHasAddress(traineeId);
  }

  Future<void> fetchTrainerWorkouts(int traineeId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _trainerWorkouts = await _traineeRepository.getTrainerWorkouts(traineeId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<Order?> placeOrder(Map<String, dynamic> orderData) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final order = await _traineeRepository.placeOrder(orderData);

      // We automatically reload orders here or let the UI handle it?
      // Adding it directly could be risky if traineeId is needed in URL but we don't have it locally.
      // So returning the newly constructed Order is better
      _orders.insert(0, order);

      _isLoading = false;
      notifyListeners();
      return order;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> fetchOrders(int traineeId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final fetchedOrders = await _traineeRepository.getTraineeOrders(
        traineeId,
      );
      final Map<int, Order> ordersMap = {};
      for (var o in _orders) {
        ordersMap[o.id] = o;
      }
      for (var o in fetchedOrders) {
        ordersMap[o.id] = o;
      }
      _orders = ordersMap.values.toList();
      _orders.sort((a, b) => b.id.compareTo(a.id)); // Newest first
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<Order?> getOrderById(int orderId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final order = await _traineeRepository.getOrderById(orderId);
      _isLoading = false;
      notifyListeners();
      return order;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }
}
