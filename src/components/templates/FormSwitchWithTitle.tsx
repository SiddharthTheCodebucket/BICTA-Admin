import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';
import { globalStyles } from '../../utils/globalStyles';

type SwitchItem = {
  id: string | number;
  label: string;
};

type Props = {
  title: string;
  isMandatory?: boolean;
  data: SwitchItem[];
  selectedValue?: string | number;
  onSelect: (item: SwitchItem | any) => void;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  rowStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  activeOptionStyle?: ViewStyle;
  inactiveOptionStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  inactiveTextStyle?: TextStyle;
};

const FormSwitchWithTitle = ({
  title,
  isMandatory = false,
  data = [],
  selectedValue,
  onSelect,
  errorMessage,
  containerStyle,
  titleStyle,
  rowStyle,
  optionStyle,
  activeOptionStyle,
  inactiveOptionStyle,
  activeTextStyle,
  inactiveTextStyle,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      <View style={[globalStyles.switchPillRow, rowStyle]}>
        {data.map(item => {
          const isActive = String(item.id) === String(selectedValue);

          return (
            <TouchableOpacity
              key={String(item.id)}
              activeOpacity={0.85}
              onPress={() => onSelect(item)}
              style={[
                globalStyles.switchPill,
                optionStyle,
                isActive
                  ? globalStyles.switchPillActive
                  : globalStyles.switchPillInactive,
                isActive ? activeOptionStyle : inactiveOptionStyle,
              ]}
            >
              <TextAtom
                style={[
                  globalStyles.switchPillText,
                  isActive
                    ? globalStyles.switchPillTextActive
                    : globalStyles.switchPillTextInactive,
                  isActive ? activeTextStyle : inactiveTextStyle,
                ]}
              >
                {item.label}
              </TextAtom>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

export default FormSwitchWithTitle;

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
  },
  option: {
    minWidth: vw(62),
    height: vh(28),
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(10),
    marginRight: vw(8),
    borderWidth: 1,
  },
  activeOption: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  inactiveOption: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 12,
    fontFamily: fonts.Inter_Medium,
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#111827',
  },
  errorText: {
    marginTop: vh(4),
    fontSize: 12,
    fontFamily: fonts.Inter_Regular,
    color: colors.red,
  },
});
