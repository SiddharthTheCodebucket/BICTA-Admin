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
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import { useHostelAllocationDetailsMutation } from '../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../utils/CommonFunction';

interface Props {
  route: any;
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

const HostelAllocationHistory = (props: Props) => {
  const { navigation } = props;

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

  const [trainindDetailList, setTrainingDetailList] = useState<any>([]);
  const [trainindDetail, setTrainindDetail] = useState<any>({});
  const [genderList, setGenderList] = useState<any>([
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
    Header.setNavigation(navigation, 'Hostel Allocation History');
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
    if (centerSerach.name === 'All Centers') {
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

  const TraineeCard = ({ item, index, navigation }: any) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.TrainneHostelAllocationDetails, {
            data: item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Training Programme</TextAtom>
          <TextAtom style={styles.value}>
            {item.nameOfTrainingProgramme || '-'}
            {item.nameOfTrainingProgrammeId
              ? ` (${item.nameOfTrainingProgrammeId})`
              : ''}
          </TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Course Start Date</TextAtom>
            <TextAtom style={styles.value}>
              {moment(item.courseStartDate).format('DD-MM-YYYY')}
            </TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Course End Date</TextAtom>
            <TextAtom style={styles.valueRight}>
              {moment(item.courseEndDate).format('DD-MM-YYYY')}
            </TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Hostel</TextAtom>
            <TextAtom style={styles.value}>{item.hostelName ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TextAtom style={styles.label}>Room</TextAtom>
            <TextAtom style={styles.value}>{item.roomNo ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>Bed</TextAtom>
            <TextAtom style={styles.value}>{item.bedName ?? '-'}</TextAtom>
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const GuestCard = ({ item, index }: any) => {
    return (
      <View style={styles.card}>
        <TextAtom style={[styles.label, { marginBottom: vh(5) }]}>
          Sr. No: {index + 1}
        </TextAtom>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>name</TextAtom>
          <TextAtom style={styles.value}>{item.name || '-'}</TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Email</TextAtom>
          <TextAtom style={styles.value}>{item.officeEmail || '-'}</TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <TextAtom style={styles.label}>Mobile Number</TextAtom>
          <TextAtom style={styles.value}>{item.mobileNo ?? '-'}</TextAtom>
        </View>

        <View style={[styles.rowBetween, { marginTop: vh(8) }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Hostel</TextAtom>
            <TextAtom style={styles.value}>{item.hostelName ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TextAtom style={styles.label}>Room</TextAtom>
            <TextAtom style={styles.value}>{item.roomNo ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>Bed</TextAtom>
            <TextAtom style={styles.value}>{item.bedName ?? '-'}</TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => {
    if (activeTab === 'Guest') {
      return <GuestCard item={item} index={index} />;
    } else {
      return <TraineeCard item={item} index={index} navigation={navigation} />;
    }
  };
  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Training Detail'}
        placeholder={'Training Detail'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Training Detail',
            Data: trainindDetailList,
            selectedData: trainindDetail,
            setSelectedData: (data: any) => {
              setTrainindDetail(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={trainindDetail?.name}
      />

      <DropDownOrganism
        label={'Gender'}
        placeholder={'Gender'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Gender',
            Data: genderList,
            selectedData: gender,
            setSelectedData: (data: any) => {
              setGender(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={gender?.name}
      />

      <DropDownOrganism
        label={'Hostel'}
        placeholder={'Hostel'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Hostel',
            Data: hostelList,
            selectedData: hostel,
            setSelectedData: (data: any) => {
              setHostel(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={hostel?.name}
      />
      <DateInputOrganism
        label={'Start Date'}
        placeholder={'Start Date'}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <DateInputOrganism
        label={'End Date'}
        placeholder={'End Date'}
        value={endDate}
        onChangeText={(val: any) => {
          setEndDate(val);
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

      <View style={{ height: vh(170) }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
              onPress={() => applyFilter(true)}
            >
              <ImageAtom
                source={images.download}
                style={{ tintColor: colors.primary }}
              />
            </TouchableAtom>
          </View>
          {showFilter && <FilterForm />}

          <DropDownOrganism
            label={''}
            placeholder={'Centers'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Center',
                Data: [
                  { id: 'All Centers', name: 'All Centers' },
                  { id: 'Gaya', name: 'Gaya' },
                  { id: 'Patna', name: 'Patna' },
                ],
                selectedData: centerSerach,
                setSelectedData: setCenterSerach,
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={centerSerach?.name}
            containerStyle={{ marginBottom: vh(5) }}
          />
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={{ marginTop: vh(10) }}
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
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
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
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
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
});
