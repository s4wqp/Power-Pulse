import 'package:flutter/foundation.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/data/network/api_client.dart';

class ChatRepository {
  final ApiClient _apiClient = ApiClient();

  Future<List<ChatContact>> getContacts(int userId, String role) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/chat/contacts',
        queryParameters: {'userId': userId, 'role': role},
      );
      debugPrint("RAW CONTACTS RESPONSE: ${response.data}");
      return (response.data as List)
          .map((e) => ChatContact.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markChatAsRead(int targetId) async {
    try {
      await _apiClient.dio.put('/api/Chat/$targetId/read');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> sendMessage(
    Map<String, dynamic> messageData,
  ) async {
    try {
      final response = await _apiClient.dio.post(
        '/api/chat',
        data: messageData,
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getMessages(
    int user1Id,
    int user2Id, {
    String? user1Role,
    String? user2Role,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/api/chat',
        queryParameters: {'userId1': user1Id, 'userId2': user2Id},
      );
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
