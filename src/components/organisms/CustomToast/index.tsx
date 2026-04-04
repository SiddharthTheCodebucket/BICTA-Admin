import * as React from 'react';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastOptions,
} from 'react-native-toast-message';
import { styles } from './styles';
import { colors } from '../../../constants';
import { vh } from '../../../constants/dimensions';

const toastConfig = {
  success: (props: ToastOptions) => (
    <BaseToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: colors.green }]}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),

  error: (props: ToastOptions) => (
    <ErrorToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: colors.red }]}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
};

export default class CustomToast extends React.PureComponent {
  render() {
    return (
      <Toast visibilityTime={5000} config={toastConfig} topOffset={vh(40)} />
    );
  }
}
