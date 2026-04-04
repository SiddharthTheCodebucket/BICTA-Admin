import {StyleSheet} from 'react-native';
import {colors, fonts} from '../../../constants';
import {SCREEN_WIDTH, vh, vw} from '../../../constants/dimensions';

export const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    minHeight: vh(70),
    height: 'auto',
    paddingVertical: vh(15),
    paddingHorizontal: vw(10),
  },
  contentContainerStyle: {
    paddingHorizontal: vw(15),
    backgroundColor: 'transparent',
  },
  text1Style: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: Math.min(vw(16), 24), // Add upper limits to prevent massive text on tablets
    color: colors.black,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  text2Style: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: Math.min(vw(14), 20),
    color: colors.black,
    includeFontPadding: false,
    paddingVertical: 0,
    marginTop: vh(5),
  },
});
