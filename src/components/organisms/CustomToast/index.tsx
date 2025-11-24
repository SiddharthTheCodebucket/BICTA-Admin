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
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
    />
  ),

  error: (props: ToastOptions) => (
    <ErrorToast
      {...props}
      style={[styles.toastContainer, { borderLeftColor: colors.red }]}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
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
