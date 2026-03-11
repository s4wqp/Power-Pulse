import 'package:power_pulse/data/models/trainee_models.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/data/models/order_models.dart';
import 'package:power_pulse/data/network/api_client.dart';
import 'package:dio/dio.dart';

class TraineeRepository {
  final ApiClient _apiClient = ApiClient();

  Future<Trainee> getProfile(int id) async {
    try {
      final response = await _apiClient.dio.get('/api/trainees/$id');
      return Trainee.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfile(int id, Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.put('/api/trainees/$id', data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfileImage(int id, String imageUrl) async {
    try {
      final current = await getProfile(id);
      await _apiClient.dio.put(
        '/api/trainees/$id',
        data: {
          'name': current.name,
          'phone': current.phone,
          'weight': current.weight,
          'height': current.height,
          'profileImageUrl': imageUrl,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Address>> getAddresses(int traineeId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/trainees/$traineeId/addresses',
      );
      return (response.data as List).map((e) => Address.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Address> addAddress(int traineeId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/trainees/$traineeId/addresses',
        data: data,
      );
      return Address.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Address> updateAddress(
    int traineeId,
    int addressId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.dio.put(
        '/api/trainees/$traineeId/addresses/$addressId',
        data: data,
      );
      return Address.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteAddress(int traineeId, int addressId) async {
    try {
      await _apiClient.dio.delete(
        '/api/trainees/$traineeId/addresses/$addressId',
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> checkHasAddress(int traineeId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/trainees/$traineeId/addresses/check',
      );
      return response.data['hasAddress'] ?? false;
    } catch (e) {
      return false; // Safely return false if error
    }
  }

  // Add card methods etc.

  Future<List<Workout>> getTrainerWorkouts(int traineeId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/chat/trainee/$traineeId/workouts',
      );
      return (response.data as List).map((e) => Workout.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> subscribe(int traineeId, int trainingPlanId) async {
    try {
      await _apiClient.dio.post(
        '/api/subscriptions',
        data: {'traineeId': traineeId, 'trainingPlanId': trainingPlanId},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<Order> placeOrder(Map<String, dynamic> orderData) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/orders',
        data: orderData,
      );
      return Order.fromJson(response.data);
    } catch (e) {
      if (e is DioException && e.response?.statusCode == 400) {
        final dataStr = e.response?.data.toString() ?? '';
        if (dataStr.contains('not found')) {
          // Extract backend message if possible
          String errorMsg =
              'Product not found in backend database. Please add it from the admin panel first.';
          try {
            if (e.response?.data is Map) {
              errorMsg = e.response?.data['message'] ?? errorMsg;
            }
          } catch (_) {}

          throw Exception(errorMsg);
        }
      }
      rethrow;
    }
  }

  Future<Order> getOrderById(int orderId) async {
    try {
      final response = await _apiClient.dio.get('/api/orders/$orderId');
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Order>> getTraineeOrders(int traineeId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/orders/trainee/$traineeId',
      );
      if (response.data is List) {
        return (response.data as List).map((e) => Order.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
