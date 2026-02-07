import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  NativeModules,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { useIsFocused } from '@react-navigation/native';

import { colors, fonts, vh, vw } from '../../../../constants';
import { Header } from '../../../../components/organisms/HeaderOrganism';

const { ObjectDetectionModule } = NativeModules;

const screenHeight = Dimensions.get('window').height;

interface Detection {
  label: string;
  confidence: number;
}

interface DetectionResult {
  humanDetected: boolean;
  confidence: number;
  humanCount: number;
  detections: Detection[];
}

const ObjectDetection = ({ navigation }: any) => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [humanDetected, setHumanDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [humanCount, setHumanCount] = useState(0);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processingRef = useRef(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Object Detection');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
    })();
  }, []);

  // Reset state when screen loses focus
  useEffect(() => {
    if (isFocused) {
      setError(null);
      setCameraReady(false);
    }
  }, [isFocused]);

  // Detection loop
  useEffect(() => {
    if (!cameraReady || !isFocused) return;

    let cancelled = false;

    const detectLoop = async () => {
      if (cancelled || processingRef.current) {
        if (!cancelled) setTimeout(detectLoop, 500);
        return;
      }

      try {
        processingRef.current = true;
        setIsProcessing(true);

        if (!cameraRef.current) {
          processingRef.current = false;
          setIsProcessing(false);
          setTimeout(detectLoop, 500);
          return;
        }

        // Take a photo
        const photo = await cameraRef.current.takePhoto({});

        // Run detection
        const result: DetectionResult = await ObjectDetectionModule.detectHuman(
          photo.path,
        );

        if (!cancelled) {
          setHumanDetected(result.humanDetected);
          setConfidence(result.confidence);
          setHumanCount(result.humanCount);
          setDetections(result.detections || []);
          setError(null);
        }

        // Clean up photo file
        try {
          await RNFS.unlink(photo.path);
        } catch (e) {
          // Ignore cleanup errors
        }
      } catch (e: any) {
        console.log('Detection error:', e);
        if (!cancelled) {
          setError(e?.message || 'Detection failed');
        }
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }

      if (!cancelled) {
        setTimeout(detectLoop, 800);
      }
    };

    detectLoop();

    return () => {
      cancelled = true;
    };
  }, [cameraReady, isFocused]);

  if (Platform.OS !== 'android') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Object Detection is only available on Android
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (permission === 'denied') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Camera permission is required for Object Detection
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Camera not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Status banner */}
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: humanDetected ? '#4CAF50' : '#FF5722' },
        ]}
      >
        <Text style={styles.statusText}>
          {humanDetected
            ? `🧑 Human Detected (${humanCount})`
            : '🔍 No Human Detected'}
        </Text>
        {humanDetected && (
          <Text style={styles.confidenceText}>
            Confidence: {(confidence * 100).toFixed(1)}%
          </Text>
        )}
      </View>

      {/* Camera view */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isFocused && permission === 'granted'}
          photo={true}
          onInitialized={() => setCameraReady(true)}
        />

        {/* Processing indicator */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>Analyzing...</Text>
          </View>
        )}
      </View>

      {/* Detection list */}
      <View style={styles.detectionList}>
        <Text style={styles.detectionTitle}>Detected Objects:</Text>
        {detections.length > 0 ? (
          detections.map((det, index) => (
            <View key={index} style={styles.detectionItem}>
              <Text
                style={[
                  styles.detectionLabel,
                  det.label === 'person' && styles.personLabel,
                ]}
              >
                {det.label === 'person' ? '🧑 ' : '📦 '}
                {det.label}
              </Text>
              <Text style={styles.detectionConfidence}>
                {(det.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDetection}>No objects detected</Text>
        )}
      </View>

      {/* Error display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Instructions */}
      <Text style={styles.instructionText}>
        Point camera at objects to detect them in real-time
      </Text>
    </SafeAreaView>
  );
};

export default ObjectDetection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: vw(20),
  },
  statusBanner: {
    paddingVertical: vh(12),
    paddingHorizontal: vw(16),
    alignItems: 'center',
    marginTop: vh(10),
    marginHorizontal: vw(16),
    borderRadius: vw(8),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Bold,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(4),
  },
  cameraContainer: {
    height: screenHeight * 0.4,
    marginHorizontal: vw(16),
    marginTop: vh(16),
    borderRadius: vw(12),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  camera: {
    flex: 1,
  },
  processingOverlay: {
    position: 'absolute',
    top: vh(8),
    right: vw(8),
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: vw(10),
    paddingVertical: vh(4),
    borderRadius: vw(4),
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
  },
  detectionList: {
    marginHorizontal: vw(16),
    marginTop: vh(16),
    padding: vw(12),
    backgroundColor: '#F5F5F5',
    borderRadius: vw(8),
    maxHeight: vh(150),
  },
  detectionTitle: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
    marginBottom: vh(8),
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detectionLabel: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: '#333',
  },
  personLabel: {
    color: '#4CAF50',
    fontFamily: fonts.Roboto_Bold,
  },
  detectionConfidence: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: '#666',
  },
  noDetection: {
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Regular,
    color: '#999',
    textAlign: 'center',
    paddingVertical: vh(10),
  },
  errorBanner: {
    marginHorizontal: vw(16),
    marginTop: vh(8),
    padding: vw(10),
    backgroundColor: '#FFEBEE',
    borderRadius: vw(6),
  },
  errorBannerText: {
    color: '#C62828',
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    textAlign: 'center',
  },
  errorText: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.red,
    textAlign: 'center',
  },
  instructionText: {
    marginHorizontal: vw(16),
    marginTop: vh(16),
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Regular,
    color: '#666',
    textAlign: 'center',
  },
});
