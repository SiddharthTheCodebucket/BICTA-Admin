import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, strings, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const Hostel = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.hostelManagement.hostelMenu.title);
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: strings.hostelManagement.hostelMenu.hostelDetails,
      onPress: () => {
        navigation.navigate(screensName.HostelDetails);
      },
    },
    {
      id: 2,
      name: strings.hostelManagement.hostelMenu.floorDetails,
      onPress: () => {
        navigation.navigate(screensName.FloorDetails);
      },
    },
    {
      id: 3,
      name: strings.hostelManagement.hostelMenu.roomDetails,
      onPress: () => {
        navigation.navigate(screensName.RoomDetails);
      },
    },
    {
      id: 4,
      name: strings.hostelManagement.hostelMenu.bedDetails,
      onPress: () => {
        navigation.navigate(screensName.BedDetails);
      },
    },
    {
      id: 5,
      name: strings.hostelManagement.hostelMenu.hostelAllocation,
      onPress: () => {
        navigation.navigate(screensName.HostelAllocation);
      },
    },
    {
      id: 6,
      name: strings.hostelManagement.hostelMenu.hostelAllocationHistory,
      onPress: () => {
        navigation.navigate(screensName.HostelAllocationHistory);
      },
    },
    {
      id: 7,
      name: strings.hostelManagement.hostelMenu.bedAvailability,
      onPress: () => {
        navigation.navigate(screensName.BedAvailability);
      },
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.flex1}>
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

export default Hostel;

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
  flex1: {
    flex: 1,
  },
});
