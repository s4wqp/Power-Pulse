import 'dart:convert';
import 'dart:io';

void main() async {
  try {
    final client = HttpClient();
    final request = await client.postUrl(
      Uri.parse('http://powerpuls.runasp.net/api/Products'),
    );
    request.headers.contentType = ContentType.json;
    request.write(
      jsonEncode({
        "name": "French Green Salad",
        "price": 200,
        "description": "Grilled chicken salad",
        "storeType": 0,
        "stockQuantity": 10,
        "imageUrl": "assets/images/green salad.png",
      }),
    );

    final response = await request.close();
    final data = await response.transform(utf8.decoder).join();
    print('STATUS NO TOKEN: ${response.statusCode}');
    print(data);
  } catch (e) {
    print('ERROR: $e');
  }
}
