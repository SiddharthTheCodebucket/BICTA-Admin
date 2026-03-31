package com.bipardadmin

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.ReadableArray
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.*
import org.tensorflow.lite.Interpreter
import java.io.File
import java.io.FileInputStream
import java.net.URL
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel
import java.util.concurrent.Executors
import kotlin.math.abs
import android.media.ExifInterface
import android.graphics.Matrix
import kotlin.math.sqrt

class FaceRecognitionModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FaceRecognitionModule"

    private val executor = Executors.newSingleThreadExecutor()

    // ================= MODEL LOAD =================

    private val faceNetInterpreter: Interpreter by lazy {
        loadModelFile("face_net_512.tflite")
    }

    private fun loadModelFile(modelPath: String): Interpreter {
        val afd = reactApplicationContext.assets.openFd(modelPath)
        val inputStream = FileInputStream(afd.fileDescriptor)
        val channel = inputStream.channel
        val buffer = channel.map(
            FileChannel.MapMode.READ_ONLY,
            afd.startOffset,
            afd.declaredLength
        )
        return Interpreter(buffer)
    }

    override fun onCatalystInstanceDestroy() {
        faceNetInterpreter.close()
        executor.shutdown()
        super.onCatalystInstanceDestroy()
    }

    // ================= FACE DETECTION + EMBEDDING =================

    private fun extractFaceEmbedding(
        bitmap: Bitmap,
        callback: (FloatArray?, Boolean) -> Unit
    ) {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .enableTracking()
           .setMinFaceSize(0.10f) 
            .build()

        val detector = FaceDetection.getClient(options)
        val image = InputImage.fromBitmap(bitmap, 0)

        detector.process(image)
            .addOnSuccessListener { faces ->
                if (faces.isEmpty()) {
                    callback(null, false)
                    return@addOnSuccessListener
                }

                val bestFace =
                    faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() }

                if (bestFace == null) {
                    callback(null, false)
                    return@addOnSuccessListener
                }

                val faceBitmap = cropFace(bitmap, bestFace)

                executor.execute {
                    try {
                        val embedding = processFaceEmbedding(faceBitmap)
                        val spoof = detectSpoofing(bestFace)
                        callback(embedding, spoof)
                    } catch (e: Exception) {
                        Log.e("FaceRecognition", "Embedding error", e)
                        callback(null, false)
                    }
                }
            }
            .addOnFailureListener {
                Log.e("FaceRecognition", "Face detection failed", it)
                callback(null, false)
            }
    }

    private fun detectSpoofing(face: Face): Boolean {
        val eyes = face.rightEyeOpenProbability ?: 0.7f
        val smile = face.smilingProbability ?: 0.7f
        val tilt = abs(face.headEulerAngleZ)
        val turn = abs(face.headEulerAngleY)

        return (eyes < 0.2f && smile < 0.2f) || tilt > 35 || turn > 35
    }

    private fun cropFace(bitmap: Bitmap, face: Face): Bitmap {
        val box = face.boundingBox
        val x = box.left.coerceAtLeast(0)
        val y = box.top.coerceAtLeast(0)
        val w = box.width().coerceAtMost(bitmap.width - x)
        val h = box.height().coerceAtMost(bitmap.height - y)
        return Bitmap.createBitmap(bitmap, x, y, w, h)
    }

    private fun processFaceEmbedding(bitmap: Bitmap): FloatArray {
        val resized = Bitmap.createScaledBitmap(bitmap, 160, 160, true)
        val buffer = ByteBuffer.allocateDirect(160 * 160 * 3 * 4)
        buffer.order(ByteOrder.nativeOrder())

        val pixels = IntArray(160 * 160)
        resized.getPixels(pixels, 0, 160, 0, 0, 160, 160)

        for (p in pixels) {
            buffer.putFloat((p shr 16 and 0xFF) / 255f)
            buffer.putFloat((p shr 8 and 0xFF) / 255f)
            buffer.putFloat((p and 0xFF) / 255f)
        }

        val output = Array(1) { FloatArray(512) }
        faceNetInterpreter.run(buffer, output)

        return l2Normalize(output[0])
    }

    // ================= REGISTER : SINGLE IMAGE =================

    @ReactMethod
    fun registerFace(imagePath: String, promise: Promise) {
        try {
            val bitmap = loadBitmap(imagePath)
                ?: return promise.reject("BITMAP_NULL", "Image load failed")

            extractFaceEmbedding(bitmap) { embedding, spoof ->
                when {
                    embedding == null ->
                        promise.reject("NO_FACE", "No face detected")

                    spoof ->
                        promise.reject("SPOOF", "Spoof face detected")

                    else ->
                        promise.resolve(embedding.joinToString(","))
                }
            }
        } catch (e: Exception) {
            promise.reject("REGISTER_ERROR", e.message)
        }
    }


private fun loadBitmapSmart(path: String): Bitmap? {
    return try {
        when {
            path.startsWith("http://") || path.startsWith("https://") -> {
                BitmapFactory.decodeStream(URL(path).openStream())
            }

            path.startsWith("file://") -> {
                val realPath = path.replace("file://", "")
                val bm = BitmapFactory.decodeFile(realPath)
                if (bm != null) applyExifRotation(bm, realPath) else null
            }

            else -> {
                val bm = BitmapFactory.decodeFile(path)
                if (bm != null) applyExifRotation(bm, path) else null
            }
        }
    } catch (e: Exception) {
        Log.e("FaceRecognition", "Bitmap load failed: $path", e)
        null
    }
}


    // ================= REGISTER : MULTIPLE IMAGES (10) =================
@ReactMethod
fun registerFaceMultiple(
    imagePaths: ReadableArray,
    promise: Promise
) {
    executor.execute {
        try {
            val embeddings = mutableListOf<FloatArray>()
            val total = imagePaths.size()
            var processed = 0

            fun finishIfDone() {
                if (processed == total) {
                    if (embeddings.size >= 3) {
                        val finalEmbedding = averageEmbeddings(embeddings)
                        promise.resolve(finalEmbedding.joinToString(","))
                    } else {
                        promise.reject(
                            "INSUFFICIENT_IMAGES",
                            "Face not clear. Please keep phone steady and try again."
                        )
                    }
                }
            }

            for (i in 0 until total) {
                val rawPath = imagePaths.getString(i)
                if (rawPath.isNullOrEmpty()) {
                    processed++
                    finishIfDone()
                    continue
                }

                val bitmap = loadBitmapSmart(rawPath)

                if (bitmap == null) {
                    processed++
                    finishIfDone()
                    continue
                }

                extractFaceEmbedding(bitmap) { embedding, _ ->
                    if (embedding != null) {
                        embeddings.add(embedding)
                    }
                    processed++
                    finishIfDone()
                }
            }
        } catch (e: Exception) {
            promise.reject("REGISTER_MULTI_ERROR", e.message)
        }
    }
}



    // ================= AUTHENTICATION =================

    @ReactMethod
    fun smartAuthenticateFace(
        imagePath: String,
        registeredEmbeddingStr: String,
        promise: Promise
    ) {
        try {
            val bitmap = loadBitmap(imagePath)
                ?: return promise.reject("BITMAP_NULL", "Image load failed")

            val registered =
                registeredEmbeddingStr.split(",").map { it.toFloat() }.toFloatArray()

            extractFaceEmbedding(bitmap) { embedding, spoof ->
                if (embedding == null) {
                    promise.reject("NO_FACE", "No face detected")
                    return@extractFaceEmbedding
                }

                if (spoof) {
                    promise.reject("SPOOF", "Spoof face detected")
                    return@extractFaceEmbedding
                }

                val score = matchFaces(embedding, registered)
                val isMatch = score >= 75f
                val result = Arguments.createMap()
                result.putDouble("score", score.toDouble())
                result.putBoolean("isMatch", isMatch)
                promise.resolve(result)
            }
        } catch (e: Exception) {
            promise.reject("AUTH_ERROR", e.message)
        }
    }

    @ReactMethod
fun compareEmbeddings(
    emb1: ReadableArray,
    emb2: ReadableArray,
    promise: Promise
) {
    try {
        val a = FloatArray(emb1.size()) { i ->
            emb1.getDouble(i).toFloat()
        }
        val b = FloatArray(emb2.size()) { i ->
            emb2.getDouble(i).toFloat()
        }

        var dot = 0f
        var na = 0f
        var nb = 0f

        for (i in a.indices) {
            dot += a[i] * b[i]
            na += a[i] * a[i]
            nb += b[i] * b[i]
        }

        val similarity = dot / (kotlin.math.sqrt(na) * kotlin.math.sqrt(nb))

        // convert to %
        val score = ((similarity + 1) / 2f) * 100f
        promise.resolve(score.toDouble())

    } catch (e: Exception) {
        promise.reject("COMPARE_ERROR", e.message)
    }
}


    // ================= HELPERS =================

    private fun matchFaces(a: FloatArray, b: FloatArray): Float {
        var dot = 0f
        var na = 0f
        var nb = 0f

        for (i in a.indices) {
            dot += a[i] * b[i]
            na += a[i] * a[i]
            nb += b[i] * b[i]
        }

        val sim = dot / (sqrt(na) * sqrt(nb))
        val score = (1 / (1 + Math.exp(-10 * (sim - 0.5)))).toFloat() * 100
        return if (score > 75) score else 0f
    }

private fun averageEmbeddings(list: List<FloatArray>): FloatArray {
    val size = list[0].size
    val avg = FloatArray(size)

    for (e in list) {
        for (i in 0 until size) {
            avg[i] = avg[i] + e[i]
        }
    }

    for (i in 0 until size) {
        avg[i] = avg[i] / list.size
    }

    return l2Normalize(avg)
}

private fun l2Normalize(v: FloatArray): FloatArray {
    var sum = 0f
    for (x in v) sum += x * x
    val norm = sqrt(sum)

    if (norm < 1e-6) return v

    for (i in v.indices) {
        v[i] = v[i] / norm
    }
    return v
}


    private fun loadBitmap(path: String): Bitmap? {
        return try {
            if (path.startsWith("http")) {
                BitmapFactory.decodeStream(URL(path).openStream())
            } else {
                val file = File(path)
                if (!file.exists()) {
                    null
                } else {
                    val bm = BitmapFactory.decodeFile(path)
                    if (bm != null) applyExifRotation(bm, path) else null
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun applyExifRotation(bitmap: Bitmap, path: String): Bitmap {
        try {
            val exif = ExifInterface(path)
            val orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
            val matrix = Matrix()
            var rotate = false
            when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> { matrix.postRotate(90f); rotate = true }
                ExifInterface.ORIENTATION_ROTATE_180 -> { matrix.postRotate(180f); rotate = true }
                ExifInterface.ORIENTATION_ROTATE_270 -> { matrix.postRotate(270f); rotate = true }
            }
            if (rotate) {
                return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return bitmap
    }
}
