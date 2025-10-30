import 'package:dio/dio.dart';
import 'package:get/get.dart' hide MultipartFile, FormData;
import '../../config/global_config.dart';
import '../../service/storage_service.dart';
import 'api_error_handler.dart';
import 'api_exception.dart';
import 'base_response.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal(); // 单例

  factory DioClient() => _instance;

  late final Dio dio;
  final controller = Get.find<GetStorageService>(); // 获取存储服务
  late final Map<String, String> info; // 设备信息

  DioClient._internal() {
    info = controller.getDeviceInfo()!;
    dio = Dio(
      BaseOptions(
        baseUrl: GlobalConfig.apiHost,
        // 统一接口地址
        connectTimeout: const Duration(seconds: 5),
        // 连接超时
        sendTimeout: const Duration(seconds: 8),
        // 发送超时
        receiveTimeout: const Duration(seconds: 8),
        // 接收超时
        headers: {
          // 请求头
          'Content-Type': 'application/json',
          'User-Agent': info['ua'] ?? 'UnknownUA',
          'OS': info['os'] ?? 'UnknownOS',
        },
      ),
    );
    _addInterceptors();
  }

  /// 添加拦截器
  void _addInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // 添加 token
          final token = await _getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('➡️ [Request] ${options.method} ${options.uri}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ [Response] ${response.statusCode}');
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          // 统一错误提示
          ApiErrorHandler.handle(e);
          return handler.next(e);
        },
      ),
    );

    // 添加日志
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => print("🧾 DioLog: $obj"),
      ),
    );
  }

  /// 获取 token
  Future<String?> _getToken() async => controller.getToken();

  /// 通用请求封装
  Future<BaseResponse<T>> request<T>(
    String path, {
    String method = 'GET',
    dynamic data,
    Map<String, dynamic>? query,
    Options? options,
    T Function(dynamic)? fromJsonT,
  }) async {
    try {
      final response = await dio.request(
        path,
        data: data,
        queryParameters: query,
        options: options?.copyWith(method: method) ?? Options(method: method),
      );

      final resJson = response.data is Map<String, dynamic>
          ? response.data
          : Map<String, dynamic>.from(response.data);

      final base = BaseResponse<T>.fromJson(resJson, fromJsonT);

      if (base.isSuccess) {
        return base;
      } else {
        throw ApiException(base.code, base.message);
      }
    } on DioException catch (e) {
      throw ApiException(-1, e.message ?? '请求异常');
    } catch (e) {
      throw ApiException(-1, e.toString());
    }
  }

  /// 快捷方法
  Future<BaseResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? query,
    T Function(dynamic)? fromJsonT,
  }) => request(path, method: 'GET', query: query, fromJsonT: fromJsonT);

  Future<BaseResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJsonT,
  }) => request(path, method: 'POST', data: data, fromJsonT: fromJsonT);

  Future<BaseResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJsonT,
  }) => request(path, method: 'PUT', data: data, fromJsonT: fromJsonT);

  Future<BaseResponse<T>> delete<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJsonT,
  }) => request(path, method: 'DELETE', data: data, fromJsonT: fromJsonT);

  /// 文件上传
  Future<BaseResponse<T>> uploadFile<T>(
    String path,
    String filePath, {
    Map<String, dynamic>? extraData,
    Function(int, int)? onSendProgress,
    T Function(dynamic)? fromJsonT,
  }) async {
    try {
      final formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(filePath),
        ...?extraData,
      });

      final response = await dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );

      return BaseResponse<T>.fromJson(response.data, fromJsonT);
    } on DioException catch (e) {
      throw ApiException(-1, e.toString());
    }
  }

  /// 文件下载
  Future<void> downloadFile(
    String urlPath,
    String savePath, {
    Function(int, int)? onReceiveProgress,
  }) async {
    try {
      await dio.download(
        urlPath,
        savePath,
        onReceiveProgress: onReceiveProgress,
      );
    } on DioException catch (e) {
      throw ApiException(-1, e.toString());
    }
  }

  /// 并发请求
  Future<List<BaseResponse<T>>> concurrentRequests<T>(
    List<Future<BaseResponse<T>>> futures,
  ) async {
    try {
      final results = await Future.wait(futures);
      return results;
    } catch (e) {
      rethrow;
    }
  }
}
