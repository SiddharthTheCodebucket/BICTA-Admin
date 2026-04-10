import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';

type Props = TextInputProps & {
  ref: React.Ref<TextInput>;
  title: string;
  isMandatory?: boolean;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  inputStyle?: TextStyle;
};

const TextInputWithTitle = ({
  ref,
  title,
  isMandatory = false,
  errorMessage,
  containerStyle,
  titleStyle,
  inputStyle,
  ...props
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      <View
        style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.grey_1}
          style={[styles.input, inputStyle]}
          {...props}
        />
      </View>

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

export default TextInputWithTitle;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: vw(8),
    marginBottom: vh(10),
    borderRadius: vw(8),
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
    color: '#6B7280',
    marginBottom: vh(6),
  },
  star: {
    color: colors.red,
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
  },
  inputBox: {
    height: vh(42),
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: vw(8),
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: vw(12),
  },
  inputBoxError: {
    borderColor: colors.red,
  },
  input: {
    padding: 0,
    margin: 0,
    fontSize: 14,
    fontFamily: fonts.Inter_Regular,
    color: colors.black,
  },
  errorText: {
    marginTop: vh(4),
    fontSize: 12,
    fontFamily: fonts.Inter_Regular,
    color: colors.red,
  },
});
