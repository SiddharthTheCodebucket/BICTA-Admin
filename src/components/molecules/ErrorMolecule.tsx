import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { nFixedLines } from '../../utils/CommonFunction';
import { colors, vh, vw } from '../../constants';

interface Props {
  errorMessage?: string;
  errorMessageView?: StyleProp<ViewStyle>;
}

const ErrorMolecule: React.FC<Props> = ({ errorMessage, errorMessageView }) => {
  if (!errorMessage) return null;

  return (
    <View style={[styles.errorMessageView, errorMessageView]}>
      <Text style={styles.errorMessage} {...nFixedLines(2)}>
        {errorMessage}
      </Text>
    </View>
  );
};

export default ErrorMolecule;

const styles = StyleSheet.create({
  errorMessage: {
    color: colors.red,
    marginLeft: vw(6),
    fontSize: vw(12),
  },
  errorMessageView: {
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
});
