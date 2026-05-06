import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle[];
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const FormWhiteButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
  buttonStyle,
  textStyle,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, containerStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.button, buttonStyle, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.black} />
        ) : (
          <TextAtom style={[styles.text, textStyle]} numberOfLines={1}>
            {title}
          </TextAtom>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default FormWhiteButton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    height: vh(46),
    borderRadius: vw(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
  },
  text: {
    color: colors.black,
    fontSize: vw(16),
    fontFamily: fonts.Inter_Medium,
  },
  disabled: {
    opacity: 0.7,
  },
});
