import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const CommunicationManagement = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.communication_management);
    navigation.BackButtonPress = () => navigation.goBack();
  });
  const DATA = [
    {
      id: 1,
      name: strings.show_cause_notice,
      onPress: () => {
        navigation.navigate(screensName.ShowCauseNotice);
      },
    },
    {
      id: 2,
      name: strings.application,
      onPress: () => {
        navigation.navigate(screensName.Application);
      },
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.contentWrapper}>
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

export default CommunicationManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '90%',
  },
  contentWrapper: {
    flex: 1,
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
