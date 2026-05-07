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
  TouchableOpacity,
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
  SvgDelete,
  SvgEditPencile,
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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import SubTab from '../../../../../../components/molecules/SubTab';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import FormSwitchForCard from '../../../../../../components/templates/FormSwitchForCard';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';
import {
  useDeleteHostelRoomMutation,
  useHostelRoomDetailsMutation,
  useUpdateHostelRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';

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

const ListItemSeparator = () => <View style={styles.itemSeparator} />;

const InfoField = ({ label, value, fullWidth = false }: any) => (
  <View style={[globalStyles.infoCol, !fullWidth && { flex: 1 }]}>
    <TextAtom style={globalStyles.infoLabel}>{label}</TextAtom>
    <TextAtom style={globalStyles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const RoomDetailsList = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const center = useGetCentre();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [roomDetailsApi] = useHostelRoomDetailsMutation();
  const [updateHostelRoomApi] = useUpdateHostelRoomMutation();
  const [deleteHostelRoomApi] = useDeleteHostelRoomMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('room');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [hostelList, setHostelList] = useState<any>([]);
  const [floorList, setFloorList] = useState<any>([]);
  const [selectedHostel, setSelectedHostel] = useState<any>({});
  const [selectedFloor, setSelectedFloor] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.roomDetails.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleAccordion = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        roomDetailsList(1, true, '');
        getHostelName();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    roomDetailsList(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return ['Gaya', 'Patna'];
    }

    return [centerSerach.name];
  };

  const roomDetailsList = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
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

    roomDetailsApi(params)
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
      roomDetailsList(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    roomDetailsList(1, true, '');
  };

  const deleteHostelRoom = (id: any) => {
    setInitialCall(true);
    const params = {
      id: id,
    };
    deleteHostelRoomApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setInitialCall(false);
        roomDetailsList(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const clearFilter = () => {
    setSelectedHostel({});
    setSelectedFloor({});
    roomDetailsList(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedHostel?.id) {
      filters.push(['selectHostelNameId', '=', selectedHostel.id]);
    }

    if (selectedFloor?.id) {
      filters.push(['selectFloorNameId', '=', selectedFloor.id]);
    }

    roomDetailsList(1, true, search, filters);
  };

  const getHostelName = () => {
    setInitialCall(true);
    const params = {
      bipardCentre: center,
      listType: 'filter_hostel_name_for_room_details',
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
      bipardCentre: center,
      listType: 'filter_floor_name_for_room_details',
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

  const handleDelete = (item: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.hostelManagement.roomDetails.delete.title,
      message: strings.hostelManagement.roomDetails.delete.message,
      okText: strings.hostelManagement.roomDetails.delete.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => deleteHostelRoom(item.id),
      cancelFunction: () => {},
    });
  };

  const RoomCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
    const [roomTypeValue] = useState(item.roomType ?? 'Trainee');
    const isExpanded = expandedItems.has(item.id);

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={[styles.accordionHeader]}
          onPress={() => toggleAccordion(item.id)}
        >
          <View style={styles.headerLeft}>
            <TextAtom
              style={[
                styles.headerTitle,
                isExpanded && styles.headerTitleActive,
              ]}
            >
              {item.roomNo ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item)}
            >
              <SvgDelete />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                navigation.navigate(screensName.AddRoomDetails, {
                  item,
                  onDone: () => roomDetailsList(1, true, search),
                });
              }}
            >
              <SvgEditPencile />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionContent}>
            <View style={globalStyles.infoRow}>
              <InfoField
                label={strings.hostelManagement.roomDetails.hostelName}
                value={item.selectHostelName}
              />
              <InfoField
                label={strings.hostelManagement.roomDetails.floorName}
                value={item.selectFloorName}
              />
            </View>

            <View style={globalStyles.infoRow}>
              <InfoField
                label={strings.hostelManagement.roomDetails.noOfBed}
                value={item.noOfBed}
              />
              <View style={styles.statusSwitchContainer}>
                <FormSwitchForCard
                  title={strings.hostelManagement.status}
                  data={[
                    { id: 'Active', label: 'Active' },
                    { id: 'Inactive', label: 'Inactive' },
                  ]}
                  selectedValue={statusValue}
                  onSelect={() => {}}
                  containerStyle={styles.statusSwitchContainer}
                  titleStyle={globalStyles.infoLabel}
                  activeOptionStyle={{ backgroundColor: '#1C4371' }}
                  activeTextStyle={{ color: '#FFFFFF' }}
                  inactiveOptionStyle={{ backgroundColor: '#E6F2FF' }}
                  inactiveTextStyle={{ color: '#1C4371' }}
                />
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <View style={styles.roomTypeContainer}>
                <FormSwitchForCard
                  title={strings.hostelManagement.roomDetails.roomType}
                  data={[
                    { id: 'Trainee', label: 'Trainee' },
                    { id: 'Guest', label: 'Guest' },
                  ]}
                  selectedValue={roomTypeValue}
                  onSelect={() => {}}
                  containerStyle={styles.roomTypeContainer}
                  titleStyle={globalStyles.infoLabel}
                  activeOptionStyle={{ backgroundColor: '#1C4371' }}
                  activeTextStyle={{ color: '#FFFFFF' }}
                  inactiveOptionStyle={{ backgroundColor: '#E6F2FF' }}
                  inactiveTextStyle={{ color: '#1C4371' }}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => {
    return <RoomCard item={item} index={index} navigation={navigation} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <AdminPageHeader title="Hostel Management" navigation={navigation} />
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader
          config={{
            title: 'Room Details',
            count: data.length,
            showCount: true,
            search: {
              visible: true,
              onPress: () => {
                // Handle search focus or modal
              },
            },
            create: {
              visible: true,
              label: '+ Create',
              onPress: () => {
                navigation.navigate(screensName.AddRoomDetails, {
                  onDone: () => roomDetailsList(1, true, search),
                });
              },
            },
          }}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.roomDetails.noDataFound}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.loadingContainer}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              roomDetailsList(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? roomDetailsList(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default RoomDetailsList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  accordionContainer: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginBottom: vh(10),
    borderRadius: vw(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: '#111827',
  },
  headerTitleActive: {
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  actionBtn: {
    padding: vw(4),
  },
  accordionContent: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(15),
    backgroundColor: '#FFFFFF',
  },
  statusSwitchContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  roomTypeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  loadingContainer: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: 0,
  },
});
