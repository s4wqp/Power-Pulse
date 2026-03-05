class LoginRequest {
  final String email;
  final String password;

  LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() {
    return {'email': email, 'password': password};
  }
}

class RegisterTraineeRequest {
  final String name;
  final String email;
  final String password;
  final String phone;
  final double weight;
  final double height;
  final String role; // Always 'Trainee'

  RegisterTraineeRequest({
    required this.name,
    required this.email,
    required this.password,
    required this.phone,
    required this.weight,
    required this.height,
    this.role = 'Trainee',
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
      'weight': weight,
      'height': height,
      'role': role,
    };
  }
}

class RegisterTrainerRequest {
  final String name;
  final String email;
  final String password;
  final String phone;
  final String professionalTitle;
  final int experienceYears;
  final String bio;
  final List<int> specializationIds;
  final List<Map<String, dynamic>> certificates;
  final String role; // Always 'Trainer'

  RegisterTrainerRequest({
    required this.name,
    required this.email,
    required this.password,
    required this.phone,
    required this.professionalTitle,
    required this.experienceYears,
    required this.bio,
    required this.specializationIds,
    this.certificates = const [],
    this.role = 'Trainer',
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
      'professionalTitle': professionalTitle,
      'experienceYears': experienceYears,
      'bio': bio,
      'specializationIds': specializationIds,
      'certificates': certificates,
      'role': role,
    };
  }
}

class AuthResponse {
  final String token;
  final String role;
  final int userId;
  final String fullName;

  AuthResponse({
    required this.token,
    required this.role,
    required this.userId,
    required this.fullName,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] ?? '',
      role: json['role'] ?? '',
      userId: json['userId'] ?? 0,
      fullName: json['fullName'] ?? '',
    );
  }
}
