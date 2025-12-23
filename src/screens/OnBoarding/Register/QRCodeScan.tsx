import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import Toast from 'react-native-toast-message';
import { useIsFocused } from '@react-navigation/native';

import { colors, fonts, screensName, vh, vw } from '../../../constants';
import TextAtom from '../../../components/atoms/TextAtom';
import ViewAtom from '../../../components/atoms/ViewAtom';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';

interface Props {
  navigation: NavigationType;
}
const QRCodeScan = (props: Props) => {
  const { navigation } = props;
  const isFocused = useIsFocused();

  const [loader, setLoader] = useState(false);
  const device = useCameraDevice('back');

  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') return;
      Toast.show({
        type: 'error',
        text1: 'Permission required',
        text2: 'Camera permission is required to continue.',
      });
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (scanned) return;
      setScanned(true);

      const value = codes[0]?.value;
      if (!value) return;

      setLoader(true);
      setTimeout(() => {
        setLoader(false);
        navigation.navigate(screensName.RegistrationSteeper, {
          qrData: value,
        });
      }, 1000);
    },
  });

  if (!device) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FullscreenLoading isVisible={loader} />

      <TextAtom
        style={{
          fontFamily: fonts.Roboto_Bold,
          fontSize: vw(16),
          color: colors.primary,
          marginTop: vh(160),
          alignSelf: 'center',
        }}
      >
        Scan QR Code
      </TextAtom>

      <ViewAtom
        style={{
          width: vw(273),
          height: vh(273),
          borderRadius: vw(11),
          borderColor: colors.primary,
          borderWidth: vw(2),
          marginTop: vh(20),
          overflow: 'hidden',
        }}
      >
        <Camera
          style={{ flex: 1 }}
          device={device}
          isActive={isFocused && !loader} // 🔥 IMPORTANT
          codeScanner={codeScanner}
        />
      </ViewAtom>

      <ViewAtom style={{ marginBottom: vh(20), marginTop: vh(80) }}>
        <TextAtom
          style={{
            fontFamily: fonts.Roboto_Bold,
            fontSize: vw(16),
            color: colors.red,
            textAlign: 'center',
          }}
        >
          NOTE
        </TextAtom>

        <TextAtom
          numberOfLines={0}
          style={{
            fontFamily: fonts.Roboto_Bold,
            fontSize: vw(16),
            color: colors.primary,
            textAlign: 'center',
            width: vw(310),
          }}
        >
          Please scan correct QR Code available with your training name
        </TextAtom>
      </ViewAtom>
    </SafeAreaView>
  );
};

export default QRCodeScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
});
