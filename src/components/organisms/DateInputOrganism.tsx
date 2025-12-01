import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, vh, vw } from '../../constants';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';
import { isNullUndefined } from '../../utils/CommonFunction';
import ErrorMolecule from '../molecules/ErrorMolecule';

import ViewAtom from '../atoms/ViewAtom';
import TouchableAtom from '../atoms/TouchableAtom';
import TextAtom from '../atoms/TextAtom';
import DateInputAtom from '../atoms/DateInputAtom';

type Props = {
  label?: string;
  isMandatory?: boolean;
  value: string;
  fieldName?: any;
  containerStyle?: ViewStyle;
  majorContainer?: ViewStyle;
  placeholder: string;
  onChangeText: Function;
  isDisable?: boolean;
  minDate?: string;
  maxDate?: any;
  dateFormat?: string;
  onPress?: Function;
  errorMessage?: string;
  errorMessageView?: ViewStyle;
  labelStyle?: ViewStyle;
};

const DateInputOrganism = (props: Props) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const showDatePicker = () => {
    setIsDatePickerVisible(true);
    if (props.onPress) {
      props.onPress();
    }
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    setIsDatePickerVisible(false);

    props.onChangeText(moment(date).format(props.dateFormat));
  };
  const { containerStyle } = props;

  return (
    <ViewAtom style={[styles.majorContainer, props.majorContainer]}>
      <LabelWithMandatoryMolecules
        label={props.label}
        isMandatory={props.isMandatory}
        labelStyle={props.labelStyle}
      />
      <TouchableAtom
        activeOpacity={1}
        onPress={showDatePicker}
        disabled={props.isDisable}
        style={[
          styles.container,
          {
            ...containerStyle,
            backgroundColor: props.isDisable
              ? colors.disabledColor
              : colors.backgroundColor,
            borderColor: isNullUndefined(props.errorMessage)
              ? colors.borderColor
              : colors.red,
          },
        ]}
      >
        <TextAtom
          style={[
            styles.textInput,
            {
              color: colors.placeholderColor,
            },
          ]}
        >
          {props.value === '' ? props.placeholder : props.value}
        </TextAtom>
      </TouchableAtom>
      <DateInputAtom
        testID="datePicker"
        isVisible={isDatePickerVisible}
        mode={props.fieldName}
        date={
          props.value === ''
            ? new Date()
            : new Date(moment(props.value, props.dateFormat))
        }
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        maximumDate={props.maxDate}
        minimumDate={props.minDate}
        isDarkModeEnabled={false}
      />
      <ErrorMolecule
        errorMessage={props.errorMessage}
        errorMessageView={props.errorMessageView}
      />
    </ViewAtom>
  );
};

const styles = StyleSheet.create({
  majorContainer: { paddingBottom: vh(10) },
  container: {
    width: vw(328),
    height: vh(48),
    borderWidth: vw(1),
    backgroundColor: colors.white,
    borderRadius: vw(4),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(13),
    marginTop: vh(8),
  },
  textInput: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(16),
    color: colors.placeholderColor,
    width: vw(285),
    includeFontPadding: false,
    paddingVertical: 0,
  },
});

DateInputOrganism.defaultProps = {
  majorContainer: {},
  dateFormat: 'DD-MMM-YYYY HH:mm',
};

export default DateInputOrganism;
