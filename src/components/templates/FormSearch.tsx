import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, fonts, vh, vw } from '../../constants';
import TextAtom from '../atoms/TextAtom';
import TextInputAtom from '../atoms/TextInputAtom';
import TouchableAtom from '../atoms/TouchableAtom';
import { SvgSearch, SvgCross } from '../../constants/svgs';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

const FormSearch = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  containerStyle,
  inputStyle,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusScale = useSharedValue(1);
  const borderColor = useSharedValue(0); // 0 for grey, 1 for primary

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(focusScale.value) }],
      borderColor: interpolateColor(
        borderColor.value,
        [0, 1],
        ['#E7E9EE', colors.primary_blue],
      ),
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = 1.02;
    borderColor.value = withTiming(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
    borderColor.value = withTiming(0);
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 8 }}>
      <Animated.View style={[styles.container, containerStyle, animatedStyle]}>
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <SvgSearch />
          </View>
          <TextInputAtom
            style={[styles.input, inputStyle]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {value.length > 0 && (
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <SvgCross />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,

    borderWidth: 1,
    borderRadius: vw(8),
    paddingHorizontal: vw(12),
    height: vh(45),
    justifyContent: 'center',
    marginBottom: vh(10),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: vw(8),
  },
  input: {
    flex: 1,
    fontSize: vw(14),
    fontFamily: fonts.Inter_Regular,
    color: colors.black,
  },
  clearButton: {
    padding: vw(4),
  },
});

export default FormSearch;
