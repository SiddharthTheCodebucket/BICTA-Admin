import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { apiSlice } from '../api/apiSlice';
import { rtkQueryErrorHandler } from '../middleware/errorHandler';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  version: 0,
  storage: AsyncStorage,
  whitelist: ['Auth'],
  timeout: 100000,
  blacklist: [apiSlice.reducerPath],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      logger,
      apiSlice.middleware,
      rtkQueryErrorHandler,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
