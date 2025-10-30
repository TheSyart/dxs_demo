import 'package:dio/dio.dart';
import 'package:get/get.dart';

class ApiErrorHandler {
  /// 统一处理 DioException
  static void handle(DioException e) {
    String message = '未知错误';
    int? statusCode = e.response?.statusCode;

    // 第一层：Dio 的类型错误
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        message = '连接服务器超时';
        break;
      case DioExceptionType.sendTimeout:
        message = '请求发送超时';
        break;
      case DioExceptionType.receiveTimeout:
        message = '服务器响应超时';
        break;
      case DioExceptionType.cancel:
        message = '请求已取消';
        break;
      case DioExceptionType.badResponse:
        // 继续判断 HTTP 状态码
        message = _mapStatusCode(statusCode, e.response?.data);
        break;
      default:
        message = e.message ?? '网络连接异常';
    }

    // 弹窗提示
    Get.snackbar('请求错误', message);
  }

  /// 第二层：根据状态码判断
  static String _mapStatusCode(int? statusCode, dynamic data) {
    switch (statusCode) {
      case 400:
        return '请求参数错误';
      case 401:
        Get.offAllNamed('/login');
        return '登录过期，请重新登录';
      case 403:
        return '没有权限访问';
      case 404:
        return '资源不存在';
      case 408:
        return '请求超时';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务器维护中';
      default:
        return data?['message'] ?? '未知服务器错误';
    }
  }
}
