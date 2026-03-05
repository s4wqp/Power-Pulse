import 'package:flutter/services.dart';

class CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.length > 16) {
      return oldValue;
    }
    return newValue;
  }
}

class CardMonthYearFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    var newText = newValue.text;

    if (newText.length > 5) {
      return oldValue;
    }

    // Only allow digits and '/'
    if (newText.isNotEmpty && !RegExp(r'^[0-9/]*$').hasMatch(newText)) {
      return oldValue;
    }

    if (newValue.selection.baseOffset < oldValue.selection.baseOffset) {
      return newValue;
    }

    if (newText.length == 2 && oldValue.text.length == 1) {
      newText += '/';
      return TextEditingValue(
        text: newText,
        selection: TextSelection.collapsed(offset: newText.length),
      );
    }

    return newValue;
  }
}

class CardCvvFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.length > 3) {
      return oldValue;
    }
    return newValue;
  }
}

class PercentInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    if (newValue.text == '%') {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    String newText = newValue.text;
    if (!newText.endsWith('%')) {
      newText = '$newText%';
    }

    // Ensure only one % at the end
    if (newText.split('%').length > 2) {
      newText = '${newText.replaceAll('%', '')}%';
    }

    return TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length - 1),
    );
  }
}
