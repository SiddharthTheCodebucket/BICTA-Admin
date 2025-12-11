import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
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
import TextAtom from '../../../components/atoms/TextAtom';

import { useAppSelector } from '../../../hooks';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import { useDeleteTraineeRegistrationMutation } from '../../../injectEndpoints/profileEndpoints';

interface Props {
  navigation: NavigationType;
}

const Profile = (props: Props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const [time, setTime] = useState(new Date());
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [deleteTraineeRegistrationApi] = useDeleteTraineeRegistrationMutation();
  const [loader, setLoader] = useState(false);

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

  const DATA = [
    {
      id: 1,
      name: strings.my_profile,
      onPress: () => {},
    },
    {
      id: 2,
      name: strings.deactivate_account,
      onPress: () => {
        // navigation.navigate(screensName.AlertOrganism, {
        //   message: strings.deactivate_message,
        //   okText: strings.ok,
        //   double: true,
        //   cancelText: strings.cancel,
        //   okFunction: () => {
        //     deleteTraineeRegistration();
        //   },
        //   cancelFunction: () => {},
        // });
      },
    },
  ];

  const deleteTraineeRegistration = () => {
    setLoader(true);
    const params = {
      traineeId: Number(crediantialData.traineeDetails.currentTraining),
    };
    deleteTraineeRegistrationApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        dispatch({ type: 'RESET' });
        Router.resetNew(navigation, 'OnBoardingNavigator', {
          screen: screensName.Login,
        });
        Toast.show({
          type: 'success',
          text2: res.data.message || strings.deactivate_res_mess,
          autoHide: true,
        });
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <View style={{ flex: 1 }}>
        {DATA.map(item => {
          return (
            <TouchableOpacity
              key={item.id.toString()}
              style={styles.touchable}
              onPress={item.onPress}
            >
              <TextAtom>{item.name}</TextAtom>
            </TouchableOpacity>
          );
        })}
      </View>

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
