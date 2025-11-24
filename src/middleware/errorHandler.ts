import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { navigate } from '../navigator/RootNavigation';

export const rtkQueryErrorHandler: Middleware = () => next => (action: any) => {
  const callErrorModal = (mesage: string) => {
    return navigate('ErrorModal', {
      routeName: 'OnBoardingNavigator',
      params: {},
      // error_title: mesage,
      error_message: mesage,
    });
  };

  if (isRejectedWithValue(action)) {
    const response = action.payload;
    const status = action.payload?.originalStatus ?? action.payload?.status;
    const errorMessage = action.payload?.data?.message;

    if (response !== undefined && response?.data !== undefined) {
      if (status === 401) {
        callErrorModal(errorMessage);
      }
    }
  }

  return next(action);
};
