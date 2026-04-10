import {
  Keyboard,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { colors, fonts, SvgCross, SvgSearch, vh, vw } from '../../constants';
import PressableAtom from '../atoms/PressableAtom';
import TouchableAtom from '../atoms/TouchableAtom';
interface Props {
  onChangeText: any;
  searchText: string;
  onPressCross: Function;
  searchBox?: ViewStyle;
}
const SearchBoxOrganism = (props: Props) => {
  const Ref: any = React.useRef(null);
  return (
    <PressableAtom
      style={[styles.searchBox, props.searchBox]}
      onPress={() => {
        Ref?.current?.focus();
      }}
    >
      <TextInput
        ref={Ref}
        style={styles.textInputStyle}
        placeholder={'Search here'}
        placeholderTextColor={colors.placeholderColor}
        onChangeText={props.onChangeText}
        autoCapitalize={'none'}
        onSubmitEditing={() => {
          Keyboard.dismiss();
        }}
        selectionColor={colors.primary}
        value={props.searchText}
      />

      {props.searchText.length === 0 ? (
        <SvgSearch width={vw(18)} height={vw(18)} />
      ) : (
        <TouchableAtom
          activeOpacity={0.8}
          hitSlop={styles.hitSlop}
          onPress={() => {
            props.onPressCross();
          }}
        >
          <SvgCross width={vw(18)} height={vw(18)} />
        </TouchableAtom>
      )}
    </PressableAtom>
  );
};

export default SearchBoxOrganism;

const styles = StyleSheet.create({
  searchBox: {
    width: vw(328),
    height: vh(48),
    backgroundColor: colors.white,
    borderRadius: vw(8),
    alignSelf: 'center',
    paddingHorizontal: vw(13),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(10),
    borderWidth: vw(1),
    borderColor: colors.borderColor,
  },
  textInputStyle: {
    flex: 1,
    color: colors.placeholderColor,
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Regular,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  hitSlop: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  },
});
