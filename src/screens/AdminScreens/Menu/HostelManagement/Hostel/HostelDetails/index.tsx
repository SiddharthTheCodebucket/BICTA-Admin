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
  useDeleteHostelDetailsMutation,
  useHostelDetailsMutation,
  useUpdateHostelDetailsMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';

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

const HostelItemSeparator = () => <View style={styles.itemSeparator} />;

const HostelDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [hostelDetailsApi] = useHostelDetailsMutation();
  const [updateHostelDetailsApi] = useUpdateHostelDetailsMutation();
  const [deleteHostelDetailsApi] = useDeleteHostelDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelDetails.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        hostelDetailsList(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    hostelDetailsList(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const hostelDetailsList = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    hostelDetailsApi(params)
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
      hostelDetailsList(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    hostelDetailsList(1, true, '');
  };

  const HostelCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.statusChangeConfirmation,
        message: strings.hostelManagement.statusChangeMessage,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateHostelStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateHostelStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        idForChangeStatus: id,
      };
      updateHostelDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          hostelDetailsList(1, true, search);
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
        title: strings.hostelManagement.deleteConfirmation,
        message: strings.hostelManagement.deleteItemConfirmation,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteHostelStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteHostelStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id: id,
      };
      deleteHostelDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          hostelDetailsList(1, true, search);
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
                navigation.navigate(screensName.AddHostelDetails, {
                  item: item,
                  onDone: () => hostelDetailsList(1, true, search),
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
              {strings.hostelManagement.hostelDetails.trainingCentre}
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.trainingCentre ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.flex1End}>
            <TextAtom style={styles.labelRight}>
              {strings.hostelManagement.hostelDetails.hostelName}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.hostelName ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelDetails.noOfFloors}
          </TextAtom>
          <TextAtom style={styles.value}>{item.noOfFloors ?? '-'}</TextAtom>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.hostelDetails.hostelAddress}
          </TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.hostelAddress ?? '-'}
          </TextAtom>
        </View>
        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.hostelManagement.hostelDetails.contactPerson}
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.contactPerson ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.flex1End}>
            <TextAtom style={styles.labelRight}>
              {strings.hostelManagement.hostelDetails.contactNo}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.contactNo ?? '-'}
            </TextAtom>
          </View>
        </View>
        {item?.alternateContactNo?.length > 0 && (
          <View style={styles.flex1MarginTop}>
            <TextAtom style={styles.label}>
              {strings.hostelManagement.hostelDetails.alternateContactNo}
            </TextAtom>
            <TextAtom style={styles.value}>
              {item?.alternateContactNo?.length > 0
                ? item.alternateContactNo.join(',')
                : '-'}
            </TextAtom>
          </View>
        )}
        {showStatusMenu && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(false)}
            style={styles.overlay}
          />
        )}

        <View style={styles.statusContainer}>
          <TextAtom style={styles.label}>
            {strings.hostelManagement.status}
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
                onPress={() => onSelectStatus('Active')}
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

  const renderListHostelDetails = ({ item, index }: any) => {
    return <HostelCard item={item} index={index} navigation={navigation} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.dashboardIndex.centers}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.dashboardIndex.center,
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
          containerStyle={{ marginBottom: vh(-10) }}
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
        renderItem={renderListHostelDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.noDataFound}
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
              hostelDetailsList(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? hostelDetailsList(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={HostelItemSeparator}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddHostelDetails, {
            onDone: () => hostelDetailsList(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default HostelDetails;

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
  flex1: {
    flex: 1,
  },
  flex1End: {
    flex: 1,
    alignItems: 'flex-end',
  },
  flex1MarginTop: {
    flex: 1,
    marginTop: vh(10),
  },
  actionRow: {
    flexDirection: 'row',
    gap: vw(15),
  },
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
  iconSmall: {
    width: vw(15),
    height: vw(15),
  },
  statusContainer: {
    marginTop: vh(15),
    zIndex: 999,
  },
  statusTextBlack: {
    color: colors.black,
  },
  loadingContainer: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: vh(10),
  },
});
