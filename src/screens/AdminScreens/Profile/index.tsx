import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../../hooks';
import { usePermission } from '../../../hooks/usePermission';
import { matchPermission } from '../../../utils/PermissionChecker/index';
import {
  setIsRegistered,
  setDeviceInfo,
} from '../../../features/face/faceSlice';
import { useListDeviceMutation } from '../../../injectEndpoints/faceEndpoints';
import DeviceInfo from 'react-native-device-info';
import { useGetCentre } from '../../../hooks/useGetCentre';

interface Props {
  navigation: NavigationType;
}

const Profile = (props: Props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const bipardCentre = useGetCentre();
  const [listDeviceApi] = useListDeviceMutation();

  const { crediantialData } = useAppSelector((state: any) => state.Auth);
  const globalPermissions = crediantialData?.globalPermissions || [];

  // Dedicated Scanner: exactly one role and it's QR CODE SCANNER DEVICE
  const isDedicatedScanner =
    globalPermissions.length === 1 &&
    globalPermissions[0]?.roleName === 'QR CODE SCANNER DEVICE';

  const hasListDevicePermission = matchPermission(
    globalPermissions?.[0]?.permissions || [],
    { name: 'LIST DEVICE' },
  );

  const hasAddDevicePermission = matchPermission(
    globalPermissions?.[0]?.permissions || [],
    { name: 'ADD DEVICE' },
  );

  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [time, setTime] = useState(new Date());
  const isRegistered = useAppSelector(state => state.face.isRegistered);

  useFocusEffect(
    useCallback(() => {
      const checkRegistration = async () => {
        const id = await DeviceInfo.getUniqueId();
        const params = {
          search: '',
          sort: {
            attributes: ['id'],
            sorts: ['desc'],
          },
          filters: [['deviceId', '=', id]],
          pageNo: 1,
          itemsPerPage: 10,
          bipardCentre: bipardCentre,
        };

        listDeviceApi(params)
          .unwrap()
          .then((res: any) => {
            if (res?.data?.data && res.data.data.length > 0) {
              const record = res.data.data[0];
              dispatch(setIsRegistered(true));
              dispatch(setDeviceInfo(record));
            } else {
              dispatch(setIsRegistered(false));
              dispatch(setDeviceInfo(null));
            }
          })
          .catch(err => {
            console.log('List Device Error (Profile):', err);
          });
      };

      checkRegistration();
    }, [bipardCentre]),
  );

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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={{ flex: 1 }}>
        {hasListDevicePermission && !isDedicatedScanner && (
          <TouchableOpacity
            style={[
              styles.markAttenButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => navigation.navigate(screensName.DeviceList)}
          >
            <Text
              style={[styles.markAttenText, { color: colors.backgroundColor }]}
            >
              {'Registered Device List'}
            </Text>
          </TouchableOpacity>
        )}

        {isDedicatedScanner && Platform.OS === 'android' && (
          <>
            <TouchableOpacity
              style={[
                styles.markAttenButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                navigation.navigate(screensName.DeviceRegistration)
              }
            >
              <Text
                style={[
                  styles.markAttenText,
                  { color: colors.backgroundColor },
                ]}
              >
                {isRegistered
                  ? 'Update Device Registration'
                  : 'Device Registration'}
              </Text>
            </TouchableOpacity>

            {isRegistered && (
              <TouchableOpacity
                style={[
                  styles.markAttenButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => navigation.navigate('ScanQRAndFace')}
              >
                <Text
                  style={[
                    styles.markAttenText,
                    { color: colors.backgroundColor },
                  ]}
                >
                  {'QR & Face Authentication'}
                </Text>
              </TouchableOpacity>
            )}
          </>
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
