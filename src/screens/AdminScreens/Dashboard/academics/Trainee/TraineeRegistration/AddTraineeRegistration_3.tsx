/* eslint-disable eslint-comments/no-unused-disable, no-unreachable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import {
  FormFieldWrapper,
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';

interface Props {
  form: any;
  errors: any;
  showOtp: boolean;
  otpTimer: number;
  showOtpModal: boolean;
  onCloseOtpModal: () => void;
  onOtpChange: (val: string) => void;
  onResendOtp: () => void;
  onVerifyOtp: () => void;
}

const maskEmail = (email?: string) => {
  if (!email) return 'a***d@abcd.com';

  const [localPart = '', domain = ''] = email.split('@');
  if (!localPart || !domain) return email;
  if (localPart.length <= 2) return `${localPart[0] || ''}***@${domain}`;

  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

const formatResendOtpText = (otpTimer: number) => {
  const mins = Math.floor(otpTimer / 60)
    .toString()
    .padStart(2, '0');
  const secs = (otpTimer % 60).toString().padStart(2, '0');

  return `Resend OTP in ${mins}:${secs} sec`;
};

const AddTraineeRegistration_3 = ({
  form,
  errors,
  showOtp,
  otpTimer,
  showOtpModal,
  onCloseOtpModal,
  onOtpChange,
  onResendOtp,
  onVerifyOtp,
}: Props) => {
  const otpDigits = Array.from(
    { length: 4 },
    (_, index) => form.otp?.[index] || '',
  );
  const maskedEmail = maskEmail(form.officeEmail);

  return (
    <FormFieldWrapper>
      <View style={styles.reviewCard}>
        <TextAtom style={styles.fieldTitle}>
          Mobile Number<TextAtom style={styles.mandatory}>*</TextAtom>
        </TextAtom>
        <View style={styles.inputLikeBox}>
          <TextAtom style={styles.countryCode}>+91</TextAtom>
          <View style={styles.divider} />
          <TextAtom style={styles.inputValue}>
            {form.mobileNumber || '912345 00001'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <TextAtom style={styles.fieldTitle}>
          Office Email<TextAtom style={styles.mandatory}>*</TextAtom>
        </TextAtom>
        <View style={styles.inputLikeBox}>
          <TextAtom style={styles.inputValue}>
            {form.officeEmail || 'hello@abcd.com'}
          </TextAtom>
        </View>
      </View>

      {showOtp ? (
        <AdminBottomModal
          visible={showOtpModal}
          onClose={onCloseOtpModal}
          title="OTP Verification"
          sheetStyle={styles.modalSheet}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.pullIndicator} />

          <TextAtom style={styles.modalLabel}>Enter OTP</TextAtom>
          <TextAtom style={styles.modalSubText}>
            Enter the security code sent on {maskedEmail}
          </TextAtom>

          <View style={styles.otpRow}>
            {otpDigits.map((digit, index) => (
              <View style={styles.otpBox} key={`otp-${index}`}>
                <TextAtom style={styles.otpBoxText}>{digit}</TextAtom>
              </View>
            ))}
          </View>

          <TextInput
            value={form.otp}
            onChangeText={(val: string) => onOtpChange(normalizeNumber(val))}
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            style={styles.hiddenInput}
          />

          {!!errors.otp && (
            <TextAtom style={styles.errorText}>{errors.otp}</TextAtom>
          )}

          <View style={styles.resendRow}>
            <TextAtom style={styles.resendHint}>Did not get the OTP?</TextAtom>
            <TextAtom
              style={[
                styles.resendText,
                otpTimer > 0 ? styles.resendTextDisabled : null,
              ]}
              onPress={otpTimer > 0 ? undefined : onResendOtp}
            >
              {otpTimer > 0 ? formatResendOtpText(otpTimer) : 'Resend OTP'}
            </TextAtom>
          </View>

          <View style={styles.modalActions}>
            <View style={styles.modalSecondaryButton}>
              <FormWhiteButton title="Cancel" onPress={onCloseOtpModal} />
            </View>
            <View style={styles.modalPrimaryButton}>
              <FormGradientButton title="Verify" onPress={onVerifyOtp} />
            </View>
          </View>
        </AdminBottomModal>
      ) : null}
    </FormFieldWrapper>
  );
};

export default AddTraineeRegistration_3;

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: vw(16),
    padding: vw(14),
    marginBottom: vh(12),
  },
  fieldTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(13),
    color: '#6B7280',
    marginBottom: vh(10),
  },
  mandatory: {
    color: colors.red,
  },
  inputLikeBox: {
    minHeight: vh(44),
    borderRadius: vw(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(12),
  },
  countryCode: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  divider: {
    width: 1,
    height: vh(20),
    backgroundColor: '#D1D5DB',
    marginHorizontal: vw(10),
  },
  inputValue: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.black,
  },
  modalSheet: {
    paddingTop: vh(10),
  },
  modalContent: {
    paddingBottom: vh(6),
  },
  pullIndicator: {
    width: vw(68),
    height: vh(5),
    borderRadius: 999,
    backgroundColor: '#1F2937',
    alignSelf: 'center',
    marginBottom: vh(18),
  },
  modalLabel: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
    marginBottom: vh(4),
  },
  modalSubText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: '#6B7280',
    marginBottom: vh(18),
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: vw(10),
    marginBottom: vh(16),
  },
  otpBox: {
    width: vw(34),
    height: vw(34),
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  otpBoxText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.black,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.red,
    textAlign: 'center',
    marginBottom: vh(10),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(18),
  },
  resendHint: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: '#6B7280',
  },
  resendText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(12),
    color: '#D9A441',
  },
  resendTextDisabled: {
    color: '#D9A441',
  },
  modalActions: {
    flexDirection: 'row',
    gap: vw(10),
  },
  modalSecondaryButton: {
    flex: 1,
  },
  modalPrimaryButton: {
    flex: 1,
  },
});
