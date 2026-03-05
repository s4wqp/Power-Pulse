import 'package:dio/dio.dart';

void main() async {
  try {
    final response = await Dio().get(
      'http://powerpuls.runasp.net/api/trainers',
    );
    print(response.data);
  } catch (e) {
    if (e is DioException) {
      print('Status Code: ${e.response?.statusCode}');
      print('Response Data: ${e.response?.data}');
    }
  }
}
