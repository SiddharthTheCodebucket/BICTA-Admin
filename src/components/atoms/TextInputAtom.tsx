import React, {forwardRef} from 'react';
import {StyleSheet, TextInput, TextInputProps, TextStyle} from 'react-native';
import {colors, fonts, vh, vw} from '../../constants';
import {
  normalizeFirstSpace,
  normalizeSpaces,
  removeEmojis,
} from '../../utils/CommonFunction';

interface TextInputAtomProps extends TextInputProps {
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCorrect?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  textInputStyle?: TextStyle;
  value?: string;
  autoFocus?: boolean;
  maxLength?: number;
  multiline?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  editable?: boolean;
  onBlur?: () => void;
  onKeyPress?: (e: any) => void;
  onFocus?: () => void;
}

const TextInputAtom = forwardRef<TextInput, TextInputAtomProps>(
  (
    {
      placeholder,
      keyboardType,
      autoCorrect,
      autoCapitalize = 'none',
      secureTextEntry,
      onChangeText,
      textInputStyle,
      value,
      autoFocus,
      maxLength,
      multiline,
      returnKeyType,
      onSubmitEditing,
      editable,
      onBlur,
      onKeyPress,
      onFocus,
    },
    ref,
  ) => (
    <TextInput
      ref={ref}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCorrect={autoCorrect}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      onChangeText={text => {
        onChangeText &&
          onChangeText(
            normalizeSpaces(removeEmojis(normalizeFirstSpace(text))),
          );
      }}
      style={[
        styles.textInputContainer,
        textInputStyle,
        multiline && styles.multiline,
      ]}
      value={value}
      autoFocus={autoFocus}
      maxLength={maxLength}
      multiline={multiline}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      editable={editable}
      placeholderTextColor={colors.placeholderColor}
      onBlur={onBlur}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      selectionColor={colors.primary}
    />
  ),
);

export default TextInputAtom;

const styles = StyleSheet.create({
  textInputContainer: {
    width: '100%',
    paddingVertical: 0,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(16),
    textAlign: 'left',
    color: colors.placeholderColor,
    includeFontPadding: false,
  },
  multiline: {
    height: vh(100),
    textAlignVertical: 'top',
    paddingTop: vh(5),
    paddingBottom: vh(5),
  },
});
