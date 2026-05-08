import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:extension_google_sign_in_as_googleapis_auth/extension_google_sign_in_as_googleapis_auth.dart';

class DriveService {
  final _googleSignIn = GoogleSignIn(scopes: [drive.DriveApi.driveFileScope]);
  GoogleSignInAccount? _currentUser;

  /// Signs in the user silently first (no popup). Falls back to interactive
  /// sign-in only if silent auth fails (e.g. first time or expired session).
  Future<GoogleSignInAccount?> signIn() async {
    try {
      // Try silent sign-in first — uses cached credentials, no popup
      var account = await _googleSignIn.signInSilently();
      if (account != null) {
        _currentUser = account;
        debugPrint('Google Sign-In: Silent success: ${account.email}');
        return account;
      }

      // Fall back to interactive sign-in (shows the Google popup)
      account = await _googleSignIn.signIn();
      _currentUser = account;
      debugPrint('Google Sign-In: Interactive success: ${account?.email}');
      return account;
    } catch (e) {
      debugPrint('Error signing in: $e');
      return null;
    }
  }

  /// Uploads a file to Google Drive.
  Future<String?> uploadFile({required File file, String? fileName}) async {
    try {
      // 1. Ensure signed in
      var account = _currentUser;
      account ??= await signIn();

      if (account == null) {
        debugPrint('Sign-in failed or user cancelled.');
        return null;
      }

      // 2. Get authenticated HTTP client using the extension
      // With extension_google_sign_in_as_googleapis_auth ^2.0.7,
      // the method 'authenticatedClient' is an extension on GoogleSignIn.
      // It uses the current user's authentication data.
      final authClient = await _googleSignIn.authenticatedClient();

      if (authClient == null) {
        debugPrint('Failed to get authenticated HTTP client');
        return null;
      }

      // 3. Create Drive API instance
      final driveApi = drive.DriveApi(authClient);

      // 4. Create metadata
      final fileMetadata = drive.File();
      fileMetadata.name =
          fileName ?? file.path.split(Platform.pathSeparator).last;

      // 5. Create media content
      final media = drive.Media(file.openRead(), file.lengthSync());

      // 6. Upload
      final uploadedFile = await driveApi.files.create(
        fileMetadata,
        uploadMedia: media,
        $fields: 'id, name, webContentLink',
      );

      final fileId = uploadedFile.id;
      if (fileId == null) {
        debugPrint('Upload failed: No file ID returned');
        return null;
      }
      debugPrint('File uploaded: ID=$fileId');

      // 7. Make public
      await _makeFilePublic(driveApi, fileId);

      // 8. Return link
      // Use webContentLink if available for better streaming compatibility
      return uploadedFile.webContentLink ??
          'https://drive.google.com/uc?export=download&id=$fileId';
    } catch (e) {
      debugPrint('Error uploading file: $e');
      return null;
    }
  }

  /// Sets permissions to 'anyone' with 'reader' role.
  Future<void> _makeFilePublic(drive.DriveApi driveApi, String fileId) async {
    try {
      final permission = drive.Permission()
        ..role = 'reader'
        ..type = 'anyone';

      await driveApi.permissions.create(permission, fileId);
      debugPrint('File ID $fileId is now public.');
    } catch (e) {
      debugPrint('Error setting permissions: $e');
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
