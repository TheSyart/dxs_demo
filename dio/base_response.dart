class BaseResponse<T> {
  final int code;
  final String message;
  final T? data;

  BaseResponse({required this.code, required this.message, this.data});

  bool get isSuccess => code == 200 || code == 0;

  factory BaseResponse.fromJson(
      Map<String, dynamic> json,
      T Function(dynamic json)? fromJsonT,
      ) {
    return BaseResponse<T>(
      code: json['code'] ?? -1,
      message: json['message'] ?? '未知错误',
      data: fromJsonT != null ? fromJsonT(json['data']) : json['data'],
    );
  }
}
