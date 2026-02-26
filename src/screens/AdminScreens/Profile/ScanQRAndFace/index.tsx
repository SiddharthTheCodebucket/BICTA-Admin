import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  Text,
  Animated,
  Linking,
  AppState,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { vh, vw, screensName } from '../../../../constants';
import { NavigationType } from '../../../../components/organisms/HeaderOrganism';
import { useAppSelector } from '../../../../hooks';
import { useAddMatchLogMutation } from '../../../../injectEndpoints/faceEndpoints';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_SIZE = SCREEN_WIDTH * 0.65;

import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import Toast from 'react-native-toast-message';
import { useCommonDropdownListMutation } from '../../../../injectEndpointsTrainee/profileEndpoints';

const { FaceRecognitionModule, FaceLivenessModule } = NativeModules;

type Step = 'QR' | 'REGISTER' | 'SCAN';

const MATCH_THRESHOLD = 75;
const MAX_FACE_RETRY = 3;

const ScanQRAndFace = () => {
  const navigation = useNavigation<NavigationType>();
  const { deviceInfo } = useAppSelector((state: any) => state.face);
  const [addMatchLogApi] = useAddMatchLogMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();
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

  const checkCameraPermission = async (showAlert = false) => {
    setCheckingPermission(true);

    const status = Camera.getCameraPermissionStatus();

    if (status === 'granted') {
      setHasPermission(true);
      setCheckingPermission(false);
      return;
    }

    if (status === 'not-determined') {
      const result = await Camera.requestCameraPermission();
      setHasPermission(result === 'granted');
      setCheckingPermission(false);
      return;
    }

    setHasPermission(false);
    setCheckingPermission(false);

    if (showAlert) {
      navigation.navigate(screensName.AlertOrganism, {
        title: 'Camera Permission Required',
        message:
          'Please allow camera access to continue.\n\nGo to Settings → Permissions → Camera → Allow only while using the app.',
        okText: 'Open Settings',
        double: true,
        cancelText: 'Cancel',
        okFunction: () => {
          void Linking.openSettings();
        },
      });
    }
  };

  useEffect(() => {
    checkCameraPermission(true);
  }, []);

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

  const getCommonApiErrorMessage = (err: any) => {
    if (err?.status === 'FETCH_ERROR') {
      return 'Network error.Check your internet connection.';
    }

    if (err?.status === 401) {
      return 'Session expired.Login again.';
    }

    if (err?.data?.message) {
      return err.data.message;
    }

    if (err?.message) {
      return err.message;
    }

    return 'Unable to fetch face data.Try again.';
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (step !== 'QR' || lock.current) return;

      const value = codes?.[0]?.value;
      if (!value) return;

      lock.current = true;
      setLoading(true);
      setMessage('ID card scanned. Fetching face data…');

      (async () => {
        try {
          // ✅ QR parse
          // sonar-ignore-next-line typescript:S7781, typescript:S6353
          const cleanedValue = value.replace(
            /([{,])\s*([a-zA-Z0-9_]+)\s*:/g,
            '$1"$2":',
          );

          const qrData = JSON.parse(cleanedValue);
          if (!qrData?.adminUserId) {
            throw new Error('adminUserId missing in QR');
          }

          // ✅ Common API call
          const params = {
            listType: 'get-user-live-image',
            replacements: [qrData.adminUserId],
          };

          const res = await commonDropdownApi(params).unwrap();

          const liveImages = res?.data?.[0]?.images;

          if (!Array.isArray(liveImages) || liveImages.length === 0) {
            throw new Error('No live face images found for this user');
          }

          setEmployee({
            ...qrData,
            images: liveImages,
          });

          setMessage(`Welcome ${qrData.name}`);
          setStep('REGISTER');
        } catch (err: any) {
          const errorMsg = getCommonApiErrorMessage(err);

          Toast.show({
            type: 'error',
            text2: errorMsg,
          });

          lock.current = false;
          setMessage('Please scan your ID card again');
        } finally {
          setLoading(false);
        }
      })();
    },
  });

  useEffect(() => {
    if (step !== 'REGISTER' || !employee) return;

    setLoading(true);
    setMessage(`Registering face for ${employee?.name}…`);

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
        setLoading(false);
        navigation.navigate(screensName.AlertOrganism, {
          title: 'Registration Failed',
          message: 'Please rescan ID card.',
          okText: 'OK',
          okFunction: reset,
        });
      }
    })();
  }, [step, employee]);

  const submitMatchLog = async (
    photoPath: string,
    isMatch: boolean,
    score: number,
  ) => {
    try {
      setLoading(true);
      setMessage(
        isMatch ? 'Match found! Syncing attendance…' : 'Logging attempt…',
      );

      const formData = new FormData();
      formData.append('deviceTableId', deviceInfo?.id || '1');
      formData.append('adminUserId', String(employee?.adminUserId || ''));
      formData.append('userRole', employee?.userRole || 'EMPLOYEE');
      formData.append('isFaceMatched', isMatch ? 'Yes' : 'No');
      formData.append('faceMatchPercentage', score.toFixed(2));

      formData.append('liveImage', {
        uri: Platform.OS === 'android' ? `file://${photoPath}` : photoPath,
        type: 'image/jpeg',
        name: `match_${Date.now()}.jpg`,
      } as any);

      await addMatchLogApi(formData).unwrap();
    } catch (err) {
      // Silent fail for logs to not interrupt flow
    } finally {
      setLoading(false);
    }
  };

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
        setMessage(`Scanning face for ${employee?.name}…`);

        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          enableShutterSound: false,
        });
        // const base64 = await RNFS.readFile(photo.path, 'base64');

        // const live = JSON.parse(await FaceLivenessModule.analyzeFace(base64));

        const live = JSON.parse(
          await FaceLivenessModule.analyzeFaceFromPath(photo.path),
        );

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
          await submitMatchLog(photo.path, true, score);

          Toast.show({
            type: 'success',
            text1: 'Access Granted',
            text2: `Verified ${
              employee?.name || employee?.cardNumber
            }! (${score.toFixed(2)}%)`,
          });
          setTimeout(reset, 1000);
        } else {
          await submitMatchLog(photo.path, false, score);

          faceRetryCount.current += 1;

          if (faceRetryCount.current >= MAX_FACE_RETRY) {
            navigation.navigate(screensName.AlertOrganism, {
              title: 'Verification Failed',
              message: `Face did not match (${faceRetryCount.current}/${MAX_FACE_RETRY}).\n\nPlease rescan your ID card.`,
              okText: 'OK',
              okFunction: reset,
            });
          } else {
            navigation.navigate(screensName.AlertOrganism, {
              title: 'Face Not Matched',
              message: `Attempt ${faceRetryCount.current}/${MAX_FACE_RETRY} failed.\n\nPlease try again.`,
              okText: 'Try Again',
              okFunction: () => {
                scanning.current = false;
                setTimeout(loop, 500);
              },
            });
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
    outputRange: [-(OVERLAY_SIZE / 2) + vw(20), OVERLAY_SIZE / 2 - vw(20)],
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
                  width: OVERLAY_SIZE - vw(20),
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

const styles = StyleSheet.create({
  container: { flex: 1 },

  messageBox: {
    position: 'absolute',
    top: vh(40),
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: vw(14),
    borderRadius: vw(8),
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
    width: vw(40),
    height: vw(40),
    borderWidth: vw(4),
    borderColor: '#fff',
  },

  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanLine: {
    height: vh(2),
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: vw(10),
    elevation: 5,
  },

  permissionBox: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: vw(24),
  },

  permissionTitle: {
    color: '#fff',
    fontSize: vw(18),
    fontWeight: '700',
  },

  permissionText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: vh(8),
  },

  permissionLink: {
    color: '#00ffcc',
    marginTop: vh(16),
    fontSize: vw(16),
  },
});
