import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  ImageStyle,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, images, vh, vw } from '../../constants';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  imageSource?: any;
  imageStyle?: ImageStyle;
};

const FormGradientButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
  buttonStyle,
  textStyle,
  imageSource = images.buttonGrad_100,
  imageStyle,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, containerStyle]}
    >
      <ImageBackground
        source={imageSource}
        resizeMode="stretch"
        style={[styles.button, buttonStyle, disabled ? styles.disabled : null]}
        imageStyle={[styles.image, imageStyle]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <TextAtom style={[styles.text, textStyle]} numberOfLines={1}>
            {title}
          </TextAtom>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default FormGradientButton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    height: vh(46),
    borderRadius: vw(10),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: vw(10),
  },
  text: {
    color: colors.white,
    fontSize: vw(16),
    fontFamily: fonts.Inter_Medium,
  },
  disabled: {
    opacity: 0.7,
  },
});
