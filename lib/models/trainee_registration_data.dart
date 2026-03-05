class TraineeRegistrationData {
  String email;
  String password;
  String name;
  String phoneNumber;
  double? weight;
  String? weightUnit;
  double? height;
  String? heightUnit;
  String? goal;

  TraineeRegistrationData({
    this.email = '',
    this.password = '',
    this.name = '',
    this.phoneNumber = '',
    this.weight,
    this.weightUnit,
    this.height,
    this.heightUnit,
    this.goal,
  });

  @override
  String toString() {
    return 'TraineeRegistrationData(email: $email, name: $name, phoneNumber: $phoneNumber, weight: $weight $weightUnit, height: $height $heightUnit, goal: $goal)';
  }
}
