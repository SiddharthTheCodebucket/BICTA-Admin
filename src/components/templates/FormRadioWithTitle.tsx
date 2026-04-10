import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';

import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';
import { CheckBox } from '@rneui/themed';

type RadioItem = {
  [key: string]: any;
};

type Props = {
  title: string;
  isMandatory?: boolean;
  data: RadioItem[];
  selectedValue?: any;
  onSelect: (item: RadioItem) => void;
  labelField?: string;
  valueField?: string;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  optionTextStyle?: TextStyle;
  rowStyle?: ViewStyle;
  disabled?: boolean;
};

const FormRadioWithTitle = ({
  title,
  isMandatory = false,
  data = [],
  selectedValue,
  onSelect,
  labelField = 'value',
  valueField = 'id',
  errorMessage,
  containerStyle,
  titleStyle,
  optionTextStyle,
  rowStyle,
  disabled = false,
}: Props) => {
  const isSelected = (item: RadioItem) => item?.[valueField] === selectedValue;

  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      <View style={[styles.row, rowStyle]}>
        {data.map(item => {
          const active = isSelected(item);

          return (
            <CheckBox
              key={String(item?.[valueField])}
              title={String(item?.[labelField] ?? '')}
              checked={active}
              onPress={() => !disabled && onSelect(item)}
              disabled={disabled}
              containerStyle={styles.checkboxContainer}
              textStyle={[
                styles.optionText,
                active && styles.optionTextActive,
                optionTextStyle,
              ]}
              iconType="material-community"
              checkedIcon="radiobox-marked"
              uncheckedIcon="radiobox-blank"
              checkedColor="#111827"
              uncheckedColor="#111827"
              size={18}
            />
            // <CheckBox
            //   containerStyle={{
            //     marginLeft: 0,
            //     marginRight: 0,
            //     height: 52,
            //     borderColor: '#E5E7EB',
            //     borderRadius: 4,
            //     borderWidth: 1,
            //   }}
            //   checked={active}
            //   title={String(item?.[labelField] ?? '')}
            //   onPress={() => onSelect(item)}
            //   iconType="material-community"
            //   checkedIcon="radiobox-marked"
            //   uncheckedIcon="radiobox-blank"
            //   checkedColor={'#111827'}
            // />
          );
        })}
      </View>

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

export default FormRadioWithTitle;

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
    marginBottom: vh(8),
  },
  star: {
    color: colors.red,
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginRight: vw(24),
    marginBottom: vh(6),
  },
  optionText: {
    fontSize: 14,
    fontFamily: fonts.Inter_Regular,
    color: '#111827',
    fontWeight: 'normal',
    marginLeft: vw(4),
  },
  optionTextActive: {
    fontFamily: fonts.Inter_Medium,
    color: '#111827',
  },
  errorText: {
    marginTop: vh(4),
    fontSize: 12,
    fontFamily: fonts.Inter_Regular,
    color: colors.red,
  },
});
