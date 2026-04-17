import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  FormFieldWrapper,
  FormTextInputWithTitle,
} from '../../../../../../components/templates';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';

interface Props {
  form: any;
  errors: any;
  setValue: (key: string, value: any) => void;
  setErrors: (errors: any) => void;
  isManual: boolean;
  showOtp: boolean;
  otpTimer: number;
  onGetOtp: () => void;
}

const AddTraineeRegistration_3 = ({
  form,
  errors,
  setValue,
  setErrors,
  isManual,
  showOtp,
  otpTimer,
  onGetOtp,
}: Props) => {
  return (
    <FormFieldWrapper>
      <View style={styles.verifyCard}>
        <TextAtom style={styles.verifySubTitle}>
          Review your information before submitting
        </TextAtom>
      </View>

      {isManual && showOtp ? (
        <>
          <FormTextInputWithTitle
            title="OTP"
            placeholder="Enter 4 digit OTP"
            value={form.otp}
            onChangeText={(val: string) => {
              setValue('otp', normalizeNumber(val));
              setErrors({ ...errors, otp: '' });
            }}
            isMandatory
            errorMessage={errors.otp}
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity
            style={[
              styles.otpBtn,
              { backgroundColor: otpTimer > 0 ? colors.grey : colors.primary },
            ]}
            onPress={otpTimer > 0 ? undefined : onGetOtp}
            activeOpacity={0.85}
          >
            <TextAtom style={styles.otpBtnText}>
              {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Get OTP'}
            </TextAtom>
          </TouchableOpacity>
        </>
      ) : null}
    </FormFieldWrapper>
  );
};

export default AddTraineeRegistration_3;

const styles = StyleSheet.create({
  otpBtn: {
    width: vw(120),
    borderRadius: vw(6),
    paddingVertical: vh(8),
    alignItems: 'center',
    marginLeft: vw(8),
  },
  otpBtnText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
  verifyCard: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(4),
    borderRadius: vw(10),
    marginBottom: vh(10),
  },
  verifySubTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
});
