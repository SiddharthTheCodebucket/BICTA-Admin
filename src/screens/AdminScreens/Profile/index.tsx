import { StyleSheet, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  colors,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import Router from '../../../navigator/routes';

interface Props {
  navigation: NavigationType;
}

const Profile = (props: Props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const [time, setTime] = useState(new Date());

  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, {
      time,
      logo: images.logo,
      onNotificationPress: () => {},
    });
  }, [time]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={{ flex: 1 }}></View>
      <ButtonOrganism
        onPress={() => {
          navigation.navigate(screensName.AlertOrganism, {
            message: strings.logout_message,
            okText: strings.ok,
            double: true,
            cancelText: strings.cancel,
            okFunction: () => {
              dispatch({ type: 'RESET' });
              Router.resetNew(navigation, 'OnBoardingNavigator', {
                screen: screensName.Login,
              });
            },
            cancelFunction: () => {},
          });
        }}
        bttnText={strings.logout}
      />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '90%',
  },
  touchable: {
    width: vw(328),
    height: vh(55),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(15),
  },
});
