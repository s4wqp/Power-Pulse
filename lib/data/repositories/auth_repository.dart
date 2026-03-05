// import 'package:dio/dio.dart';
import 'package:power_pulse/data/models/auth_models.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/auth/login',
        data: request.toJson(),
      );

      final authResponse = AuthResponse.fromJson(response.data);
      await _saveSession(authResponse);
      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> registerTrainee(RegisterTraineeRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/auth/signup/trainee',
        data: request.toJson(),
      );
      final authResponse = AuthResponse.fromJson(response.data);
      await _saveSession(authResponse);
      return authResponse;
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> registerTrainer(RegisterTrainerRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/auth/signup/trainer',
        data: request.toJson(),
      );
      final authResponse = AuthResponse.fromJson(response.data);
      await _saveSession(authResponse);
      return authResponse;
    } catch (e) {
      // Assuming valid error handling here
      rethrow;
    }
  }

  Future<void> _saveSession(AuthResponse authResponse) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', authResponse.token);
    await prefs.setString('role', authResponse.role);
    await prefs.setInt('user_id', authResponse.userId);
    await prefs.setString('full_name', authResponse.fullName);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('role');
    await prefs.remove('user_id');
    await prefs.remove('full_name');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('auth_token');
  }
}
