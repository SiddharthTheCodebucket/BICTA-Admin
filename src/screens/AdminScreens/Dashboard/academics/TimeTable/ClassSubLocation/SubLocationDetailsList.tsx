import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  SvgEditPencile,
  SvgDelete,
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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

import {
  useListClassSubLocationDetailsMutation,
  useUpdateClassSubLocationDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import AdminListHeader, {
  AdminListHeaderConfig,
  AdminListHeaderCreateConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import { globalStyles } from '../../../../../../utils/globalStyles';
import { FormSwitchForCard } from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  route?: any;
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

const SubLocationDetailsList = (props: Props) => {
  const { navigation, route } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listSubLocationDetailsApi] = useListClassSubLocationDetailsMutation();
  const [updateSubLocationDetailsApi] =
    useUpdateClassSubLocationDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.locationDetails.subLocationDetailsTitle,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, route?.params?.suppressHeader]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listSubLocationDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listSubLocationDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listSubLocationDetails = (
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
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
    };
    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listSubLocationDetailsApi(params)
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
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const headerConfig: AdminListHeaderConfig = useMemo(
    () => ({
      title: strings.lms.locationDetails.subLocationDetailsTitle,
      count: data.length,
      search: {
        visible: true,
        onPress: () => setIsSearchVisible(prev => !prev),
      },
      filter: {
        visible: false,
      },
      create: {
        visible: true,
        onPress: () => navigation.navigate(screensName.AddSubLocation),
      },
    }),
    [data.length, navigation],
  );

  const handleSearch = useCallback(
    debounce((text: string) => {
      listSubLocationDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listSubLocationDetails(1, true, '');
  };

  const SubLocationDetailsCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const handleEdit = () => {
      navigation.navigate(screensName.AddSubLocation, { data: item });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.cancel || 'Delete Confirmation',
        message: `Are you sure you want to delete ${item.subLocationName}?`,
        okText: (strings as any).confirm || 'Delete',
        double: true,
        cancelText: strings.cancel || 'Cancel',
        okFunction: () => {
          Toast.show({
            type: 'success',
            text2: 'Sub-location deleted successfully',
          });
        },
        cancelFunction: () => {},
      });
    };

    const onSelectStatus = () => {
      let newStatus = statusValue === 'Active' ? 'Inactive' : 'Active';
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.assignmentDetailsList.statusChangeConf,
        message: strings.lms.assignmentDetailsList.statusChangeMsg,
        okText: strings.lms.assignmentDetailsList.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id_for_change_sub_location_status: id,
      };
      updateSubLocationDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data?.message.message,
          });
          setInitialCall(false);
          listSubLocationDetails(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong_,
          });
        });
    };

    return (
      <TouchableAtom style={styles.card} onPress={() => {}}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            {item.selectLocationName ?? '-'}
          </TextAtom>

          <View style={styles.iconRow}>
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <SvgEditPencile />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <SvgDelete />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={globalStyles.infoLabel}>
            {strings.lms.locationDetails.subLocationName}
          </TextAtom>
          <TextAtom style={globalStyles.infoValue}>
            {item.subLocationName ?? '-'}
          </TextAtom>
        </View>
        <View style={globalStyles.infoSection}>
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Contact Person</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {item.subLocationContactPerson || item.contactPerson || '-'}
              </TextAtom>
            </View>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Contact No.</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {item.subLocationContactNo || item.contactNo || '-'}
              </TextAtom>
            </View>
          </View>
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Total Capacity</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {item.totalCapacity ?? '-'}
              </TextAtom>
            </View>
            <View style={globalStyles.infoCol}>
              <FormSwitchForCard
                title={strings.lms.locationDetails.status}
                data={[
                  { id: 'Active', label: 'Active' },
                  { id: 'Inactive', label: 'In-Active' },
                ]}
                selectedValue={statusValue}
                onSelect={onSelectStatus}
                containerStyle={{ marginTop: vh(10) }}
              />
            </View>
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const renderSubLocationDetailsItem = ({ item, index }: any) => {
    return (
      <SubLocationDetailsCard
        item={item}
        index={index}
        navigation={navigation}
      />
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader config={headerConfig} />
      </View>

      {isSearchVisible && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={{ marginTop: vh(15) }}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderSubLocationDetailsItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.assignmentResponse.noDataFound}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(15) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listSubLocationDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listSubLocationDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

export default SubLocationDetailsList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  flatListContainer: {
    paddingVertical: vh(10),
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  iconButton: {
    padding: vw(4),
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
  separator: {
    height: vh(10),
  },
});
