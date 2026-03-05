import 'dart:io';

class TrainerCertification {
  int? id; // Backend certificate ID (null for new certs)
  String name;
  String organization;
  String year;
  File? image;
  String? imageUrl;

  TrainerCertification({
    this.id,
    this.name = '',
    this.organization = '',
    this.year = '',
    this.image,
    this.imageUrl,
  });
}

class TrainerRegistrationData {
  String email;
  String name;
  String password;
  String phone;

  String professionalTitle;
  String experience;
  List<String> specializations;
  String otherSpecialization;

  String about;
  List<TrainerCertification> certifications;
  String subscriptionPrice;
  String services;

  TrainerRegistrationData({
    this.email = '',
    this.name = '',
    this.password = '',
    this.phone = '',
    this.professionalTitle = '',
    this.experience = '',
    this.specializations = const [],
    this.otherSpecialization = '',
    this.about = '',
    this.certifications = const [],
    this.subscriptionPrice = '',
    this.services = '',
  });

  @override
  String toString() {
    return 'TrainerRegistrationData(email: $email, name: $name, phone: $phone)';
  }
}
