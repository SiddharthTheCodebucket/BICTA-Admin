// FormDropdownFieldWithTitle

import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';

type DropdownItem = {
  [key: string]: any;
};

type Props = {
  title: string;
  isMandatory?: boolean;
  data: DropdownItem[];
  value?: any;
  onChange: (item: DropdownItem) => void;
  labelField?: string;
  valueField?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  dropdownStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  disabled?: boolean;
  search?: boolean;
  maxHeight?: number;
};

const FormDropdownFieldWithTitle = ({
  title,
  isMandatory = false,
  data,
  value,
  onChange,
  labelField = 'name',
  valueField = 'id',
  placeholder = 'Select',
  searchPlaceholder = 'Search...',
  errorMessage,
  containerStyle,
  titleStyle,
  dropdownStyle,
  itemTextStyle,
  placeholderStyle,
  selectedTextStyle,
  disabled = false,
  search = false,
  maxHeight = 250,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      <View
        style={[
          styles.dropdownWrapper,
          errorMessage ? styles.errorBorder : null,
        ]}
      >
        <Dropdown
          style={[styles.dropdown, dropdownStyle]}
          containerStyle={styles.dropdownContainer}
          itemTextStyle={[styles.itemText, itemTextStyle]}
          placeholderStyle={[styles.placeholderText, placeholderStyle]}
          selectedTextStyle={[styles.selectedText, selectedTextStyle]}
          data={data}
          maxHeight={maxHeight}
          labelField={labelField}
          valueField={valueField}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          value={value}
          onChange={onChange}
          disable={disabled}
          search={search}
          renderLeftIcon={undefined}
          showsVerticalScrollIndicator={false}
          activeColor="#F2F4F7"
        />
      </View>

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

export default FormDropdownFieldWithTitle;

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
  dropdownWrapper: {
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
  dropdown: {
    height: vh(42),
    width: '100%',
    backgroundColor: colors.white,
  },
  dropdownContainer: {
    borderRadius: vw(8),
    borderColor: '#E7E9EE',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: fonts.Inter_Regular,
    color: '#B9C0CE',
  },
  selectedText: {
    fontSize: 14,
    fontFamily: fonts.Inter_Regular,
    color: colors.black,
  },
  itemText: {
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
