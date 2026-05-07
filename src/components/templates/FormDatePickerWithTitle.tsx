import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';

type Props = {
  title: string;
  value: Date;
  onChange: (date: Date) => void;
  isMandatory?: boolean;
  placeholder?: string;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
};

const FormDatePickerWithTitle = ({
  title,
  value,
  onChange,
  isMandatory = false,
  placeholder = 'Select Date',
  errorMessage,
  containerStyle,
  titleStyle,
  inputStyle,
  disabled = false,
}: Props) => {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      <TouchableOpacity
        disabled={disabled}
        onPress={() => setShow(true)}
        style={[styles.inputWrapper, errorMessage ? styles.errorBorder : null]}
      >
        <TextAtom style={[styles.inputText, inputStyle]}>
          {value ? formatDate(value) : placeholder}
        </TextAtom>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

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
  inputWrapper: {
    height: vh(42),
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: vw(8),
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: vw(12),
  },
  errorBorder: {
    borderColor: colors.red,
  },
  inputText: {
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

export default FormDatePickerWithTitle;
