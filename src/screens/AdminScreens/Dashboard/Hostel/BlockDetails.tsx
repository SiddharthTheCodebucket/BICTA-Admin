import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../../constants';
import strings from '../../../../constants/strings';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {
  useDashboardBlockBedListMutation,
  useDashboardUnblockBedMutation,
} from '../../../../injectEndpoints/dashboardEndpoints';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';

interface Props {
  route: any;
  navigation: NavigationType;
}

const BlockDetails = ({ route, navigation }: Props) => {
  const [dashboardBlockBedListAPi] = useDashboardBlockBedListMutation();
  const [dashboardUnBlockBedAPi] = useDashboardUnblockBedMutation();
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.blockDetails.hostelDetails);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    blockedbedData();
  }, []);

  const blockedbedData = () => {
    setLoader(true);

    const params = {};

    dashboardBlockBedListAPi(params)
      .unwrap()
      .then((res: any) => {
        setData(res?.data?.data || []);
        setLoader(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };
  const unblockedBedData = (item: any) => {
    setLoader(true);

    const params = {
      bedIds: item.blockedBedIds,
      blockFrom: item.fromDate,
      blockTo: item.toDate,
    };

    dashboardUnBlockBedAPi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setLoader(false);
        navigation.navigate('BottomTabNavigator', {
          screen: 'Dashboard',
          params: { goToHostelPlanning: true },
        });
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };

  const renderCard = ({ item, index }: any) => {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TextAtom style={styles.label}>{strings.blockDetails.srNo}</TextAtom>
          <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>
            {strings.blockDetails.purpose}
          </TextAtom>
          <TextAtom style={styles.value}>{item.purpose}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>{strings.blockDetails.type}</TextAtom>
          <TextAtom style={styles.value}>{item.type}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>
            {strings.blockDetails.hostel}
          </TextAtom>
          <TextAtom style={styles.value}>{item.hostel}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>{strings.blockDetails.from}</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.fromDate).format('YYYY-MM-DD')}
          </TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>{strings.blockDetails.to}</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.toDate).format('YYYY-MM-DD')}
          </TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>
            {strings.blockDetails.blockedRooms}
          </TextAtom>
          <TextAtom style={styles.value}>{item.blockedBedIds?.length}</TextAtom>
        </View>

        <TouchableAtom
          style={styles.unblockBtn}
          onPress={() => unblockedBedData(item)}
        >
          <TextAtom style={styles.unblockText}>
            {strings.blockDetails.unblock}
          </TextAtom>
        </TouchableAtom>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <TextAtom style={styles.title}>
        {strings.blockDetails.hostelDetailsOn} {moment().format('D MMMM YYYY')}
      </TextAtom>

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loader ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.blockDetails.noDataFound}
            </TextAtom>
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default BlockDetails;

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

  card: {
    marginHorizontal: vw(15),
    marginBottom: vh(10),
    padding: vw(15),
    backgroundColor: colors.white,
    borderRadius: vw(8),
    elevation: 3,
    shadowColor: colors.black_20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vh(4),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
    fontSize: vw(14),
  },

  unblockBtn: {
    marginTop: vh(10),
    backgroundColor: colors.primary,
    paddingVertical: vh(8),
    borderRadius: vw(6),
    alignItems: 'center',
  },

  unblockText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(30),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
  listContent: {
    paddingBottom: vh(30),
  },
});
