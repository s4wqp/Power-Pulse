import 'dart:convert';
import 'dart:io';

void main() async {
  try {
    final client = HttpClient();
    final request = await client.getUrl(
      Uri.parse('http://powerpuls.runasp.net/swagger/v1/swagger.json'),
    );
    final response = await request.close();
    final stringData = await response.transform(utf8.decoder).join();
    File('swagger.json').writeAsStringSync(stringData);
    print('Swagger downloaded to swagger.json, status: ${response.statusCode}');
  } catch (e) {
    print('ERROR: $e');
  }
}
