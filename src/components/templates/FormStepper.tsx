import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, SvgStepSuccess, vh, vw } from '../../constants';

type Props = {
  steps: string[];
  currentStep: number; // 1-based index
  containerStyle?: ViewStyle;
  stepTextStyle?: TextStyle;
  activeStepTextStyle?: TextStyle;
  completedStepTextStyle?: TextStyle;
};

type StepState = 'completed' | 'current' | 'upcoming';

const StepDot = ({
  index,
  state,
  totalSteps,
}: {
  index: number;
  state: StepState;
  totalSteps: number;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (state === 'current') {
      scale.value = withSequence(
        withTiming(1.12, {
          duration: 180,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: 180,
          easing: Easing.out(Easing.quad),
        }),
      );
    } else {
      scale.value = withTiming(1, { duration: 180 });
    }

    opacity.value = withTiming(1, { duration: 180 });
  }, [state, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        isCompleted && styles.completedDot,
        isCurrent && styles.currentDot,
        state === 'upcoming' && styles.upcomingDot,
      ]}
    >
      {isCompleted ? (
        <View style={{}}>
          <SvgStepSuccess />
        </View>
      ) : (
        <Text
          style={[
            styles.dotText,
            isCurrent && styles.currentDotText,
            state === 'upcoming' && styles.upcomingDotText,
          ]}
        >
          {index + 1}
        </Text>
      )}
    </Animated.View>
  );
};

const StepConnector = ({ filled }: { filled: boolean }) => {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View style={styles.connectorTrack}>
      <Animated.View style={[styles.connectorFill, animatedStyle]} />
    </View>
  );
};

const FormStepper = ({
  steps,
  currentStep,
  containerStyle,
  stepTextStyle,
  activeStepTextStyle,
  completedStepTextStyle,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const state: StepState =
            stepNumber < currentStep
              ? 'completed'
              : stepNumber === currentStep
              ? 'current'
              : 'upcoming';

          const connectorFilled = stepNumber < currentStep;

          return (
            <React.Fragment key={`${label}-${index}`}>
              <View style={styles.stepWrap}>
                <StepDot
                  index={index}
                  state={state}
                  totalSteps={steps.length}
                />

                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepLabel,
                    stepTextStyle,
                    state === 'current' && styles.currentLabel,
                    state === 'current' && activeStepTextStyle,
                    state === 'completed' && styles.completedLabel,
                    state === 'completed' && completedStepTextStyle,
                    state === 'upcoming' && styles.upcomingLabel,
                  ]}
                >
                  {label}
                </Text>
              </View>

              {index < steps.length - 1 ? (
                <StepConnector filled={connectorFilled} />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default FormStepper;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: vw(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: vw(78),
  },
  dot: {
    width: vw(24),
    height: vw(24),
    borderRadius: vw(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vh(8),
  },
  completedDot: {
    backgroundColor: '#1F9D55',
    borderWidth: 0,
  },
  currentDot: {
    backgroundColor: '#111827',
    borderWidth: 0,
  },
  upcomingDot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  tickWrap: {
    width: vw(12),
    height: vw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    fontSize: 12,
    fontFamily: fonts.Inter_Medium,
    color: '#111827',
  },
  currentDotText: {
    color: '#FFFFFF',
  },
  upcomingDotText: {
    color: '#111827',
  },
  connectorTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#D7DCE3',
    marginTop: vh(11),
    marginHorizontal: vw(6),
    borderRadius: 999,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#4B5572',
    borderRadius: 999,
    transformOrigin: 'left',
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: fonts.Inter_SemiBold,
    color: '#111827',
    textAlign: 'center',
  },
  currentLabel: {
    color: '#111827',
  },
  completedLabel: {
    color: '#111827',
  },
  upcomingLabel: {
    color: '#1F2937',
    opacity: 0.7,
  },
});
