import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, fonts, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';

import { useAppSelector } from '../../../../hooks';
import TextAtom from '../../../../components/atoms/TextAtom';
import { useHostelAllocationDetailsMutation } from '../../../../injectEndpointsTrainee/hostelEndpoints';

interface Props {
  navigation: NavigationType;
}

const Hostel = (props: Props) => {
  const { navigation } = props;

  const [hostelAllocationDetailsApi] = useHostelAllocationDetailsMutation();
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [data, setData] = useState<any>(null);
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Hostel Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    hostelAllocationDetails();
  }, []);

  const hostelAllocationDetails = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [
        ['adminUserId', '=', Number(crediantialData.user[0].adminUserId)],
      ],
      pageNo: 1,
      itemsPerPage: 10,
    };

    hostelAllocationDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        const d = res.data?.data?.[0] ?? null;
        setData(d);
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

  const renderHostelCard = () => {
    if (!data) {
      return (
        <View style={styles.noDataCard}>
          <TextAtom style={styles.noDataText}>
            No Hostel Allocation Found
          </TextAtom>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TextAtom style={styles.label}>Hostel</TextAtom>
          <TextAtom style={styles.value}>{data?.hostelName ?? '-'}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>Floor</TextAtom>
          <TextAtom style={styles.value}>{data?.floorName ?? '-'}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>Room No</TextAtom>
          <TextAtom style={styles.value}>{data?.roomNo ?? '-'}</TextAtom>
        </View>

        <View style={styles.row}>
          <TextAtom style={styles.label}>Bed</TextAtom>
          <TextAtom style={styles.value}>{data?.bedName ?? '-'}</TextAtom>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      {!loader && renderHostelCard()}
    </SafeAreaView>
  );
};

export default Hostel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: 0,
    paddingTop: vh(2),
  },

  card: {
    backgroundColor: colors.white,
    marginTop: vh(5),
    marginHorizontal: vw(15),
    borderRadius: vw(6),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    paddingHorizontal: vw(10),
    paddingVertical: vh(8),
  },

  label: {
    fontSize: vw(14),
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    marginTop: vh(5),
  },

  value: {
    fontSize: vw(14),
    color: colors.grey,
    marginTop: vh(5),
    fontFamily: fonts.Roboto_Regular,
  },

  noDataCard: {
    marginTop: vh(12),
    alignSelf: 'center',
    paddingVertical: vh(3),
    paddingHorizontal: vw(10),
  },

  noDataText: {
    fontSize: vw(14),
    color: colors.grey,
    fontFamily: fonts.Roboto_Bold,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(4),
  },
});
