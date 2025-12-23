import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { colors, fonts, vh, vw } from '../../constants';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';
import ErrorMolecule from '../molecules/ErrorMolecule';

export const defaultRatings = [
  {
    id: 5,
    label: 'Excellent',
    emoji: '😄',
    bg: '#E2F7E9',
    shadow: '#89E2A0',
  },
  {
    id: 4,
    label: 'Very Good',
    emoji: '😊',
    bg: '#F5F0FF',
    shadow: '#CAB4FF',
  },
  { id: 3, label: 'Good', emoji: '🙂', bg: '#FFF7D9', shadow: '#F7D684' },
  {
    id: 2,
    label: 'Satisfactory',
    emoji: '😐',
    bg: '#FFF0E0',
    shadow: '#FFC99C',
  },
  { id: 1, label: 'Bad', emoji: '😞', bg: '#FDE4E4', shadow: '#FF9A9A' },
];

export default function RatingSelector({
  label,
  value,
  onSelect,
  error,
  options,
}: any) {
  const ratings = options ?? defaultRatings;

  const pressAnims = React.useRef(
    ratings.map(() => new Animated.Value(1)),
  ).current;

  return (
    <View style={styles.wrapper}>
      <LabelWithMandatoryMolecules label={label} isMandatory={true} />

      <View style={styles.container}>
        {ratings.map((item: any, index: number) => {
          const isSelected = value?.id === item.id;
          const pressAnim = pressAnims[index];

          const animateIn = () => {
            Animated.spring(pressAnim, {
              toValue: 0.92,
              useNativeDriver: true,
            }).start();
          };

          const animateOut = () => {
            Animated.spring(pressAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          };

          return (
            <Pressable
              key={item.id}
              onPressIn={animateIn}
              onPressOut={animateOut}
              onPress={() => onSelect?.(item)}
            >
              <Animated.View
                style={[
                  styles.card,
                  { transform: [{ scale: pressAnim }] },
                  isSelected && {
                    backgroundColor: item.bg,
                    shadowColor: item.shadow,
                    shadowOpacity: 0.45,
                    shadowRadius: 25,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 15,
                    transform: [{ scale: 1.05 }],
                  },
                ]}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.label}>{item.label}</Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
      <ErrorMolecule errorMessage={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginBottom: vh(5),
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(10),
  },
  card: {
    width: vw(60),
    height: vw(60),
    borderRadius: vw(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vh(5),
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  emoji: {
    marginBottom: vh(5),
    fontSize: vw(20),
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
  },
  label: {
    fontSize: vw(10),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
});
