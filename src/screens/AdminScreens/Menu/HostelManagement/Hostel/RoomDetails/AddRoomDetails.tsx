import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  colors,
  fonts,
  screensName,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddHostelRoomMutation,
  useUpdateHostelRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  hostelList: [],
  hostel: {},
  floorNameList: [],
  floorName: {},
  roomNo: '',
  noOfBed: '',
  status: {},
};

const AddRoomDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addHostelRoomApi] = useAddHostelRoomMutation();
  const [updateHostelRoomApi] = useUpdateHostelRoomMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item) ? 'Edit Room Details' : 'Add Room Details',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getBipardCenter();

    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] || {};

    // SET LOCATION
    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,
    }));

    // Load hostel list first
    getHostelName(selectedLocation.name);

    // Load floors AFTER hostel list is ready
    setTimeout(() => {
      getFloorName(item.selectHostelNameId, selectedLocation.name);

      // Now final prefill
      setForm((prev: any) => ({
        ...prev,

        hostel: {
          id: item.selectHostelNameId,
          name: item.selectHostelName,
        },

        floorName: {
          id: item.selectFloorNameId,
          name: item.selectFloorName,
        },

        roomNo: item.roomNo?.toString() || '',
        noOfBed: item.noOfBed?.toString() || '',

        status: {
          id: item.status,
          value: item.status,
        },
      }));
    }, 400);
  }, [item]);

  const schema = Yup.object().shape({
    status: isNullUndefined(item)
      ? Yup.object({
          id: Yup.string().required('Status is required'),
        })
      : Yup.mixed().notRequired(),
    noOfBed: Yup.string().required('Number of bed is required'),
    roomNo: Yup.string().required('Room no is required'),
    floorName: Yup.object({
      id: Yup.string().required('Floor name is required'),
    }),
    hostel: Yup.object({
      id: Yup.string().required('Hostel name is required'),
    }),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateRoomDetails();
      } else {
        addRoomDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addRoomDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      selectFloorName: form.floorName.id,
      selectHostelNameShow: '',
      selectFloorNameShow: '',
      roomNo: form.roomNo,
      noOfBed: form.noOfBed,
      status: form.status.id,
    };

    addHostelRoomApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.RoomDetails,
              },
            ],
          }),
        );
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };
  const updateRoomDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      selectFloorName: form.floorName.id,
      selectHostelNameShow: '',
      selectFloorNameShow: '',
      roomNo: form.roomNo,
      noOfBed: form.noOfBed,
      status: form.status.id,
    };

    updateHostelRoomApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.RoomDetails,
              },
            ],
          }),
        );
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };
  const getBipardCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bipardLocationList', res.data);
        if (!item) {
          if (tenantId === 1) {
            setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
            getHostelName('Gaya');
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
            getHostelName('Patna');
          }
        }

        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getHostelName = (id: any) => {
    setLoader(true);
    const params = {
      bipardCentre: [id],
      listType: 'select_hostel_name_for_room_details',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('hostelList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getFloorName = (hostelId: any, centreName: string) => {
    setLoader(true);

    const params = {
      bipardCentre: [centreName],
      listType: 'select_floor_name_for_room_details',
      replacements: ['%%', hostelId],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('floorNameList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={'Bipard Location'}
          placeholder={'Bipard Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Bipard Location',
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocationList,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                  hostel: {},
                  floorName: {},
                }));
                getHostelName(data.name);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Hostel Name'}
          placeholder={'Hostel Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Hostel Name',
              Data: form.hostelList,
              selectedData: form.hostel,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  hostel: data,
                  floorName: {},
                }));
                getFloorName(data.id, form.bipardLocation.name);
                setErrors({ ...errors, 'hostel.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.hostel?.name}
          isMandatory
          errorMessage={errors['hostel.id']}
        />
        <DropDownOrganism
          label={'Floor Name'}
          placeholder={'Floor Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Floor Name',
              Data: form.floorNameList,
              selectedData: form.floorName,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  floorName: data,
                }));

                setErrors({ ...errors, 'floorName.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.floorName?.name}
          isMandatory
          errorMessage={errors['floorName.id']}
        />
        <TextInputOrganisms
          label={'Room Number'}
          placeholder={'Room Number'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.roomNo}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('roomNo', normalizeNumber(val));
            setErrors({ ...errors, roomNo: '' });
          }}
          isMandatory
          errorMessage={errors.roomNo}
          maxLength={3}
          keyboardType="numeric"
        />

        <TextInputOrganisms
          label={'No Of Bed'}
          placeholder={'No Of Bed'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.noOfBed}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('noOfBed', normalizeNumber(val));
            setErrors({ ...errors, noOfBed: '' });
          }}
          isMandatory
          errorMessage={errors.noOfBed}
          maxLength={2}
          keyboardType="numeric"
        />

        {isNullUndefined(item) && (
          <RadioSelectableOrganism
            data={[
              { id: 'Active', value: 'Active' },
              { id: 'Inactive', value: 'Inactive' },
            ]}
            onSelect={(item: any) => {
              setValue('status', item);
              setErrors({ ...errors, 'status.id': '' });
            }}
            label={'Status'}
            selectedType={form.status}
            typeName={'value'}
            typeId={'id'}
            isMandatory
            errorMessage={errors['status.id']}
          />
        )}
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddRoomDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  uploadBtn: {
    borderWidth: 1,
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(320),
    alignSelf: 'center',
    backgroundColor: colors.backgroundColor,
    marginBottom: vh(10),
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey_1,
    fontSize: vw(14),
  },
  instructionText: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(4),
  },
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
    marginBottom: vh(8),
  },
});
