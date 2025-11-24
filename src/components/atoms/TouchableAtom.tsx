import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import React, {ReactNode} from 'react';

interface TouchableAtomProps extends TouchableOpacityProps {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const TouchableAtom: React.FC<TouchableAtomProps> = ({
  children,
  onPress,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={style}
      {...rest}>
      {children}
    </TouchableOpacity>
  );
};

export default TouchableAtom;

const styles = StyleSheet.create({});
