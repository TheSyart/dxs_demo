import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:video_player/video_player.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    const assetVideo = 'assets/videos/test2.mp4';
    return MaterialApp(
      title: '慢速视频拍球识别',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: FutureBuilder<String>(
        future: copyAssetToTemp(assetVideo),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return VideoPosePage(videoPath: snapshot.data!);
        },
      ),
    );
  }
}

Future<String> copyAssetToTemp(String assetPath) async {
  final byteData = await rootBundle.load(assetPath);
  final tempDir = await getTemporaryDirectory();
  final tempFile = File('${tempDir.path}/${assetPath.split('/').last}');
  await tempFile.writeAsBytes(byteData.buffer.asUint8List());
  return tempFile.path;
}

class VideoPosePage extends StatefulWidget {
  final String videoPath;

  const VideoPosePage({super.key, required this.videoPath});

  @override
  State<VideoPosePage> createState() => _VideoPosePageState();
}

class _VideoPosePageState extends State<VideoPosePage> {
  late VideoPlayerController _controller;
  late PoseDetector _poseDetector;
  List<Pose> _poses = [];
  HumanAction _currentAction = HumanAction.idle;

  final BasketballActionRecognizer _actionRecognizer = BasketballActionRecognizer();
  bool _isAnalyzing = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.file(File(widget.videoPath))
      ..initialize().then((_) {
        setState(() {});
        _controller.setPlaybackSpeed(0.5); // 慢速播放
        _controller.play();
        _analyzeVideoFrames();
      });

    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(mode: PoseDetectionMode.stream),
    );
  }

  Future<void> _analyzeVideoFrames() async {
    if (_isAnalyzing) return;
    _isAnalyzing = true;

    final tempDir = await getTemporaryDirectory();
    int lastAnalyzedMs = 0;

    while (_controller.value.isInitialized && _controller.value.isPlaying) {
      final posMs = _controller.value.position.inMilliseconds;

      if (posMs - lastAnalyzedMs >= 200) { // 每 0.2 秒分析一次
        lastAnalyzedMs = posMs;

        final framePath = '${tempDir.path}/frame_$posMs.jpg';
        final thumbPath = await VideoThumbnail.thumbnailFile(
          video: widget.videoPath,
          thumbnailPath: framePath,
          imageFormat: ImageFormat.JPEG,
          timeMs: posMs,
          quality: 50,
          maxHeight: 480,
          maxWidth: 640,
        );

        if (thumbPath != null) {
          try {
            final poses = await _poseDetector.processImage(InputImage.fromFile(File(thumbPath)));

            // 更新拍球识别
            if (poses.isNotEmpty) {
              final lm = poses.first.landmarks;
              if (lm.containsKey(PoseLandmarkType.leftWrist) &&
                  lm.containsKey(PoseLandmarkType.rightWrist)) {
                _actionRecognizer.update(
                  leftWristY: lm[PoseLandmarkType.leftWrist]!.y,
                  rightWristY: lm[PoseLandmarkType.rightWrist]!.y,
                );
              }
            }

            setState(() {
              _poses = poses;
              _currentAction = _actionRecognizer.currentAction;
            });
          } catch (e) {
            debugPrint('Pose detection error: $e');
          }
        }
      }

      await Future.delayed(const Duration(milliseconds: 30));
    }

    _isAnalyzing = false;
  }

  @override
  void dispose() {
    _controller.dispose();
    _poseDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_controller.value.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          VideoPlayer(_controller),
          Positioned(
            left: 10,
            top: 10,
            width: 180,
            height: 180,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(8),
              ),
              child: CustomPaint(painter: SkeletonThumbnailPainter(_poses)),
            ),
          ),
          Positioned(
            left: 10,
            bottom: 30,
            child: Container(
              padding: const EdgeInsets.all(8),
              color: Colors.black45,
              child: Text(
                '动作: $_currentAction, 拍球计数: ${_actionRecognizer.dribbleCount}',
                style: const TextStyle(color: Colors.white, fontSize: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// 绘制缩略骨骼
class SkeletonThumbnailPainter extends CustomPainter {
  // 传入的关键点列表，每个 Pose 对应一帧检测到的人体姿态
  final List<Pose> poses;

  SkeletonThumbnailPainter(this.poses);

  @override
  void paint(Canvas canvas, Size size) {
    if (poses.isEmpty) return; // 如果没有姿态数据，直接返回

    // 绘制关键点的画笔
    final paintPoint = Paint()
      ..strokeWidth = 3
      ..style = PaintingStyle.fill;

    // 绘制骨骼连线的画笔
    final paintLine = Paint()
      ..color = Colors.green
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    const padding = 5.0; // 缩略图四周留白
    final w = size.width - padding * 2; // 可绘制宽度
    final h = size.height - padding * 2; // 可绘制高度

    for (final pose in poses) {
      if (pose.landmarks.isEmpty) continue; // 当前 Pose 无关键点，跳过

      // 找出关键点的边界，用于缩放适配到画布
      double minX = pose.landmarks.values.map((lm) => lm.x).reduce((a, b) => a < b ? a : b);
      double maxX = pose.landmarks.values.map((lm) => lm.x).reduce((a, b) => a > b ? a : b);
      double minY = pose.landmarks.values.map((lm) => lm.y).reduce((a, b) => a < b ? a : b);
      double maxY = pose.landmarks.values.map((lm) => lm.y).reduce((a, b) => a > b ? a : b);

      if (maxX - minX == 0 || maxY - minY == 0) continue; // 避免除以零

      // 计算 X/Y 方向缩放比例，保证宽高适应画布
      final scaleX = w / (maxX - minX);
      final scaleY = h / (maxY - minY);
      final scale = scaleX < scaleY ? scaleX : scaleY; // 保持纵横比
      final offsetX = (w - (maxX - minX) * scale) / 2 + padding; // X 居中偏移
      final offsetY = (h - (maxY - minY) * scale) / 2 + padding; // Y 居+中偏移

      // 将 Pose 坐标转换为画布坐标
      Offset toCanvas(PoseLandmark lm) => Offset(
        (lm.x - minX) * scale + offsetX,
        (lm.y - minY) * scale + offsetY,
      );

      // 关键点连线对，用于绘制骨架
      final connectPairs = [
        [PoseLandmarkType.leftShoulder, PoseLandmarkType.rightShoulder],
        [PoseLandmarkType.leftShoulder, PoseLandmarkType.leftElbow],
        [PoseLandmarkType.leftElbow, PoseLandmarkType.leftWrist],
        [PoseLandmarkType.rightShoulder, PoseLandmarkType.rightElbow],
        [PoseLandmarkType.rightElbow, PoseLandmarkType.rightWrist],
        [PoseLandmarkType.leftShoulder, PoseLandmarkType.leftHip],
        [PoseLandmarkType.rightShoulder, PoseLandmarkType.rightHip],
        [PoseLandmarkType.leftHip, PoseLandmarkType.rightHip],
        [PoseLandmarkType.leftHip, PoseLandmarkType.leftKnee],
        [PoseLandmarkType.leftKnee, PoseLandmarkType.leftAnkle],
        [PoseLandmarkType.rightHip, PoseLandmarkType.rightKnee],
        [PoseLandmarkType.rightKnee, PoseLandmarkType.rightAnkle],
      ];

      // 绘制骨骼连线
      for (final pair in connectPairs) {
        final lm1 = pose.landmarks[pair[0]];
        final lm2 = pose.landmarks[pair[1]];
        if (lm1 != null && lm2 != null) {
          canvas.drawLine(toCanvas(lm1), toCanvas(lm2), paintLine);
        }
      }

      // 绘制每个关键点
      for (var lm in pose.landmarks.values) {
        // 手腕用绿色，食指用蓝色，其他关键点用红色
        if (lm.type == PoseLandmarkType.leftWrist || lm.type == PoseLandmarkType.rightWrist) {
          paintPoint.color = Colors.green;
        } else if (lm.type == PoseLandmarkType.leftIndex || lm.type == PoseLandmarkType.rightIndex) {
          paintPoint.color = Colors.blue;
        } else {
          paintPoint.color = Colors.red;
        }
        canvas.drawCircle(toCanvas(lm), 3, paintPoint); // 绘制关键点
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true; // 始终重绘
}


enum HumanAction { idle, dribbling, unknown }

// 拍篮球动作识别器
class BasketballActionRecognizer {
  double previousLeftWristY = 0;
  double previousRightWristY = 0;

  bool wristMovingDown = false;
  bool wristMovingUp = false;
  bool isCounting = false;

  final double wristThreshold;
  int dribbleCount = 0;

  BasketballActionRecognizer({this.wristThreshold = 5.0});

  HumanAction currentAction = HumanAction.idle;

  void update({required double leftWristY, required double rightWristY}) {
    double leftDiff = leftWristY - previousLeftWristY;
    double rightDiff = rightWristY - previousRightWristY;

    if ((leftDiff + rightDiff) / 2 > wristThreshold) {
      wristMovingDown = true;
      wristMovingUp = false;
      currentAction = HumanAction.dribbling;
    } else if ((leftDiff + rightDiff) / 2 < -wristThreshold) {
      wristMovingUp = true;
      wristMovingDown = false;
      currentAction = HumanAction.dribbling;
    } else {
      currentAction = HumanAction.idle;
    }

    if (wristMovingDown && !isCounting) isCounting = true;
    if (wristMovingUp && isCounting) {
      dribbleCount++;
      isCounting = false;
    }

    previousLeftWristY = leftWristY;
    previousRightWristY = rightWristY;

    // debug
    // print('Count: $dribbleCount, wristDown=$wristMovingDown, wristUp=$wristMovingUp');
  }

  void reset() {
    dribbleCount = 0;
    wristMovingDown = false;
    wristMovingUp = false;
    isCounting = false;
    previousLeftWristY = 0;
    previousRightWristY = 0;
    currentAction = HumanAction.idle;
  }
}
