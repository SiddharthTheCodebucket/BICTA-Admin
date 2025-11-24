import { StyleSheet } from 'react-native';
import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DateInputAtom = ({
  testID,
  isVisible,
  mode,
  date,
  onConfirm,
  onCancel,
  maximumDate,
  minimumDate,
  isDarkModeEnabled,
  ...rest
}: any) => {
  return (
    <DateTimePickerModal
      testID={testID}
      isVisible={isVisible}
      mode={mode || 'date'}
      date={date}
      onConfirm={onConfirm}
      onCancel={onCancel}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      isDarkModeEnabled={isDarkModeEnabled}
      {...rest}
    />
  );
};

export default DateInputAtom;

const styles = StyleSheet.create({});
