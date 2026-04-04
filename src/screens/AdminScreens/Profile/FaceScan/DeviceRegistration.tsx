import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import * as Yup from 'yup';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppSelector } from '../../../../hooks';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { Header } from '../../../../components/organisms/HeaderOrganism';
import { colors, screensName, vh, vw } from '../../../../constants';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import DropDownOrganism from '../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddDeviceMutation,
  useListDeviceMutation,
  useUpdateDeviceMutation,
} from '../../../../injectEndpoints/faceEndpoints';

import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import { useGetCentre } from '../../../../hooks/useGetCentre';
import { setDeviceInfo } from '../../../../features/face/faceSlice';

const { KioskModule } = NativeModules;

const DeviceRegistration = ({ navigation, route }: any) => {
  const bipardCentre = useGetCentre();
  const { crediantialData } = useAppSelector((state: any) => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;
  const passedDeviceData = route?.params?.deviceData;

  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);

  const [addDeviceApi] = useAddDeviceMutation();
  const [updateDeviceApi] = useUpdateDeviceMutation();
  const [listDeviceApi] = useListDeviceMutation();
  const [commonDropdownListApi] = useCommonDropdownListMutation();

  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any>({});
  const [centerSearch, setCenterSearch] = useState<any>({});
  const [deviceId, setDeviceId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [dbRecord, setDbRecord] = useState<any>(null);

  const validationSchema = Yup.object().shape({
    ...(!dbRecord
      ? {
          secretKey: Yup.string()
            .required('Secret Key is required')
            .min(8, 'Secret Key must be at least 8 characters')
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#]).{8,}$/,
              'Secret Key must contain at least one uppercase, one lowercase, and one special character',
            ),
        }
      : {}),
    centre:
      tenantId === 3
        ? Yup.object().shape({
            id: Yup.string().required('Centre is required'),
          })
        : Yup.mixed().notRequired(),
    location: Yup.object().shape({
      id: Yup.string().required('Location is required'),
    }),
  });

  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState({
    centre: '',
    location: '',
    secretKey: '',
  });

  const isAlertOpen = useRef(false);
  const lastAlertTime = useRef(0);
  const isNavigatingToSettings = useRef(false);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      passedDeviceData ? 'Edit Device' : 'Device Registration',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, passedDeviceData]);

  useEffect(() => {
    const init = async () => {
      // ── Ensure Kiosk Mode is OFF during registration ──
      if (Platform.OS === 'android' && KioskModule) {
        KioskModule.stopKioskMode().catch(() => {});
      }

      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);

      // Auto-select centre for tenantId 1 or 2
      if (tenantId !== 3 && bipardCentre && bipardCentre.length > 0) {
        setCenterSearch({ id: bipardCentre[0], name: bipardCentre[0] });
      }

      if (passedDeviceData) {
        // If we are editing a specific device from the list
        setDbRecord(passedDeviceData);
        setSelectedLocation({
          id: passedDeviceData.locationId,
          name: passedDeviceData.locationName,
        });

        if (tenantId === 3) {
          const inferredCentre =
            passedDeviceData.tenantId === 2 ? 'Patna' : 'Gaya';
          setCenterSearch({ id: inferredCentre, name: inferredCentre });
        }
        setIsChecking(false);
      } else {
        // Normal flow: check if CURRENT device is registered
        checkIfAlreadyRegistered(id);
      }
    };

    init();

    const subscription = AppState.addEventListener('change', nextAppState => {
      const now = Date.now();
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        isNavigatingToSettings.current = false;

        if (!locationCoords && !isAlertOpen.current) {
          setTimeout(() => {
            if (!locationCoords && !isAlertOpen.current) {
              requestLocationPermission(false);
            }
          }, 100);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (centerSearch?.id) {
      getLocationList();
    }
  }, [centerSearch]);

  useFocusEffect(
    useCallback(() => {
      if (!locationCoords && !isAlertOpen.current) {
        requestLocationPermission(false);
      }
    }, [locationCoords]),
  );

  const showAlert = (params: any) => {
    const now = Date.now();
    if (isAlertOpen.current || now - lastAlertTime.current < 2000) {
      return;
    }

    isAlertOpen.current = true;
    lastAlertTime.current = now;

    navigation.navigate(screensName.AlertOrganism, {
      ...params,
      okFunction: () => {
        isAlertOpen.current = false;
        lastAlertTime.current = Date.now();
        if (params.okFunction) params.okFunction();
      },
      cancelFunction: () => {
        isAlertOpen.current = false;
        lastAlertTime.current = Date.now();
        if (params.cancelFunction) params.cancelFunction();
      },
    });
  };

  const checkIfAlreadyRegistered = (id: string) => {
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
          setDbRecord(record);
          dispatch(setDeviceInfo(record));

          if (tenantId === 3) {
            const inferredCentre = record.tenantId === 2 ? 'Patna' : 'Gaya';
            setCenterSearch({ id: inferredCentre, name: inferredCentre });
          }

          setSelectedLocation({
            id: record.locationId,
            name: record.locationName,
          });
        }
      })
      .catch(err => {})
      .finally(() => {
        setTimeout(() => setIsChecking(false), 800);
      });
  };

  const getLocationList = () => {
    if (!centerSearch?.id) return;

    const params = {
      listType: 'select_face_match_location',
      bipardCentre: [centerSearch.id],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setLocationList(res.data);
      })
      .catch(err => {});
  };

  const requestLocationPermission = async (silent = false) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation(silent);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          if (!silent) {
            showAlert({
              title: 'Permission Required',
              message:
                'You have permanently denied location permission. Enable it in settings.',
              okText: 'OK',
            });
          }
        } else {
          if (!silent) {
            showAlert({
              title: 'Permission Denied',
              message: 'Location permission is required for registration.',
              okText: 'OK',
            });
          }
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation(silent);
    }
  };

  const getCurrentLocation = (
    silent = false,
  ): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocationCoords(coords);
          resolve(coords);
        },
        error => {
          if (!silent) {
            showAlert({
              title: 'Location Error',
              message:
                'Unable to fetch current location. Ensure your device location/GPS is turned ON and try again.',
              double: true,
              cancelText: 'Cancel',
              okText: 'Open Settings',
              okFunction: () => {
                isNavigatingToSettings.current = true;
                setTimeout(() => {
                  if (Platform.OS === 'android') {
                    Linking.sendIntent(
                      'android.settings.LOCATION_SOURCE_SETTINGS',
                    );
                  } else {
                    Linking.openSettings();
                  }
                }, 1000);
              },
              cancelFunction: () => {},
            });
          }
          resolve(null);
        },
      );
    });
  };

  const isValidate = () => {
    try {
      validationSchema.validateSync(
        {
          centre: centerSearch,
          location: selectedLocation,
          secretKey: secretKey,
        },
        { abortEarly: true },
      );
      setError({ centre: '', location: '', secretKey: '' });
      return true;
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        // Only set the first error found to ensure sequential display
        const path = err.path || '';
        setError({
          centre: path === 'centre.id' ? err.message : '',
          location: path === 'location.id' ? err.message : '',
          secretKey: path === 'secretKey' ? err.message : '',
        });
      }
      return false;
    }
  };

  const handleAction = async () => {
    if (!isValidate()) return;

    setLoading(true);

    const freshCoords = await getCurrentLocation(false);
    if (!freshCoords) {
      setLoading(false);
      return;
    }

    const payload: any = {
      latitude: String(freshCoords.latitude),
      longitude: String(freshCoords.longitude),
      locationId: selectedLocation.id,
      bipardCentre: centerSearch?.id ? [centerSearch.id] : bipardCentre,
    };

    if (!dbRecord) {
      payload.secretKey = secretKey;
    }

    if (dbRecord) {
      payload.id = String(dbRecord.id);
      updateDeviceApi(payload)
        .unwrap()
        .then((res: any) => {
          setLoading(false);
          if (res?.data) {
            dispatch(setDeviceInfo(res.data));
          }
          Toast.show({
            type: 'success',
            text2: res.data.message || 'Device updated successfully!',
          });
          navigation.goBack();
        })
        .catch(err => {
          setLoading(false);
          Toast.show({
            type: 'error',
            text2: err?.data?.message || 'Update failed',
          });
        });
    } else {
      payload.deviceId = deviceId;
      addDeviceApi(payload)
        .unwrap()
        .then((res: any) => {
          setLoading(false);
          if (res?.data) {
            dispatch(setDeviceInfo(res.data));
          }
          Toast.show({
            type: 'success',
            text2: res?.data?.message ?? 'Device registered successfully!',
          });
          navigation.goBack();
        })
        .catch(err => {
          setLoading(false);
          Toast.show({
            type: 'error',
            text2: err?.data?.message ?? 'Registration failed',
          });
        });
    }
  };

  if (isChecking) {
    return <FullscreenLoading isVisible={true} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FullscreenLoading isVisible={loading} />
      <View style={styles.content}>
        <Text style={styles.title}>
          {dbRecord ? 'Update Device' : 'Register Device'}
        </Text>
        <Text style={styles.subtitle}>
          {dbRecord
            ? 'Your device is already registered. You can update its location if needed.'
            : 'Select your current location to register this device.'}
        </Text>

        {tenantId === 3 && (
          <DropDownOrganism
            label="Select Centre"
            placeholder="Select Centre"
            isDisabled={!!passedDeviceData}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Center',
                Data: [
                  { id: 'Gaya', name: 'Gaya' },
                  { id: 'Patna', name: 'Patna' },
                ],
                selectedData: centerSearch,
                setSelectedData: (data: any) => {
                  setCenterSearch(data);
                  setSelectedLocation({});
                  setError(prev => ({ ...prev, centre: '' }));
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={centerSearch?.name}
            errorMessage={error.centre}
            isMandatory
          />
        )}

        <DropDownOrganism
          label="Select Location"
          placeholder="Select Location"
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Select Location',
              Data: locationList,
              selectedData: selectedLocation,
              setSelectedData: (data: any) => {
                setSelectedLocation(data);
                setError(prev => ({ ...prev, location: '' }));
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedLocation?.name}
          errorMessage={error.location}
          isMandatory
        />

        {!dbRecord && (
          <TextInputOrganisms
            label="Secret Key (Password)"
            placeholder="Enter Secret Key (Password)"
            onChangeText={(txt: string) => {
              setSecretKey(txt);
              setError(prev => ({ ...prev, secretKey: '' }));
            }}
            value={secretKey}
            errorMessage={error.secretKey}
            isMandatory
            secureTextEntry
          />
        )}

        <ButtonOrganism
          bttnText={dbRecord ? 'Update' : 'Register'}
          onPress={handleAction}
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
    marginTop: vh(20),
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
    marginVertical: vh(15),
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
  button: {
    marginTop: vh(20),
  },
});
