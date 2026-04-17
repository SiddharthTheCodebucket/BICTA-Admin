import React from 'react';
import { StyleSheet } from 'react-native';
import TouchableAtom from '../atoms/TouchableAtom';
import ImageAtom from '../atoms/ImageAtom';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw, images } from '../../constants';
import { NavigationType } from '../organisms/HeaderOrganism';

interface Props {
  title: string;
  navigation: NavigationType;
}

const AdminPageHeader = ({ title, navigation }: Props) => {
  return (
    <TouchableAtom
      style={styles.titleRow}
      onPress={() => navigation.goBack()}
      activeOpacity={0.8}
    >
      <ImageAtom source={images.arrow_back} style={styles.inlineBackIcon} />
      <TextAtom style={styles.pageTitle}>{title}</TextAtom>
    </TouchableAtom>
  );
};

export default AdminPageHeader;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(10),
    marginTop: vh(10),
  },
  inlineBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    lineHeight: 24,
    color: colors.text_black,
  },
});
