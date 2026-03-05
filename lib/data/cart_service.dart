class CartService {
  static final CartService _instance = CartService._internal();

  factory CartService() {
    return _instance;
  }

  CartService._internal();

  final List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => _items;

  void addItem(Map<String, dynamic> item) {
    print('CartService: Adding item: $item');
    // Check if item already exists
    final existingIndex = _items.indexWhere(
      (element) => element['title'] == item['title'],
    );
    if (existingIndex != -1) {
      print(
        'CartService: Item exists at index $existingIndex, updating quantity',
      );
      _items[existingIndex]['quantity'] += item['quantity'];
    } else {
      print('CartService: New item, adding to list');
      _items.add(item);
    }
    print('CartService: Current items: $_items');
  }

  void removeItem(int index) {
    if (index >= 0 && index < _items.length) {
      _items.removeAt(index);
    }
  }

  void updateQuantity(int index, int quantity) {
    if (index >= 0 && index < _items.length) {
      _items[index]['quantity'] = quantity;
    }
  }

  void clearCart() {
    _items.clear();
  }
}
