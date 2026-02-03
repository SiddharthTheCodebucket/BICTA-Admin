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
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';
import {
  useConferenceAddConferenceMutation,
  useConferenceUpdateConferenceMutation,
} from '../../../../../../injectEndpoints/conferenceManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  conferenceName: '',
  desc: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  status: {},
};

const AddConferenceForm = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useConferenceAddConferenceMutation();
  const [updateApi] = useConferenceUpdateConferenceMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Conference Data' : 'Update Conference Data',
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

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: locationMap[item.tenantId],

      conferenceName: item.name || '',
      desc: item.description || '',

      startDate: moment(item.fromDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
      endDate: moment(item.toDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),

      startTime: moment(item.fromTime, 'HH:mm:ss').format('hh:mm A'),
      endTime: moment(item.toTime, 'HH:mm:ss').format('hh:mm A'),

      status: { id: item.status, value: item.status },
    }));
  }, [item]);

  const schema = Yup.object().shape({
    status: isNullUndefined(item)
      ? Yup.object({
          id: Yup.string().required('Status is required'),
        })
      : Yup.mixed().notRequired(),
    endDate: Yup.string().required('End Date is required'),
    startDate: Yup.string().required('Start Date is required'),
    desc: Yup.string().required('Description is required'),

    conferenceName: Yup.string().required('Conference Name is required'),

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
        updateDetails();
      } else {
        addDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    const toApiTime = (time: string) =>
      moment(time, 'hh:mm A').format('HH:mm:ss');
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      name: form.conferenceName,
      description: form.desc,
      fromDate: moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      fromTime: toApiTime(form.startTime),
      toDate: moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      toTime: toApiTime(form.endTime),
      status: form.status?.id,
    };

    addApi(params)
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

  const updateDetails = () => {
    const toApiTime = (time: string) =>
      moment(time, 'hh:mm A').format('HH:mm:ss');
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      name: form.conferenceName,
      description: form.desc,
      fromDate: moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      fromTime: toApiTime(form.startTime),
      toDate: moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      toTime: toApiTime(form.endTime),
      status: form.status?.id,
    };

    updateApi(params)
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
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
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
                }));

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

        <TextInputOrganisms
          label={'Conference Name'}
          placeholder={'Conference Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref?.current?.focus()}
          value={form.conferenceName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('conferenceName', val);
            setErrors({ ...errors, conferenceName: '' });
          }}
          isMandatory
          errorMessage={errors.conferenceName}
        />

        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.numberOfParticipants}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('desc', val);
            setErrors({ ...errors, desc: '' });
          }}
          isMandatory
          errorMessage={errors.desc}
        />

        <DateInputOrganism
          label={strings.blockedForm.startDate}
          placeholder={strings.blockedForm.startDate}
          value={form.startDate}
          returnType="date"
          onChangeText={(val: Date) => {
            setValue('startDate', moment(val).format('DD-MM-YYYY'));
            setValue('startTime', moment(val).format('hh:mm A'));
            setErrors({ ...errors, startDate: '' });
          }}
          fieldName="datetime"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.startDate}
        />
        <TextInputOrganisms
          label={'Start Time'}
          placeholder={'Start Time'}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.startTime}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />
        <DateInputOrganism
          label={strings.blockedForm.endDate}
          placeholder={strings.blockedForm.endDate}
          value={form.endDate}
          fieldName="datetime"
          returnType="date"
          dateFormat="DD-MM-YYYY"
          onChangeText={(val: Date) => {
            console.log(val);
            setValue('endDate', moment(val).format('DD-MM-YYYY'));
            setValue('endTime', moment(val).format('hh:mm A'));
            setErrors({ ...errors, endDate: '' });
          }}
          minDate={
            form.startDate
              ? moment(form.startDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
          isMandatory
          errorMessage={errors.endDate}
        />
        <TextInputOrganisms
          label={'End Time'}
          placeholder={'End Time'}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.endTime}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />
        <RadioSelectableOrganism
          data={[
            {
              id: 'Upcoming',
              value: 'Upcoming',
            },
            {
              id: 'Over',
              value: 'Over',
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

export default AddConferenceForm;

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
