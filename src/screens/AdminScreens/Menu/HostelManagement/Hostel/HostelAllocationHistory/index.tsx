import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useHostelAllocationDetailsMutation } from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
import { useAppSelector } from '../../../../../../hooks';

interface Props {
  navigation: NavigationType;
}

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const HostelAllocationSeparator = () => <View style={{ height: vh(10) }} />;

interface TraineeCardProps {
  item: any;
  index: number;
  navigation: NavigationType;
}

const TraineeCard = ({ item, index, navigation }: TraineeCardProps) => {
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() =>
        navigation.navigate(screensName.TrainneHostelAllocationDetails, {
          data: item,
        })
      }
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>
      </View>

      <View>
        <TextAtom style={styles.label}>
          {strings.hostelManagement.hostelAllocationHistory.trainingProgramme}
        </TextAtom>
        <TextAtom style={styles.value}>
          {item.nameOfTrainingProgramme || '-'}
          {item.nameOfTrainingProgrammeId
            ? ` (${item.nameOfTrainingProgrammeId})`
            : ''}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.courseStartDate}
          </TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.courseStartDate).format('DD-MM-YYYY')}
          </TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.labelRight}>
            {strings.hostelManagement.hostelAllocationHistory.courseEndDate}
          </TextAtom>
          <TextAtom style={styles.valueRight}>
            {moment(item.courseEndDate).format('DD-MM-YYYY')}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.hostel}
          </TextAtom>
          <TextAtom style={styles.value}>{item.hostelName ?? '-'}</TextAtom>
        </View>

        <View style={styles.centerAlign}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.room}
          </TextAtom>
          <TextAtom style={styles.value}>{item.roomNo ?? '-'}</TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.bed}
          </TextAtom>
          <TextAtom style={styles.value}>{item.bedName ?? '-'}</TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface GuestCardProps {
  item: any;
  index: number;
}

const GuestCard = ({ item, index }: GuestCardProps) => {
  return (
    <View style={styles.card}>
      <TextAtom style={[styles.label, styles.marginBottom5]}>
        {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
      </TextAtom>

      <View>
        <TextAtom style={styles.label}>
          {strings.hostelManagement.hostelAllocationHistory.name}
        </TextAtom>
        <TextAtom style={styles.value}>{item.name || '-'}</TextAtom>
      </View>

      <View>
        <TextAtom style={styles.label}>
          {strings.hostelManagement.hostelAllocationHistory.email}
        </TextAtom>
        <TextAtom style={styles.value}>{item.officeEmail || '-'}</TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <TextAtom style={styles.label}>
          {strings.hostelManagement.hostelAllocationHistory.mobileNumber}
        </TextAtom>
        <TextAtom style={styles.value}>{item.mobileNo ?? '-'}</TextAtom>
      </View>

      <View style={[styles.rowBetween, styles.marginTop8]}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.hostel}
          </TextAtom>
          <TextAtom style={styles.value}>{item.hostelName ?? '-'}</TextAtom>
        </View>

        <View style={styles.centerAlign}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.room}
          </TextAtom>
          <TextAtom style={styles.value}>{item.roomNo ?? '-'}</TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelAllocationHistory.bed}
          </TextAtom>
          <TextAtom style={styles.value}>{item.bedName ?? '-'}</TextAtom>
        </View>
      </View>
    </View>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  trainingDetailList: any[];
  trainindDetail: any;
  setTrainindDetail: (d: any) => void;
  genderList: any[];
  gender: any;
  setGender: (d: any) => void;
  hostelList: any[];
  hostel: any;
  setHostel: (d: any) => void;
  startDate: any;
  endDate: any;
  setStartDate: (d: any) => void;
  setEndDate: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

const FilterForm = ({
  navigation,
  trainingDetailList,
  trainindDetail,
  setTrainindDetail,
  genderList,
  gender,
  setGender,
  hostelList,
  hostel,
  setHostel,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyFilter,
  clearFilter,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={strings.hostelManagement.hostelAllocationHistory.trainingDetail}
      placeholder={
        strings.hostelManagement.hostelAllocationHistory.trainingDetail
      }
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: strings.hostelManagement.hostelAllocationHistory.trainingDetail,
          Data: trainingDetailList,
          selectedData: trainindDetail,
          setSelectedData: setTrainindDetail,
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={trainindDetail?.name}
    />

    <DropDownOrganism
      label={strings.hostelManagement.hostelAllocationHistory.gender}
      placeholder={strings.hostelManagement.hostelAllocationHistory.gender}
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: strings.hostelManagement.hostelAllocationHistory.gender,
          Data: genderList,
          selectedData: gender,
          setSelectedData: setGender,
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={gender?.name}
    />

    <DropDownOrganism
      label={strings.hostelManagement.hostelAllocationHistory.hostel}
      placeholder={strings.hostelManagement.hostelAllocationHistory.hostel}
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: strings.hostelManagement.hostelAllocationHistory.hostel,
          Data: hostelList,
          selectedData: hostel,
          setSelectedData: setHostel,
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={hostel?.name}
    />

    <DateInputOrganism
      label={strings.hostelManagement.hostelAllocationHistory.startDate}
      placeholder={strings.hostelManagement.hostelAllocationHistory.startDate}
      value={startDate}
      onChangeText={setStartDate}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <DateInputOrganism
      label={strings.hostelManagement.hostelAllocationHistory.endDate}
      placeholder={strings.hostelManagement.hostelAllocationHistory.endDate}
      value={endDate}
      onChangeText={setEndDate}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.hostelManagement.hostelAllocationHistory.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.hostelManagement.hostelAllocationHistory.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={styles.colorPrimary}
      />
    </ViewAtom>
  </View>
);

const HostelAllocationHistory = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [hostelAllocationDetailsApi] = useHostelAllocationDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [trainingDetailList, setTrainingDetailList] = useState<any>([]);
  const [trainindDetail, setTrainindDetail] = useState<any>({});
  const [genderList] = useState<any>([
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' },
  ]);
  const [gender, setGender] = useState<any>({});
  const [hostelList, setHostelList] = useState<any>([]);
  const [hostel, setHostel] = useState<any>({});
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<'Trainee' | 'Guest'>('Trainee');

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocationHistory.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        hostelAllocationDetails(1, true, '');
        getTrainingDetails();
        getHostelDetails();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    hostelAllocationDetails(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    hostelAllocationDetails(1, true, search);
  }, [activeTab]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const hostelAllocationDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
    isExport = false,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      bipardCentre: [],
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      isReleasedData: true,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    if (activeTab === 'Guest') {
      params.userType = 'GUEST';
    } else {
      params.userType = 'TRAINEE';
    }

    if (isExport) {
      params.exportFlag = true;
    }

    hostelAllocationDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);

        if (!isNullUndefined(res.data?.exportUrl)) {
          downloadAndOpenFile(res.data.exportUrl);
        }
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      hostelAllocationDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    hostelAllocationDetails(1, true, '');
  };

  const renderListRoomDetails = ({ item, index }: any) =>
    activeTab === 'Guest' ? (
      <GuestCard item={item} index={index} />
    ) : (
      <TraineeCard item={item} index={index} navigation={navigation} />
    );

  const clearFilter = () => {
    setTrainindDetail({});
    setGender({});
    setHostel({});
    setStartDate('');
    setEndDate('');
    hostelAllocationDetails(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (trainindDetail?.id) {
      filters.push(['nameOfTrainingProgrammeId', '=', trainindDetail.id]);
    }

    if (gender?.id) {
      filters.push(['gender', '=', gender.id]);
    }

    if (hostel?.id) {
      filters.push(['hostelNameId', '=', hostel.id]);
    }

    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseStartDate', '>=', formatted]);
    }

    if (endDate) {
      const formatted = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseEndDate', '<=', formatted]);
    }
    hostelAllocationDetails(1, true, search, filters, isExport);
  };

  const getTrainingDetails = () => {
    setInitialCall(true);
    const params = {
      bipardCentre: ['Gaya', 'Patna'],
      listType: 'list-all-training',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingDetailList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getHostelDetails = () => {
    setInitialCall(true);
    const params = {
      bipardCentre: ['Gaya', 'Patna'],
      listType: 'filter_hostel_name_for_bed_details',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setHostelList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.heightAuto}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
              <TextAtom style={styles.filterText}>
                {showFilter
                  ? strings.hostelManagement.hostelAllocationHistory.hideFilter
                  : strings.hostelManagement.hostelAllocationHistory.showFilter}
              </TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={styles.filterButton}
              onPress={() => applyFilter(true)}
            >
              <ImageAtom
                source={images.download}
                style={styles.tintColorBlack}
              />
            </TouchableAtom>
          </View>
          {showFilter && (
            <FilterForm
              navigation={navigation}
              trainingDetailList={trainingDetailList}
              trainindDetail={trainindDetail}
              setTrainindDetail={setTrainindDetail}
              genderList={genderList}
              gender={gender}
              setGender={setGender}
              hostelList={hostelList}
              hostel={hostel}
              setHostel={setHostel}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
            />
          )}

          {crediantialData.user[0].tenantId === 3 && (
            <DropDownOrganism
              label={''}
              placeholder={'Centers'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Center',
                  Data: [
                    {
                      id: strings.dashboardIndex.allCenters,
                      name: strings.dashboardIndex.allCenters,
                    },
                    {
                      id: strings.dashboardIndex.gaya,
                      name: strings.dashboardIndex.gaya,
                    },
                    {
                      id: strings.dashboardIndex.patna,
                      name: strings.dashboardIndex.patna,
                    },
                  ],
                  selectedData: centerSerach,
                  setSelectedData: setCenterSerach,
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={centerSerach?.name}
              containerStyle={styles.centerDropdown}
            />
          )}
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={styles.marginTop10}
          />
        </ScrollView>
      </View>
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
              {tab}
            </TextAtom>
          </TouchableAtom>
        ))}
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(10) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              hostelAllocationDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? hostelAllocationDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={HostelAllocationSeparator}
      />
    </SafeAreaView>
  );
};

export default HostelAllocationHistory;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: vw(10),
    marginTop: vh(5),
  },
  tabButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(35),
    backgroundColor: '#EAEAEA',
    borderRadius: vw(6),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  activeTabText: {
    color: colors.white,
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    marginBottom: vh(5),
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
    textAlign: 'right',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  filterButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
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
  filterContainer: { paddingHorizontal: vw(15) },
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
  heightAuto: {
    height: 'auto',
  },
  filterRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  tintColorBlack: {
    tintColor: colors.black,
  },
  centerDropdown: {
    marginBottom: vh(5),
  },
  marginTop10: {
    marginTop: vh(10),
  },
  flex1: {
    flex: 1,
  },
  flexEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  centerAlign: {
    flex: 1,
    alignItems: 'center',
  },
  marginBottom5: {
    marginBottom: vh(5),
  },
  marginTop8: {
    marginTop: vh(8),
  },
  colorPrimary: {
    color: colors.primary,
  },
});
