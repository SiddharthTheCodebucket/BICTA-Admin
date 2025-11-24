import {StyleSheet} from 'react-native';
import {colors, fonts} from '../../../constants';
import {SCREEN_WIDTH, vh, vw} from '../../../constants/dimensions';

export const styles = StyleSheet.create({
  toastContainer: {
    width: SCREEN_WIDTH * 0.95,
    maxHeight: vh(70),
  },
  contentContainerStyle: {
    backgroundColor: 'red',
  },
  text1Style: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  text2Style: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
    includeFontPadding: false,
    paddingVertical: 0,
  },
});
