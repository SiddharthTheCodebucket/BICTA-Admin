import {StyleSheet} from 'react-native';
import {colors, fonts, vh, vw} from '../../../constants';

export default StyleSheet.create({
  mainFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundColor,
  },
  noInternetFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: vw(22),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
  },
  noInternetCircle: {
    marginTop: vh(24),
    marginBottom: vh(16),
    width: vw(140),
    height: vw(140),
    borderRadius: vw(70),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetImg: {
    width: vw(79.739),
    height: vh(64),
    resizeMode: 'contain',
  },
  noInternetMessage: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black80per,
    width: vw(343),
    textAlign: 'center',
  },
  btnStyle: {
    marginTop: vh(30),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtStyle: {
    color: colors.white,
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
  },
});
