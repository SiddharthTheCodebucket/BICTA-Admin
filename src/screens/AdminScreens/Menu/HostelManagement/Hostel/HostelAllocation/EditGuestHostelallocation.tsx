import { Keyboard, StyleSheet } from 'react-native';
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
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useHostelAllocationMutation,
  useUpdateHostelAllocationMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  emailId: '',
  genderList: [
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' },
    { id: 'Both', name: 'Both' },
  ],
  gender: {},
  checkInDate: '',
  checkOutDate: '',
  hostelList: [],
  hostel: {},
  newRoomList: [],
  newRoom: {},
  newBedList: [],
  newBed: {},
  purpose: '',
};

const EditGuestHostelallocation = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [hostelAllocationApi] = useHostelAllocationMutation();
  const [updateHostelAllocationApi] = useUpdateHostelAllocationMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Hostel Allocation Request');
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
  }, []);
  useEffect(() => {
    if (!item) return;

    // let preEmail = item.officeEmail || item.mobileNo || "";
    setValue('emailId', '');

    const genderObj =
      form.genderList.find((g: any) => g?.id === item.guestGender) || {};
    setValue('gender', genderObj);

    setValue(
      'checkInDate',
      item.guestCheckInDate
        ? moment(item.guestCheckInDate).format('DD-MM-YYYY')
        : '',
    );
    setValue(
      'checkOutDate',
      item.guestCheckOutDate
        ? moment(item.guestCheckOutDate).format('DD-MM-YYYY')
        : '',
    );

    const hostelObj = {
      id: item.hostelNameId,
      name: item.hostelName,
    };
    setValue('hostel', hostelObj);

    getRoomList(item.hostelNameId);

    setValue('purpose', item.purpose || '');

    const allocatedRoomObj = { id: item.roomNoId, name: item.roomNo };
    const allocatedBedObj = { id: item.bedNameId, name: item.bedName };

    setForm((prev: any) => ({
      ...prev,

      allocatedRoom: allocatedRoomObj,
      allocatedBed: allocatedBedObj,
    }));
  }, [item, form.genderList]);

  const isEmail = (val: string) => /\S+@\S+\.\S+/.test(val);
  const isNumeric = (val: string) => /^[0-9]+$/.test(val);

  const schema = Yup.object().shape({
    purpose: Yup.string().required('Purpose is required'),
    newBed: Yup.object({
      id: Yup.string().required('New bed is required'),
    }),
    newRoom: Yup.object({
      id: Yup.string().required('New room is required'),
    }),
    hostel: Yup.object({
      id: Yup.string().required('Hostel is required'),
    }),
    checkOutDate: Yup.string().required('Check out date is required'),
    checkInDate: Yup.string().required('Check in date is required'),
    gender: Yup.object({
      id: Yup.string().required('Gender is required'),
    }),
    emailId: Yup.string()
      .required('Guest Id / Email Id is required')
      .test('valid-id', 'Enter valid Email or Guest Id', (value: any) => {
        if (!value) return false;

        return isEmail(value) || isNumeric(value);
      }),
  });

  const onSubmit = () => {
    try {
      if (item) {
        updateHostelAllocationDetails();
        return;
      }

      schema.validateSync(form);
      addHostelAllocationDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addHostelAllocationDetails = () => {
    setLoader(true);

    let params: any = {
      checkInDate: moment(form.checkInDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      checkOutDate: moment(form.checkOutDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      hostelName: form.hostel.id,
      roomNo: form.newRoom.id,
      bedName: form.newBed.id,
      purpose: form.purpose,
    };

    if (isNumeric(form.emailId)) {
      params.guestId = form.emailId;
    } else {
      params.guestEmailId = form.emailId;
    }

    hostelAllocationApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.HostelAllocation,
              },
            ],
          }),
        );

        Toast.show({ type: 'success', text2: res.data.message });
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

  const updateHostelAllocationDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      hostelName: form.hostel.id,
      roomNo: form.newRoom.id ?? null,
      roomNameShow: form.allocatedRoom.name ?? '',
      bedName: form.newBed.id ?? null,
      bedNameShow: form.allocatedBed.name ?? '',
      purpose: form.purpose,
      traineeId: '',
      guestId: '',
      guestEmailId: '',
      keyProvided: item.keyProvided,
      yogaMatProvided: item.yogaMatProvided,
      trainingCenter: [],
      requestType: 'GUEST',
      checkInDate: moment(form.checkInDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      checkOutDate: moment(form.checkOutDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      genderId: form.genderId ?? 'Male',
    };

    updateHostelAllocationApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.HostelAllocation,
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

  const getHostelName = () => {
    setLoader(true);
    const params = {
      bipardCentre: [],
      listType: 'select_hostel_name_for_guest_allocation',
      replacements: [null, null, '%%'],
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

  const getRoomList = (hostelId: any) => {
    setLoader(true);

    const params = {
      bipardCentre: [],
      listType: 'select_room_no_for_guest_allocation',
      replacements: [null, null, '%%', hostelId, form.gender.id],
    };

    commonDropdownApi(params)
      .unwrap()
      .then(res => {
        setValue('newRoomList', res.data);

        if (item && res.data?.length > 0) {
          const selectedRoom = res.data.find(
            (r: any) => r.id === item.roomNoId,
          );
          if (selectedRoom) {
            setValue('newRoom', selectedRoom);
            getBedList(hostelId, selectedRoom.id);
          }
        }

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
      listType: 'select_bed_name_for_guest_allocation',
      replacements: [null, null, null, null, '%%', hostelId, roomId],
    };

    commonDropdownApi(params)
      .unwrap()
      .then(res => {
        const availableBeds = (res.data || []).filter(
          (b: any) => b.isAvailable === 'Yes',
        );

        setValue('newBedList', availableBeds);

        if (item && availableBeds.length > 0) {
          const selectedBed = availableBeds.find(
            (b: any) => b.id === item.bedNameId,
          );
          if (selectedBed) {
            setValue('newBed', selectedBed);
          }
        }

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
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <TextInputOrganisms
          label={'Guest Id / Email Id'}
          placeholder={'Guest Id / Email Id'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.emailId}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('emailId', val);
            setErrors({ ...errors, emailId: '' });
          }}
          isMandatory
          errorMessage={errors.emailId}
        />

        <DropDownOrganism
          label={'Gender'}
          placeholder={'Gender'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Gender',
              Data: form.genderList,
              selectedData: form.gender,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  gender: data,
                }));

                setErrors({ ...errors, 'gender.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.gender?.name}
          isMandatory
          errorMessage={errors['gender.id']}
        />
        <DateInputOrganism
          label={'Check In Date'}
          placeholder={'Check In Date'}
          value={form.checkInDate}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              checkInDate: val,
            }));
            setErrors({ ...errors, checkInDate: '' });
          }}
          fieldName={'date'}
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.checkInDate}
        />
        <DateInputOrganism
          label={'Check Out Date'}
          placeholder={'Check Out Date'}
          value={form.checkOutDate}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              checkOutDate: val,
            }));
            setErrors({ ...errors, checkOutDate: '' });
          }}
          fieldName={'date'}
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.checkOutDate}
          minDate={
            form.checkInDate
              ? moment(form.checkInDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
        />

        <DropDownOrganism
          label={'Hostel'}
          placeholder={'Hostel'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Hostel',
              Data: form.hostelList,
              selectedData: form.hostel,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  hostel: data,
                  newRoom: {},
                  newBed: {},
                }));
                getRoomList(data.id);
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
        {!isNullUndefined(item) && (
          <TextInputOrganisms
            label={'Allocated Room'}
            placeholder={'Allocated Room'}
            value={form.allocatedRoom?.name}
            disabled
            editable={false}
          />
        )}
        <DropDownOrganism
          label={'New Room'}
          placeholder={'New Room'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'New Room',
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
        {!isNullUndefined(item) && (
          <TextInputOrganisms
            label={'Allocated Bed'}
            placeholder={'Allocated Bed'}
            value={form.allocatedBed?.name}
            disabled
            editable={false}
          />
        )}

        <DropDownOrganism
          label={'New Bed'}
          placeholder={'New Bed'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'New Bed',
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
          label={'Purpose'}
          placeholder={'Purpose'}
          ref={input2_ref}
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

      <ButtonOrganism onPress={onSubmit} bttnText={'Submit'} />
    </SafeAreaView>
  );
};

export default EditGuestHostelallocation;

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
