import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import { useAppSelector } from '../../../../../hooks';

interface Props {
  navigation: NavigationType;
}

const User = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId: any = crediantialData.user[0].tenantId;
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'User');
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const ALL_DATA = [
    {
      id: 1,
      name: 'User Registration',
      onPress: () => navigation.navigate(screensName.UserRegistration),
    },
    {
      id: 2,
      name: 'Role Management',
      onPress: () => navigation.navigate(screensName.RoleManagement),
    },
    {
      id: 3,
      name: 'Permission Name List',
      onPress: () => navigation.navigate(screensName.PermissionNameList),
    },
    {
      id: 4,
      name: 'Role Permission',
      onPress: () => navigation.navigate(screensName.RolePermission),
    },
    {
      id: 5,
      name: 'View Users Role With Permission',
      onPress: () => navigation.navigate(screensName.RoleWithPermission),
    },
  ];

  const DATA =
    tenantId === 3 ? ALL_DATA : ALL_DATA.filter(item => item.id === 1);

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

export default User;

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
