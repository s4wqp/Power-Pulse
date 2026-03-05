class OrderItem {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final double purchasePrice;
  final String? selectedOption;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.purchasePrice,
    this.selectedOption,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? 0,
      productId: json['productId'] ?? 0,
      productName: json['productName'] ?? '',
      quantity: json['quantity'] ?? 1,
      purchasePrice: (json['purchasePrice'] as num?)?.toDouble() ?? 0.0,
      selectedOption: json['selectedOption'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'quantity': quantity,
      'selectedOption': selectedOption,
    };
  }
}

class Order {
  final int id;
  final DateTime orderDate;
  final double totalPrice;
  final String orderStatus;
  final int traineeId;
  final int? deliveryAddressId;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.orderDate,
    required this.totalPrice,
    required this.orderStatus,
    required this.traineeId,
    this.deliveryAddressId,
    required this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderDate: json['orderDate'] != null
          ? DateTime.tryParse(json['orderDate']) ?? DateTime.now()
          : DateTime.now(),
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      orderStatus: json['orderStatus'] ?? 'Pending',
      traineeId: json['traineeId'] ?? 0,
      deliveryAddressId: json['deliveryAddressId'],
      items:
          (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
