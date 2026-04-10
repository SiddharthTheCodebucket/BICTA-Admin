// components/form/FormFieldWrapper.tsx
import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vw, vh } from '../../constants';

type Props = {
  children: React.ReactNode;
};

const FormFieldWrapper = ({ children }: Props) => {
  return (
    <View
      style={{
        borderRadius: vw(16),
        backgroundColor: colors.white,
        padding: vw(8),
      }}
    >
      {children}
    </View>
  );
};

export default FormFieldWrapper;
