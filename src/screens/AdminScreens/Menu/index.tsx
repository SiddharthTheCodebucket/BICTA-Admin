import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, images, screensName, vh, vw } from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';
import { useAppSelector } from '../../../hooks';

interface Props {
  navigation: NavigationType;
}

const Menu = ({ navigation }: Props) => {
  const [time, setTime] = useState(new Date());

  const { crediantialData } = useAppSelector(state => state.Auth);

  const userType: string | undefined = crediantialData?.user?.[0]?.userType;

  const isAccountController = userType === 'ACCOUNTCONTROLLER';
  const canSeeInvoice =
    userType === 'SUPERADMIN' || userType === 'ACCOUNTCONTROLLER';

  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, {
      time,
      logo: images.logo,
      onNotificationPress: () => console.log('Notification Clicked'),
    });
  }, [time, navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const baseData = [
    {
      id: 1,
      name: 'Learning Management System',
      onPress: () => navigation.navigate(screensName.LMS),
    },
    {
      id: 2,
      name: 'Hostel Management',
      onPress: () => navigation.navigate(screensName.HostelManagement),
    },
    {
      id: 3,
      name: 'PHC Management System',
      onPress: () => navigation.navigate(screensName.PHCManagement),
    },
    {
      id: 4,
      name: 'Vehicle Management System',
      onPress: () => navigation.navigate(screensName.VehicleManagement),
    },
  ];

  const invoiceMenu = [
    {
      id: 5,
      name: 'Invoice & Bill Management',
      onPress: () => {
        navigation.navigate(screensName.InvoiceAndBillManagement);
      },
    },
  ];

  const DATA = isAccountController
    ? invoiceMenu
    : [...baseData, ...(canSeeInvoice ? invoiceMenu : [])];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={{ flex: 1 }}>
        {DATA.map(item => (
          <TouchableOpacity
            key={item.id.toString()}
            style={styles.touchable}
            onPress={item.onPress}
          >
            <TextAtom>{item.name}</TextAtom>
          </TouchableOpacity>
        ))}
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
