import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh, images, screensName } from '../../../constants';
import TextAtom from '../../../components/atoms/TextAtom';
import { useHostelDataMutation } from '../../../injectEndpoints/dashboardEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../components/atoms/TouchableAtom';
import DateInputOrganism from '../../../components/organisms/DateInputOrganism';
import ViewAtom from '../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import moment from 'moment';
import ImageAtom from '../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../utils/CommonFunction';
import { useFocusEffect } from '@react-navigation/native';

const AllHostel = (props: any) => {
  const { navigation } = props;
  const selectedCenter = props.route.params?.selectedCenter;
  const [loader, setLoader] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [exportUrlPdf, setExportUrlPdf] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [hostelDataApi] = useHostelDataMutation();

  useFocusEffect(
    useCallback(() => {
      fetchHostelData();
    }, [selectedCenter]),
  );

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const [startDate, setStartDate] = useState<any>('');

  const [summary, setSummary] = useState({
    totalHostel: 0,
    totalRooms: 0,
    totalBeds: 0,
    totalVacantBeds: 0,
    totalOccupiedBeds: 0,
  });

  const calculateSummary = (data: any[]) => {
    let totalHostel = data.length;
    let totalRooms = 0;
    let totalBeds = 0;
    let totalVacantBeds = 0;
    let totalOccupiedBeds = 0;

    data.forEach(item => {
      totalRooms += item.noOfRooms;
      totalBeds += item.noOfBeds;
      totalVacantBeds += item.noOfVacantBeds;
      totalOccupiedBeds += item.noOfOccupiedBeds;
    });

    setSummary({
      totalHostel,
      totalRooms,
      totalBeds,
      totalVacantBeds,
      totalOccupiedBeds,
    });
  };

  const fetchHostelData = () => {
    setLoader(true);

    let params: any = {
      trainingCentre: 'all',
      bipardCentre: [],
      exportFlag: true,
    };
    if (selectedCenter) {
      params.bipardCentre =
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter];
    }

    hostelDataApi(params)
      .unwrap()
      .then((res: any) => {
        const list = res?.data?.hostelData?.hostelDetails || [];
        setReportData(list);
        calculateSummary(list);
        setExportUrlPdf(res?.data?.exportUrlPdf || []);
        setLoader(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: 'Something went wrong' });
      });
  };

  const HostelCard = ({ item, index }: any) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.HostelDetailsDashbaord, {
            item: item,
          });
        }}
      >
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>
            Hostel Name :{' '}
            <TextAtom style={styles.valueRight}>{item.hostelName}</TextAtom>
          </TextAtom>
        </View>
        <ViewAtom
          style={{
            width: '100%',
            height: vh(1),
            backgroundColor: colors.chinese_silver,
            marginTop: vh(6),
          }}
        />
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>
              No. of Floors :{' '}
              <TextAtom style={styles.value}>{item.noOfFloors}</TextAtom>
            </TextAtom>
          </View>

          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>
              No. of Beds :{' '}
              <TextAtom style={styles.valueRight}>{item.noOfBeds}</TextAtom>
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>
              No. of Rooms :{' '}
              <TextAtom style={styles.value}>{item.noOfRooms}</TextAtom>
            </TextAtom>
          </View>

          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>
              No. of Vacant :{' '}
              <TextAtom style={styles.valueRight}>
                {item.noOfVacantBeds}
              </TextAtom>
            </TextAtom>
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const renderTotalCard = () => {
    return (
      <View style={[styles.card, { backgroundColor: '#E8F0FE' }]}>
        <View style={[styles.rowBetween, { alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Total Hostel</TextAtom>
            <TextAtom
              style={[styles.value, { flexShrink: 1 }]}
              numberOfLines={3}
            >
              {summary.totalHostel ?? '-'}
            </TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TextAtom style={styles.label}>Total Rooms</TextAtom>
            <TextAtom
              style={[styles.value, { flexShrink: 1 }]}
              numberOfLines={3}
            >
              {summary.totalRooms ?? '-'}
            </TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>Total Beds</TextAtom>
            <TextAtom
              style={[styles.value, { flexShrink: 1, textAlign: 'right' }]}
              numberOfLines={3}
            >
              {summary.totalBeds ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom
              numberOfLines={0}
              style={[styles.label, { width: vw(160) }]}
            >
              Total Vacant Beds:{' '}
              <TextAtom style={styles.value}>
                {summary.totalVacantBeds}
              </TextAtom>
            </TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={[styles.label]}>
              Occupied Beds:{' '}
              <TextAtom style={styles.valueRight}>
                {summary.totalOccupiedBeds}
              </TextAtom>
            </TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DateInputOrganism
        label={'Date'}
        placeholder={'Date'}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText="Apply Filter"
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText="Clear Filter"
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary }}
        />
      </ViewAtom>
    </View>
  );
  const clearFilter = () => {
    setStartDate('');
    fetchHostelData();
  };

  const applyFilter = () => {
    let params: any = {
      bipardCentre: [],
      startDate: startDate
        ? moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : '',
      endDate: startDate
        ? moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : '',
    };

    if (selectedCenter) {
      params.bipardCentre =
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter];
    }

    setLoader(true);
    hostelDataApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        const list = res?.data?.hostelData?.hostelDetails || [];
        setReportData(list);
        calculateSummary(list);
        setExportUrlPdf(res?.data?.exportUrlPdf || []);
        setLoader(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: 'Something went wrong' });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
        }}
      >
        <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
          <TextAtom style={styles.filterText}>
            {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (!isNullUndefined(exportUrlPdf)) {
              downloadAndOpenFile(exportUrlPdf);
            }
          }}
        >
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={reportData}
        keyExtractor={(_, i) => i.toString()}
        renderItem={HostelCard}
        ListHeaderComponent={
          <View>
            {showFilter && <FilterForm />}
            {renderTotalCard()}
          </View>
        }
        ListEmptyComponent={
          <TextAtom style={styles.emptyText}>No Data Found</TextAtom>
        }
      />
    </SafeAreaView>
  );
};

export default AllHostel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  card: {
    backgroundColor: colors.white,
    marginVertical: vw(4),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    width: vw(320),
    marginLeft: vh(2),
  },
  hostelTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    marginBottom: vh(8),
    color: colors.black,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vh(4),
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: vh(10),
    backgroundColor: '#F5F5F5',
    borderRadius: vw(6),
  },

  bottomItem: {
    alignItems: 'center',
    flex: 1,
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(40),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },

  filterButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginBottom: vh(5),
    alignSelf: 'flex-end',
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  filterText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  filterContainer: { paddingHorizontal: vw(0) },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(5),
  },
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
});
