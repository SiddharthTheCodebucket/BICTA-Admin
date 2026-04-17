import React, { useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
  title: string;
  description: string;
}

const TraineeFeaturePlaceholder = ({
  navigation,
  title,
  description,
}: Props) => {
  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, [navigation, title]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.content}>
        <TextAtom style={styles.title}>{title}</TextAtom>
        <TextAtom style={styles.description}>{description}</TextAtom>
      </View>
    </SafeAreaView>
  );
};

export default TraineeFeaturePlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: vw(24),
  },
  title: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(20),
    lineHeight: vw(26),
    color: colors.primary_dark_blue,
    textAlign: 'center',
    marginBottom: vh(10),
  },
  description: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    lineHeight: vw(20),
    color: colors.text_grey,
    textAlign: 'center',
  },
});
