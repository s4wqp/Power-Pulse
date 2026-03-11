import 'dart:io';
import 'package:dio/dio.dart';

/// Centralized error handler that converts technical exceptions
/// into user-friendly messages suitable for displaying in the UI.
class ErrorHandler {
  /// Converts any error/exception into a clean, user-readable message.
  static String getUserFriendlyMessage(dynamic error) {
    // ── Dio HTTP errors ──
    if (error is DioException) {
      return _handleDioError(error);
    }

    // ── Socket / connectivity errors ──
    if (error is SocketException) {
      return 'No internet connection. Please check your Wi-Fi or mobile data.';
    }

    // ── Timeout errors ──
    if (error is HttpException) {
      return 'Unable to reach the server. Please try again later.';
    }

    // ── Format / parsing errors ──
    if (error is FormatException) {
      return 'We received unexpected data. Please try again.';
    }

    // ── Generic Exception with a message ──
    if (error is Exception) {
      final msg = error.toString();
      // Strip the "Exception: " prefix if present
      final cleaned = msg.replaceFirst(RegExp(r'^Exception:\s*'), '');
      // If the cleaned message looks like a user-readable sentence, use it
      if (cleaned.length < 120 &&
          !cleaned.contains('DioException') &&
          !cleaned.contains('StatusCode')) {
        return cleaned;
      }
      return 'Something went wrong. Please try again.';
    }

    return 'Something went wrong. Please try again.';
  }

  /// Handles Dio-specific errors based on type and HTTP status code.
  static String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please check your internet and try again.';

      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your Wi-Fi or mobile data.';

      case DioExceptionType.cancel:
        return 'Request was cancelled. Please try again.';

      case DioExceptionType.badResponse:
        return _handleHttpStatus(error);

      case DioExceptionType.badCertificate:
        return 'Secure connection failed. Please try again later.';

      case DioExceptionType.unknown:
        // Check if the underlying error is a SocketException (no internet)
        if (error.error is SocketException) {
          return 'No internet connection. Please check your Wi-Fi or mobile data.';
        }
        return 'Something went wrong. Please try again.';
    }
  }

  /// Maps HTTP status codes to user-friendly messages.
  /// Tries to extract a meaningful message from the response body first.
  static String _handleHttpStatus(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    // Try to extract a backend message from the response
    String? backendMessage;
    if (data is Map) {
      backendMessage =
          data['message']?.toString() ??
          data['error']?.toString() ??
          data['title']?.toString();
    } else if (data is String && data.isNotEmpty && data.length < 200) {
      backendMessage = data;
    }

    switch (statusCode) {
      case 400:
        return backendMessage ??
            'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return backendMessage ?? 'The requested item was not found.';
      case 409:
        return backendMessage ??
            'This action conflicts with existing data. Please try again.';
      case 422:
        return backendMessage ??
            'The provided data is invalid. Please check and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Our server is having trouble right now. Please try again later.';
      case 502:
      case 503:
        return 'The server is temporarily unavailable. Please try again in a few minutes.';
      default:
        return backendMessage ?? 'Something went wrong. Please try again.';
    }
  }
}
