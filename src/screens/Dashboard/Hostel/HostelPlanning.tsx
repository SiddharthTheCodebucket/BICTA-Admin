import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { colors, fonts, vw, vh, screensName } from '../../../constants';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import { useHostelPlanningDataMutation } from '../../../injectEndpoints/dashboardEndpoints';
import TouchableAtom from '../../../components/atoms/TouchableAtom';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import { useFocusEffect } from '@react-navigation/native';
interface Props {
  navigation: NavigationType;
}
const HostelPlanning = (props: any) => {
  const { navigation } = props;
  const selectedCenter = props.route?.params?.selectedCenter;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loader, setLoader] = useState(false);

  const [monthDays, setMonthDays] = useState([]);
  const [hostelDetails, setHostelDetails] = useState([]);

  const [hostelPlanningDataApi] = useHostelPlanningDataMutation();

  const goPrevMonth = () =>
    setCurrentDate(moment(currentDate).subtract(1, 'month').toDate());

  const goNextMonth = () =>
    setCurrentDate(moment(currentDate).add(1, 'month').toDate());

  const generateMonthDays = () => {
    const start = moment(currentDate).startOf('month');
    const totalDays = start.daysInMonth();

    const days: any[] = [];

    for (let i = 1; i <= totalDays; i++) {
      const date = start.date(i);

      days.push({
        id: i,
        date: date.format('DD'),
        dayName: date.format('ddd'),
        fullDate: date.format('YYYY-MM-DD'),
        hostelTotal: 0,
        hostelOccupied: 0,
        guestTotal: 0,
        guestOccupied: 0,
      });
    }

    return days;
  };

  useFocusEffect(
    useCallback(() => {
      fetchHostelPlanningData();
    }, [currentDate, selectedCenter]),
  );

  const fetchHostelPlanningData = () => {
    setLoader(true);

    const monthYear = moment(currentDate).format('YYYY-MM');

    let params: any = { monthYear };

    if (selectedCenter) {
      let bipardCentreParam: any = [];

      if (selectedCenter === 'All Centers') {
        bipardCentreParam = ['Gaya', 'Patna'];
      } else {
        bipardCentreParam = [selectedCenter];
      }

      if (bipardCentreParam.length > 0) {
        params.bipardCentre = bipardCentreParam;
      }
    }

    hostelPlanningDataApi(params)
      .unwrap()
      .then((res: any) => {
        const apiList = res?.data?.hostelDetails ?? [];
        setHostelDetails(apiList);

        const days = generateMonthDays();

        const finalMapped: any = days.map(day => {
          const filtered = apiList.filter(
            (item: any) => item.reportDate === day.fullDate,
          );

          let hostelTotal = 0;
          let hostelOccupied = 0;
          let guestTotal = 0;
          let guestOccupied = 0;

          filtered.forEach((h: any) => {
            hostelTotal += h.totalTraineeBeds || 0;
            hostelOccupied += h.occupiedTraineeBeds || 0;

            guestTotal += h.totalGuestBeds || 0;
            guestOccupied += h.occupiedGuestBeds || 0;
          });

          return {
            ...day,
            hostelTotal,
            hostelOccupied,
            guestTotal,
            guestOccupied,
          };
        });

        setMonthDays(finalMapped);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const renderCard = ({ item }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        const filteredHostels = hostelDetails.filter(
          (h: any) => h.reportDate === item.fullDate,
        );

        navigation.navigate(screensName.HostelPlanningDetails, {
          selectedDate: item.fullDate,
          hostels: filteredHostels,
        });
      }}
    >
      <View style={styles.dateRow}>
        <Text style={styles.dateLeft}>{item.date}</Text>
        <Text style={styles.dateRight}>{item.dayName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.dataLabel}>Hostel Beds (Total)</Text>
        <Text style={styles.dataValue}>{item.hostelTotal}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.dataLabel}>Hostel Beds (Occupied)</Text>
        <Text style={styles.dataValue}>{item.hostelOccupied}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.dataLabel}>Guest Beds (Total)</Text>
        <Text style={styles.dataValue}>{item.guestTotal}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.dataLabel}>Guest Beds (Occupied)</Text>
        <Text style={styles.dataValue}>{item.guestOccupied}</Text>
      </View>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: vw(330),
        }}
      >
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
        <TouchableOpacity
          style={[styles.buttonAction, { width: vw(50) }]}
          onPress={() => setCurrentDate(new Date())}
        >
          <Text style={styles.calendarArrow}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAction} onPress={() => {}}>
          <Text style={styles.calendarArrow}>Block</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonAction}
          onPress={() => {
            navigation.navigate(screensName.BlockDetails);
          }}
        >
          <Text style={styles.calendarArrow}>Unblock</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={monthDays}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ marginTop: vh(5), paddingBottom: vh(10) }}
      />
    </SafeAreaView>
  );
};

export default HostelPlanning;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: vw(4),
    backgroundColor: colors.primary,
    alignItems: 'center',
    width: vw(150),
    height: vh(30),
    borderRadius: vw(4),
  },
  buttonAction: {
    padding: vw(4),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(60),
    borderRadius: vw(4),
  },
  calendarArrow: {
    color: colors.white,
    fontSize: vw(12),
  },
  calendarTitle: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: vw(2),
  },
  card: {
    backgroundColor: colors.white,
    width: vw(160),
    paddingVertical: vh(6),
    paddingHorizontal: vw(6),
    marginVertical: vh(4),
    borderRadius: vw(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(5),
  },
  dateLeft: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(18),
  },
  dateRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.grey,
  },
  dataText: {
    fontSize: vw(12),
    marginVertical: vh(1),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey_3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vh(2),
  },

  dataLabel: {
    fontSize: vw(10),
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
    flex: 1,
  },

  dataValue: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
    marginLeft: vw(10),
  },
});
