import 'package:flutter/foundation.dart';

class Trainer {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String bio;
  final String professionalTitle;
  final int experienceYears;
  final String? profileImageUrl;
  final double rating;
  final List<Specialization> specializations;
  final List<Certificate> certificates;
  final List<Workout> workouts;
  final List<TrainingPlan> plans;
  final TrainerStats? stats;

  Trainer({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.bio,
    this.professionalTitle = 'Personal Trainer',
    required this.experienceYears,
    this.profileImageUrl,
    this.rating = 0.0,
    this.specializations = const [],
    this.certificates = const [],
    this.workouts = const [],
    this.plans = const [],
    this.stats,
  });

  factory Trainer.fromJson(Map<String, dynamic> json) {
    return Trainer(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      bio: json['bio'] ?? '',
      professionalTitle: json['professionalTitle'] ?? 'Personal Trainer',
      experienceYears: json['experienceYears'] ?? 0,
      profileImageUrl: json['profileImageUrl'],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      specializations:
          (json['specializations'] as List<dynamic>?)?.map((e) {
            if (e is String) {
              return Specialization(id: 0, name: e);
            } else if (e is Map<String, dynamic>) {
              return Specialization.fromJson(e);
            } else {
              return Specialization(id: 0, name: '');
            }
          }).toList() ??
          [],
      certificates:
          (json['certificates'] as List<dynamic>?)
              ?.map((e) => Certificate.fromJson(e))
              .toList() ??
          [],
      workouts:
          (json['workouts'] as List<dynamic>?)
              ?.map((e) => Workout.fromJson(e))
              .toList() ??
          [],
      plans:
          (json['plans'] as List<dynamic>?)
              ?.map((e) => TrainingPlan.fromJson(e))
              .toList() ??
          [],
      stats: json['stats'] != null
          ? TrainerStats.fromJson(json['stats'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'bio': bio,
      'professionalTitle': professionalTitle,
      'experienceYears': experienceYears,
      'profileImageUrl': profileImageUrl,
      'rating': rating,
      'specializations': specializations.map((e) => e.toJson()).toList(),
      'certificates': certificates.map((e) => e.toJson()).toList(),
      'workouts': workouts.map((e) => e.toJson()).toList(),
      'plans': plans.map((e) => e.toJson()).toList(),
    };
  }
}

class TrainingPlan {
  final int id;
  final String name;
  final String description;
  final double price;
  final double durationDays;
  final double? durationMonths;
  final double? durationHours;
  final String? badge;
  final List<String> features;
  final bool isActive;

  TrainingPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.durationDays,
    this.durationMonths,
    this.durationHours,
    this.badge,
    this.features = const [],
    this.isActive = true,
  });

  factory TrainingPlan.fromJson(Map<String, dynamic> json) {
    return TrainingPlan(
      id: json['id'] ?? json['trainingPlanId'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      durationDays: (json['durationDays'] as num?)?.toDouble() ?? 0.0,
      durationMonths: (json['durationMonths'] as num?)?.toDouble(),
      durationHours: (json['durationHours'] as num?)?.toDouble(),
      badge: json['badge'],
      features: (json['features'] as List<dynamic>?)?.cast<String>() ?? [],
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'durationDays': durationDays,
      if (durationMonths != null) 'durationMonths': durationMonths,
      if (durationHours != null) 'durationHours': durationHours,
      'badge': badge,
      'features': features,
      'isActive': isActive,
    };
  }
}

class ChatContact {
  final int userId;
  final String name;
  final String role;
  final String? profileImageUrl;
  final String? lastMessage;
  final String? lastMessageTime;
  final int unreadCount;

  ChatContact({
    required this.userId,
    required this.name,
    required this.role,
    this.profileImageUrl,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
  });

  factory ChatContact.fromJson(Map<String, dynamic> json) {
    return ChatContact(
      userId: json['userId'] ?? json['id'] ?? json['contactId'] ?? 0,
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      profileImageUrl: json['profileImageUrl'],
      lastMessage: json['lastMessage'],
      lastMessageTime: json['lastMessageTime'],
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}

class Specialization {
  final int id;
  final String name;

  Specialization({required this.id, required this.name});

  factory Specialization.fromJson(Map<String, dynamic> json) {
    return Specialization(id: json['id'] ?? 0, name: json['name'] ?? '');
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name};
  }
}

class Certificate {
  final int id;
  final String name;
  final String organization;
  final int year;
  final String? imageUrl;

  Certificate({
    required this.id,
    required this.name,
    required this.organization,
    required this.year,
    this.imageUrl,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'] ?? 0,
      name: json['name'] ?? json['certName'] ?? '',
      organization: json['organization'] ?? json['issuer'] ?? '',
      year: json['year'] ?? 0,
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'organization': organization,
      'year': year,
      'imageUrl': imageUrl,
    };
  }
}

class Workout {
  final int id;
  final String title;
  final String description;
  final String? videoUrl;
  final String? imageUrl;
  final String? targetMuscle;
  final String? assistantMuscle;
  final List<int>? replacementWorkoutIds;

  Workout({
    required this.id,
    required this.title,
    required this.description,
    this.videoUrl,
    this.imageUrl,
    this.targetMuscle,
    this.assistantMuscle,
    this.replacementWorkoutIds,
  });

  factory Workout.fromJson(Map<String, dynamic> json) {
    debugPrint('=== Workout.fromJson ===');
    debugPrint('All keys: ${json.keys.toList()}');
    for (var key in json.keys) {
      if (json[key] is! List && json[key] is! Map) {
        debugPrint('  $key: ${json[key]}');
      }
    }

    String? parsedTarget;
    String? parsedAssistant;

    if (json['muscles'] != null && json['muscles'] is List) {
      for (var m in json['muscles']) {
        if (m['isPrimary'] == true) {
          parsedTarget = m['muscleName'];
        } else {
          if (parsedAssistant == null) {
            parsedAssistant = m['muscleName'];
          } else {
            parsedAssistant = '$parsedAssistant, ${m['muscleName']}';
          }
        }
      }
    }

    // Try every possible key the API might use for the workout name
    String parsedTitle =
        (json['title'] ??
                json['name'] ??
                json['workoutName'] ??
                json['workoutTitle'] ??
                json['exerciseName'] ??
                json['exerciseTitle'] ??
                json['workout_name'] ??
                json['exercise_name'] ??
                json['workout_title'] ??
                json['exercise_title'] ??
                '')
            .toString()
            .trim();

    String parsedDescription = (json['description'] ?? '').toString();

    List<int> parsedReplacementIds = [];
    if (json['replacementWorkoutIds'] != null &&
        json['replacementWorkoutIds'] is List) {
      for (var id in json['replacementWorkoutIds']) {
        if (id is int) {
          parsedReplacementIds.add(id);
        }
      }
    }

    return Workout(
      id: json['id'] ?? json['workoutId'] ?? 0,
      title: parsedTitle,
      description: parsedDescription,
      videoUrl: json['videoUrl'],
      imageUrl: json['imageUrl'],
      targetMuscle: parsedTarget ?? json['targetMuscle'],
      assistantMuscle: parsedAssistant ?? json['assistantMuscle'],
      replacementWorkoutIds: parsedReplacementIds,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'videoUrl': videoUrl,
      'imageUrl': imageUrl,
      'targetMuscle': targetMuscle,
      'assistantMuscle': assistantMuscle,
    };
  }
}

class TrainerStats {
  final int? _totalClients;
  final double? _todayAmount;
  final double? _totalAmount;

  TrainerStats({int? totalClients, double? todayAmount, double? totalAmount})
    : _totalClients = totalClients,
      _todayAmount = todayAmount,
      _totalAmount = totalAmount;

  int get totalClients => _totalClients ?? 0;
  double get todayAmount => _todayAmount ?? 0.0;
  double get totalAmount => _totalAmount ?? 0.0;

  factory TrainerStats.fromJson(Map<String, dynamic> json) {
    return TrainerStats(
      totalClients: (json['totalClients'] ?? json['TotalClients']) is int
          ? (json['totalClients'] ?? json['TotalClients'])
          : 0,
      todayAmount: _toDouble(json['todayAmount'] ?? json['TodayAmount']),
      totalAmount: _toDouble(json['totalAmount'] ?? json['TotalAmount']),
    );
  }

  static double _toDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}
