import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { Header } from '../../../../components/organisms/HeaderOrganism';
import { colors, screensName, vh, vw } from '../../../../constants';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import { setIsRegistered as setIsRegisteredRedux } from '../../../../features/face/faceSlice';

const REGISTRATION_KEY = '@device_registered_status';

const DeviceRegistration = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [locationName, setLocationName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState({ locationName: '' });

  const [registering, setRegistering] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Device Registration');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const init = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);

      try {
        // 🔥 Simulate API check with Local Storage
        const isRegistered = await AsyncStorage.getItem(REGISTRATION_KEY);
        if (isRegistered === 'true') {
          dispatch(setIsRegisteredRedux(true));
          navigation.replace(screensName.ScanQRAndFace);
          return;
        }
      } catch (err) {
        console.log('Reg Check Error:', err);
      } finally {
        setTimeout(() => setIsChecking(false), 800);
      }
    };

    init();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location Permission Granted');
          getCurrentLocation();
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Required',
            'You have permanently denied location permission. Please enable it in settings.',
            [{ text: 'OK' }],
          );
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required for registration.',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.log('Location Error:', error);
        Alert.alert(
          'Location Error',
          'Unable to fetch current location. Please ensure GPS is on.',
        );
      },
      {
        enableHighAccuracy: Platform.OS === 'ios',
        timeout: 30000,
        maximumAge: 10000,
      },
    );
  };

  const isValidate = () => {
    try {
      const schema = Yup.object().shape({
        locationName: Yup.string().required(
          'Location Name is required (e.g. GATE 1)',
        ),
      });
      schema.validateSync({ locationName });
      return true;
    } catch (err: any) {
      setError({ ...error, [err.path]: err.message });
      return false;
    }
  };

  const handleRegister = async () => {
    if (!isValidate()) return;

    if (!location) {
      Toast.show({
        type: 'error',
        text1: 'Location Required',
        text2: 'Please wait until your location is fetched before registering.',
      });
      getCurrentLocation();
      return;
    }

    setLoading(true);

    try {
      const payload = {
        deviceId,
        latitude: location.latitude,
        longitude: location.longitude,
        locationName,
      };

      console.log('Registering with payload:', payload);

      // 🔥 Simulate API call
      await new Promise(resolve => setTimeout(() => resolve(null), 2000));

      await AsyncStorage.setItem(REGISTRATION_KEY, 'true');
      dispatch(setIsRegisteredRedux(true));

      setLoading(false);
      Alert.alert('Success', 'Device registered successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.replace(screensName.ScanQRAndFace),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  if (isChecking) {
    return <FullscreenLoading isVisible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FullscreenLoading isVisible={loading} />
      <View style={styles.content}>
        <Text style={styles.title}>Register Device</Text>
        <Text style={styles.subtitle}>
          Please provide the location details to continue.
        </Text>

        <TextInputOrganisms
          label="Location Name"
          placeholder="e.g. GATE 1"
          value={locationName}
          onChangeText={(txt: string) => {
            setLocationName(txt);
            setError({ ...error, locationName: '' });
          }}
          errorMessage={error.locationName}
          containerStyle={styles.input}
        />

        <ButtonOrganism
          bttnText="Register & Continue"
          onPress={handleRegister}
          containerStyle={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

export default DeviceRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  content: {
    flex: 1,
    paddingHorizontal: vw(20),
    paddingTop: vh(20),
  },
  title: {
    fontSize: vw(22),
    fontFamily: 'Roboto-Bold',
    color: colors.black,
    marginBottom: vh(10),
  },
  subtitle: {
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(30),
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: vw(15),
    borderRadius: vw(8),
    marginBottom: vh(15),
  },
  infoLabel: {
    fontSize: vw(12),
    color: colors.grey,
    marginBottom: vh(4),
  },
  infoValue: {
    fontSize: vw(14),
    color: colors.black,
    fontFamily: 'Roboto-Medium',
  },
  input: {
    marginTop: vh(10),
  },
  button: {
    marginTop: vh(40),
  },
});
