import React, { useMemo } from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { adminFontSizes, colors, fonts, images, vh, vw } from '../../constants';
import ErrorMolecule from '../molecules/ErrorMolecule';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';
import ImageAtom from './ImageAtom';
import ViewAtom from './ViewAtom';

type AnyRecord = Record<string, any>;

export interface UniversalDropdownProps<T extends AnyRecord> {
  label?: string;
  isMandatory?: boolean;
  placeholder: string;
  labelStyle?: TextStyle;

  data: T[];
  value?: any;
  onChange: (item: T) => void;
  labelField: keyof T | string;
  valueField: keyof T | string;

  disabled?: boolean;
  searchable?: boolean;

  containerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle;
  errorMessage?: string;
  errorMessageView?: ViewStyle;
}

const UniversalDropdown = <T extends AnyRecord>(
  props: UniversalDropdownProps<T>,
) => {
  const Dropdown = useMemo(() => {
    const mod = require('react-native-element-dropdown');
    return mod?.Dropdown as any;
  }, []);

  return (
    <ViewAtom style={[styles.container, props.containerStyle]}>
      {!!props.label && (
        <LabelWithMandatoryMolecules
          label={props.label}
          isMandatory={props.isMandatory}
          labelStyle={props.labelStyle}
        />
      )}

      <Dropdown
        data={props.data}
        value={props.value}
        onChange={props.onChange}
        labelField={props.labelField}
        valueField={props.valueField}
        placeholder={props.placeholder}
        search={!!props.searchable}
        disable={!!props.disabled}
        style={[styles.dropdown, props.dropdownStyle]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        inputSearchStyle={styles.searchInput}
        containerStyle={styles.listContainer}
        itemTextStyle={styles.itemText}
        activeColor={'#DCE8F6'}
        renderRightIcon={() => (
          <ImageAtom source={images.downArrow} style={styles.downIcon} />
        )}
      />

      <ErrorMolecule
        errorMessage={props.errorMessage}
        errorMessageView={props.errorMessageView}
      />
    </ViewAtom>
  );
};

export default UniversalDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(10),
  },
  dropdown: {
    height: vh(48),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    marginTop: vh(8),
  },
  placeholder: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: '#B3BCC8',
  },
  selectedText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },
  downIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.new_ui_icon,
  },
  listContainer: {
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  itemText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },
  searchInput: {
    height: vh(40),
    borderRadius: vw(10),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
    borderColor: '#E1E4E8',
  },
});
