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

const Examination = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examinationIndex.title,
    );
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: strings.lms.examination.examinationIndex.createTest,
      onPress: () => {
        navigation.navigate(screensName.CreateTest);
      },
    },
    {
      id: 2,
      name: strings.lms.examination.examinationIndex.assignQuestion,
      onPress: () => {
        navigation.navigate(screensName.AssignQuestionList);
      },
    },
    {
      id: 3,
      name: strings.lms.examination.examinationIndex.question,
      onPress: () => {
        navigation.navigate(screensName.ExaminationQuestionBank);
      },
    },
    {
      id: 4,
      name: strings.lms.examination.examinationIndex.examResponse,
      onPress: () => {
        navigation.navigate(screensName.ExamResponse);
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

export default Examination;

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
  flex1: { flex: 1 },
});
