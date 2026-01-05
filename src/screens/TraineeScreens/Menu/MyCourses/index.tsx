import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const MyCourses = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'My Courses');
    navigation.BackButtonPress = () => navigation.goBack();
  });
  const DATA = [
    {
      id: 1,
      name: 'Time Table',
      onPress: () => {
        navigation.navigate(screensName.TimeTable);
      },
    },
    {
      id: 2,
      name: 'Assignment',
      onPress: () => {
        navigation.navigate(screensName.Assignment);
      },
    },
    {
      id: 3,
      name: 'Course Module',
      onPress: () => {
        navigation.navigate(screensName.CourseModule);
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

export default MyCourses;

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
