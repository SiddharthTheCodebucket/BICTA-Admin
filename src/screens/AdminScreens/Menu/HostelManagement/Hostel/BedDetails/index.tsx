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
  LayoutAnimation,
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
import {
  useBedDetailsRoomMutation,
  useDeleteBedDetailsRoomMutation,
  useUpdateBedDetailsRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';

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

const BedDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [bedDetailsApi] = useBedDetailsRoomMutation();
  const [updatebedDetailsApi] = useUpdateBedDetailsRoomMutation();
  const [deletebedDetailsRoomApi] = useDeleteBedDetailsRoomMutation();

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

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.hostelManagement.bedDetails.title);
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

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
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
          text2: err.data?.message || strings.something_went_wrong,
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

  const BedCard = ({ item, index, navigation }: any) => {
    const [statusValue, setStatusValue] = useState(
      item.status ?? strings.hostelManagement.active,
    );
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.bedDetails.statusChangeConfirmation,
        message: strings.hostelManagement.bedDetails.statusChangeMessage,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateBedStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateBedStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        idForChangeStatus: id,
      };
      updatebedDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message?.message,
          });
          setInitialCall(false);
          bedDetailsList(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.bedDetails.deleteConfirmation,
        message: strings.hostelManagement.bedDetails.deleteMessage,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteBedHostelRoom(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteBedHostelRoom = (id: any) => {
      setInitialCall(true);
      const params = {
        id: id,
      };
      deletebedDetailsRoomApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          bedDetailsList(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    return (
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, styles.flex1]}>
            {strings.hostelManagement.srNo} {index + 1}
          </TextAtom>

          <View style={styles.actionRow}>
            <TouchableAtom
              style={styles.editButton}
              onPress={() => {
                navigation.navigate(screensName.AddBedDetails, {
                  item: item,
                  onDone: () => bedDetailsList(1, true, search),
                });
              }}
            >
              <ImageAtom source={images.edit_pencil} style={styles.editIcon} />
            </TouchableAtom>

            <TouchableAtom
              style={styles.deleteButton}
              onPress={() => handleDelete()}
            >
              <ImageAtom source={images.delete} style={styles.iconSmall} />
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.hostelManagement.bedDetails.hostelName}
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.selectHostelName ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.flex1End}>
            <TextAtom style={styles.labelRight}>
              {strings.hostelManagement.bedDetails.floorName}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.selectFloorName ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.hostelManagement.bedDetails.roomNo}
            </TextAtom>
            <TextAtom style={styles.value}>{item.selectRoomNo ?? '-'}</TextAtom>
          </View>

          <View style={styles.flex1End}>
            <TextAtom style={styles.labelRight}>
              {strings.hostelManagement.bedDetails.bedName}
            </TextAtom>
            <TextAtom numberOfLines={0} style={styles.valueRight}>
              {item.bedName ?? '-'}
            </TextAtom>
          </View>
        </View>

        {showStatusMenu && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(false)}
            style={styles.overlay}
          />
        )}

        <View style={styles.statusContainer}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.bedDetails.status}
          </TextAtom>

          <TouchableAtom
            onPress={() => setShowStatusMenu(!showStatusMenu)}
            style={[
              styles.statusBox,
              statusValue === strings.hostelManagement.active
                ? styles.activeBox
                : styles.inActiveBox,
            ]}
          >
            <TextAtom
              style={[
                styles.statusText,
                statusValue === strings.hostelManagement.active
                  ? styles.activeText
                  : styles.inActiveText,
              ]}
            >
              {statusValue}
            </TextAtom>
            <ImageAtom source={images.downArrow} />
          </TouchableAtom>

          {showStatusMenu && (
            <View style={styles.dropMenu}>
              <TouchableAtom
                style={styles.dropItem}
                onPress={() => onSelectStatus(strings.hostelManagement.active)}
              >
                <TextAtom style={styles.statusTextBlack}>
                  {strings.hostelManagement.active}
                </TextAtom>
              </TouchableAtom>

              <TouchableAtom
                style={styles.dropItem}
                onPress={() =>
                  onSelectStatus(strings.hostelManagement.inActive)
                }
              >
                <TextAtom style={styles.statusTextBlack}>
                  {strings.hostelManagement.inActive}
                </TextAtom>
              </TouchableAtom>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.hostelManagement.bedAvailability.hostel}
        placeholder={strings.hostelManagement.bedAvailability.hostel}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.hostelManagement.bedAvailability.hostel,
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
        label={strings.hostelManagement.bedAvailability.floor}
        placeholder={strings.hostelManagement.bedAvailability.floor}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.hostelManagement.bedAvailability.floor,
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
        label={strings.hostelManagement.bedAvailability.room}
        placeholder={strings.hostelManagement.bedAvailability.room}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.hostelManagement.bedAvailability.room,
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

      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText={strings.hostelManagement.bedAvailability.applyFilter}
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={strings.hostelManagement.bedAvailability.clearFilter}
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary }}
        />
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedHostel({});
    setSelectedFloor({});
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
        setSelectedRoom({});
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
        setSelectedRoom({});
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
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter
            ? strings.hostelManagement.bedAvailability.hideFilter
            : strings.hostelManagement.bedAvailability.showFilter}
        </TextAtom>
      </TouchableAtom>
      {showFilter && <FilterForm />}
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.dashboardIndex.centers}
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
              setSelectedData: (data: any) => {
                setCenterSerach(data);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={centerSerach?.name}
          containerStyle={styles.marginBottomNegative}
        />
      )}
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListBedDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.noDataFound}
            </TextAtom>
          ) : null
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
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddBedDetails, {
            onDone: () => bedDetailsList(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default BedDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
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
  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(5),
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
  thumbnail: {
    width: 70,
    height: 70,
    backgroundColor: colors.lightGray2,
    borderRadius: 8,
    marginTop: 6,
  },
  statusBox: {
    marginTop: vh(8),
    paddingVertical: vh(8),
    paddingHorizontal: vw(12),
    borderRadius: vw(6),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeBox: {
    backgroundColor: colors.lightGreenBg,
    borderColor: colors.darkGreen,
  },

  inActiveBox: {
    backgroundColor: colors.lightRedBg,
    borderColor: colors.darkRed,
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: colors.greenText },
  inActiveText: { color: colors.redText },

  dropMenu: {
    marginTop: vh(6),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: vw(6),
    overflow: 'hidden',
  },

  dropItem: {
    paddingVertical: vh(10),
    paddingHorizontal: vw(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.chinese_silver,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
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
    marginTop: vh(10),
  },

  // New StyleSheet Entries
  flex1: { flex: 1 },
  flex1End: { flex: 1, alignItems: 'flex-end' },
  actionRow: { flexDirection: 'row', gap: vw(15) },
  editButton: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteButton: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: { width: vw(15), height: vw(15) },
  statusContainer: { marginTop: vh(0), zIndex: 999 },
  statusTextBlack: { color: colors.black },
  loadingContainer: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  marginBottomNegative: { marginBottom: vh(-10) },
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
});
