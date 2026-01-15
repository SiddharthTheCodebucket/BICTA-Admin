import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { Calendar } from 'react-native-big-calendar';
import {
  colors,
  fonts,
  images,
  vw,
  vh,
  strings,
  screensName,
} from '../../../constants';
import ImageAtom from '../../../components/atoms/ImageAtom';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import {
  useEventListMutation,
  useListNoticeResponseUserMutation,
  useNoticeListMutation,
} from '../../../injectEndpointsTrainee/dashboardEndpoints';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';

interface Props {
  navigation: NavigationType;
}

const Dashboard = (props: Props) => {
  const { navigation } = props;
  const skipNextModal = React.useRef(false);
  const [time, setTime] = useState(new Date());
  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, { time, logo: images.logo });
  }, [time]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [eventListApi] = useEventListMutation();
  const [noticeListApi] = useNoticeListMutation();
  const [listNoticeResponseUserApi] = useListNoticeResponseUserMutation();

  const [noticeListData, setNoticeListData] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);

  const [expanded, setExpanded] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const onFocus = () => {
      if (skipNextModal.current) {
        skipNextModal.current = false;
        return;
      }

      eventList();
      noticeList();
      listNoticeResponseUser();
    };

    const unsubscribe = navigation.addListener('focus', onFocus);

    return unsubscribe;
  }, [navigation]);

  const eventList = () => {
    setLoader(true);
    const params = {
      sort: { attributes: ['fromDate'], sorts: ['desc'] },
      filters: [],
    };

    eventListApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        const eventData = res?.data.data || [];
        setEvents(eventData);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message,
          autoHide: true,
        });
      });
  };

  const noticeList = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: { attributes: ['created_at'], sorts: ['desc'] },
      filters: [],
      pageNo: 1,
      itemsPerPage: 10,
    };
    noticeListApi(params)
      .unwrap()
      .then((res: any) => {
        setNoticeListData(res.data?.data || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err?.data?.message });
      });
  };

  const listNoticeResponseUser = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: { attributes: ['dateOfNotice'], sorts: ['desc'] },
      filters: [['hasResponded', '=', 'No']],
      pageNo: 1,
      itemsPerPage: 10,
    };
    listNoticeResponseUserApi(params)
      .unwrap()
      .then((res: any) => {
        const data = res?.data?.data || [];
        if (data.length > 0) {
          navigation.navigate(screensName.ShowCaseNoticeModal, {
            notices: data,
            onClose: () => {
              skipNextModal.current = true;
            },
          });
        }
        setLoader(false);
      })
      .catch(() => setLoader(false));
  };

  const calendarEvents = events.map((ev: any) => ({
    title: ev.title,
    start: moment(ev.fromDate, 'YYYY-MM-DD').toDate(),
    end: moment(ev.toDate, 'YYYY-MM-DD').toDate(),
  }));

  const goPrevMonth = () =>
    setCurrentDate(moment(currentDate).subtract(1, 'month').toDate());
  const goNextMonth = () =>
    setCurrentDate(moment(currentDate).add(1, 'month').toDate());

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{strings.dg_message}</Text>

        <View style={styles.headerBlock}>
          <ImageAtom
            source={{
              uri: 'https://prod-1.static.codebuckets.in/file/codebucket-production-public/bipard-website-updated/person/image_1.jpeg',
            }}
            style={styles.image}
          />
          <Text style={styles.nameText}>{strings.dg_name}</Text>
          <Text style={styles.designationText}>{strings.dg_designation}</Text>
        </View>

        <Text style={styles.text}>
          {strings.message_1}
          <Text onPress={() => setExpanded(true)} style={styles.moreBtn}>
            {strings.read_more}
          </Text>
        </Text>

        <Text style={styles.heading}>{strings.event_calendar}</Text>
        <Text style={styles.subHeading}>{strings.this_month_event}</Text>
        <View style={styles.calendarWrapper}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goPrevMonth}>
              <Text style={styles.calendarArrow}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {moment(currentDate).format('MMMM YYYY')}
            </Text>
            <TouchableOpacity onPress={goNextMonth}>
              <Text style={styles.calendarArrow}>▶</Text>
            </TouchableOpacity>
          </View>

          <Calendar
            date={currentDate}
            events={calendarEvents}
            mode="month"
            height={vh(400)}
            eventCellStyle={{ backgroundColor: colors.primary }}
          />
        </View>

        <Text style={styles.heading}>{strings.notice}</Text>
        <Text style={styles.subHeading}>
          {noticeListData.length > 0
            ? `${noticeListData.length} ${strings.new_notice_found}`
            : strings.no_new_notice_found}
        </Text>

        {noticeListData.length > 0 ? (
          noticeListData.map((item: any, index: any) => (
            <TouchableOpacity
              key={index.toString() + item?.title}
              style={styles.noticeCard}
              onPress={() => item?.file && Linking.openURL(item.file)}
            >
              <Text style={styles.noticeTitle}>{item?.title}</Text>
              <Text style={styles.noticeDescription}>{item?.description}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noRecordContainer}>
            <Text style={styles.noRecordText}>{strings.no_record_found}</Text>
          </View>
        )}
      </ScrollView>
      <Modal
        visible={expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={[styles.modalContainer]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: vh(80) }}
            >
              <Text style={[styles.heading, { alignSelf: 'center' }]}>
                {strings.dg_message}
              </Text>

              <View style={styles.headerBlock}>
                <ImageAtom
                  source={{
                    uri: 'https://prod-1.static.codebuckets.in/file/codebucket-production-public/bipard-website-updated/person/image_1.jpeg',
                  }}
                  style={styles.image}
                />
                <Text style={styles.nameText}>{strings.dg_name}</Text>
                <Text style={styles.designationText}>
                  {strings.dg_designation}
                </Text>
              </View>

              {[
                strings.message_1,
                strings.message_2,
                strings.message_3,
                strings.message_4,
                strings.message_5,
                strings.message_6,
                strings.message_7,
              ].map((msg, index) => (
                <Text key={index.toString() + msg} style={styles.text}>
                  {msg} {'\n'}
                </Text>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setExpanded(false)}
            >
              <Text style={styles.closeText}>{strings.close}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: vw(15),
    paddingTop: vh(10),
    paddingBottom: vh(10),
  },
  heading: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(20),
    marginBottom: vh(10),
  },
  subHeading: {
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    marginBottom: vh(5),
  },
  headerBlock: {
    alignSelf: 'center',
    marginBottom: vh(10),
    alignItems: 'center',
  },
  image: {
    width: vw(60),
    height: vw(60),
    borderRadius: vw(60),
  },
  nameText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Bold,
    marginTop: vh(5),
    color: colors.primary,
  },
  designationText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  text: {
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(10),
  },
  moreBtn: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },
  modalContainer: {
    alignSelf: 'center',
    width: vw(310),
    height: '95%',
    marginTop: vh(20),
    // flex: 1,
    paddingHorizontal: vw(15),
    paddingTop: vh(10),
    backgroundColor: colors.white,
    borderRadius: vw(8),
    borderWidth: vw(2),
    borderColor: colors.primary,
  },
  closeBtn: {
    paddingVertical: vh(12),
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginVertical: vh(10),
    borderRadius: vw(6),
  },
  closeText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  calendarWrapper: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: vw(10),
    backgroundColor: colors.primary,
  },
  calendarArrow: {
    color: colors.white,
  },
  calendarTitle: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
  },
  noticeCard: {
    backgroundColor: colors.primary,
    width: vw(330),
    height: vh(55),
    borderRadius: vw(3),
    justifyContent: 'center',
    marginTop: vh(10),
    paddingHorizontal: vw(10),
  },
  noticeTitle: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
  },
  noticeDescription: {
    color: colors.white,
    fontSize: vw(12),
  },
  noRecordContainer: {
    marginTop: vh(10),
    alignItems: 'center',
  },
  noRecordText: {
    color: colors.grey,
    fontSize: vw(14),
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
