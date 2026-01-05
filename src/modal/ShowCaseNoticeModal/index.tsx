import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, fonts, images, screensName, vh, vw } from '../../constants';
import ImageAtom from '../../components/atoms/ImageAtom';
import ViewAtom from '../../components/atoms/ViewAtom';
import TextAtom from '../../components/atoms/TextAtom';
import ButtonOrganism from '../../components/organisms/ButtonOrganism';
import { NavigationType } from '../../components/organisms/HeaderOrganism';
interface Props {
  navigation: NavigationType;
  route: any;
}
const ShowCaseNoticeModal = (props: Props) => {
  const { navigation } = props;
  const notices = props.route?.params?.notices || [];

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.overlay}
        onPress={() => {
          props.route?.params?.onClose?.();
          navigation.goBack();
        }}
      />

      <ViewAtom style={styles.modalBox}>
        <ViewAtom style={styles.headerRow}>
          <ImageAtom source={images.warning} style={styles.warningIcon} />
          <TextAtom style={styles.modalTitle}>
            Important: Show Cause Notice(s)
          </TextAtom>
        </ViewAtom>

        <TextAtom numberOfLines={2} style={styles.subText}>
          Immediate attention is required. Please review the following notice(s)
          and respond.
        </TextAtom>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {notices.map((item: any, index: any) => (
            <View key={`${index}-${item?.title}`} style={styles.noticeCard}>
              <Text style={styles.noticeHeader}>
                Notice #{index + 1} | Date: {item.dateOfNotice}
              </Text>

              <Text style={styles.noticeTitle}>{item.title}</Text>

              <Text style={styles.noticeDesc}>{item.description}</Text>

              <TouchableOpacity
                style={styles.respondBtn}
                onPress={() => {
                  const onClose = props.route?.params?.onClose;
                  onClose?.();
                  navigation.goBack();
                  setTimeout(() => {
                    navigation.navigate(screensName.ShowCauseNotice);
                  }, 50);
                }}
              >
                <Text style={styles.respondBtnText}>RESPOND NOW</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <ViewAtom style={styles.divider} />

        <ButtonOrganism
          onPress={() => {
            props.route?.params?.onClose?.();
            navigation.goBack();
          }}
          bttnText="CLOSE"
          containerStyle={styles.closeButton}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default ShowCaseNoticeModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black50per,
    justifyContent: 'center',
    paddingHorizontal: vw(15),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    paddingVertical: vh(15),
    paddingHorizontal: vw(15),
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vh(10),
  },
  warningIcon: {
    marginRight: vh(5),
  },
  modalTitle: {
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
  },
  subText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    marginBottom: vh(10),
  },
  noticeCard: {
    backgroundColor: colors.backgroundColor,
    padding: vw(12),
    borderRadius: vw(8),
    marginBottom: vh(10),
    borderLeftWidth: vw(3),
    borderColor: colors.primary,
  },
  noticeHeader: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
  },
  noticeTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.primary,
    marginVertical: vh(5),
  },
  noticeDesc: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    marginBottom: vh(8),
  },
  respondBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vh(8),
    borderRadius: vw(5),
    alignItems: 'center',
  },
  respondBtnText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },
  divider: {
    height: vw(1),
    backgroundColor: colors.grey,
    width: '100%',
  },
  closeButton: {
    marginTop: vh(10),
    width: vw(220),
  },
});
