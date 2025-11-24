import { ActivityIndicator, StyleSheet, Image, View } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import { colors, vw, vh, images } from '../../../constants';

interface Props {
  isVisible: boolean;
}
const FullscreenLoading = ({ isVisible }: Props) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn={'bounceIn'}
      animationOut={'fadeOut'}
      backdropColor={colors.grey_6}
      backdropOpacity={0.6}
    >
      <View style={styles.centerView}>
        <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: vh(10) }}
        />
      </View>
    </Modal>
  );
};

export default FullscreenLoading;

const styles = StyleSheet.create({
  centerView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: vw(40),
    height: vw(40),
  },
});
