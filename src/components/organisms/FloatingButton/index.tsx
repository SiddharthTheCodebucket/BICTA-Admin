import {Image, TouchableOpacity, ViewStyle} from 'react-native';
import React from 'react';
import styles from './styles';
import {images} from '../../../constants';

interface Props {
  onButtonPress: Function;
  contantContainerStyle?: ViewStyle;
}

export default function FloatingButton(props: Props) {
  const containerStyle = [styles.container, props.contantContainerStyle];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={containerStyle}
      onPress={() => props.onButtonPress()}>
      <Image source={images.add} style={styles.imageSize} />
    </TouchableOpacity>
  );
}

FloatingButton.defaultProps = {
  onButtonPress: () => {},
  contantContainerStyle: {},
};
