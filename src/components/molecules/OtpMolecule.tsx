import {StyleSheet} from 'react-native';
import React, {forwardRef} from 'react';
import {colors, fonts, vh, vw} from '../../constants';
import TextInputAtom from '../atoms/TextInputAtom';

const OtpMolecule = (props: any, ref: any) => {
  return (
    <TextInputAtom
      ref={ref}
      maxLength={props.maxLength}
      value={props.value}
      textInputStyle={{
        ...styles.otpBox,
        ...props.style,
        borderWidth: vw(1),
        borderColor: props.value ? colors.primary : colors.grey_1,
      }}
      keyboardType={props?.keyboardType}
      returnKeyType={props.returnKeyType}
      onKeyPress={props.onKeyPress}
      editable={props.editable}
      onChangeText={props.onChangeText}
      onSubmitEditing={props.onSubmitEditing}
      selectionColor={colors.primary}
      secureTextEntry={false}
    />
  );
};

export default forwardRef(OtpMolecule);

const styles = StyleSheet.create({
  otpBox: {
    width: vw(70),
    height: vh(48),
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(4),
    textAlign: 'center',
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
  },
});
