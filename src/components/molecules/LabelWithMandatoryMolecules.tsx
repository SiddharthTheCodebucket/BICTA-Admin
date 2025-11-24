import { StyleSheet, TextStyle } from 'react-native';
import React from 'react';
import { isNullUndefined } from '../../utils/CommonFunction';
import { colors, fonts, vw } from '../../constants';
import TextAtom from '../atoms/TextAtom';

interface IProps {
  label?: string;
  isMandatory?: boolean;
  labelStyle?: TextStyle;
}

const LabelWithMandatoryMolecules = ({
  label,
  isMandatory,
  labelStyle,
}: IProps) => {
  return (
    <>
      {!isNullUndefined(label) && (
        <TextAtom style={[styles.labelStyle, labelStyle]} numberOfLines={2}>
          {label}
          {isMandatory && <TextAtom style={styles.mandatoryStar}>*</TextAtom>}
        </TextAtom>
      )}
    </>
  );
};

export default LabelWithMandatoryMolecules;

const styles = StyleSheet.create({
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
  },
  mandatoryStar: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
    color: colors.red,
  },
});
