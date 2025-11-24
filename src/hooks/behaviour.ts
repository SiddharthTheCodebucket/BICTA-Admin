import { useEffect } from 'react';
import { BackHandler, NativeEventSubscription } from 'react-native';

const useAndroidBackButton = (onPress: () => boolean, dependencies: unknown[] = []) => {
  const onBackPress = () => {
    return onPress();
  };

  useEffect(() => {
    const subscription: NativeEventSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, dependencies);
};

export { useAndroidBackButton };