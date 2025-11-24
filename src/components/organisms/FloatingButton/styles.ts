import {StyleSheet} from 'react-native';
import {colors, vh, vw} from '../../../constants';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: vw(54),
    height: vw(54),
    backgroundColor: colors.white,
    borderRadius: vw(54 / 2),
    position: 'absolute',
    bottom: vh(30),
    right: vh(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },
  imageSize: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.primary,
  },
});

export default styles;
