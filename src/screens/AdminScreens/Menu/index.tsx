import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, images, screensName, vh, vw } from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const Menu = ({ navigation }: Props) => {
  const [time, setTime] = useState(new Date());

  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, {
      time,
      logo: images.logo,
      onNotificationPress: () => console.log('Notification Clicked'),
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
      name: 'Learning Management System',
      onPress: () => {
        navigation.navigate(screensName.LMS);
      },
    },
    {
      id: 2,
      name: 'Hostel Management',
      onPress: () => {
        navigation.navigate(screensName.HostelManagement);
      },
    },
    {
      id: 3,
      name: 'PHC Management System',
      onPress: () => {
        navigation.navigate(screensName.PHCManagement);
      },
    },
    {
      id: 4,
      name: 'Vehicle Management System',
      onPress: () => {
        navigation.navigate(screensName.VehicleManagement);
      },
    },
    {
      id: 4,
      name: 'Invoice & Bill Management',
      onPress: () => {
        navigation.navigate(screensName.InvoiceAndBillManagement);
      },
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
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
    </SafeAreaView>
  );
};

export default Menu;

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
