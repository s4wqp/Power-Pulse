import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:power_pulse/data/models/trainer_models.dart';
import 'package:power_pulse/data/repositories/chat_repository.dart';
import 'package:power_pulse/utils/error_handler.dart';
import 'package:signalr_netcore/signalr_client.dart';

class ChatProvider extends ChangeNotifier {
  final ChatRepository _chatRepository = ChatRepository();
  List<ChatContact> _contacts = [];
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ChatContact> get contacts => _contacts;
  List<Map<String, dynamic>> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  HubConnection? _hubConnection;
  int? _currentUserId;
  String? _currentUserRole;

  // Track the currently open chat partner for message filtering
  int? _activeChatPartnerId;
  Timer? _pollingTimer;
  bool _isReconnecting = false;

  Future<void> connectSignalR(String userId, String role) async {
    _currentUserId = int.tryParse(userId);
    _currentUserRole = role;

    if (_hubConnection != null &&
        _hubConnection!.state == HubConnectionState.Connected) {
      return;
    }

    // If we already have a hub that's in a bad state, clean it up first
    if (_hubConnection != null) {
      try {
        await _hubConnection!.stop();
      } catch (_) {}
      _hubConnection = null;
    }

    _hubConnection = HubConnectionBuilder()
        .withUrl("http://powerpuls.runasp.net/chathub")
        .withAutomaticReconnect()
        .build();

    // Handle incoming messages via SignalR
    _hubConnection!.on("ReceiveMessage", _onReceiveMessage);

    // Handle disconnection — attempt reconnect
    _hubConnection!.onclose(({error}) {
      debugPrint("SignalR disconnected: $error");
      _attemptReconnect();
    });

    _hubConnection!.onreconnecting(({error}) {
      debugPrint("SignalR reconnecting: $error");
    });

    _hubConnection!.onreconnected(({connectionId}) {
      debugPrint("SignalR reconnected with id: $connectionId");
      // Re-join the user group after reconnection
      _hubConnection!.invoke("JoinUserGroup", args: [userId, role]).catchError((
        e,
      ) {
        debugPrint("Failed to re-join group after reconnect: $e");
        return null;
      });
    });

    try {
      await _hubConnection!.start();
      await _hubConnection!.invoke("JoinUserGroup", args: [userId, role]);
      debugPrint(
        "Successfully connected to SignalR for user: $userId as $role",
      );
    } catch (e) {
      debugPrint("SignalR connection error: $e");
      // Schedule a reconnect attempt
      _attemptReconnect();
    }
  }

  void _onReceiveMessage(List<Object?>? arguments) {
    if (arguments != null && arguments.isNotEmpty) {
      final message = arguments[0];
      if (message is Map) {
        final mapMsg = Map<String, dynamic>.from(message);
        debugPrint(
          "SignalR ReceiveMessage: senderId=${mapMsg['senderId']}, "
          "receiverId=${mapMsg['receiverId']}, activeChatPartner=$_activeChatPartnerId",
        );

        // Only add to messages list if we're in an active chat with this person
        if (_activeChatPartnerId != null) {
          final senderId = mapMsg['senderId'];
          final receiverId = mapMsg['receiverId'];

          // Message belongs to this conversation if:
          // - sent by our chat partner to us, OR
          // - sent by us to our chat partner (echo from server)
          final belongsToChat =
              senderId == _activeChatPartnerId ||
              receiverId == _activeChatPartnerId;

          if (belongsToChat) {
            // Verify not already in list
            final exists = _messages.any(
              (m) => m['id'] == mapMsg['id'] && mapMsg['id'] != null,
            );
            if (!exists) {
              _messages.insert(0, mapMsg);
              notifyListeners();
            }
          }
        }

        // Also refresh chat contact list for unread counts
        if (_currentUserId != null && _currentUserRole != null) {
          fetchContacts(_currentUserId!, _currentUserRole!, showLoading: false);
        }
      }
    }
  }

  void _attemptReconnect() {
    if (_isReconnecting) return;
    _isReconnecting = true;

    Future.delayed(const Duration(seconds: 3), () async {
      _isReconnecting = false;
      if (_currentUserId != null && _currentUserRole != null) {
        if (_hubConnection == null ||
            _hubConnection!.state != HubConnectionState.Connected) {
          debugPrint("SignalR: Attempting reconnect...");
          // Reset hub so connectSignalR creates a fresh one
          _hubConnection = null;
          await connectSignalR(_currentUserId.toString(), _currentUserRole!);
        }
      }
    });
  }

  void disconnectSignalR() {
    _hubConnection?.stop();
    _hubConnection = null;
  }

  /// Start polling for new messages while the chat detail screen is open.
  /// This acts as a fallback in case SignalR is not working.
  void startPolling(int myUserId, int partnerId, {String? myRole}) {
    _activeChatPartnerId = partnerId;
    stopPolling(); // Cancel any existing timer

    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      try {
        final fetchedMessages = await _chatRepository.getMessages(
          myUserId,
          partnerId,
          user1Role: myRole,
        );
        final newMessages = fetchedMessages.reversed.toList();

        // Only update if there are new messages (compare count and latest id)
        if (newMessages.isNotEmpty) {
          final currentLatestId = _messages.isNotEmpty
              ? _messages[0]['id']
              : null;
          final fetchedLatestId = newMessages.isNotEmpty
              ? newMessages[0]['id']
              : null;

          if (currentLatestId != fetchedLatestId ||
              _messages.length != newMessages.length) {
            _messages = newMessages;
            notifyListeners();
          }
        }
      } catch (e) {
        debugPrint("Polling error: $e");
      }
    });
  }

  /// Stop polling when leaving the chat detail screen.
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _activeChatPartnerId = null;
  }

  Future<void> fetchContacts(
    int userId,
    String role, {
    bool showLoading = true,
  }) async {
    _currentUserId = userId;
    _currentUserRole = role;

    // Initiate Real-Time Connection
    connectSignalR(userId.toString(), role);

    if (showLoading) {
      _isLoading = true;
      _errorMessage = null;
      Future.microtask(() => notifyListeners());
    }

    try {
      _contacts = await _chatRepository.getContacts(userId, role);
      if (showLoading) {
        _isLoading = false;
      }
      notifyListeners();
    } catch (e) {
      if (showLoading) {
        _isLoading = false;
        _errorMessage = ErrorHandler.getUserFriendlyMessage(e);
      }
      notifyListeners();
    }
  }

  Future<void> markChatAsRead(int targetId) async {
    try {
      await _chatRepository.markChatAsRead(targetId);
      // Remove unread count locally
      final index = _contacts.indexWhere((c) => c.userId == targetId);
      if (index != -1) {
        final currentContact = _contacts[index];
        _contacts[index] = ChatContact(
          userId: currentContact.userId,
          name: currentContact.name,
          role: currentContact.role,
          profileImageUrl: currentContact.profileImageUrl,
          lastMessage: currentContact.lastMessage,
          lastMessageTime: currentContact.lastMessageTime,
          unreadCount: 0,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Failed to mark chat as read: $e");
    }
  }

  Future<void> fetchMessages(
    int user1Id,
    int user2Id, {
    String? user1Role,
    String? user2Role,
  }) async {
    // Ensure SignalR is connected when we enter a chat
    _currentUserId = user1Id;
    _currentUserRole = user1Role;
    _activeChatPartnerId = user2Id;
    connectSignalR(user1Id.toString(), user1Role ?? '');

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final fetchedMessages = await _chatRepository.getMessages(
        user1Id,
        user2Id,
        user1Role: user1Role,
        user2Role: user2Role,
      );
      // ListView.builder(reverse: true) expects Index 0 as the bottom (newest)
      // So if backend returns oldest first, we must reverse.
      _messages = fetchedMessages.reversed.toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = ErrorHandler.getUserFriendlyMessage(e);
      notifyListeners();
    }
  }

  Future<bool> sendMessage(Map<String, dynamic> data) async {
    _errorMessage = null;
    debugPrint("Sending Chat Data: $data");

    try {
      final newMessage = await _chatRepository.sendMessage(data);
      // Optimistically add the message to the list at index 0 (bottom of reversed list)
      _messages.insert(0, newMessage);
      notifyListeners();
      return true;
    } on DioException catch (e) {
      final errorData = e.response?.data;
      debugPrint("Chat Send Error (${e.response?.statusCode}): $errorData");
      _errorMessage = ErrorHandler.getUserFriendlyMessage(e);
      notifyListeners();
      return false;
    } catch (e) {
      debugPrint("Chat Send Unexpected Error: $e");
      _errorMessage = ErrorHandler.getUserFriendlyMessage(e);
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
