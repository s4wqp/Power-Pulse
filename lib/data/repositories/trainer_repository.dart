import 'package:flutter/foundation.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/data/network/api_client.dart';

class TrainerRepository {
  final ApiClient _apiClient = ApiClient();

  Future<List<Trainer>> getTrainers() async {
    try {
      final response = await _apiClient.dio.get('/api/trainers');
      // Assuming response.data is a List
      return (response.data as List).map((e) => Trainer.fromJson(e)).toList();
    } catch (e) {
      // Return empty list or rethrow?
      // For now rethrow to let provider handle error
      rethrow;
    }
  }

  Future<Trainer> getTrainerDetails(int id) async {
    try {
      final response = await _apiClient.dio.get('/api/trainers/$id');
      return Trainer.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<TrainerStats> getTrainerStats(int id) async {
    try {
      final response = await _apiClient.dio.get('/api/trainers/$id/stats');
      if (response.data == null || response.data is! Map) {
        return TrainerStats(
          totalClients: 0,
          todayAmount: 0.0,
          totalAmount: 0.0,
        );
      }
      return TrainerStats.fromJson(response.data);
    } catch (e) {
      // Fallback if endpoint doesn't exist yet to avoid crashes
      return TrainerStats(totalClients: 0, todayAmount: 0.0, totalAmount: 0.0);
    }
  }

  /// Fetches active subscriptions for this trainer.
  /// Returns a list of subscription maps from the backend.
  Future<List<Map<String, dynamic>>> getTrainerSubscriptions(
    int trainerId,
  ) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/subscriptions/trainer/$trainerId',
      );
      if (response.data is List) {
        return (response.data as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching trainer subscriptions: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> addDailyNote(
    int subscriptionId,
    String noteTitle,
    String noteText,
  ) async {
    try {
      final data = {'noteText': noteText};
      if (noteTitle.isNotEmpty) {
        data['title'] = noteTitle;
      }

      final response = await _apiClient.dio.post(
        '/api/subscriptions/$subscriptionId/notes',
        data: data,
      );
      if (response.data != null && response.data is Map) {
        return Map<String, dynamic>.from(response.data);
      }
      return null;
    } catch (e) {
      debugPrint('Error adding daily note: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>?> getDailyNotes(int subscriptionId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/subscriptions/$subscriptionId/notes',
      );
      if (response.data is List) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return null;
    } catch (e) {
      debugPrint('Error fetching specific daily notes endpoint: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> getSubscriptionDetails(
    int subscriptionId,
  ) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/subscriptions/$subscriptionId',
      );
      if (response.data is Map) {
        return Map<String, dynamic>.from(response.data);
      }
      return null;
    } catch (e) {
      debugPrint('Error fetching subscription details: $e');
      return null;
    }
  }

  Future<void> addCertificate(
    int trainerId,
    Map<String, dynamic> certificateData,
  ) async {
    try {
      // Assuming endpoint: POST /api/trainers/{id}/certificates
      await _apiClient.dio.post(
        '/api/trainers/$trainerId/certificates',
        data: certificateData,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateCertificate(
    int trainerId,
    int certId,
    Map<String, dynamic> certificateData,
  ) async {
    try {
      await _apiClient.dio.put(
        '/api/trainers/$trainerId/certificates/$certId',
        data: certificateData,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteCertificate(int trainerId, int certId) async {
    try {
      await _apiClient.dio.delete(
        '/api/trainers/$trainerId/certificates/$certId',
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> addWorkout(
    int trainerId,
    Map<String, dynamic> workoutData,
  ) async {
    try {
      // Assuming endpoint: POST /api/trainers/{id}/workouts
      await _apiClient.dio.post(
        '/api/trainers/$trainerId/workouts',
        data: workoutData,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<int?> addWorkoutForId(
    int trainerId,
    Map<String, dynamic> workoutData,
  ) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/trainers/$trainerId/workouts',
        data: workoutData,
      );
      if (response.data != null && response.data['id'] != null) {
        return response.data['id'] as int;
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfile(int trainerId, Map<String, dynamic> data) async {
    try {
      final url = '/api/trainers/$trainerId';
      debugPrint('Updating Profile at: $url with method: PUT');
      await _apiClient.dio.put(url, data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfileImage(int trainerId, String imageUrl) async {
    try {
      final current = await getTrainerDetails(trainerId);
      final url = '/api/trainers/$trainerId';
      await _apiClient.dio.put(
        url,
        data: {
          'name': current.name,
          'phone': current.phone,
          'professionalTitle': current.professionalTitle,
          'experienceYears': current.experienceYears,
          'bio': current.bio,
          'specialization': current.specializations
              .map((e) => e.name)
              .join(', '),
          'profileImageUrl': imageUrl,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<List<TrainingPlan>> getPlans(int trainerId) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/trainers/$trainerId/plans',
      );
      return (response.data as List)
          .map((e) => TrainingPlan.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createPlan(int trainerId, Map<String, dynamic> planData) async {
    try {
      await _apiClient.dio.post(
        '/api/trainers/$trainerId/plans',
        data: planData,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updatePlan(
    int trainerId,
    int planId,
    Map<String, dynamic> planData,
  ) async {
    try {
      final dataWithId = Map<String, dynamic>.from(planData);
      dataWithId['id'] = planId;
      dataWithId['trainingPlanId'] = planId;

      await _apiClient.dio.put(
        '/api/trainers/$trainerId/plans/$planId',
        data: dataWithId,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePlan(int trainerId, int planId) async {
    try {
      await _apiClient.dio.delete('/api/trainers/$trainerId/plans/$planId');
    } catch (e) {
      rethrow;
    }
  }
}
