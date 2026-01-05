import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, vh, vw } from '../../constants';

const StepHeaderOtherRegistration = ({ currentStep }: any) => {
  const steps = [
    'General',
    'Address and Office',
    'Witness & Verification',
    'Email & OTP',
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={`${index}-${label}`} style={styles.stepContainer}>
              {/* Circle */}
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

              {/* Step Line */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    (isCompleted || isActive) && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              )}

              {/* Label */}
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
    width: `${100 / 4}%`,
    alignItems: 'center',
    position: 'relative',
  },

  circle: {
    width: vw(26),
    height: vw(26),
    borderRadius: vw(13),
    backgroundColor: C_LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  activeCircle: {
    backgroundColor: colors.primary,
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
    fontFamily: fonts.Roboto_Bold,
  },
  completedCircleText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },

  line: {
    position: 'absolute',
    top: vw(13),
    left: '50%',
    width: '100%',
    height: vw(3),
    backgroundColor: C_GREY,
    zIndex: 1,
  },

  label: {
    marginTop: vh(5),
    fontSize: vw(13),
    color: colors.grey,
    textAlign: 'center',
    width: vw(80),
  },

  activeLabel: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Bold,
  },

  completedLabel: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Bold,
  },
});

export default StepHeaderOtherRegistration;
