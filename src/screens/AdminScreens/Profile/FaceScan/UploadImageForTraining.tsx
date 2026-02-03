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
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector } from '../../../../hooks';
import {
  addFaceImage,
  setEmbedding,
  setReferenceEmbedding,
} from '../../../../features/face/faceSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, vh, vw } from '../../../../constants';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { Header } from '../../../../components/organisms/HeaderOrganism';

const { FaceLivenessModule, FaceRecognitionModule } = NativeModules;

const MAX_IMAGES = 5;

const UploadImageForTraining = ({ navigation }: any) => {
  const cameraRef = useRef<Camera>(null);
  const scanValue = useRef(new Animated.Value(0)).current;
  const device = useCameraDevice('front');
  const screenHeight = Dimensions.get('window').height;

  const dispatch = useDispatch();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [trainingCompleted, setTrainingCompleted] = useState(false);

  const images = useAppSelector((state: any) =>
    Array.isArray(state?.face?.images) ? state.face.images : [],
  );

  const referenceEmbedding = useAppSelector(
    (state: any) => state.face.referenceEmbedding,
  );

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Capture Live Image');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert('Camera Permission Required');
      }
    })();
  }, []);

  const startScanAnimation = (onEnd: () => void) => {
    setScanAnimation(true);
    Animated.timing(scanValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      scanValue.setValue(0);
      setScanAnimation(false);
      onEnd();
    });
  };

  const checkLivenessMultiFrame = async () => {
    let lastResult: any = null;

    for (let i = 0; i < 4; i++) {
      if (!cameraRef.current) break;

      const photo = await cameraRef.current.takePhoto();
      const base64 = await RNFS.readFile(photo.path, 'base64');

      lastResult = JSON.parse(await FaceLivenessModule.analyzeFace(base64));

      console.log('TRAIN LIVENESS FRAME', i, lastResult);

      if (lastResult?.isLive) {
        return { isLive: true, photo };
      }

      // 👇 blink / motion ke liye gap
      await new Promise((r: any) => setTimeout(r, 300));
    }

    return { isLive: false, photo: null, lastResult };
  };

  const captureTrainingImage = async () => {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    try {
      const { isLive, photo } = await checkLivenessMultiFrame();

      if (!isLive || !photo) {
        Alert.alert('Face not live', 'Blink once OR slowly move your head');
        setLoading(false);
        return;
      }

      const embeddingStr = await FaceRecognitionModule.registerFace(photo.path);
      const embedding = embeddingStr.split(',').map(Number);

      const currentCount = images?.length ?? 0;
      const nextCount = currentCount + 1;

      if (!referenceEmbedding && currentCount === 0) {
        dispatch(setReferenceEmbedding(embedding));
        dispatch(addFaceImage(photo.path));

        Alert.alert('Image Added', `${nextCount}/${MAX_IMAGES} image captured`);
        setLoading(false);
        return;
      }

      if (!referenceEmbedding) {
        Alert.alert('Error', 'Reference face missing, please retry');
        setLoading(false);
        return;
      }

      const similarity = await FaceRecognitionModule.compareEmbeddings(
        referenceEmbedding,
        embedding,
      );

      if (similarity < 30) {
        Alert.alert('Different face detected');
        setLoading(false);
        return;
      }

      dispatch(addFaceImage(photo.path));
      Alert.alert('Image Added', `${nextCount}/${MAX_IMAGES} images captured`);
      setLoading(false);
      if (nextCount === MAX_IMAGES) {
        const finalEmbedding = await FaceRecognitionModule.registerFaceMultiple(
          [...images, photo.path],
        );

        dispatch(setEmbedding(finalEmbedding));

        setLoading(false);
        setTrainingCompleted(true);

        Alert.alert('Face Registered', 'Training completed successfully', [
          {
            text: 'Continue',
            onPress: () =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Profile' }],
                }),
              ),
          },
        ]);
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e?.message ?? 'Training failed');
    }
  };

  if (!device || !permissionGranted) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Text>No camera available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView style={styles.flex}>
        <View style={[styles.cameraView, { height: screenHeight - vh(260) }]}>
          <Text style={styles.instruction}>
            Keep phone steady & look at camera
          </Text>

          <Camera
            ref={cameraRef}
            style={styles.flex}
            device={device}
            isActive
            photo
          />

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

        <View style={styles.previewContainer}>
          {Array.isArray(images) &&
            images.map((img: string, i: number) => (
              <Image
                key={`${i.toString()}-'Image'`}
                source={{ uri: `file://${img}` }}
                style={styles.previewImage}
              />
            ))}
        </View>

        <Text style={styles.counterText}>
          {`Captured: ${
            Array.isArray(images) ? images.length : 0
          } / ${MAX_IMAGES}`}
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {!trainingCompleted && (
          <ButtonOrganism
            bttnText={loading ? 'Processing...' : 'Capture Image'}
            isDisabled={loading}
            onPress={() => startScanAnimation(captureTrainingImage)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default UploadImageForTraining;

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
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: vw(12),
  },
  previewImage: {
    width: vw(60),
    height: vw(60),
    margin: vw(6),
    borderRadius: vw(6),
  },
  counterText: {
    textAlign: 'center',
    marginVertical: vh(10),
  },
  buttonContainer: {
    paddingHorizontal: vw(15),
    paddingVertical: vh(15),
  },
});
