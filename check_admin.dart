import 'dart:convert';
import 'dart:io';

void main() async {
  try {
    final client = HttpClient();
    final request = await client.postUrl(
      Uri.parse('http://powerpuls.runasp.net/api/Auth/login'),
    );
    request.headers.contentType = ContentType.json;
    request.write(
      jsonEncode({"email": "admin@gmail.com", "password": "admin12345"}),
    );

    final response = await request.close();
    final data = await response.transform(utf8.decoder).join();
    print('STATUS 1: ${response.statusCode}');
    print(data);

    final request2 = await client.postUrl(
      Uri.parse('http://powerpuls.runasp.net/api/Auth/login'),
    );
    request2.headers.contentType = ContentType.json;
    request2.write(
      jsonEncode({"email": "admin@gmail.com", "password": "12345678"}),
    );

    final response2 = await request2.close();
    final data2 = await response2.transform(utf8.decoder).join();
    print('STATUS 2: ${response2.statusCode}');
    print(data2);
  } catch (e) {
    print('ERROR: $e');
  }
}
