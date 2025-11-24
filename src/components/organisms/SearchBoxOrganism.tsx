import {
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { colors, fonts, images, vh, vw } from '../../constants';
import PressableAtom from '../atoms/PressableAtom';
import ImageAtom from '../atoms/ImageAtom';
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

      {props.searchText.length !== 0 ? (
        <TouchableAtom
          activeOpacity={0.8}
          hitSlop={styles.hitSlop}
          onPress={() => {
            props.onPressCross();
          }}
        >
          <Image source={images.cross} style={styles.crossIconStyle} />
        </TouchableAtom>
      ) : (
        <ImageAtom source={images.search} style={styles.crossIconStyle} />
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
  crossIconStyle: {
    width: vw(18),
    height: vh(18),
    resizeMode: 'contain',
  },
  hitSlop: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  },
});
