package com.bipardadmin

import android.graphics.*
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.*
import org.json.JSONObject
import org.tensorflow.lite.Interpreter
import java.io.ByteArrayInputStream
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import kotlin.math.abs
import kotlin.math.exp
import java.io.File

class FaceLivenessModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private var livenessModel: Interpreter? = null

  // ====== PRODUCTION BUFFERS ======
  private val spoofScores = ArrayDeque<Float>()
  private val faceBoxes = ArrayDeque<Rect>()
  private val eyeStates = ArrayDeque<Boolean>()

  override fun getName() = "FaceLivenessModule"

  init {
    loadModel()
  }

  // ================= MODEL LOAD =================
  private fun loadModel() {
    val afd = reactApplicationContext.assets.openFd("FaceAntiSpoofing.tflite")
    val buffer = FileInputStream(afd.fileDescriptor).channel.map(
      FileChannel.MapMode.READ_ONLY,
      afd.startOffset,
      afd.declaredLength
    )
    livenessModel = Interpreter(buffer)
  }

  // ================= JS ENTRY =================
  @ReactMethod
  fun analyzeFace(base64Image: String, promise: Promise) {
    try {
      val bytes = Base64.decode(base64Image, Base64.DEFAULT)
      val bitmap = BitmapFactory.decodeStream(ByteArrayInputStream(bytes))
        ?: return promise.reject("BITMAP_NULL", "Invalid image")

      val image = InputImage.fromBitmap(bitmap, 0)

      val detector = FaceDetection.getClient(
        FaceDetectorOptions.Builder()
          .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
          .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
          .build()
      )

      detector.process(image)
        .addOnSuccessListener { faces ->
          if (faces.isEmpty()) {
              resetBuffers()
              promise.reject("NO_FACE", "No face detected")
              return@addOnSuccessListener
          }

          val face = faces.first()
          val faceBitmap = crop(bitmap, face.boundingBox)

          // ===== IMAGE QUALITY CHECK =====
          if (!isFaceSizeValid(face.boundingBox, bitmap)) {
            resetBuffers() 
            promise.reject("FACE_TOO_SMALL", "Move closer to camera")
            return@addOnSuccessListener
          }

          // ===== MODEL SCORE =====
          val spoofScore = runLiveness(faceBitmap)
          pushScore(spoofScore)

          // ===== MOTION CHECK =====
          pushFaceBox(face.boundingBox)
          val motionDetected = detectMotion()

          // ===== BLINK CHECK =====
          val blinkDetected = detectBlink(face)

          val avgScore = spoofScores.average().toFloat()

          val isLive =
            spoofScores.size >= 3 &&
           avgScore < 0.65 &&
            (motionDetected || blinkDetected)

          val result = JSONObject()
          result.put("avgSpoofScore", avgScore)
          result.put("motionDetected", motionDetected)
          result.put("blinkDetected", blinkDetected)
          result.put("isLive", isLive)

          promise.resolve(result.toString())
          if (isLive) {
            resetBuffers()
          }
        }
        .addOnFailureListener {
          promise.reject("DETECT_FAIL", it.message)
        }

    } catch (e: Exception) {
      resetBuffers()
      promise.reject("ANALYZE_ERROR", e.message)
    }
  }

  @ReactMethod
fun analyzeFaceFromPath(imagePath: String, promise: Promise) {
  try {
    val file = File(imagePath)
    if (!file.exists()) {
      promise.reject("FILE_NOT_FOUND", "Image file not found")
      return
    }

    val bitmap = BitmapFactory.decodeFile(imagePath)
      ?: return promise.reject("BITMAP_NULL", "Invalid image")

    val image = InputImage.fromBitmap(bitmap, 0)

    val detector = FaceDetection.getClient(
      FaceDetectorOptions.Builder()
        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
        .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
        .build()
    )

    detector.process(image)
      .addOnSuccessListener { faces ->
        if (faces.isEmpty()) {
          resetBuffers()
          promise.reject("NO_FACE", "No face detected")
          return@addOnSuccessListener
        }

        val face = faces.first()
        val faceBitmap = crop(bitmap, face.boundingBox)

        if (!isFaceSizeValid(face.boundingBox, bitmap)) {
          resetBuffers()
          promise.reject("FACE_TOO_SMALL", "Move closer to camera")
          return@addOnSuccessListener
        }

        val spoofScore = runLiveness(faceBitmap)
        pushScore(spoofScore)

        pushFaceBox(face.boundingBox)
        val motionDetected = detectMotion()
        val blinkDetected = detectBlink(face)

        val avgScore = spoofScores.average().toFloat()

        val isLive =
          spoofScores.size >= 3 &&
          avgScore < 0.65 &&
          (motionDetected || blinkDetected)

        val result = JSONObject()
        result.put("avgSpoofScore", avgScore)
        result.put("motionDetected", motionDetected)
        result.put("blinkDetected", blinkDetected)
        result.put("isLive", isLive)

        promise.resolve(result.toString())

        if (isLive) resetBuffers()
      }
      .addOnFailureListener {
        resetBuffers()
        promise.reject("DETECT_FAIL", it.message)
      }

  } catch (e: Exception) {
    resetBuffers()
    promise.reject("ANALYZE_ERROR", e.message)
  }
}

  private fun resetBuffers() {
  spoofScores.clear()
  faceBoxes.clear()
  eyeStates.clear()
}

  // ================= LIVENESS MODEL =================
  private fun runLiveness(faceBitmap: Bitmap): Float {
    val model = livenessModel ?: return 1f

    val resized = Bitmap.createScaledBitmap(faceBitmap, 256, 256, true)
    val input = bitmapToBuffer(resized)

    val output = Array(1) { FloatArray(8) }
    model.run(input, output)

    val probs = softmax(output[0])
    // return 1f - probs[0] // spoof score
    return probs[1] 
  }

  // ================= BUFFERS =================
  private fun pushScore(score: Float) {
    if (spoofScores.size >= 7) spoofScores.removeFirst()
    spoofScores.addLast(score)
  }

  private fun pushFaceBox(rect: Rect) {
    if (faceBoxes.size >= 5) faceBoxes.removeFirst()
    faceBoxes.addLast(rect)
  }

  // ================= MOTION =================
  private fun detectMotion(): Boolean {
    if (faceBoxes.size < 3) return false

    val first = faceBoxes.first()
    val last = faceBoxes.last()

    val dx = abs(first.centerX() - last.centerX())
    val dy = abs(first.centerY() - last.centerY())

    return dx > 8 || dy > 8

  }

  // ================= BLINK =================
  private fun detectBlink(face: Face): Boolean {
    val left = face.leftEyeOpenProbability ?: return false
    val right = face.rightEyeOpenProbability ?: return false

    val open = left > 0.6 && right > 0.6

    eyeStates.addLast(open)
    if (eyeStates.size > 5) eyeStates.removeFirst()

    return eyeStates.contains(false) && eyeStates.contains(true)
  }

  // ================= IMAGE QUALITY =================
  private fun isFaceSizeValid(rect: Rect, bitmap: Bitmap): Boolean {
    val faceArea = rect.width() * rect.height()
    val imgArea = bitmap.width * bitmap.height
    return faceArea > imgArea * 0.15
  }

  // ================= HELPERS =================
  private fun crop(bitmap: Bitmap, rect: Rect): Bitmap {
    val x = rect.left.coerceAtLeast(0)
    val y = rect.top.coerceAtLeast(0)
    val w = rect.width().coerceAtMost(bitmap.width - x)
    val h = rect.height().coerceAtMost(bitmap.height - y)
    return Bitmap.createBitmap(bitmap, x, y, w, h)
  }

  private fun bitmapToBuffer(bitmap: Bitmap): ByteBuffer {
    val buffer = ByteBuffer.allocateDirect(4 * 256 * 256 * 3)
    buffer.order(ByteOrder.nativeOrder())

    val pixels = IntArray(256 * 256)
    bitmap.getPixels(pixels, 0, 256, 0, 0, 256, 256)

    for (p in pixels) {
      buffer.putFloat(((p shr 16) and 0xFF) / 255f)
      buffer.putFloat(((p shr 8) and 0xFF) / 255f)
      buffer.putFloat((p and 0xFF) / 255f)
    }

    buffer.rewind()
    return buffer
  }

  private fun softmax(logits: FloatArray): FloatArray {
    val max = logits.maxOrNull() ?: 0f
    val expArr = FloatArray(logits.size)
    var sum = 0f

    for (i in logits.indices) {
      expArr[i] = exp(logits[i] - max)
      sum += expArr[i]
    }

    for (i in expArr.indices) {
      expArr[i] /= sum
    }
    return expArr
  }
}
