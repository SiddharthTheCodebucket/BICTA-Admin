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
  useAddHostelFloorMutation,
  useUpdateHostelFloorMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  hostelList: [],
  hostel: {},
  genderTypeList: [],
  genderType: {},
  nameOfFloor: '',
  noOfRooms: '',
};

const AddFloorDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addHostelFloorApi] = useAddHostelFloorMutation();
  const [updateHostelFloorApi] = useUpdateHostelFloorMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item) ? 'Edit Floor Details' : 'Add Floor Details',
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

    getHostelName(selectedLocation.name);
    getGenderTypeName(selectedLocation.name);

    setForm((prev: any) => ({
      ...prev,

      bipardLocation: selectedLocation,

      hostel: {
        id: item.selectHostelNameId,
        name: item.selectHostelName,
      },

      genderType: {
        id: item.floorType,
        name: item.floorType,
      },

      nameOfFloor: item.nameOfFloors ?? '',
      noOfRooms: item.noOfRooms?.toString() ?? '',
    }));
  }, [item]);

  const schema = Yup.object().shape({
    noOfRooms: Yup.string().required('Number of room is required'),
    nameOfFloor: Yup.string().required('Name of floor is required'),
    genderType: Yup.object({
      id: Yup.string().required('Floor gender type is required'),
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
        updateFloorDetails();
      } else {
        addFloorDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addFloorDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      nameOfFloors: form.nameOfFloor,
      noOfRooms: form.noOfRooms,
      selectHostelNameShow: '',
      floorType: form.genderType.id,
    };

    addHostelFloorApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.FloorDetails,
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
  const updateFloorDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      nameOfFloors: form.nameOfFloor,
      noOfRooms: form.noOfRooms,
      selectHostelNameShow: '',
      floorType: form.genderType.id,
    };

    updateHostelFloorApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.FloorDetails,
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
      listType: 'select_hostel_name_for_floor_details',
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

  const getGenderTypeName = (id: any) => {
    setLoader(true);
    const params = {
      bipardCentre: [id],
      listType: 'select_floor_type_for_floor_details',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('genderTypeList', res.data);
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
                  genderType: {},
                }));
                getHostelName(data.name);
                getGenderTypeName(data.name);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
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
                }));

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
          label={'Floor Gender Type'}
          placeholder={'Floor Gender Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Floor Gender Type',
              Data: form.genderTypeList,
              selectedData: form.genderType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  genderType: data,
                }));

                setErrors({ ...errors, 'genderType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.genderType?.name}
          isMandatory
          errorMessage={errors['genderType.id']}
        />
        <TextInputOrganisms
          label={'Name Of Floor'}
          placeholder={'Name of floor'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.nameOfFloor}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('nameOfFloor', val);
            setErrors({ ...errors, nameOfFloor: '' });
          }}
          isMandatory
          errorMessage={errors.nameOfFloor}
        />

        <TextInputOrganisms
          label={'No Of Rooms'}
          placeholder={'No Of Rooms'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.noOfRooms}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('noOfRooms', normalizeNumber(val));
            setErrors({ ...errors, noOfRooms: '' });
          }}
          isMandatory
          errorMessage={errors.noOfRooms}
          maxLength={2}
          keyboardType="numeric"
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddFloorDetails;

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
