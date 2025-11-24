import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import TouchableAtom from '../atoms/TouchableAtom';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';
import ImageAtom from '../atoms/ImageAtom';
interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  onPress: Function;
  bttnText: string;
  bttnTextStyle?: StyleProp<TextStyle>;
  isDisabled?: boolean;
  leftImage?: any;
  leftImageStyle?: any;
}
const ButtonOrganism = (props: Props) => {
  const {
    containerStyle,
    onPress,
    bttnText,
    bttnTextStyle,
    isDisabled,
    leftImage,
    leftImageStyle,
  } = props;
  return (
    <TouchableAtom
      disabled={isDisabled}
      style={[
        styles.container,
        {
          backgroundColor: isDisabled ? colors.lightGrey : colors.primary,
        },
        containerStyle,
      ]}
      onPress={() => {
        onPress();
      }}
    >
      {leftImage && <ImageAtom source={leftImage} style={leftImageStyle} />}
      <TextAtom style={[styles.bttnText, bttnTextStyle]}>{bttnText}</TextAtom>
    </TouchableAtom>
  );
};

export default ButtonOrganism;

const styles = StyleSheet.create({
  container: {
    width: vw(328),
    height: vh(48),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(15),
    marginBottom: vh(15),
  },
  bttnText: {
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(18),
  },
});
