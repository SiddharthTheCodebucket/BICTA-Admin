import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, strings, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const HostelManagement = (props: Props) => {
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
      name: strings.hostelManagement.hostelMenu.hostel,
      onPress: () => navigation.navigate(screensName.Hostel),
    },
    {
      id: 2,
      name: strings.hostelManagement.hostelMenu.guest,
      onPress: () => navigation.navigate(screensName.Guest),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.flex1}>
        {DATA.map(item => {
          return (
            <TouchableOpacity
              key={item.id}
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

export default HostelManagement;

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
  flex1: {
    flex: 1,
  },
});
