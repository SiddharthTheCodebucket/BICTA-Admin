import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import Router from '../../../navigator/routes';
import { useAppSelector } from '../../../hooks';

interface Props {
  navigation: NavigationType;
}

const Profile = (props: Props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const [time, setTime] = useState(new Date());
  const trainingImages = useAppSelector(state => state.face.images ?? []);
  const embedding = useAppSelector(state => state.face.embedding);
  const [attendanceData, setAttendanceData] = useState<any>([]);
  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, {
      time,
      logo: images.logo,
      onNotificationPress: () => {},
    });
  }, [time]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);
  const handleAttendancePress = () => {
    if (!isFaceReady) {
      navigation.navigate('UploadImageForTraining');
      return;
    }

    navigation.navigate('FaceScan');
  };

  const getAttendanceLabel = (attendanceData: any[]): string => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return 'Scan Face';
    }

    const inExists = attendanceData.some(i => i.attendance_type === 'IN');
    const outExists = attendanceData.some(i => i.attendance_type === 'OUT');

    if (inExists && outExists) return 'Done';
    if (inExists) return 'Check Out';
    return 'Scan Face';
  };

  const faceImagesCount = trainingImages?.length;
  const isFaceReady = faceImagesCount === 5 && !!embedding;

  const getAttendanceButtonText = () => {
    if (!isFaceReady) {
      return `Upload Face For Scan (${faceImagesCount}/5)`;
    }

    return getAttendanceLabel(attendanceData);
  };

  const handleQRScanPress = () => {
    navigation.navigate('QRScan');
  };

  const handleScanQRAndFacePress = () => {
    navigation.navigate(screensName.ScanQRAndFace);
  };

  const handleObjectDetectionPress = () => {
    navigation.navigate('ObjectDetection');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={[
            styles.markAttenButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleScanQRAndFacePress}
        >
          <Text
            style={[styles.markAttenText, { color: colors.backgroundColor }]}
          >
            {'Gate Pass Through QR and Face'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.markAttenButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleAttendancePress}
        >
          <Text
            style={[styles.markAttenText, { color: colors.backgroundColor }]}
          >
            {getAttendanceButtonText()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.markAttenButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleQRScanPress}
        >
          <Text
            style={[styles.markAttenText, { color: colors.backgroundColor }]}
          >
            {'QR Scan'}
          </Text>
        </TouchableOpacity>
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={[
              styles.markAttenButton,
              {
                backgroundColor: '#FF9800',
              },
            ]}
            onPress={handleObjectDetectionPress}
          >
            <Text
              style={[styles.markAttenText, { color: colors.backgroundColor }]}
            >
              {'🔍 Object Detection'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ButtonOrganism
        onPress={() => {
          navigation.navigate(screensName.AlertOrganism, {
            message: strings.logout_message,
            okText: strings.ok,
            double: true,
            cancelText: strings.cancel,
            okFunction: () => {
              dispatch({ type: 'RESET' });
              Router.resetNew(navigation, 'OnBoardingNavigator', {
                screen: screensName.Login,
              });
            },
            cancelFunction: () => {},
          });
        }}
        bttnText={strings.logout}
      />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '90%',
  },
  touchable: {
    width: vw(328),
    height: vh(55),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(15),
  },
  markAttenButton: {
    width: vw(330),
    height: vh(40),
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: vh(20),
  },
  markAttenText: {
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Medium,
  },
});
