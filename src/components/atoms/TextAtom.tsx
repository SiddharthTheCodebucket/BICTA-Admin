import React from 'react';
import {Text, StyleSheet, TextProps, TextStyle, StyleProp} from 'react-native';
import {colors, fonts, vh} from '../../constants';

interface TextAtomProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const TextAtom: React.FC<TextAtomProps> = ({
  style,
  numberOfLines = 1,
  children,
  ...rest
}) => {
  return (
    <Text style={[styles.text, style]} numberOfLines={numberOfLines} {...rest}>
      {children}
    </Text>
  );
};

export default TextAtom;

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vh(16),
    color: colors.white,
  },
});
