import React, {ReactNode, forwardRef} from 'react';
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../../constants';
import {globalStyles} from '../../utils/globalStyles';
import TextAtom from '../atoms/TextAtom';

export interface AdminTextInputFieldProps
  extends Omit<
    TextInputProps,
    'style' | 'value' | 'onChangeText' | 'placeholderTextColor'
  > {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  fieldBlockStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  requiredMarkStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  showWrapperCard?: boolean;
}

const AdminTextInputField = forwardRef<TextInput, AdminTextInputFieldProps>(
  (
    {
      label,
      required,
      value,
      onChangeText,
      error,
      leftAccessory,
      rightAccessory,
      wrapperStyle,
      fieldBlockStyle,
      labelStyle,
      requiredMarkStyle,
      inputContainerStyle,
      inputStyle,
      errorStyle,
      multiline,
      showWrapperCard = true,
      ...textInputProps
    },
    ref,
  ) => {
    const wrapperCardStyle = showWrapperCard
      ? [globalStyles.adminFieldCard, wrapperStyle]
      : wrapperStyle;

    return (
      <View style={wrapperCardStyle}>
        <View style={[globalStyles.adminFieldBlock, fieldBlockStyle]}>
          <TextAtom style={[globalStyles.adminLabelText, labelStyle]}>
            {label}
            {required ? (
              <TextAtom
                style={[globalStyles.adminRequiredMark, requiredMarkStyle]}>
                *
              </TextAtom>
            ) : null}
          </TextAtom>

          <View
            style={[
              globalStyles.adminInputContainer,
              multiline && globalStyles.adminMultilineInputContainer,
              inputContainerStyle,
            ]}>
            {leftAccessory}
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholderTextColor={colors.new_ui_count}
              multiline={multiline}
              style={[
                globalStyles.adminInputText,
                multiline && globalStyles.adminMultilineInputText,
                inputStyle,
              ]}
              {...textInputProps}
            />
            {rightAccessory}
          </View>

          {!!error && (
            <TextAtom style={[globalStyles.adminErrorText, errorStyle]}>
              {error}
            </TextAtom>
          )}
        </View>
      </View>
    );
  },
);

AdminTextInputField.displayName = 'AdminTextInputField';

export default AdminTextInputField;

