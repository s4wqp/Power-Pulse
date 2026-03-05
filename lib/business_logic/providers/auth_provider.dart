import 'package:flutter/material.dart';
import 'package:power_pulse/data/models/auth_models.dart';
import 'package:power_pulse/data/repositories/auth_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();
  bool _isLoading = false;
  String? _errorMessage;
  int? _userId;
  String? _role;
  String? _fullName;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int? get userId => _userId;
  String? get role => _role;
  String? get fullName => _fullName;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authRepository.login(
        LoginRequest(email: email, password: password),
      );
      _userId = authResponse.userId;
      _role = authResponse.role;
      _fullName = authResponse.fullName;
      _isLoading = false;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _isLoading = false;
      if (e.toString().contains('500')) {
        _errorMessage = 'Server error. Please try again later.';
      } else if (e.toString().contains('401')) {
        _errorMessage = 'Invalid email or password.';
      } else {
        _errorMessage = 'An error occurred. Please check your connection.';
      }
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'An unexpected error occurred.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerTrainee(RegisterTraineeRequest request) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authRepository.registerTrainee(request);
      _userId = authResponse.userId;
      _role = authResponse.role;
      _fullName = authResponse.fullName;
      _isLoading = false;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _isLoading = false;
      if (e.toString().contains('500')) {
        _errorMessage = 'Server error. Please try again later.';
      } else if (e.toString().contains('409') ||
          e.toString().contains('Conflict')) {
        _errorMessage = 'User already exists.';
      } else {
        _errorMessage = 'An error occurred. Please check your connection.';
      }
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'An unexpected error occurred.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerTrainer(RegisterTrainerRequest request) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _authRepository.registerTrainer(request);
      _userId = authResponse.userId;
      _role = authResponse.role;
      _fullName = authResponse.fullName;
      _isLoading = false;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _isLoading = false;
      if (e.toString().contains('500')) {
        _errorMessage = 'Server error. Please try again later.';
      } else if (e.toString().contains('409') ||
          e.toString().contains('Conflict')) {
        _errorMessage = 'User already exists.';
      } else {
        _errorMessage = 'An error occurred. Please check your connection.';
      }
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'An unexpected error occurred.';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _userId = null;
    _role = null;
    _fullName = null;
    notifyListeners();
  }

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('auth_token')) return false;

    final token = prefs.getString('auth_token');
    final userId = prefs.getInt('user_id');
    final role = prefs.getString('role');
    final fullName = prefs.getString('full_name');

    if (token != null) {
      _userId = userId;
      _role = role;
      _fullName = fullName;
      notifyListeners();
      return true;
    }
    return false;
  }
}
