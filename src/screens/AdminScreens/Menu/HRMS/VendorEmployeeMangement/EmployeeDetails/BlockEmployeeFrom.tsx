import { StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';

import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import { useHrmsBlacklistingEmployeeMutation } from '../../../../../../injectEndpoints/hrmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const BlockEmployeeFrom = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [blacklistingApi] = useHrmsBlacklistingEmployeeMutation();

  const [loader, setLoader] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [form, setForm] = useState<any>({
    otp: '',
    reason: '',
  });

  const [errors, setErrors] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      item?.isBlacklisted === 'Yes' ? 'Unblock Employee' : 'Block Employee',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    if (!item) return;

    if (item.isBlacklisted === 'Yes') {
      setForm((prev: any) => ({
        ...prev,
        reason: item.reasonForBlacklisting ?? '',
      }));
    }
  }, [item]);

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    otp: Yup.string().required('OTP is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      item?.isBlacklisted === 'Yes' ? unblock() : block();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const block = () => {
    setLoader(true);
    const params = {
      employeeId: item.id,
      apiFor: form.selectedOption.id === 'BLOCKED',
      otp: form.otp,
      reasonForBlacklisting: form.reason,
    };
    blacklistingApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({ type: 'success', text2: res.data.message });
        setLoader(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const unblock = () => {
    setLoader(true);
    const params = {
      employeeId: item.id,
      apiFor: 'UNBLOCK',
      otp: form.otp,
      reasonForUnblocking: form.reason,
    };

    blacklistingApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({ type: 'success', text2: res.data.message });
        setLoader(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const handleGetOtp = () => {
    if (otpTimer > 0) return;

    let apiFor = '';

    if (item?.isBlacklisted === 'No') {
      apiFor = 'SEND_BLOCKING_OTP';
    }

    if (item?.isBlacklisted === 'Yes') {
      apiFor = 'SEND_UNBLOCKING_OTP';
    }

    setLoader(true);

    const params = {
      employeeId: item.id,
      apiFor,
    };

    blacklistingApi(params)
      .unwrap()
      .then(res => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setOtpTimer(60);
        setLoader(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <TextAtom numberOfLines={0} style={styles.vendorName}>
        Vendor Name:
        <TextAtom numberOfLines={0} style={styles.vendorLabel}>
          {item?.name ?? '-'}
        </TextAtom>
      </TextAtom>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentScroll}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TextInputOrganisms
          label="OTP"
          placeholder="OTP"
          ref={input1_ref}
          value={form.otp}
          onChangeText={(val: string) => {
            setValue('otp', normalizeNumber(val));
            setErrors({ ...errors, otp: '' });
          }}
          maxLength={4}
          keyboardType="numeric"
          isMandatory
          errorMessage={errors.otp}
        />

        <TextAtom
          style={[
            styles.otpBtn,
            {
              backgroundColor: otpTimer > 0 ? colors.grey : colors.primary,
            },
          ]}
          onPress={otpTimer > 0 ? undefined : handleGetOtp}
        >
          {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Get OTP on Email'}
        </TextAtom>

        <TextInputOrganisms
          label="Reason"
          placeholder="Reason"
          ref={input2_ref}
          value={form.reason}
          onChangeText={(val: string) => {
            setValue('reason', val);
            setErrors({ ...errors, reason: '' });
          }}
          isMandatory
          errorMessage={errors.reason}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={item?.isBlacklisted === 'Yes' ? 'Unblock' : 'Block'}
      />
    </SafeAreaView>
  );
};

export default BlockEmployeeFrom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  otpBtn: {
    color: colors.white,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    width: vw(110),
    borderRadius: vw(4),
    textAlign: 'center',
    paddingVertical: vh(4),
    marginBottom: vh(8),
    alignSelf: 'flex-start',
    marginLeft: vh(15),
  },
  vendorLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.grey,
    marginLeft: vh(15),
    marginBottom: vh(5),
  },

  vendorName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(15),
    color: colors.black,
    marginLeft: vh(15),
    marginBottom: vh(5),
  },
});
