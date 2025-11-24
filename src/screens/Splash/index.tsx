import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAtom from '../../components/atoms/ImageAtom';
import { colors, fonts, images, strings, vh, vw } from '../../constants';
import { NavigationType } from '../../components/organisms/HeaderOrganism';
import Router from '../../navigator/routes';
import { useAppSelector } from '../../hooks';
import { isNullUndefined } from '../../utils/CommonFunction';
interface Props {
  navigation: NavigationType;
}
const Splash = (props: Props) => {
  const { navigation } = props;
  const { token } = useAppSelector(state => state.Auth);

  useEffect(() => {
    if (isNullUndefined(token)) {
      Router.resetNew(navigation, 'OnBoardingNavigator');
    } else {
      Router.resetNew(navigation, 'BottomTabNavigator');
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageAtom source={images.logo} style={styles.logo} />
      <Text style={styles.appName}>{strings.app_name}</Text>
    </SafeAreaView>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  glowContainerLeft: {
    position: 'absolute',
    width: vw(421),
    height: vh(421),
    top: vh(175),
    left: vh(-335),
    borderRadius: vw(210.5),
    overflow: 'hidden',
  },
  glowContainerRight: {
    position: 'absolute',
    top: vh(270),
    left: vh(204),
    overflow: 'hidden',
    width: vw(421),
    height: vh(421),
    borderRadius: vw(210.5),
  },
  logo: {
    width: vw(168),
    height: vh(80),
    resizeMode: 'contain',
    zIndex: 10,
  },
  appName: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(22),
    color: colors.primary,
    marginTop: vh(15),
    letterSpacing: vw(0.5),
  },
});
