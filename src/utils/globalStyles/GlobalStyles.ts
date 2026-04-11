import {StyleSheet} from 'react-native';
import {adminFontSizes, colors, fonts, vh, vw} from '../../constants';

export const globalStyles = StyleSheet.create({
  adminFormCard: {
    backgroundColor: colors.white,
    borderRadius: vw(16),
    borderWidth: 1,
    borderColor: '#EFEFF2',
    padding: vw(10),
  },
  adminFieldCard: {
    backgroundColor: colors.backgroundColor,
    padding: vw(8),
    borderRadius: vw(8),
    marginTop: vh(10),
  },
  adminFieldBlock: {
    marginBottom: vh(12),
  },
  adminLabelText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#6D7480',
    marginBottom: vh(6),
  },
  adminRequiredMark: {
    color: '#D11A2A',
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
  },
  adminInputContainer: {
    height: vh(42),
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminMultilineInputContainer: {
    height: vh(100),
    alignItems: 'flex-start',
    paddingVertical: vh(10),
  },
  adminInputText: {
    flex: 1,
    paddingVertical: 0,
    includeFontPadding: false,
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.md,
    color: '#2E3440',
  },
  adminMultilineInputText: {
    textAlignVertical: 'top',
  },
  adminErrorText: {
    marginTop: vh(5),
    color: colors.red_2,
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
  },
});
