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
} from '../../constants';
import ImageAtom from '../../components/atoms/ImageAtom';
import {
  Header,
  NavigationType,
} from '../../components/organisms/HeaderOrganism';
// import {
//   useEventListMutation,
//   useListNoticeResponseUserMutation,
//   useNoticeListMutation,
// } from '../../injectEndpoints/dashboardEndpoints';
import FullscreenLoading from '../../components/organisms/FullscreenLoading';

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

  // const [eventListApi] = useEventListMutation();
  // const [noticeListApi] = useNoticeListMutation();
  // const [listNoticeResponseUserApi] = useListNoticeResponseUserMutation();

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
    };

    const unsubscribe = navigation.addListener('focus', onFocus);

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
    </SafeAreaView>
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
});
