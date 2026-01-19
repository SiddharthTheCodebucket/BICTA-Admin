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
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { useHrmsCreditLeaveBalanceMutation } from '../../../../../../injectEndpoints/hrmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  levaeTypeList: [],
  selectedLeaveType: {},
  date: '',
  noOfDays: '',
  remark: '',
};

const CreditLeaveBalance = (props: Props) => {
  const { navigation } = props;
  const selectedEmployeeIds = props.route.params?.selectedEmployeeIds || [];

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [creditLeaveApi] = useHrmsCreditLeaveBalanceMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Credit Leave');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getLeaveList();
  }, []);

  const schema = Yup.object().shape({
    remark: Yup.string().required('Remarks is required'),
    noOfDays: Yup.string().required('No of days is required'),
    date: Yup.string().required('Date is required'),
    selectedLeaveType: Yup.object({
      id: Yup.string().required('Leave Type is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params = {
      employeeIds: selectedEmployeeIds,
      creditDate: moment(form.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      credits: [
        {
          leaveTypeId: form.selectedLeaveType.id,
          days: form.noOfDays,
        },
      ],
      remarks: form.remark,
    };
    creditLeaveApi(params)
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

  const getLeaveList = () => {
    setLoader(true);
    const params = {
      listType: 'select_leave_type',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('levaeTypeList', res.data);
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
          label={'Leave Type'}
          placeholder={'Leave Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Leave Type',
              Data: form.levaeTypeList,
              selectedData: form.selectedLeaveType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedLeaveType: data,
                }));

                setErrors({ ...errors, 'selectedLeaveType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedLeaveType?.name}
          isMandatory
          errorMessage={errors['selectedLeaveType.id']}
        />

        <DateInputOrganism
          label={'Date'}
          placeholder={'Date'}
          value={form.date}
          onChangeText={(val: any) => {
            setValue('date', val);
            setErrors({ ...errors, date: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.date}
        />

        <TextInputOrganisms
          label={'Number Of Days'}
          placeholder={'Number Of Days'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref?.current?.focus()}
          value={form.noOfDays}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('noOfDays', val);
            setErrors({ ...errors, noOfDays: '' });
          }}
          isMandatory
          errorMessage={errors.noOfDays}
          maxLength={2}
          keyboardType="numeric"
        />

        <TextInputOrganisms
          label={'Remarks'}
          placeholder={'Remarks'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.remark}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('remark', val);
            setErrors({ ...errors, remark: '' });
          }}
          isMandatory
          errorMessage={errors.remark}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={'Submit'} />
    </SafeAreaView>
  );
};

export default CreditLeaveBalance;

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
