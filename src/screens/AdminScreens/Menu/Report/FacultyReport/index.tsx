import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
}

const FacultyReport = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Report');
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: 'Course Wise',
      onPress: () => {
        navigation.navigate(screensName.CourseWise);
      },
    },
    {
      id: 2,
      name: 'Faculty Wise Class Report',
      onPress: () => {
        navigation.navigate(screensName.FacultyWiseClassReport);
      },
    },
    {
      id: 3,
      name: 'Faculty Calculation Sheet',
      onPress: () => {
        navigation.navigate(screensName.FacultyCalculationSheet);
      },
    },
    {
      id: 4,
      name: 'Course Wise Approval Status',
      onPress: () => {},
    },
    {
      id: 5,
      name: 'Faculty Class Report Training Wise',
      onPress: () => {
        navigation.navigate(screensName.FacultyClassReportTrainingWise);
      },
    },
    {
      id: 6,
      name: 'Faculty Upcomimg Class Report',
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

export default FacultyReport;

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
