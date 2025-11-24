/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { persistor, store } from './src/store';
import { PersistGate } from 'redux-persist/integration/react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import CustomToast from './src/components/organisms/CustomToast';
import { LogBox, StatusBar } from 'react-native';
import RootScreen from './src/screens/RootScreen';

function App(): React.JSX.Element {
  useEffect(() => {
    LogBox.ignoreAllLogs(true);
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        animated={true}
        backgroundColor="transparent"
      />
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <BottomSheetModalProvider>
            <RootScreen />
          </BottomSheetModalProvider>
          <CustomToast />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
