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
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector } from '../../../../hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, vh, vw } from '../../../../constants';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { Header } from '../../../../components/organisms/HeaderOrganism';

const { FaceRecognitionModule, FaceLivenessModule } = NativeModules;

const MATCH_THRESHOLD = 75;

const FaceScan = ({ navigation }: any) => {
  const cameraRef = useRef<Camera>(null);
  const scanValue = useRef(new Animated.Value(0)).current;
  const device = useCameraDevice('front');
  const screenHeight = Dimensions.get('window').height;

  const embedding = useAppSelector(state => state.face.embedding);

  const [cameraKey, setCameraKey] = useState(0);

  const [scanAnimation, setScanAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Scan Face');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const startScan = (cb: () => void) => {
    setScanAnimation(true);
    Animated.timing(scanValue, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      scanValue.setValue(0);
      setScanAnimation(false);
      cb();
    });
  };

  const checkLivenessMultiFrame = async () => {
    let lastResult: any = null;

    for (let i = 0; i < 4; i++) {
      if (!cameraRef.current) break;

      const photo = await cameraRef.current.takePhoto();
      const base64 = await RNFS.readFile(photo.path, 'base64');

      lastResult = JSON.parse(await FaceLivenessModule.analyzeFace(base64));

      console.log('LIVENESS FRAME', i, lastResult);

      if (lastResult?.isLive) {
        return { isLive: true, photo };
      }

      await new Promise((r: any) => setTimeout(r, 300));
    }

    return { isLive: false, photo: null };
  };

  const captureAndVerify = async () => {
    if (!cameraRef.current || !embedding) return;

    try {
      setLoading(true);

      const { isLive, photo } = await checkLivenessMultiFrame();

      if (!isLive || !photo) {
        Alert.alert('Face not live', 'Blink once OR slowly move your head', [
          {
            text: 'OK',
            onPress: () => {
              setLoading(false);
              setPreviewImage(null);
              setCameraKey(prev => prev + 1);
            },
          },
        ]);
        setLoading(false);
        return;
      }

      const result = await FaceRecognitionModule.smartAuthenticateFace(
        photo.path,
        embedding,
      );

      setLoading(false);

      if (result?.isMatch && result.score >= MATCH_THRESHOLD) {
        setPreviewImage(`file://${photo.path}`);

        Alert.alert(
          'Attendance Verified ✅',
          `Score: ${result.score.toFixed(2)}%`,
          [
            {
              text: 'Continue',
              onPress: () =>
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Profie' }],
                  }),
                ),
            },
          ],
        );
      } else {
        Alert.alert(
          'Face Mismatch ❌',
          `Score: ${result?.score?.toFixed(2) ?? 0}%`,
        );
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e?.message ?? 'Verification failed');
    }
  };

  useEffect(() => {
    if (!embedding) {
      Alert.alert('Face not registered');
      navigation.goBack();
    }
  }, [embedding]);

  if (!device) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Text>Camera not available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView style={styles.flex}>
        <View style={[styles.cameraView, { height: screenHeight - vh(260) }]}>
          <Text style={styles.instruction}>Look at camera & blink</Text>

          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.flex} />
          ) : (
            <Camera
              key={cameraKey}
              ref={cameraRef}
              style={styles.flex}
              device={device}
              isActive
              photo
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

      <View style={styles.btn}>
        <ButtonOrganism
          bttnText={loading ? 'Verifying...' : 'Mark Attendance'}
          isDisabled={loading}
          onPress={() => {
            if (!loading) {
              startScan(captureAndVerify);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default FaceScan;

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
  btn: {
    paddingHorizontal: vw(15),
    paddingVertical: vh(15),
  },
});
