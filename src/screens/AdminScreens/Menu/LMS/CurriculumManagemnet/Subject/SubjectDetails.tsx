import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  adminFontSizes,
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { SvgEditPencile } from '../../../../../../constants/svgs';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import {
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  route: any;
}

const SubjectDetails = (props: Props) => {
  const { navigation, route } = props;
  const data = route.params?.data;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Curriculum - Knowledge Management');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const thumbnail =
    data?.thumbnail && data.thumbnail !== null && data.thumbnail !== ''
      ? { uri: data.thumbnail }
      : null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <TextAtom style={styles.subjectName}>{data?.name ?? '-'}</TextAtom>

          <View style={styles.fieldRow}>
            <TextAtom style={styles.label}>Description</TextAtom>
            <TextAtom style={styles.value}>{data?.description ?? '-'}</TextAtom>
          </View>

          <View style={styles.fieldRow}>
            <TextAtom style={styles.label}>Class Approved</TextAtom>
            <TextAtom style={styles.value}>
              {data?.classApproved ?? 'Yes'}
            </TextAtom>
          </View>

          <View style={styles.thumbnailSection}>
            <TextAtom style={styles.label}>Thumbnail</TextAtom>
            <View style={styles.thumbnailRow}>
              {thumbnail ? (
                <ImageAtom
                  source={thumbnail}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <TextAtom style={styles.thumbnailPlaceholderText}>
                    {data?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </TextAtom>
                </View>
              )}
              <TouchableAtom style={styles.viewBtn} onPress={() => {}}>
                <TextAtom style={styles.viewBtnText}>View</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.bottomActions}>
        <TouchableAtom
          style={styles.deleteBtn}
          onPress={() => {
            // Implement delete logic here
            navigation.goBack();
          }}
        >
          <TextAtom style={styles.deleteBtnText}>Delete</TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate(screensName.AddSubject, { item: data })
          }
        >
          <TextAtom style={styles.editBtnText}>Edit</TextAtom>
        </TouchableAtom>
      </View> */}

      <ViewAtom style={styles.bottomActions}>
        <View style={{ marginRight: vw(4), flex: 1 }}>
          <FormWhiteButton
            onPress={() => {
              // Implement delete logic here
              navigation.goBack();
            }}
            title={'Delete'}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
        <View style={{ marginLeft: vw(4), flex: 1 }}>
          <FormGradientButton
            onPress={() =>
              navigation.navigate(screensName.AddSubject, { item: data })
            }
            title={'Edit'}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
      </ViewAtom>
    </SafeAreaView>
  );
};

export default SubjectDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scrollContent: {
    padding: vw(14),
    paddingTop: vh(20),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(16),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  subjectName: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: adminFontSizes.lg,
    color: colors.text_black,
    marginBottom: vh(16),
  },
  fieldRow: {
    marginBottom: vh(16),
  },
  label: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    marginBottom: vh(4),
  },
  value: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  thumbnailSection: {
    marginTop: vh(8),
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
    marginTop: vh(8),
  },
  thumbnailImage: {
    width: vw(50),
    height: vw(50),
    borderRadius: vw(4),
    backgroundColor: colors.grey,
  },
  thumbnailPlaceholder: {
    width: vw(50),
    height: vw(50),
    borderRadius: vw(4),
    backgroundColor: colors.light_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.primary_blue,
  },
  viewBtn: {
    backgroundColor: colors.primary_blue,
    paddingHorizontal: vw(12),
    paddingVertical: vh(6),
    borderRadius: vw(4),
  },
  viewBtnText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: vw(14),
    gap: vw(10),
    backgroundColor: colors.new_ui_screen_bg,
    paddingBottom: vh(20),
  },
  deleteBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    borderWidth: 1,
    borderColor: colors.grey_1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  editBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.white,
  },
});
