import 'dart:convert';
import 'dart:io';

void main() async {
  try {
    final client = HttpClient();
    for (String st in ['HealthyMeals', 'Supplements', 'Apparel']) {
      final req = await client.getUrl(
        Uri.parse('http://powerpuls.runasp.net/api/Products?storeType=$st'),
      );
      final res = await req.close();
      final data = await res.transform(utf8.decoder).join();
      print('StoreType $st results: $data');
    }
  } catch (e) {
    print('ERROR: $e');
  }
}
