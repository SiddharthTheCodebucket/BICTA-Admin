import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, vh, vw } from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const LMS = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'LMS');
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: 'Training Management',
      onPress: () => {
        navigation.navigate(screensName.TrainingManagement);
      },
    },
    {
      id: 2,
      name: 'Trainee Management',
      onPress: () => {},
    },
    {
      id: 3,
      name: 'Faculty Management',
      onPress: () => {},
    },
    {
      id: 4,
      name: 'Curriculum/Knowledge Management',
      onPress: () => {},
    },
    {
      id: 5,
      name: 'Class Location Management',
      onPress: () => {},
    },
    {
      id: 6,
      name: 'Class Room Management',
      onPress: () => {},
    },
    {
      id: 7,
      name: 'Assignment',
      onPress: () => {},
    },
    {
      id: 8,
      name: 'Examination',
      onPress: () => {},
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

export default LMS;

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
