import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

import { colors, fonts, vh, vw } from '../../../../constants';
import TextAtom from '../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import { isNullUndefined } from '../../../../utils/CommonFunction';

const QRScan = () => {
  const isFocused = useIsFocused();

  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [loader, setLoader] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [scanLock, setScanLock] = useState(false);

  const device = useCameraDevice('front');

  useEffect(() => {
    if (isFocused) {
      setQrData(null);
      setScanLock(false);
    }
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (scanLock || !codes.length) return;

      const value = codes[0]?.value;
      if (!value) return;

      setScanLock(true);

      try {
        const parsedQR = value.trim().startsWith('{')
          ? JSON.parse(value)
          : { raw: value };

        console.log('GATE QR RESULT ===>', parsedQR);

        setQrData(parsedQR);
        setLoader(true);

        setTimeout(() => {
          setLoader(false);

          // 🔁 AUTO RESET FOR NEXT ENTRY
          setQrData(null);
          setScanLock(false);
        }, 1000); // 1 second gap
      } catch (err) {
        setScanLock(false);
      }
    },
  });

  if (permission === 'denied') {
    return (
      <SafeAreaView style={styles.container}>
        <TextAtom style={styles.permissionText}>
          Camera permission is required to scan QR Code
        </TextAtom>

        <TextAtom
          onPress={() => Linking.openSettings()}
          style={styles.openSettings}
        >
          Open Settings
        </TextAtom>
      </SafeAreaView>
    );
  }

  if (!device || permission !== 'granted') return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FullscreenLoading isVisible={loader} />

      <TextAtom style={styles.title}>Scan ID Card QR Code</TextAtom>

      <ViewAtom style={styles.cameraBox}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused && !loader}
          codeScanner={codeScanner}
        />
      </ViewAtom>

      <TextAtom style={styles.hintText}>
        Hold ID card straight • Avoid glare • Keep inside box
      </TextAtom>

      {isNullUndefined(qrData) ? (
        <ViewAtom style={styles.noteBox}>
          <TextAtom style={styles.noteTitle}>NOTE</TextAtom>
          <TextAtom numberOfLines={0} style={styles.noteText}>
            Please scan correct ID Card QR Code available on your card
          </TextAtom>
        </ViewAtom>
      ) : (
        <ViewAtom style={styles.resultBox}>
          <TextAtom style={styles.resultText}>
            {`ID: ${qrData?.id ?? '-'}`}
          </TextAtom>
          <TextAtom style={styles.resultText}>
            {`Tenant ID: ${qrData?.tenantId ?? '-'}`}
          </TextAtom>
        </ViewAtom>
      )}
    </SafeAreaView>
  );
};

export default QRScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },

  title: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.primary,
    marginTop: vh(150),
  },

  cameraBox: {
    width: vw(300),
    height: vh(300),
    borderRadius: vw(12),
    borderWidth: vw(2),
    borderColor: colors.primary,
    marginTop: vh(20),
    overflow: 'hidden',
  },

  hintText: {
    marginTop: vh(12),
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
    textAlign: 'center',
  },

  noteBox: {
    marginTop: vh(70),
    width: vw(310),
  },

  noteTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.red,
    textAlign: 'center',
  },

  noteText: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.primary,
    textAlign: 'center',
    marginTop: vh(8),
  },

  resultBox: {
    marginTop: vh(70),
  },

  resultText: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.grey,
    textAlign: 'center',
  },

  permissionText: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.red,
    marginTop: vh(200),
    textAlign: 'center',
  },

  openSettings: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.primary,
    marginTop: vh(16),
    textDecorationLine: 'underline',
  },
});
