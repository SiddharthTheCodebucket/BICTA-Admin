import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useUpdateHostelAllocationMutation } from '../../../../../../injectEndpoints/hostelEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  keyProvided: {},
  yogaMatProvided: {},
  bipardLocation: {},
  hostelList: [],
  hostel: {},
  allocatedRoom: '',
  allocatedBed: '',
  newRoomList: [],
  newRoom: {},
  newBedList: [],
  newBed: {},
  purpose: '',
};

const EditTraineeHostelAllocation = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const isAllocated = props.route.params?.isAllocated;
  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [updateHostelAllocationApi] = useUpdateHostelAllocationMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocation.hostelAllocationRequest,
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
    getHostelName();

    const keyProvidedObj = { id: item.keyProvided, name: item.keyProvided };
    const yogaMatObj = { id: item.yogaMatProvided, name: item.yogaMatProvided };

    const allocatedRoomObj = { id: item.roomNoId, name: item.roomNo };
    const allocatedBedObj = { id: item.bedNameId, name: item.bedName };

    getRoomList(item.hostelNameId, item.genderId);
    getBedList(item.hostelNameId, item.roomNoId);

    setForm((prev: any) => ({
      ...prev,
      keyProvided: isAllocated ? keyProvidedObj : {},
      yogaMatProvided: isAllocated ? yogaMatObj : {},

      allocatedRoom: allocatedRoomObj,
      allocatedBed: allocatedBedObj,

      hostel: {
        id: item.hostelNameId,
        name: item.hostelName,
      },

      genderId: item.genderId,
      newRoom: {},
      newBed: {},
      purpose: item.purpose ?? '',
    }));
  }, [item]);

  const schema = Yup.object().shape({
    purpose: Yup.string().required(
      strings.hostelManagement.hostelAllocation.required.purpose,
    ),
    newBed: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.hostelAllocation.required.newBed,
      ),
    }),
    newRoom: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.hostelAllocation.required.newRoom,
      ),
    }),
    hostel: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.hostelAllocation.required.hostel,
      ),
    }),
    yogaMatProvided: Yup.object({
      id: Yup.string().required(
        strings.hostelManagement.hostelAllocation.required.yogaMatProvided,
      ),
    }),
    keyProvided: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.hostelAllocation.required.keyProvided,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      updateHostelAllocationDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const updateHostelAllocationDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      hostelName: form.hostel.id,
      roomNo: form.newRoom.id,
      roomNameShow: form.allocatedRoom ?? '',
      bedName: form.newBed.id,
      bedNameShow: form.allocatedBed ?? '',
      purpose: form.purpose,
      traineeId: '',
      guestId: '',
      guestEmailId: '',
      keyProvided: form.keyProvided.id,
      yogaMatProvided: form.yogaMatProvided.id,
      trainingCenter: [],
      requestType: 'TRAINEE',
      checkInDate: form.courseStartDate,
      checkOutDate: form.courseEndDate,
      genderId: form.genderId ?? 'Male',
    };

    updateHostelAllocationApi(params)
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
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const getHostelName = () => {
    setLoader(true);
    const params = {
      bipardCentre: [],
      listType: 'select_hostel_name_for_allocation',
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

  const getRoomList = (hostelId: any, genderId: any) => {
    setLoader(true);

    const params = {
      bipardCentre: [],
      listType: 'select_room_no_for_allocation',
      replacements: ['%%', hostelId, genderId ?? 'Male'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then(res => {
        setValue('newRoomList', res.data);
        setLoader(false);
      })
      .catch(err => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
      });
  };

  const getBedList = (hostelId: any, roomId: any) => {
    setLoader(true);

    const params = {
      bipardCentre: [],
      listType: 'select_bed_name_for_allocation',
      replacements: [
        item.courseEndDate,
        item.courseStartDate,
        '%%',
        hostelId,
        roomId,
      ],
    };

    commonDropdownApi(params)
      .unwrap()
      .then(res => {
        const availableBeds = (res.data || []).filter(
          (b: any) => b.isAvailable === 'Yes',
        );

        setValue('newBedList', availableBeds);
        setLoader(false);
      })
      .catch(err => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
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
          label={strings.hostelManagement.hostelAllocation.keyProvided}
          placeholder={strings.hostelManagement.hostelAllocation.keyProvided}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.keyProvided,
              Data: [
                {
                  id: 'Yes',
                  name: strings.hostelManagement.hostelAllocation.yes,
                },
                {
                  id: 'No',
                  name: strings.hostelManagement.hostelAllocation.no,
                },
              ],
              selectedData: form.keyProvided,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  keyProvided: data,
                }));

                setErrors({ ...errors, 'keyProvided.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.keyProvided?.name}
          isMandatory
          errorMessage={errors['keyProvided.name']}
        />

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.yogaMatProvided}
          placeholder={
            strings.hostelManagement.hostelAllocation.yogaMatProvided
          }
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.yogaMatProvided,
              Data: [
                {
                  id: 'Yes',
                  name: strings.hostelManagement.hostelAllocation.yes,
                },
                {
                  id: 'No',
                  name: strings.hostelManagement.hostelAllocation.no,
                },
              ],
              selectedData: form.yogaMatProvided,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  yogaMatProvided: data,
                }));
                setErrors({ ...errors, 'yogaMatProvided.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.yogaMatProvided?.name}
          isMandatory
          errorMessage={errors['yogaMatProvided.id']}
        />

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.hostel}
          placeholder={strings.hostelManagement.hostelAllocation.hostel}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.hostel,
              Data: form.hostelList,
              selectedData: form.hostel,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  hostel: data,
                  newRoom: {},
                  newBed: {},
                }));
                getRoomList(data.id, form.genderId);
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
        {isAllocated && (
          <TextInputOrganisms
            label={strings.hostelManagement.hostelAllocation.allocatedRoom}
            placeholder={
              strings.hostelManagement.hostelAllocation.allocatedRoom
            }
            value={form.allocatedRoom?.name}
            disabled
            editable={false}
          />
        )}
        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.newRoom}
          placeholder={strings.hostelManagement.hostelAllocation.newRoom}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.newRoom,
              Data: form.newRoomList,
              selectedData: form.newRoom,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  newRoom: data,
                  newBed: {},
                }));
                getBedList(form.hostel.id, data.id);
                setErrors({ ...errors, 'newRoom.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.newRoom?.name}
          isMandatory
          errorMessage={errors['newRoom.id']}
        />
        {isAllocated && (
          <TextInputOrganisms
            label={strings.hostelManagement.hostelAllocation.allocatedBed}
            placeholder={strings.hostelManagement.hostelAllocation.allocatedBed}
            value={form.allocatedBed?.name}
            disabled
            editable={false}
          />
        )}

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.newBed}
          placeholder={strings.hostelManagement.hostelAllocation.newBed}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.newBed,
              Data: form.newBedList,
              selectedData: form.newBed,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  newBed: data,
                }));

                setErrors({ ...errors, 'newBed.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.newBed?.name}
          isMandatory
          errorMessage={errors['newBed.id']}
        />
        <TextInputOrganisms
          label={strings.hostelManagement.hostelAllocation.purpose}
          placeholder={strings.hostelManagement.hostelAllocation.purpose}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.purpose}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('purpose', val);
            setErrors({ ...errors, purpose: '' });
          }}
          isMandatory
          errorMessage={errors.purpose}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={strings.hostelManagement.hostelAllocation.submit}
      />
    </SafeAreaView>
  );
};

export default EditTraineeHostelAllocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  flex1: {
    flex: 1,
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
