## Dio 封装说明

这是一套基于 `dio` 与 `get` 的网络请求封装，提供统一的请求配置、错误处理、响应模型与常用便捷方法，支持文件上传/下载与并发请求。

### 功能亮点
- 单例客户端：`DioClient()` 全局唯一，避免多实例配置不一致
- 统一请求配置：`baseUrl`、超时、公共请求头（含 `User-Agent`、`OS`）
- 自动注入 Token：拦截器中为请求添加 `Authorization: Bearer <token>`
- 错误统一处理：`ApiErrorHandler` 对 `DioException` 与 HTTP 状态码分层映射，并通过 `Get.snackbar` 友好提示；`401` 自动跳转登录
- 标准响应模型：`BaseResponse<T>`，支持泛型解析与自定义 `fromJsonT`
- 便捷方法：`get/post/put/delete` 统一封装，简化调用
- 文件能力：`uploadFile` 上传，`downloadFile` 下载，支持进度回调
- 并发请求：`concurrentRequests` 聚合多个请求结果
- 日志拦截器：请求/响应体完整打印，便于排查问题

### 目录结构
- `dio_client.dart`：核心客户端与拦截器、请求方法
- `api_error_handler.dart`：错误分类处理与提示
- `api_exception.dart`：业务异常类型（`code`、`message`）
- `base_response.dart`：统一响应结构与解析

### 前置依赖
- 依赖包：`dio`、`get`
- 全局配置：`GlobalConfig.apiHost`（见 `../../config/global_config.dart`）
- 存储服务：`GetStorageService`（见 `../../service/storage_service.dart`），需实现：
  - `Future<String?> getToken()`：返回当前登录 Token
  - `Map<String, String>? getDeviceInfo()`：返回设备信息（建议包含 `ua`、`os` 字段）
- 路由约定：`401` 时默认 `Get.offAllNamed('/login')`，可按需修改

### 快速开始
```dart
// 启动时注册依赖（示例）
void main() {
  Get.put(GetStorageService());
  runApp(const MyApp());
}

// 获取单例客户端
final client = DioClient();

// 基础 GET 请求（无泛型）
final res = await client.get<dynamic>('/api/ping');
print(res.code); // 200 或 0 视后端约定
print(res.data);
```

### 使用范式：泛型与模型解析
```dart
class User {
  final int id;
  final String name;
  User({required this.id, required this.name});
  factory User.fromJson(Map<String, dynamic> json) =>
      User(id: json['id'], name: json['name']);
}

// GET 示例：将 data 解析为 User
final userRes = await client.get<User>(
  '/api/user/1',
  fromJsonT: (json) => User.fromJson(json as Map<String, dynamic>),
);
if (userRes.isSuccess) {
  final user = userRes.data; // User?
}

// POST 示例：创建用户并解析返回模型
final createRes = await client.post<User>(
  '/api/user',
  data: {'name': 'Alice'},
  fromJsonT: (json) => User.fromJson(json as Map<String, dynamic>),
);
```

### 错误处理约定
- `DioClient.request<T>` 在以下情况抛出 `ApiException(code, message)`：
  - 服务端返回的 `BaseResponse.isSuccess` 为 `false`
  - `DioException` / 未知异常被捕获并转换
- UI 层已由 `ApiErrorHandler` 统一弹出提示；业务层可按需捕获进行流程控制：
```dart
try {
  final res = await client.get<User>('/api/user/1', fromJsonT: ...);
  // 正常处理
} on ApiException catch (e) {
  // 业务流控制：如统计、降级、重试等
  debugPrint('ApiException: code=${e.code}, msg=${e.message}');
}
```

### 文件上传
```dart
final upRes = await client.uploadFile<String>(
  '/api/upload',
  'C:/path/to/file.png',
  extraData: {'biz': 'avatar'},
  onSendProgress: (sent, total) {
    debugPrint('上传进度: $sent / $total');
  },
  fromJsonT: (json) => json.toString(),
);
```

### 文件下载
```dart
await client.downloadFile(
  'https://example.com/file.zip',
  'C:/Downloads/file.zip',
  onReceiveProgress: (received, total) {
    debugPrint('下载进度: $received / $total');
  },
);
```

### 并发请求
```dart
final futures = <Future<BaseResponse<User>>>[
  client.get<User>('/api/user/1', fromJsonT: (j) => User.fromJson(j)),
  client.get<User>('/api/user/2', fromJsonT: (j) => User.fromJson(j)),
];
final results = await client.concurrentRequests<User>(futures);
```

### 响应模型适配
后端返回结构若与当前 `BaseResponse<T>` 不一致（例如：`{status, msg, payload}`），可在 `base_response.dart` 中调整解析逻辑：
```dart
class BaseResponse<T> {
  final int code;
  final String message;
  final T? data;
  bool get isSuccess => code == 200 || code == 0; // 可按需修改

  factory BaseResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    return BaseResponse<T>(
      code: json['status'] ?? -1,
      message: json['msg'] ?? '未知错误',
      data: fromJsonT != null ? fromJsonT(json['payload']) : json['payload'],
    );
  }
}
```

### 自定义拦截器与行为
- 修改 `dio_client.dart` 中的 `_addInterceptors()` 可：
  - 增加/移除自定义拦截器（如埋点、重试策略）
  - 调整日志打印与级别
  - 自定义错误处理：将 `ApiErrorHandler.handle(e)` 替换为自定义逻辑
- 修改 `api_error_handler.dart` 可：
  - 更改状态码映射与文案
  - 关闭或替换 `401` 的登录跳转行为

### 配置与超时
- 默认超时：连接 `5s`，发送/接收各 `8s`
- 公共请求头：`Content-Type: application/json`，`User-Agent` 与 `OS` 来自 `GetStorageService.getDeviceInfo()`
- 通过 `GlobalConfig.apiHost` 统一维护接口域名

### 常见问题
- 成功码为何同时支持 `200` 与 `0`？兼容不同后端约定，可在 `BaseResponse.isSuccess` 中按需修改。
- 未提供 `fromJsonT` 时，`data` 直接透传为原始结构（`dynamic`）。
- 不希望弹窗提示？可在 `ApiErrorHandler.handle` 中移除 `Get.snackbar` 或改为日志。

### 许可
本封装用于项目内复用，按需修改即可，不额外附加开源协议。