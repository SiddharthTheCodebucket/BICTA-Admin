import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  NativeModules,
  Text,
  Animated,
  Linking,
  AppState,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_SIZE = SCREEN_WIDTH * 0.65; // Responsive size
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import Toast from 'react-native-toast-message';

const { FaceRecognitionModule, FaceLivenessModule } = NativeModules;

type Step = 'QR' | 'REGISTER' | 'SCAN';

const MATCH_THRESHOLD = 75;
const MAX_FACE_RETRY = 3;

const ScanQRAndFace = () => {
  const cameraRef = useRef<Camera>(null);
  const appState = useRef(AppState.currentState);

  const [step, setStep] = useState<Step>('QR');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(true);

  // const device = useCameraDevice(step === 'SCAN' ? 'front' : 'back');
  const device = useCameraDevice('front');

  const [employee, setEmployee] = useState<any>(null);
  const [embedding, setEmbedding] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Please scan your ID card');

  const lock = useRef(false);
  const scanning = useRef(false);
  const faceRetryCount = useRef(0);

  /* ---------------- CAMERA PERMISSION (BULLETPROOF) ---------------- */
  const checkCameraPermission = async (showAlert = false) => {
    setCheckingPermission(true);

    const status = Camera.getCameraPermissionStatus();
    console.log('Camera permission:', status);

    if (status === 'granted') {
      setHasPermission(true);
      setCheckingPermission(false);
      return;
    }

    // FIRST TIME INSTALL → ONLY time Android shows system prompt
    if (status === 'not-determined') {
      const result = await Camera.requestCameraPermission();
      setHasPermission(result === 'granted');
      setCheckingPermission(false);
      return;
    }

    // denied / restricted / ask every time
    setHasPermission(false);
    setCheckingPermission(false);

    if (showAlert) {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to continue.\n\nGo to Settings → Permissions → Camera → Allow only while using the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
        { cancelable: false },
      );
    }
  };

  // initial check
  useEffect(() => {
    checkCameraPermission(true);
  }, []);

  // re-check when user comes back from settings
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        checkCameraPermission(false);
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  const reset = () => {
    lock.current = false;
    scanning.current = false;
    faceRetryCount.current = 0;
    setEmployee(null);
    setEmbedding(null);
    setLoading(false);
    setMessage('Please scan your ID card');
    setStep('QR');
  };

  /* ---------------- QR SCAN ---------------- */
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (step !== 'QR' || lock.current) return;

      const value = codes?.[0]?.value;
      if (!value) return;

      lock.current = true;
      setLoading(true);
      setMessage('ID card scanned. Verifying details…');

      try {
        const qrData = JSON.parse(value);

        if (!qrData?.images?.length) {
          throw new Error('Invalid QR: missing face images');
        }

        setEmployee(qrData);
        setMessage(`Welcome ${qrData.basicData?.name}`);
        setStep('REGISTER');
      } catch {
        setMessage('Invalid ID card. Please scan again.');
        setLoading(false);
        lock.current = false;
      }
    },
  });

  /* ---------------- REGISTER FACE ---------------- */
  useEffect(() => {
    if (step !== 'REGISTER' || !employee) return;

    setLoading(true);
    setMessage(`Registering face for ${employee.basicData?.name}…`);

    (async () => {
      try {
        const localImages: string[] = [];

        for (let i = 0; i < employee.images.length; i++) {
          const path = `${RNFS.CachesDirectoryPath}/reg_${i}.jpg`;
          await RNFS.downloadFile({
            fromUrl: employee.images[i],
            toFile: path,
          }).promise;
          localImages.push(path);
        }

        const emb = await FaceRecognitionModule.registerFaceMultiple(
          localImages,
        );

        setEmbedding(emb);
        setLoading(false);
        setMessage('Face registered. Please look at the camera.');
        setStep('SCAN');
      } catch {
        Alert.alert('Registration Failed', 'Please rescan ID card.');
        reset();
      }
    })();
  }, [step, employee]);

  /* ---------------- FACE SCAN LOOP ---------------- */
  useEffect(() => {
    if (step !== 'SCAN' || !embedding) return;

    let cancelled = false;

    const loop = async () => {
      if (cancelled) return;

      try {
        if (!cameraRef.current || scanning.current) {
          setTimeout(loop, 300);
          return;
        }

        scanning.current = true;
        setMessage(`Scanning face for ${employee?.basicData?.name}…`);

        const photo = await cameraRef.current.takePhoto();
        const base64 = await RNFS.readFile(photo.path, 'base64');

        const live = JSON.parse(await FaceLivenessModule.analyzeFace(base64));

        if (!live?.isLive) {
          scanning.current = false;
          setTimeout(loop, 300);
          return;
        }

        setLoading(true);
        setMessage('Analyzing face…');

        const result = await FaceRecognitionModule.smartAuthenticateFace(
          photo.path,
          embedding,
        );

        setLoading(false);

        const score = result?.score ?? 0;
        const isMatch = result?.isMatch && score >= MATCH_THRESHOLD;

        if (isMatch) {
          // 🔥 Attendance Payload Simulation
          const deviceId = await DeviceInfo.getUniqueId();
          const userId = employee?.basicData?.id || 'USER_PLACEHOLDER';
          const dateTime = new Date().toISOString();
          const liveImageBase64 = await RNFS.readFile(photo.path, 'base64');

          const attendancePayload = {
            deviceId,
            userId,
            dateTime,
            liveImage: liveImageBase64.substring(0, 50) + '...', // Log partial for safety
          };

          console.log('--- SCAN QR + FACE ATTENDANCE LOG ---');
          console.log('Sending Attendance Payload:', {
            ...attendancePayload,
            liveImage: `[Base64 Image String length: ${liveImageBase64.length}]`,
          });
          console.log('--------------------------------------');

          Toast.show({
            type: 'success',
            text1: 'Access Granted',
            text2: `Welcome ${employee.basicData?.name}! (${score.toFixed(
              2,
            )}%)`,
          });
          setTimeout(reset, 1000);
        } else {
          faceRetryCount.current += 1;

          if (faceRetryCount.current >= MAX_FACE_RETRY) {
            Alert.alert(
              'Verification Failed',
              `Face did not match (${faceRetryCount.current}/${MAX_FACE_RETRY}).\n\nPlease rescan your ID card.`,
              [{ text: 'OK', onPress: reset }],
            );
          } else {
            Alert.alert(
              'Face Not Matched',
              `Attempt ${faceRetryCount.current}/${MAX_FACE_RETRY} failed.\n\nPlease try again.`,
              [
                {
                  text: 'Try Again',
                  onPress: () => {
                    scanning.current = false;
                    setTimeout(loop, 500);
                  },
                },
              ],
            );
          }
        }
      } catch {
        scanning.current = false;
        setLoading(false);
        setTimeout(loop, 300);
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [step, embedding]);

  /* ---------------- UI GUARDS ---------------- */
  if (checkingPermission) {
    return <FullscreenLoading isVisible />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please allow Camera permission to continue.
        </Text>
        <Text
          style={styles.permissionLink}
          onPress={() => Linking.openSettings()}
        >
          Open Settings
        </Text>
      </View>
    );
  }

  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={step !== 'REGISTER'}
        photo
        codeScanner={codeScanner}
      />

      {step === 'SCAN' && <FaceIDOverlay scanning={scanning.current} />}

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      <FullscreenLoading isVisible={loading} />
    </View>
  );
};

export default ScanQRAndFace;

/* ---------------- FACEID OVERLAY ---------------- */

const FaceIDOverlay = ({ scanning }: { scanning: boolean }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanning) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scanning]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(OVERLAY_SIZE / 2) + 20, OVERLAY_SIZE / 2 - 20],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.overlayCenter}>
        <View style={styles.boxContainer}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {scanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  width: OVERLAY_SIZE - 20,
                  transform: [{ translateY }],
                },
              ]}
            />
          )}
        </View>
      </View>
    </View>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  messageBox: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 14,
    borderRadius: 8,
    zIndex: 10,
  },

  messageText: { color: '#fff', fontWeight: '600' },

  overlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  boxContainer: {
    width: OVERLAY_SIZE,
    height: OVERLAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: '#fff',
  },

  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanLine: {
    height: 2,
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  permissionBox: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  permissionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  permissionText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },

  permissionLink: {
    color: '#00ffcc',
    marginTop: 16,
    fontSize: 16,
  },
});
