import { Image, TouchableOpacity, ViewStyle } from 'react-native';
import React from 'react';
import styles from './styles';
import { images } from '../../../constants';

interface Props {
  readonly onButtonPress?: () => void;
  readonly contantContainerStyle?: ViewStyle;
}

const FloatingButton: React.FC<Props> = ({
  onButtonPress = () => {},
  contantContainerStyle = {},
}) => {
  const containerStyle = [styles.container, contantContainerStyle];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={containerStyle}
      onPress={onButtonPress}
    >
      <Image source={images.add} style={styles.imageSize} />
    </TouchableOpacity>
  );
};

export default FloatingButton;
