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

const LeaveManagement = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Leave Mangement');
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: 'Employee Leave History',
      onPress: () => {
        navigation.navigate(screensName.EmployeeLeaveHistory);
      },
    },
    {
      id: 2,
      name: 'Leave Approval',
      onPress: () => {
        navigation.navigate(screensName.LeaveApproval);
      },
    },
  ].filter(item => {
    if (tenantId === 3 && item.id === 2) {
      return false;
    }
    return true;
  });

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

export default LeaveManagement;

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
