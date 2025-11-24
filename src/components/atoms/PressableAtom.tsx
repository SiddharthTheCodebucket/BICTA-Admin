import {Pressable, PressableProps, StyleProp, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';

interface PressableAtomProps extends PressableProps {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const PressableAtom: React.FC<PressableAtomProps> = ({
  children,
  onPress,
  style,
  ...rest
}) => {
  return (
    <Pressable onPress={onPress} style={style} {...rest}>
      {children}
    </Pressable>
  );
};

export default PressableAtom;
