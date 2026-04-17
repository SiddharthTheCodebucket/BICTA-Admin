import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fonts, vh, vw } from '../../constants';

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
}: {
  index: number;
  state: StepState;
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
        <Icon name="check" size={12} color="#FFFFFF" />
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

const StepConnector = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const progress = useSharedValue(
    totalSteps <= 1 ? 0 : (safeCurrentStep - 1) / (totalSteps - 1),
  );

  useEffect(() => {
    progress.value = withTiming(
      totalSteps <= 1 ? 0 : (safeCurrentStep - 1) / (totalSteps - 1),
      {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      },
    );
  }, [safeCurrentStep, totalSteps, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (totalSteps <= 1) {
    return null;
  }

  const sideInset = `${50 / totalSteps}%`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.connectorTrack,
        {
          left: sideInset,
          right: sideInset,
        },
      ]}
    >
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
        <StepConnector currentStep={currentStep} totalSteps={steps.length} />

        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const state: StepState =
            stepNumber < currentStep
              ? 'completed'
              : stepNumber === currentStep
              ? 'current'
              : 'upcoming';

          return (
            <View style={styles.stepWrap} key={`${label}-${index}`}>
              <StepDot index={index} state={state} />

              <Text
                numberOfLines={2}
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
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: vw(4),
    zIndex: 1,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0C163D',
  },
  upcomingDot: {
    backgroundColor: '#E5E7EB',
    borderWidth: 0,
  },
  dotText: {
    fontSize: 11,
    fontFamily: fonts.Inter_SemiBold,
    color: '#0C163D',
  },
  currentDotText: {
    color: '#0C163D',
  },
  upcomingDotText: {
    color: '#6B7280',
  },
  connectorTrack: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#24356B',
    marginTop: vh(11),
    borderRadius: 999,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    backgroundColor: '#24356B',
    borderRadius: 999,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.Inter_SemiBold,
    color: '#0C163D',
    textAlign: 'center',
    lineHeight: 16,
  },
  currentLabel: {
    color: '#0C163D',
  },
  completedLabel: {
    color: '#0C163D',
  },
  upcomingLabel: {
    color: '#0C163D',
  },
});
