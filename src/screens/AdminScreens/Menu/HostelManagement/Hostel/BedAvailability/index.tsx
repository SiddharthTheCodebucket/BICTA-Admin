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
  screensName,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import {
  useBedDetailsRoomMutation,
  useDeleteHostelRoomMutation,
  useUpdateHostelRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';

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

const BedAvailability = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [bedDetailsApi] = useBedDetailsRoomMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [hostelList, setHostelList] = useState<any>([]);
  const [floorList, setFloorList] = useState<any>([]);
  const [roomList, setRoomList] = useState<any>([]);
  const [selectedHostel, setSelectedHostel] = useState<any>({});
  const [selectedFloor, setSelectedFloor] = useState<any>({});
  const [selectedRoom, setSelectedRoom] = useState<any>({});
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<
    'Vacant' | 'Allocated' | 'Blocked'
  >('Vacant');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Bed Availability Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        bedDetailsList(1, true, '');
        getHostelName();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    bedDetailsList(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    bedDetailsList(1, true, search);
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

  const bedDetailsList = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      bedStatus: activeTab,
      date: '',
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    if (startDate) {
      params.fromDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    if (endDate) {
      params.toDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    bedDetailsApi(params)
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
      bedDetailsList(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    bedDetailsList(1, true, '');
  };

  const RoomCard = ({ item, index, navigation }: any) => {
    return (
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Hostel</TextAtom>
            <TextAtom style={styles.value}>
              {item.selectHostelName ?? '-'}
            </TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Room</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.selectRoomNo ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Bed</TextAtom>
            <TextAtom style={styles.value}>{item.bedName ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Status</TextAtom>
            <TextAtom numberOfLines={0} style={styles.valueRight}>
              {item.bedStatus ?? '-'}
            </TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => {
    return <RoomCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Hostel'}
        placeholder={'Hostel'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Hostel',
            Data: hostelList,
            selectedData: selectedHostel,
            setSelectedData: (data: any) => {
              setSelectedHostel(data);
              getFloorName(data.id);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedHostel?.name}
      />

      <DropDownOrganism
        label={'Floor'}
        placeholder={'Floor'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Floor',
            Data: floorList,
            selectedData: selectedFloor,
            setSelectedData: (data: any) => {
              setSelectedFloor(data);
              getRoomName(data.id);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedFloor?.name}
      />

      <DropDownOrganism
        label={'Room'}
        placeholder={'Room'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Room',
            Data: roomList,
            selectedData: selectedRoom,
            setSelectedData: (data: any) => {
              setSelectedRoom(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedRoom?.name}
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
    setSelectedHostel({});
    setSelectedFloor({});
    setSelectedRoom({});
    setStartDate('');
    setEndDate('');
    bedDetailsList(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedHostel?.id) {
      filters.push(['selectHostelNameId', '=', selectedHostel.id]);
    }

    if (selectedFloor?.id) {
      filters.push(['selectFloorNameId', '=', selectedFloor.id]);
    }

    if (selectedRoom?.id) {
      filters.push(['selectRoomNoId', '=', selectedRoom.id]);
    }

    bedDetailsList(1, true, search, filters);
  };

  const getHostelName = () => {
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
        setSelectedFloor({});
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

  const getFloorName = (hostelId: any) => {
    setInitialCall(true);
    const params = {
      bipardCentre: ['Gaya', 'Patna'],
      listType: 'filter_floor_name_for_bed_details',
      replacements: ['%%', hostelId],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFloorList(res.data);
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

  const getRoomName = (floorId: any) => {
    setInitialCall(true);
    const params = {
      bipardCentre: ['Gaya', 'Patna'],
      listType: 'filter_room_no_for_bed_details',
      replacements: ['%%', selectedHostel.id, floorId],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setRoomList(res.data);
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
      <View style={{ height: 'auto' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
            <TextAtom style={styles.filterText}>
              {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
            </TextAtom>
          </TouchableAtom>

          {showFilter && <FilterForm />}

          {crediantialData.user[0].tenantId === 3 && (
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
          )}
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={{ marginTop: vh(10) }}
          />
        </ScrollView>
      </View>
      <View style={styles.tabRow}>
        {['Vacant', 'Allocated', 'Blocked'].map(tab => (
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
              bedDetailsList(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? bedDetailsList(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default BedAvailability;

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
    paddingHorizontal: vw(25),
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
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
