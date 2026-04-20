import {StyleSheet} from 'react-native';
import {adminFontSizes, colors, fonts, vh, vw} from '../../constants';

export const globalStyles = StyleSheet.create({

    switchPillRow: {
    flexDirection: 'row',
    marginTop: vh(2),
    backgroundColor:colors.sky_blue,
    alignSelf: 'flex-start',
      borderRadius: vw(4),
      overflow: 'hidden',
    
  },


  switchPill: {
    minHeight:23,
    minWidth: vw(32),
    // borderRadius: vw(4),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(6),
      paddingVertical: vh(4),
  },
  switchPillActive: {
    backgroundColor: colors.primary_blue,
    borderRadius: vw(4),
  },
  switchPillInactive: {
    backgroundColor: '#CFE2F7',
  },
  switchPillText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.xs,
  },
  switchPillTextActive: {
    color: colors.white,
  },
  switchPillTextInactive: {
    color: '#23406A',
  },

    createButtonTouchable: {
    borderRadius: vw(8),
    overflow: 'hidden',
  },

    createButton: {
    paddingHorizontal: vw(14),
    paddingVertical: vh(9),
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonImage: {
    borderRadius: vw(8),
  },

  createButtonText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: colors.white,
  },


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

// for stepwise footor buttons in admin forms
footerButtonsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: vh(10),
  marginTop: vh(20),
},
footerButton: {
  height: vh(46),
  borderRadius: vh(10),
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: vh(18),
},
backButton: {
  flex: 1,
  backgroundColor: colors.backgroundColor,
  borderRadius: vh(8),
  borderWidth: 1,
  borderColor: '#111827',
},
backButtonText: {
  fontSize: vw(16),
  fontFamily: fonts.Inter_Medium,
  color: '#111827',
},

  infoSection: {
    marginTop: vh(8),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
    marginBottom: vh(10),
  },
  infoCol: { flex: 1 },
  infoLabel: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_title,
    marginTop: vh(3),
  },
  infoTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_card_title,
  },
  infoSubtitle: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_description,
    marginTop: vh(2),
  },
  sectionSeparator: {
    marginTop: vh(12),
    paddingTop: vh(10),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: colors.primary,
  },


});
