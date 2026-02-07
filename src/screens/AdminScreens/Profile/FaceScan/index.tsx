import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Dimensions,
  Animated,
  NativeModules,
  Image,
  Text,
  Easing,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../hooks';
import { colors, vh, vw } from '../../../../constants';
import { Header } from '../../../../components/organisms/HeaderOrganism';

const { FaceRecognitionModule, FaceLivenessModule } = NativeModules;

const MATCH_THRESHOLD = 75;
const SCAN_INTERVAL = 150; // 🔥 fast & safe

const FaceScan = ({ navigation }: any) => {
  const cameraRef = useRef<Camera>(null);

  const device = useCameraDevice('front');
  const screenHeight = Dimensions.get('window').height;

  const scanValue = useRef(new Animated.Value(0)).current;

  const scanInProgress = useRef(false);
  const modalVisible = useRef(false);
  const cooldown = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const embedding = useAppSelector(state => state.face.embedding);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Scan Face');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  /* ---------------- AUTO SCAN LOOP ---------------- */
  useEffect(() => {
    if (!cameraReady) return;

    let cancelled = false;

    const loop = async () => {
      if (cancelled) return;

      try {
        if (
          !cameraRef.current ||
          scanInProgress.current ||
          modalVisible.current ||
          cooldown.current
        ) {
          setTimeout(loop, SCAN_INTERVAL);
          return;
        }

        // 🔒 LOCK IMMEDIATELY
        scanInProgress.current = true;

        const photo = await cameraRef.current.takePhoto();
        const base64 = await RNFS.readFile(photo.path, 'base64');

        let res;
        try {
          res = JSON.parse(await FaceLivenessModule.analyzeFace(base64));
        } catch (e: any) {
          scanInProgress.current = false;
          if (e?.code === 'NO_FACE') {
            setTimeout(loop, SCAN_INTERVAL);
            return;
          }
          throw e;
        }

        if (!res?.isLive) {
          scanInProgress.current = false;
          setTimeout(loop, SCAN_INTERVAL);
          return;
        }

        startScan(async () => {
          const success = await captureAndVerify(photo.path);

          cooldown.current = true;
          setTimeout(
            () => {
              cooldown.current = false;
              scanInProgress.current = false;
              setTimeout(loop, SCAN_INTERVAL);
            },
            success ? 200 : 300,
          );
        });
      } catch (err: any) {
        scanInProgress.current = false;
        if (err?.code !== 'NO_FACE') {
          console.log('AUTO SCAN ERROR', err);
        }
        setTimeout(loop, SCAN_INTERVAL);
      }
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [cameraReady]);

  /* ---------------- SCAN ANIMATION ---------------- */
  const startScan = (cb: () => void) => {
    setScanAnimation(true);

    Animated.timing(scanValue, {
      toValue: 1,
      duration: 1800, // slow & smooth
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      scanValue.setValue(0);
      setScanAnimation(false);
      cb();
    });
  };

  /* ---------------- VERIFY ---------------- */
  const captureAndVerify = async (photoPath: string): Promise<boolean> => {
    if (!embedding) return false;

    try {
      const result = await FaceRecognitionModule.smartAuthenticateFace(
        photoPath,
        embedding,
      );

      modalVisible.current = true;
      setPreviewImage(`file://${photoPath}`);

      setTimeout(() => {
        if (result?.isMatch && result.score >= MATCH_THRESHOLD) {
          Alert.alert(
            'Attendance Verified ✅',
            `Score: ${result.score.toFixed(2)}%`,
            [
              {
                text: 'Continue',
                onPress: resetAfterResult,
              },
            ],
          );
        } else {
          Alert.alert(
            'Face Mismatch ❌',
            `Score: ${result?.score?.toFixed(2) ?? 0}%`,
            [
              {
                text: 'Retry',
                onPress: resetAfterResult,
              },
            ],
          );
        }
      }, 100);

      return result?.isMatch && result.score >= MATCH_THRESHOLD;
    } catch (e) {
      resetAfterResult();
      return false;
    }
  };

  const resetAfterResult = () => {
    modalVisible.current = false;
    scanInProgress.current = false;
    cooldown.current = false;
    setPreviewImage(null);

    // ⚡ immediately allow next scan
    setTimeout(() => {
      scanInProgress.current = false;
      cooldown.current = false;
    }, 50);
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Camera not available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={[styles.cameraView, { height: screenHeight - vh(260) }]}>
          <Text style={styles.instruction}>Look at camera & blink</Text>

          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.flex} />
          ) : (
            <Camera
              ref={cameraRef}
              style={styles.flex}
              device={device}
              isActive={true}
              photo
              onInitialized={() => setCameraReady(true)}
            />
          )}

          {scanAnimation && (
            <Animated.View
              style={[
                styles.scanOverlay,
                {
                  transform: [
                    {
                      translateY: scanValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, screenHeight - vh(260)],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FaceScan;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  flex: { flex: 1 },
  cameraView: {
    width: vw(328),
    alignSelf: 'center',
    borderRadius: vw(8),
    overflow: 'hidden',
    marginVertical: vh(20),
  },
  instruction: {
    textAlign: 'center',
    marginBottom: vh(6),
  },
  scanOverlay: {
    position: 'absolute',
    height: vh(4),
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
