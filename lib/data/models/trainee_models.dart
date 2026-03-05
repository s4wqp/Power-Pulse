class Trainee {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? profileImageUrl;
  final double? weight;
  final double? height;
  final String? goal; // Assuming single goal for now

  Trainee({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.profileImageUrl,
    this.weight,
    this.height,
    this.goal,
  });

  factory Trainee.fromJson(Map<String, dynamic> json) {
    return Trainee(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      profileImageUrl: json['profileImageUrl'],
      weight: (json['weight'] as num?)?.toDouble(),
      height: (json['height'] as num?)?.toDouble(),
      goal: json['goal'],
    );
  }
}

class Address {
  final int id;
  final String building;
  final String? apartment;
  final String? floor;
  final String street;
  final String? phone;
  final String? additionalDetails;

  Address({
    required this.id,
    required this.building,
    this.apartment,
    this.floor,
    required this.street,
    this.phone,
    this.additionalDetails,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] ?? 0,
      building: json['building'] ?? '',
      apartment: json['apartment'],
      floor: json['floor'],
      street: json['street'] ?? '',
      phone: json['phone'],
      additionalDetails: json['additionalDetails'],
    );
  }
}

class PaymentCard {
  final int id;
  final String cardNumber;
  final String expiryDate;
  final String cardHolderName;

  PaymentCard({
    required this.id,
    required this.cardNumber,
    required this.expiryDate,
    required this.cardHolderName,
  });

  factory PaymentCard.fromJson(Map<String, dynamic> json) {
    return PaymentCard(
      id: json['id'] ?? 0,
      cardNumber: json['cardNumber'] ?? '',
      expiryDate: json['expiryDate'] ?? '',
      cardHolderName: json['cardHolderName'] ?? '',
    );
  }
}
