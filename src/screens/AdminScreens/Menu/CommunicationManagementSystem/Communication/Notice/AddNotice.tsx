import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddBedDetailsRoomMutation,
  useUpdateBedDetailsRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  trainingList: [],
  selectedTraining: {},
  categoryList: [],
  selectedCategory: {},
  title: '',
  desc: '',
  file: {},
  startDate: '',
  endDate: '',
  status: {},
};

const AddBedDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addBedDetailsmApi] = useAddBedDetailsRoomMutation();
  const [updateBedDetailsApi] = useUpdateBedDetailsRoomMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? strings.hostelManagement.addBedDetails.addTitle
        : strings.hostelManagement.addBedDetails.editTitle,
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

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,
      bedName: item.bedName || '',
      status: {
        id: item.status,
        value: item.status,
      },
    }));

    getHostelName(selectedLocation.name);

    setTimeout(() => {
      setForm((prev: any) => ({
        ...prev,
        hostel: {
          id: item.selectHostelNameId,
          name: item.selectHostelName,
        },
      }));

      getFloorName(item.selectHostelNameId, selectedLocation.name);
    }, 300);

    setTimeout(() => {
      setForm((prev: any) => ({
        ...prev,
        floorName: {
          id: item.selectFloorNameId,
          name: item.selectFloorName,
        },
      }));

      getRoomName(item.selectFloorNameId, selectedLocation.name);
    }, 600);

    setTimeout(() => {
      setForm((prev: any) => ({
        ...prev,
        room: {
          id: item.selectRoomNoId,
          name: item.selectRoomNo,
        },
      }));
    }, 900);
  }, [item]);

  const schema = Yup.object().shape({
    status: isNullUndefined(item)
      ? Yup.object({
          id: Yup.string().required('Status is required'),
        })
      : Yup.mixed().notRequired(),
    bedName: Yup.string().required(
      strings.hostelManagement.addBedDetails.required.bedName,
    ),
    room: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.room,
      ),
    }),
    floorName: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.floor,
      ),
    }),
    hostel: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.hostel,
      ),
    }),
    bipardLocation: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.location,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateBedDetails();
      } else {
        addBedDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addBedDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      selectFloorName: form.floorName.id,
      selectRoomNo: form.room.id,
      selectHostelNameShow: '',
      selectFloorNameShow: '',
      selectRoomNoShow: '',
      bedName: form.bedName,
      status: form.status.id,
    };

    addBedDetailsmApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
        setLoader(false);
      });
  };
  const updateBedDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      selectFloorName: form.floorName.id,
      selectRoomNo: form.room.id,
      selectHostelNameShow: '',
      selectFloorNameShow: '',
      selectRoomNoShow: '',
      bedName: form.bedName,
      status: form.status.id,
    };

    updateBedDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
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
      listType: 'select_hostel_name_for_bed_details',
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
      listType: 'select_floor_name_for_bed_details',
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

  const getRoomName = (floorId: any, centreName: string) => {
    setLoader(true);

    const params = {
      bipardCentre: [centreName],
      listType: 'select_room_no_for_bed_details',
      replacements: ['%%', form.hostel.id, floorId],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('roomList', res.data);
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
        style={styles.flex1}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={strings.hostelManagement.addBedDetails.bipardLocation}
          placeholder={strings.hostelManagement.addBedDetails.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.bipardLocation,
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
                  room: {},
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
          label={'Training'}
          placeholder={'Training'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training',
              Data: form.trainingList,
              selectedData: {},
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  hostel: data,
                  floorName: {},
                  room: {},
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
          label={'Category'}
          placeholder={'Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.floorName,
              Data: form.floorNameList,
              selectedData: form.floorName,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  floorName: data,
                }));
                getRoomName(data.id, form.bipardLocation.name);
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

        <DropDownOrganism
          label={strings.hostelManagement.addBedDetails.room}
          placeholder={strings.hostelManagement.addBedDetails.room}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.room,
              Data: form.roomList,
              selectedData: form.room,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  room: data,
                }));
                setErrors({ ...errors, 'room.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.room?.name}
          isMandatory
          errorMessage={errors['room.id']}
        />
        <TextInputOrganisms
          label={strings.hostelManagement.addBedDetails.bedName}
          placeholder={strings.hostelManagement.addBedDetails.bedName}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.bedName}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('bedName', val);
            setErrors({ ...errors, bedName: '' });
          }}
          isMandatory
          errorMessage={errors.bedName}
        />
        {isNullUndefined(item) && (
          <RadioSelectableOrganism
            data={[
              {
                id: strings.hostelManagement.addBedDetails.active,
                value: strings.hostelManagement.addBedDetails.active,
              },
              {
                id: strings.hostelManagement.addBedDetails.inactive,
                value: strings.hostelManagement.addBedDetails.inactive,
              },
            ]}
            onSelect={(item: any) => {
              setValue('status', item);
              setErrors({ ...errors, 'status.id': '' });
            }}
            label={strings.hostelManagement.addBedDetails.status}
            selectedType={form.status}
            typeName={'value'}
            typeId={'id'}
            isMandatory
            errorMessage={errors['status.id']}
          />
        )}
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={
          item
            ? strings.hostelManagement.addBedDetails.update
            : strings.hostelManagement.addBedDetails.add
        }
      />
    </SafeAreaView>
  );
};

export default AddBedDetails;

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
  flex1: {
    flex: 1,
  },
});
