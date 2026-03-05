class Note {
  String id;
  String title;
  String content;
  DateTime date;

  Note({
    required this.id,
    required this.title,
    required this.content,
    required this.date,
  });

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: (json['id'] ?? json['noteId'] ?? '').toString(),
      title: json['title'] ?? json['noteTitle'] ?? 'Untitled',
      content:
          json['noteText'] ??
          json['content'] ??
          json['text'] ??
          json['description'] ??
          '',
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : (json['createdAt'] != null
                ? DateTime.tryParse(json['createdAt'].toString()) ??
                      DateTime.now()
                : DateTime.now()),
    );
  }
}
