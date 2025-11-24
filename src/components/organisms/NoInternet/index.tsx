import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';
import { images, strings } from '../../../constants';

import ButtonOrganism from '../ButtonOrganism';

const NoInternet = (props: any) => {
  return (
    <SafeAreaView style={{ ...styles.mainFrame }}>
      <View style={{ ...styles.noInternetFrame }}>
        <Text style={styles.text}>{strings.noInternet}</Text>
        <View style={{ ...styles.noInternetCircle }}>
          <Image source={images.internetDown} style={styles.noInternetImg} />
        </View>
        <Text style={{ ...styles.noInternetMessage }}>
          {strings.noInternetMessage}
        </Text>
        <ButtonOrganism
          onPress={() => {
            props.handleAction();
          }}
          bttnText={strings.tryAgain}
          containerStyle={styles.btnStyle}
          bttnTextStyle={styles.txtStyle}
        />
      </View>
    </SafeAreaView>
  );
};

export default NoInternet;
