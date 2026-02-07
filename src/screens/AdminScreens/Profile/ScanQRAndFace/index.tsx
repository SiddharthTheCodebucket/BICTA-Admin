import React, { useEffect, useRef, useState } from 'react';
import { View, Alert, StyleSheet, NativeModules, Text } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';

const { FaceRecognitionModule, FaceLivenessModule } = NativeModules;

type Step = 'QR' | 'REGISTER' | 'SCAN';

const MATCH_THRESHOLD = 75;
const MAX_FACE_RETRY = 3;

const ScanQRAndFace = () => {
  const cameraRef = useRef<Camera>(null);

  const [step, setStep] = useState<Step>('QR');

  const device = useCameraDevice(step === 'SCAN' ? 'front' : 'back');

  const [employee, setEmployee] = useState<any>(null);
  const [embedding, setEmbedding] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Please scan your ID card');

  const lock = useRef(false);
  const scanning = useRef(false);
  const faceRetryCount = useRef(0);

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
      if (step !== 'QR') return;
      if (lock.current) return;

      const value = codes?.[0]?.value;
      if (!value) return;

      lock.current = true;
      setLoading(true);
      setMessage('ID card scanned. Verifying details…');

      try {
        const qrData = JSON.parse(value);

        if (!qrData?.images || qrData.images.length === 0) {
          throw new Error('QR missing images');
        }

        setEmployee(qrData);

        setMessage(`Welcome ${qrData.basicData?.name}`);

        setStep('REGISTER');
      } catch (e) {
        setMessage('Invalid ID card. Please scan again.');
        setLoading(false);
        lock.current = false;
      }
    },
  });

  useEffect(() => {
    if (step !== 'REGISTER' || !employee) return;

    setMessage(
      `Registering face for ${employee.basicData?.name}. Please wait…`,
    );
    setLoading(true);

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
      } catch (e) {
        Alert.alert(
          'Registration Failed',
          'Unable to register face. Please rescan ID card.',
        );
        reset();
      }
    })();
  }, [step, employee]);

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
        setMessage(
          employee?.basicData?.name
            ? `Scanning face for ${employee.basicData.name}…`
            : 'Scanning face…',
        );

        const photo = await cameraRef.current.takePhoto();
        const base64 = await RNFS.readFile(photo.path, 'base64');

        let live;
        try {
          live = JSON.parse(await FaceLivenessModule.analyzeFace(base64));
        } catch (e: any) {
          scanning.current = false;
          if (e?.code === 'NO_FACE') {
            setTimeout(loop, 300);
            return;
          }
          throw e;
        }

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
          scanning.current = true;
          setMessage(`Access granted (${score.toFixed(1)}%)`);
          Alert.alert('Access Granted ✅', `Match Score: ${score.toFixed(2)}%`);
          setTimeout(reset, 1000);
        } else {
          faceRetryCount.current += 1;

          if (faceRetryCount.current >= MAX_FACE_RETRY) {
            Alert.alert(
              'Verification Failed',
              'Face verification failed multiple times. Please rescan ID card.',
            );
            reset();
          } else {
            setMessage(
              `Face not matched. Try again (${faceRetryCount.current}/${MAX_FACE_RETRY})`,
            );
            scanning.current = false;
            setTimeout(loop, 500);
          }
        }
      } catch (err) {
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

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      <FullscreenLoading isVisible={loading} />
    </View>
  );
};

export default ScanQRAndFace;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageBox: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
