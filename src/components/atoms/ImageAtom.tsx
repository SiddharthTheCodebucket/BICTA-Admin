import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import React from 'react';

interface ImageAtomProps extends ImageProps {
  style?: StyleProp<ImageStyle>;
}

const ImageAtom: React.FC<ImageAtomProps> = ({ source, style, ...rest }) => {
  return <Image source={source} style={style} {...rest} />;
};

export default ImageAtom;

const styles = StyleSheet.create({});
