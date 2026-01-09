import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  LayoutAnimation,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vw, vh } from '../../../../constants';
import strings from '../../../../constants/strings';
import TextAtom from '../../../../components/atoms/TextAtom';
import { useHostelReportDataMutation } from '../../../../injectEndpoints/dashboardEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../components/organisms/DropDownOrganism';
import DateInputOrganism from '../../../../components/organisms/DateInputOrganism';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { isNullUndefined } from '../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

interface ReportCardProps {
  item: any;
  index: number;
}

const ReportCard = ({ item, index }: ReportCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>{strings.hostelReport.srNo}</TextAtom>
          <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </View>

        <View style={[styles.flex1, styles.alignEnd]}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.totalBed}
          </TextAtom>
          <TextAtom style={styles.valueRight}>{item.totalBeds}</TextAtom>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>
          {strings.hostelReport.hostelGuestHouseName}
        </TextAtom>
        <TextAtom style={styles.value}>{item.hostelName}</TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.traineeAllocatedBed}
          </TextAtom>
          <TextAtom style={styles.value}>{item.allocatedTraineeBeds}</TextAtom>
        </View>

        <View style={[styles.flex1, styles.alignEnd]}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.guestAllocatedBed}
          </TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.allocatedGuestBeds}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <TextAtom style={styles.label}>
          {strings.hostelReport.totalAllocatedBed}
        </TextAtom>
        <TextAtom style={styles.valueRight}>{item.totalAllocatedBeds}</TextAtom>
      </View>
    </View>
  );
};

interface FilterFormProps {
  navigation: any;
  userTypeList: any[];
  selectedUserType: any;
  selectedTraining: any;
  selectedDesignation: any;
  trainingList: any[];
  designationList: any[];
  startDate: any;
  endDate: any;
  setStartDate: (v: any) => void;
  setEndDate: (v: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  handleUserTypeChange: (d: any) => void;
  setSelectedTraining: (d: any) => void;
  setSelectedDesignation: (d: any) => void;
}

const FilterForm = ({
  navigation,
  userTypeList,
  selectedUserType,
  selectedTraining,
  selectedDesignation,
  trainingList,
  designationList,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyFilter,
  clearFilter,
  handleUserTypeChange,
  setSelectedTraining,
  setSelectedDesignation,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label="User Type"
      placeholder="User Type"
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: strings.hostelReport.userType,
          Data: userTypeList,
          selectedData: selectedUserType,
          setSelectedData: handleUserTypeChange,
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={selectedUserType?.name}
    />

    {selectedUserType?.id === 'Trainee' && (
      <>
        <DropDownOrganism
          label={strings.hostelReport.training}
          placeholder={strings.hostelReport.training}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: strings.hostelReport.training,
              Data: trainingList,
              selectedData: selectedTraining,
              setSelectedData: setSelectedTraining,
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={selectedTraining?.name}
        />

        <DropDownOrganism
          label={strings.hostelReport.designation}
          placeholder={strings.hostelReport.designation}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: strings.hostelReport.designation,
              Data: designationList,
              selectedData: selectedDesignation,
              setSelectedData: setSelectedDesignation,
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={selectedDesignation?.name}
        />
      </>
    )}

    {!isNullUndefined(selectedUserType) && (
      <>
        <DateInputOrganism
          label={strings.hostelReport.startDate}
          placeholder={strings.hostelReport.startDate}
          value={startDate}
          onChangeText={setStartDate}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
        />
        <DateInputOrganism
          label={strings.hostelReport.endDate}
          placeholder={strings.hostelReport.endDate}
          value={endDate}
          onChangeText={setEndDate}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
        />
      </>
    )}

    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.hostelReport.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.hostelReport.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={styles.clearBtnText}
      />
    </ViewAtom>
  </View>
);

const HostelReport = (props: any) => {
  const { navigation } = props;
  const selectedCenter = props.route?.params?.selectedCenter;
  const [loader, setLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [hostelReportDataApi] = useHostelReportDataMutation();
  const [commonListApi] = useCommonDropdownListMutation();

  useFocusEffect(
    useCallback(() => {
      fetchHostelReportData();
      getTrainingList();
      getTrainingDesignation();
    }, [selectedCenter]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHostelReportData(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const [userTypeList] = useState<any>([
    { id: 'Trainee', name: 'Trainee' },
    { id: 'Guest', name: 'Guest' },
  ]);
  const [trainingList, setTrainingList] = useState<any>([]);
  const [designationList, setDesignationList] = useState<any>([]);
  const [selectedUserType, setSelectedUserType] = useState<any>({});
  const [selectedTraining, setSelectedTraining] = useState<any>({});
  const [selectedDesignation, setSelectedDesignation] = useState<any>({});
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const fetchHostelReportData = (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoader(true);
    }

    let params: any = {
      bipardCentre: [],
      startDate: '',
      endDate: '',
      training: '',
      designation: '',
    };

    if (selectedCenter) {
      params.bipardCentre =
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter];
    }

    hostelReportDataApi(params)
      .unwrap()
      .then((res: any) => {
        setReportData(res?.data?.data || []);
        if (isRefreshing) setRefreshing(false);
        else setLoader(false);
      })
      .catch(() => {
        if (isRefreshing) setRefreshing(false);
        else setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };

  const calculateTotals = () => {
    const list = Array.isArray(reportData) ? reportData : [];

    return {
      totalBeds: list.reduce((s, v) => s + (v.totalBeds || 0), 0),
      totalTrainee: list.reduce((s, v) => s + (v.allocatedTraineeBeds || 0), 0),
      totalGuest: list.reduce((s, v) => s + (v.allocatedGuestBeds || 0), 0),
      totalAllocated: list.reduce((s, v) => s + (v.totalAllocatedBeds || 0), 0),
    };
  };

  const totals = calculateTotals();

  const getTrainingList = () => {
    setLoader(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre:
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingList(res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const getTrainingDesignation = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_designation',
      bipardCentre:
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setDesignationList(res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const renderTotalCard = () => (
    <View style={[styles.card, styles.summaryCardBg]}>
      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.totalBed}
          </TextAtom>
          <TextAtom style={styles.value}>{totals.totalBeds}</TextAtom>
        </View>

        <View style={[styles.flex1, styles.alignEnd]}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.totalAllocatedBed}
          </TextAtom>
          <TextAtom style={styles.valueRight}>{totals.totalAllocated}</TextAtom>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.traineeAllocatedBed}
          </TextAtom>
          <TextAtom style={styles.value}>{totals.totalTrainee}</TextAtom>
        </View>

        <View style={[styles.flex1, styles.alignEnd]}>
          <TextAtom style={styles.label}>
            {strings.hostelReport.guestAllocatedBed}
          </TextAtom>
          <TextAtom style={styles.valueRight}>{totals.totalGuest}</TextAtom>
        </View>
      </View>
    </View>
  );

  const clearFilter = () => {
    setSelectedUserType({});
    setSelectedTraining({});
    setSelectedDesignation({});
    setStartDate('');
    setEndDate('');
    fetchHostelReportData();
  };

  const handleUserTypeChange = (data: any) => {
    setSelectedUserType(data);

    setSelectedTraining({});
    setSelectedDesignation({});
    setStartDate('');
    setEndDate('');
  };

  const applyFilter = () => {
    let params: any = {
      bipardCentre: [],
      startDate: startDate
        ? moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : '',
      endDate: endDate
        ? moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
        : '',
    };

    if (selectedCenter) {
      params.bipardCentre =
        selectedCenter === 'All Centers' ? ['Gaya', 'Patna'] : [selectedCenter];
    }

    if (selectedUserType?.id === 'Trainee') {
      params.training = selectedTraining?.id || '';
      params.designation = selectedDesignation?.id || '';
    }

    setLoader(true);
    hostelReportDataApi(params)
      .unwrap()
      .then((res: any) => {
        setReportData(res?.data?.data || []);
        setLoader(false);
        setShowFilter(false);
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: strings.something_went_wrong });
      });
  };

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter
            ? strings.hostelReport.hideFilter
            : strings.hostelReport.showFilter}
        </TextAtom>
      </TouchableAtom>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={reportData}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <ReportCard item={item} index={index} />
        )}
        ListFooterComponent={renderTotalCard()}
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              userTypeList={userTypeList}
              selectedUserType={selectedUserType}
              selectedTraining={selectedTraining}
              selectedDesignation={selectedDesignation}
              trainingList={trainingList}
              designationList={designationList}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              handleUserTypeChange={handleUserTypeChange}
              setSelectedTraining={setSelectedTraining}
              setSelectedDesignation={setSelectedDesignation}
            />
          ) : null
        }
        ListEmptyComponent={
          <TextAtom style={styles.emptyText}>
            {strings.hostelReport.noDataFound}
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

export default HostelReport;

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
    elevation: 3,
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
    textAlign: 'right',
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
    textAlign: 'right',
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
  flex1: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  clearBtnText: {
    color: colors.primary,
  },
  summaryCardBg: {
    backgroundColor: colors.lightBlue,
  },
});
