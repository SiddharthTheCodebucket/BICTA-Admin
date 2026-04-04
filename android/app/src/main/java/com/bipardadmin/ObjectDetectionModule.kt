package com.bipardadmin

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.util.Log
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.DataType
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import java.util.concurrent.Executors

class ObjectDetectionModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "ObjectDetection"
    }

    override fun getName(): String = "ObjectDetectionModule"

    private val executor = Executors.newSingleThreadExecutor()
    
    // Detection threshold for confidence
    private val CONFIDENCE_THRESHOLD = 0.4f
    
    // Input size for the model
    private val INPUT_SIZE = 300
    
    // Number of detections
    private val NUM_DETECTIONS = 10
    
    // COCO labels for object detection (index 0 is background for some models)
    private val labels = arrayOf(
        "???", "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
        "traffic light", "fire hydrant", "???", "stop sign", "parking meter", "bench", "bird", "cat",
        "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "???", "backpack",
        "umbrella", "???", "???", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
        "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
        "tennis racket", "bottle", "???", "wine glass", "cup", "fork", "knife", "spoon", "bowl",
        "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut",
        "cake", "chair", "couch", "potted plant", "bed", "???", "dining table", "???", "???",
        "toilet", "???", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave",
        "oven", "toaster", "sink", "refrigerator", "???", "book", "clock", "vase", "scissors",
        "teddy bear", "hair drier", "toothbrush"
    )

    private var interpreter: Interpreter? = null
    private var inputDataType: DataType? = null
    private var inputShape: IntArray? = null

    private fun getInterpreter(): Interpreter {
        if (interpreter == null) {
            try {
                val modelBuffer = loadModelFile("ssd_mobilenet.tflite")
                val options = Interpreter.Options()
                options.setNumThreads(4)
                interpreter = Interpreter(modelBuffer, options)
                
                // Get input tensor info
                val inputTensor = interpreter!!.getInputTensor(0)
                inputDataType = inputTensor.dataType()
                inputShape = inputTensor.shape()
                
                Log.d(TAG, "Interpreter created successfully")
                Log.d(TAG, "Input tensor shape: ${inputShape?.contentToString()}, type: $inputDataType")
                
                for (i in 0 until interpreter!!.outputTensorCount) {
                    val outputTensor = interpreter!!.getOutputTensor(i)
                    Log.d(TAG, "Output tensor $i shape: ${outputTensor.shape().contentToString()}, type: ${outputTensor.dataType()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to create interpreter", e)
                throw e
            }
        }
        return interpreter!!
    }

    private fun loadModelFile(modelPath: String): MappedByteBuffer {
        val afd = reactApplicationContext.assets.openFd(modelPath)
        val inputStream = FileInputStream(afd.fileDescriptor)
        val channel = inputStream.channel
        return channel.map(
            FileChannel.MapMode.READ_ONLY,
            afd.startOffset,
            afd.declaredLength
        )
    }

    override fun onCatalystInstanceDestroy() {
        interpreter?.close()
        interpreter = null
        executor.shutdown()
        super.onCatalystInstanceDestroy()
    }

    private fun getRotatedBitmap(path: String, bitmap: Bitmap): Bitmap {
        var rotate = 0
        try {
            val exif = ExifInterface(path)
            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )
            when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_270 -> rotate = 270
                ExifInterface.ORIENTATION_ROTATE_180 -> rotate = 180
                ExifInterface.ORIENTATION_ROTATE_90 -> rotate = 90
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check exif", e)
        }

        if (rotate == 0) return bitmap

        val matrix = Matrix()
        matrix.postRotate(rotate.toFloat())
        return Bitmap.createBitmap(
            bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
        )
    }

    @ReactMethod
    fun detectHuman(imagePath: String, promise: Promise) {
        executor.execute {
            try {
                val cleanPath = if (imagePath.startsWith("file://")) {
                    imagePath.replace("file://", "")
                } else {
                    imagePath
                }

                Log.d(TAG, "Loading image from: $cleanPath")
                
                val bitmap = BitmapFactory.decodeFile(cleanPath)
                if (bitmap == null) {
                    Log.e(TAG, "Failed to decode bitmap from: $cleanPath")
                    promise.reject("BITMAP_NULL", "Failed to load image from path: $cleanPath")
                    return@execute
                }

                Log.d(TAG, "Bitmap loaded: ${bitmap.width}x${bitmap.height}")
                
                val rotatedBitmap = getRotatedBitmap(cleanPath, bitmap)
                if (rotatedBitmap != bitmap) {
                    Log.d(TAG, "Bitmap rotated to: ${rotatedBitmap.width}x${rotatedBitmap.height}")
                }

                val detections = runDetectionRaw(rotatedBitmap)
                
                Log.d(TAG, "Got ${detections.size} detections")
                
                // Check if any "person" is detected
                var humanDetected = false
                var maxConfidence = 0f
                var humanCount = 0

                for (detection in detections) {
                    Log.d(TAG, "Detection: ${detection.label} - ${detection.confidence}")
                    if (detection.label == "person" && detection.confidence >= CONFIDENCE_THRESHOLD) {
                        humanDetected = true
                        humanCount++
                        if (detection.confidence > maxConfidence) {
                            maxConfidence = detection.confidence
                        }
                    }
                }

                val result = Arguments.createMap()
                result.putBoolean("humanDetected", humanDetected)
                result.putDouble("confidence", maxConfidence.toDouble())
                result.putInt("humanCount", humanCount)
                
                // Add all detections (with lower threshold for display)
                val detectionsArray = Arguments.createArray()
                for (detection in detections) {
                    if (detection.confidence >= 0.3f) {
                        val obj = Arguments.createMap()
                        obj.putString("label", detection.label)
                        obj.putDouble("confidence", detection.confidence.toDouble())
                        detectionsArray.pushMap(obj)
                    }
                }
                result.putArray("detections", detectionsArray)
                
                Log.d(TAG, "Result: humanDetected=$humanDetected, count=$humanCount, confidence=$maxConfidence")
                promise.resolve(result)

            } catch (e: Exception) {
                Log.e(TAG, "Human detection error", e)
                promise.reject("DETECTION_ERROR", e.message)
            }
        }
    }

    private data class Detection(
        val label: String,
        val confidence: Float,
        val left: Float,
        val top: Float,
        val right: Float,
        val bottom: Float
    )

    private fun runDetectionRaw(bitmap: Bitmap): List<Detection> {
        val detections = mutableListOf<Detection>()
        
        try {
            val interpreter = getInterpreter()
            
            // Resize bitmap to model input size
            val resizedBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true)
            
            // Create input buffer based on model's expected data type
            val imgData: ByteBuffer
            val isQuantized = inputDataType == DataType.UINT8
            
            if (isQuantized) {
                // Quantized model expects UINT8 [1,300,300,3] = 270000 bytes
                imgData = ByteBuffer.allocateDirect(INPUT_SIZE * INPUT_SIZE * 3)
                imgData.order(ByteOrder.nativeOrder())
                
                val pixels = IntArray(INPUT_SIZE * INPUT_SIZE)
                resizedBitmap.getPixels(pixels, 0, INPUT_SIZE, 0, 0, INPUT_SIZE, INPUT_SIZE)
                
                for (pixel in pixels) {
                    imgData.put((pixel shr 16 and 0xFF).toByte())  // R
                    imgData.put((pixel shr 8 and 0xFF).toByte())   // G
                    imgData.put((pixel and 0xFF).toByte())          // B
                }
            } else {
                // Float model expects FLOAT32 [1,300,300,3] = 1080000 bytes
                imgData = ByteBuffer.allocateDirect(INPUT_SIZE * INPUT_SIZE * 3 * 4)
                imgData.order(ByteOrder.nativeOrder())
                
                val pixels = IntArray(INPUT_SIZE * INPUT_SIZE)
                resizedBitmap.getPixels(pixels, 0, INPUT_SIZE, 0, 0, INPUT_SIZE, INPUT_SIZE)
                
                for (pixel in pixels) {
                    // Normalize to [-1, 1] or [0, 1] depending on model
                    imgData.putFloat(((pixel shr 16 and 0xFF) - 127.5f) / 127.5f)
                    imgData.putFloat(((pixel shr 8 and 0xFF) - 127.5f) / 127.5f)
                    imgData.putFloat(((pixel and 0xFF) - 127.5f) / 127.5f)
                }
            }
            
            imgData.rewind()
            
            Log.d(TAG, "Input buffer size: ${imgData.capacity()}, isQuantized: $isQuantized")
            
            // Output buffers for SSD MobileNet v1
            // Output order: locations, classes, scores, num_detections
            val outputLocations = Array(1) { Array(NUM_DETECTIONS) { FloatArray(4) } }
            val outputClasses = Array(1) { FloatArray(NUM_DETECTIONS) }
            val outputScores = Array(1) { FloatArray(NUM_DETECTIONS) }
            val numDetections = FloatArray(1)
            
            val outputMap = mutableMapOf<Int, Any>()
            outputMap[0] = outputLocations
            outputMap[1] = outputClasses
            outputMap[2] = outputScores
            outputMap[3] = numDetections

            Log.d(TAG, "Running inference...")
            interpreter.runForMultipleInputsOutputs(arrayOf(imgData), outputMap)
            
            val numDet = numDetections[0].toInt().coerceAtMost(NUM_DETECTIONS)
            Log.d(TAG, "Number of detections: $numDet")
            
            for (i in 0 until numDet) {
                val score = outputScores[0][i]
                val classIndex = outputClasses[0][i].toInt()
                
                Log.d(TAG, "Detection $i: classIndex=$classIndex, score=$score")
                
                if (score >= 0.3f && classIndex >= 0 && classIndex < labels.size) {
                    val label = labels[classIndex]
                    
                    if (label != "???") {
                        detections.add(
                            Detection(
                                label = label,
                                confidence = score,
                                top = outputLocations[0][i][0],
                                left = outputLocations[0][i][1],
                                bottom = outputLocations[0][i][2],
                                right = outputLocations[0][i][3]
                            )
                        )
                        Log.d(TAG, "Added detection: $label with score $score")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Detection failed: ${e.message}", e)
        }
        
        return detections
    }

    @ReactMethod
    fun detectObjects(imagePath: String, promise: Promise) {
        executor.execute {
            try {
                val cleanPath = if (imagePath.startsWith("file://")) {
                    imagePath.replace("file://", "")
                } else {
                    imagePath
                }

                val bitmap = BitmapFactory.decodeFile(cleanPath)
                if (bitmap == null) {
                    promise.reject("BITMAP_NULL", "Failed to load image from path: $cleanPath")
                    return@execute
                }

                val rotatedBitmap = getRotatedBitmap(cleanPath, bitmap)
                val detections = runDetectionRaw(rotatedBitmap)
                val results = Arguments.createArray()
                
                for (detection in detections) {
                    val obj = Arguments.createMap()
                    obj.putString("label", detection.label)
                    obj.putDouble("confidence", detection.confidence.toDouble())
                    obj.putDouble("left", detection.left.toDouble())
                    obj.putDouble("top", detection.top.toDouble())
                    obj.putDouble("right", detection.right.toDouble())
                    obj.putDouble("bottom", detection.bottom.toDouble())
                    results.pushMap(obj)
                }
                
                promise.resolve(results)

            } catch (e: Exception) {
                Log.e(TAG, "Detection error", e)
                promise.reject("DETECTION_ERROR", e.message)
            }
        }
    }
}
