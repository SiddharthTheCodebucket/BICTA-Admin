import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';
import TouchableAtom from '../../../components/atoms/TouchableAtom';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const HostelPlanningDetails = (props: Props) => {
  const { navigation } = props;
  const hostels = props.route.params?.hostels;
  const selectedDate = props.route.params?.selectedDate;
  const [activeTab, setActiveTab] = useState<'Trainee' | 'Guest'>('Trainee');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Hostel Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeTab]);

  useEffect(() => {
    applyFilter();
    setLoading(false);
  }, []);

  const applyFilter = () => {
    if (!hostels) return;

    let filtered;

    if (activeTab === 'Trainee') {
      filtered = hostels.filter(
        (h: any) =>
          (h.totalTraineeRooms ?? 0) > 0 || (h.totalTraineeBeds ?? 0) > 0,
      );
    } else {
      filtered = hostels.filter(
        (h: any) => (h.totalGuestRooms ?? 0) > 0 || (h.totalGuestBeds ?? 0) > 0,
      );
    }

    setFilteredData(filtered);
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <TextAtom style={[styles.headerCell, { flex: 0.6 }]}>Sr.No</TextAtom>
      <TextAtom style={[styles.headerCell, { flex: 2 }]}>Hostel Name</TextAtom>

      <TextAtom style={[styles.headerCell, { flex: 1 }]}>Room</TextAtom>
      <TextAtom style={[styles.headerCell, { flex: 1 }]}>Bed</TextAtom>
    </View>
  );

  const renderRow = ({ item, index }: any) => {
    const traineeRoom = item.totalTraineeRooms ?? 0;
    const traineeBed = item.totalTraineeBeds ?? 0;

    const guestRoom = item.totalGuestRooms ?? 0;
    const guestBed = item.totalGuestBeds ?? 0;

    return (
      <View style={styles.tableRow}>
        <TextAtom style={[styles.cell, { flex: 0.6 }]}>{index + 1}</TextAtom>

        <TextAtom style={[styles.cell, { flex: 2 }]}>
          {item.hostelName ?? '-'}
        </TextAtom>

        {activeTab === 'Trainee' ? (
          <>
            <TextAtom style={[styles.cell, { flex: 1 }]}>
              {traineeRoom}
            </TextAtom>
            <TextAtom style={[styles.cell, { flex: 1 }]}>{traineeBed}</TextAtom>
          </>
        ) : (
          <>
            <TextAtom style={[styles.cell, { flex: 1 }]}>{guestRoom}</TextAtom>
            <TextAtom style={[styles.cell, { flex: 1 }]}>{guestBed}</TextAtom>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <TextAtom style={styles.title}>
        Hostel Details On {moment(selectedDate).format('D MMMM YYYY')}
      </TextAtom>

      <View style={styles.tabRow}>
        {['Trainee', 'Guest'].map(tab => (
          <TouchableAtom
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <TextAtom
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === 'Trainee' ? 'Training Vacant Beds' : 'Guest Vacant Beds'}
            </TextAtom>
          </TouchableAtom>
        ))}
      </View>

      {renderHeader()}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderRow}
        ListEmptyComponent={
          !loading ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default HostelPlanningDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  title: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(18),
    margin: vw(15),
    color: colors.black,
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: vw(10),
    marginBottom: vh(10),
  },

  tabButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: '#EAEAEA',
    borderRadius: vw(6),
  },

  activeTab: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
  },
  activeTabText: {
    color: colors.white,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: vh(8),
    paddingHorizontal: vw(10),
    borderRadius: vw(6),
    marginHorizontal: vw(10),
    marginBottom: vh(4),
  },

  headerCell: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.black,
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: vh(10),
    paddingHorizontal: vw(10),
    marginHorizontal: vw(10),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  cell: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.black,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(30),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
});
