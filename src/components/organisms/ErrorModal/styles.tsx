import { StyleSheet } from 'react-native';
import { fonts, vh, vw } from '../../../constants';

export default StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: 'rgba(33, 33, 33, 0.50)',
  },
  emptyContainerStyle: {
    flex: 1,
  },
  modalContainerStyle: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: vh(30),
    borderTopLeftRadius: vw(16),
    borderTopRightRadius: vw(16),
  },
  warningImg: {
    width: vw(24),
    height: vh(24),
    marginVertical: vh(24),
  },
  api_error_title: {
    color: '#111111',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
  },
  api_error_message: {
    color: 'rgba(0, 0, 0, 0.60)',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(16),
    marginBottom: vh(8),
    marginHorizontal: vh(24),
  },
  okBtnStyle: {
    marginTop: vh(16),
    width: vw(300),
  },
});
