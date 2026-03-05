import 'dart:convert';
import 'dart:io';

void main() async {
  final content = File('swagger.json').readAsStringSync();
  final data = jsonDecode(content);
  final postProduct = data['paths']['/api/Products']['post'];
  print(jsonEncode(postProduct));
}
