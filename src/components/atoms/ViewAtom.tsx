import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';

interface ViewAtomProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ViewAtom: React.FC<ViewAtomProps> = ({children, style}) => {
  return <View style={style}>{children}</View>;
};

export default ViewAtom;

const styles = StyleSheet.create({});
