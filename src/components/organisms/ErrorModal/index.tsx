import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';

import styles from './styles';
import { useAppDispatch } from '../../../hooks';
import { useAndroidBackButton } from '../../../hooks/behaviour';
import images from '../../../constants/images';
import { strings } from '../../../constants';
import ButtonOrganism from '../ButtonOrganism';
import Router from '../../../navigator/routes';

interface Props {
  navigation: any;
  route: RoutesType;
}
interface RoutesType {
  params: Params;
}
interface Params {
  routeName?: any;
  error_title?: string;
  error_message?: string;
  params?: any;
}

const ErrorModal = ({ navigation, route }: Props) => {
  const params = route.params?.params ?? {};
  const routeName = route.params?.routeName ?? '';

  const dispatch = useAppDispatch();

  useAndroidBackButton(() => {
    return true;
  }, []);

  return (
    <View style={styles.containerStyle}>
      <TouchableOpacity onPress={() => {}} style={styles.emptyContainerStyle} />
      <View style={styles.modalContainerStyle}>
        <Image source={images.warning} style={styles.warningImg} />
        <Text style={styles.api_error_title}>
          {route.params.error_title ?? 'Error'}
        </Text>
        <Text style={styles.api_error_message}>
          {route.params.error_message}
        </Text>
        <ButtonOrganism
          onPress={() => {
            if (routeName === '') {
              navigation.goBack();
            } else {
              dispatch({ type: 'RESET' });
              Router.resetNew(navigation, routeName, params);
            }
          }}
          bttnText={strings.ok}
          containerStyle={styles.okBtnStyle}
        />
      </View>
    </View>
  );
};
export default ErrorModal;
