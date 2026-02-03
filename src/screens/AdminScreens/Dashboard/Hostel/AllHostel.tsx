import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  LayoutAnimation,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  vw,
  vh,
  images,
  screensName,
} from '../../../../constants';
import strings from '../../../../constants/strings';
import TextAtom from '../../../../components/atoms/TextAtom';
import { useHostelDataMutation } from '../../../../injectEndpoints/dashboardEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import DateInputOrganism from '../../../../components/organisms/DateInputOrganism';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import moment from 'moment';
import ImageAtom from '../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../utils/CommonFunction';
import { useFocusEffect } from '@react-navigation/native';

interface HostelCardProps {
  item: any;
  onPress: (item: any) => void;
}

const HostelCard = ({ item, onPress }: HostelCardProps) => {
  return (
    <TouchableAtom style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.flex1}>
        <TextAtom style={styles.label}>
          {strings.allHostel.hostelName}{' '}
          <TextAtom style={styles.valueRight}>{item.hostelName}</TextAtom>
        </TextAtom>
      </View>

      <ViewAtom style={styles.separator} />

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.allHostel.noOfFloors}{' '}
            <TextAtom style={styles.value}>{item.noOfFloors}</TextAtom>
          </TextAtom>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.allHostel.noOfBeds}{' '}
            <TextAtom style={styles.valueRight}>{item.noOfBeds}</TextAtom>
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.allHostel.noOfRooms}{' '}
            <TextAtom style={styles.value}>{item.noOfRooms}</TextAtom>
          </TextAtom>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.allHostel.noOfVacant}{' '}
            <TextAtom style={styles.valueRight}>{item.noOfVacantBeds}</TextAtom>
          </TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  startDate: any;
  setStartDate: (val: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

const FilterForm = ({
  startDate,
  setStartDate,
  applyFilter,
  clearFilter,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DateInputOrganism
      label={strings.allHostel.date}
      placeholder={strings.allHostel.date}
      value={startDate}
      onChangeText={setStartDate}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.allHostel.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.allHostel.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={styles.clearBtnText}
      />
    </ViewAtom>
  </View>
);

const AllHostel = (props: any) => {
  const { navigation } = props;
  const selectedCenter = props?.selectedCenter;
  const [loader, setLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchHostelData = (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoader(true);
    }

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
        if (isRefreshing) setRefreshing(false);
        else setLoader(false);
      })
      .catch(() => {
        if (isRefreshing) setRefreshing(false);
        else setLoader(false);
        Toast.show({ type: 'error', text2: 'Something went wrong' });
      });
  };

  const onHostelPress = (item: any) => {
    navigation.navigate(screensName.HostelDetailsDashbaord, { item });
  };

  const renderTotalCard = () => {
    return (
      <View style={[styles.card, styles.summaryCard]}>
        <View style={[styles.rowBetween, styles.alignStart]}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.allHostel.totalHostel}
            </TextAtom>
            <TextAtom
              style={[styles.value, styles.flexShrink]}
              numberOfLines={3}
            >
              {summary.totalHostel ?? '-'}
            </TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignCenter]}>
            <TextAtom style={styles.label}>
              {strings.allHostel.totalRooms}
            </TextAtom>
            <TextAtom
              style={[styles.value, styles.flexShrink]}
              numberOfLines={3}
            >
              {summary.totalRooms ?? '-'}
            </TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.label}>
              {strings.allHostel.totalBeds}
            </TextAtom>
            <TextAtom
              style={[styles.value, styles.flexShrinkRight]}
              numberOfLines={3}
            >
              {summary.totalBeds ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom
              numberOfLines={0}
              style={[styles.label, styles.labelWidth]}
            >
              {strings.allHostel.totalVacantBeds}{' '}
              <TextAtom style={styles.value}>
                {summary.totalVacantBeds}
              </TextAtom>
            </TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={[styles.label]}>
              {strings.allHostel.occupiedBeds}{' '}
              <TextAtom style={styles.valueRight}>
                {summary.totalOccupiedBeds}
              </TextAtom>
            </TextAtom>
          </View>
        </View>
      </View>
    );
  };

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchHostelData(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <View style={styles.headerContainer}>
        <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
          <TextAtom style={styles.filterText}>
            {showFilter
              ? strings.allHostel.hideFilter
              : strings.allHostel.showFilter}
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
          <ImageAtom source={images.download} style={styles.downloadIcon} />
        </TouchableAtom>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={reportData}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <HostelCard item={item} onPress={onHostelPress} />
        )}
        ListHeaderComponent={
          <View>
            {showFilter && (
              <FilterForm
                startDate={startDate}
                setStartDate={setStartDate}
                applyFilter={applyFilter}
                clearFilter={clearFilter}
              />
            )}
            {renderTotalCard()}
          </View>
        }
        ListEmptyComponent={
          <TextAtom style={styles.emptyText}>
            {strings.allHostel.noDataFound}
          </TextAtom>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
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
    backgroundColor: colors.veryLightGray,
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
  flex1: {
    flex: 1,
  },
  separator: {
    width: '100%',
    height: vh(1),
    backgroundColor: colors.chinese_silver,
    marginTop: vh(6),
  },
  summaryCard: {
    backgroundColor: colors.lightBlue,
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  flexShrink: {
    flexShrink: 1,
  },
  flexShrinkRight: {
    flexShrink: 1,
    textAlign: 'right',
  },
  labelWidth: {
    width: vw(160),
  },
  headerContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  downloadIcon: {
    tintColor: colors.black,
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
  clearBtnText: {
    color: colors.primary,
  },
});
