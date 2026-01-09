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

const Feedback = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Feedback');
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  const DATA = [
    {
      id: 1,
      name: 'Feedback Category',
      onPress: () => {
        navigation.navigate(screensName.FeedbackCategory);
      },
    },
    {
      id: 2,
      name: 'Feedback Topic',
      onPress: () => {
        navigation.navigate(screensName.FeedbackTopic);
      },
    },
    {
      id: 3,
      name: 'Mess Feedback Response',
      onPress: () => {
        navigation.navigate(screensName.MessFeedbackResponse);
      },
    },
    {
      id: 4,
      name: 'House Keeping Feedback Response',
      onPress: () => {
        navigation.navigate(screensName.HouseKeepingFeedbackResponse);
      },
    },
    {
      id: 5,
      name: 'Faculty Feedback By Trainee',
      onPress: () => {
        navigation.navigate(screensName.FacultyFeedbackByTrainee);
      },
    },
    {
      id: 6,
      name: 'Faculty Feedback By Observer',
      onPress: () => {
        navigation.navigate(screensName.FacultyFeedbackByObserver);
      },
    },
    {
      id: 7,
      name: 'Faculty Feedback Training Wise',
      onPress: () => {},
    },
    {
      id: 8,
      name: 'Overall Feedback',
      onPress: () => {
        navigation.navigate(screensName.OverallFeedback);
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

export default Feedback;

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
