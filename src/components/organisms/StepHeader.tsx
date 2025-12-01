import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, vh, vw } from '../../constants';

const StepHeader = ({ currentStep }: any) => {
  const steps = [
    'General',
    'Description and Hostel',
    'Training Team & Location',
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={index} style={styles.stepContainer}>
              <View
                style={[
                  styles.circle,
                  isActive && styles.activeCircle,
                  isCompleted && styles.completedCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    isActive && styles.activeCircleText,
                    isCompleted && styles.completedCircleText,
                  ]}
                >
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>

              {index < steps.length - 1 && <View style={styles.line} />}

              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                  isCompleted && styles.completedLabel,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const C_GREY = '#BFC5D2';
const C_LIGHT_BG = '#EEF0FB';

const styles = StyleSheet.create({
  wrapper: {
    marginTop: vh(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  stepContainer: {
    width: '33%',
    alignItems: 'center',
  },

  circle: {
    width: vw(22),
    height: vw(22),
    borderRadius: vw(11),
    backgroundColor: C_LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: colors.primary,
    borderWidth: vw(2),
    borderColor: colors.primary,
  },
  completedCircle: {
    backgroundColor: colors.primary,
  },

  circleText: {
    fontSize: vw(12),
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
  },
  activeCircleText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },
  line: {
    position: 'absolute',
    top: 10,
    left: '65%',
    width: '70%',
    height: vw(3),
    backgroundColor: C_GREY,
    borderRadius: vw(2),
  },
  label: {
    marginTop: vh(5),
    fontSize: vw(14),
    color: colors.primary,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
  },
  completedLabel: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
  },
  completedCircleText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },
});

export default StepHeader;
