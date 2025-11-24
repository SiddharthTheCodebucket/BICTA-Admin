import { StyleSheet } from 'react-native';
import React from 'react';
import RadioButton from 'react-native-animated-radio-button';
import { colors, vw } from '../../constants';

interface RadioButtonAtomProps {
  isSelected: boolean;
  onSelect: () => void;
}

const RadioButtonAtom: React.FC<RadioButtonAtomProps> = ({
  isSelected,
  onSelect,
}) => {
  return (
    <RadioButton
      style={{
        ...styles.radioButtonStyle,
        borderColor: isSelected ? colors.primary : colors.grey_3,
      }}
      innerBackgroundColor={colors.primary}
      innerContainerStyle={styles.innerContainer}
      isActive={isSelected}
      onPress={onSelect}
    />
  );
};

export default RadioButtonAtom;

const styles = StyleSheet.create({
  radioButtonStyle: {
    width: vw(20),
    height: vw(20),
    borderRadius: vw(30),
    borderWidth: vw(1.5),
    borderColor: colors.grey_3,
  },
  innerContainer: {
    height: vw(12),
    width: vw(12),
  },
});
