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
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

import { useAppSelector } from '../../../../../../hooks';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import {
  useConferenceDeleteConferenceMutation,
  useConferenceListConferenceMutation,
} from '../../../../../../injectEndpoints/conferenceManagementEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';

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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
  onRefresh: () => void;
  onDelete: (id: any) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
  item,
  index,
  navigation,
  onRefresh,
  onDelete,
}) => {
  const formatDateTime = (date?: string, time?: string) => {
    if (!date || !time) return '-';
    return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss').format(
      'DD-MM-YYYY hh:mm A',
    );
  };

  const getStatusStyle = (status?: string) => {
    if (status?.toLowerCase() === 'upcoming') {
      return {
        text: 'Upcoming',
        bg: '#DFF5E1',
        color: '#2E7D32',
      };
    }

    if (status?.toLowerCase() === 'over') {
      return {
        text: 'Over',
        bg: '#F6C1BE',
        color: '#A11A12',
      };
    }

    return {
      text: status ?? '-',
      bg: '#EEE',
      color: '#555',
    };
  };
  const statusStyle = getStatusStyle(item.status);

  const confirmDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.hostelManagement.bedDetails.deleteConfirmation,
      message: strings.hostelManagement.bedDetails.deleteMessage,
      okText: strings.hostelManagement.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => onDelete(item.id),
      cancelFunction: () => {},
    });
  };

  const isShowEditDelete = item?.status === 'Upcoming';

  return (
    <ViewAtom style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, { flex: 1 }]}>
          Sr. No: {index + 1}
        </TextAtom>
        <View style={{ flexDirection: 'row', gap: vw(10) }}>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.navigate(screensName.AddConferenceForm, {
                item: item,
              });
            }}
          >
            <ImageAtom
              source={images.receipt}
              style={{
                tintColor: colors.primary,
                width: vw(15),
                height: vw(15),
              }}
            />
          </TouchableAtom>
          {isShowEditDelete && (
            <>
              <TouchableAtom
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate(screensName.AddConferenceForm, {
                    item,
                    onDone: onRefresh,
                  })
                }
              >
                <ImageAtom
                  source={images.edit_pencil}
                  style={styles.editIcon}
                />
              </TouchableAtom>
              <TouchableAtom
                style={styles.deleteButton}
                onPress={confirmDelete}
              >
                <ImageAtom source={images.delete} style={styles.iconSmall} />
              </TouchableAtom>
            </>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Conference Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.name ?? '-'}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Description</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.description ?? '-'}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>From</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {formatDateTime(item.fromDate, item.fromTime)}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelRight}>To</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {formatDateTime(item.toDate, item.toTime)}
          </TextAtom>
        </View>
      </View>
      <View style={styles.statusRow}>
        <TextAtom style={styles.label}>Status</TextAtom>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <TextAtom style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.text}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  startDate: any;
  endDate: any;
  setStartDate: (d: any) => void;
  setEndDate: (d: any) => void;
  conferenceStatusList: any[];
  selectedConferenceStatus: any;
  setSelectedConferenceStatus: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  conferenceStatusList,
  selectedConferenceStatus,
  setSelectedConferenceStatus,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DateInputOrganism
      label={'Start Date'}
      placeholder={'Start Date'}
      value={startDate}
      onChangeText={(val: any) => {
        setStartDate(val);
        hitFilterApi({ startDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <DateInputOrganism
      label={'End Date'}
      placeholder={'End Date'}
      value={endDate}
      onChangeText={(val: any) => {
        setEndDate(val);
        hitFilterApi({ endDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />
    <DropDownOrganism
      label={'Conference Status'}
      placeholder={'Conference Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Conference Status',
          Data: conferenceStatusList,
          selectedData: selectedConferenceStatus,
          setSelectedData: (data: any) => {
            setSelectedConferenceStatus(data);
            hitFilterApi({ conferenceStatus: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedConferenceStatus?.name}
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

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const ConferenceMasterDetails = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listApi] = useConferenceListConferenceMutation();
  const [deleteApi] = useConferenceDeleteConferenceMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [conferenceStatusList, setConferenceStatusList] = useState<any>([]);
  const [selectedConferenceStatus, setSelectedConferenceStatus] = useState<any>(
    {},
  );

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Conference Management List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        list(1, true, '');
        setFirstTimeLoad(false);
        getConferenceStatusList();
      }
    }, [centerSerach, search, firstTimeLoad]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    list(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const list = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
    extraParams: any = {},
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      ...extraParams,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listApi(params)
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

        if (res.data.exportUrl) {
          downloadAndOpenFile(res.data.exportUrl);
        }

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
      list(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    list(1, true, '');
  };

  const renderlist = useCallback(
    ({ item, index }: any) => (
      <VendorCard
        item={item}
        index={index}
        navigation={navigation}
        onDelete={deleteData}
        onRefresh={() => list(1, true, search)}
      />
    ),
    [navigation],
  );

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedConferenceStatus({});
    list(1, true, search, []);
  };
  const buildFilters = (
    ci = startDate,
    co = endDate,
    status = selectedConferenceStatus,
  ) => {
    const filters: any[] = [];

    if (ci) {
      const sd = moment(ci, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['checkInDate', '>=', sd]);
    }

    if (co) {
      const ed = moment(co, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['checkInDate', '<=', ed]);
    }
    if (status.id) {
      filters.push(['status', '=', status.id]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    list(1, true, search, filters);
    setShowFilter(false);
  };

  const hitFilterApi = ({
    startDate: ci,
    endDate: co,
    conferenceStatus,
  }: any = {}) => {
    const filters = buildFilters(
      ci ?? startDate,
      co ?? endDate,
      conferenceStatus ?? selectedConferenceStatus,
    );

    list(1, true, search, filters);
  };

  const downloadPdf = () => {
    const filters = buildFilters();
    list(1, true, search, filters, {
      exportFlag: true,
    });
  };

  const getConferenceStatusList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_conference_status',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setConferenceStatusList(resData);
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

  const deleteData = (id: any) => {
    setInitialCall(true);
    const params = {
      id: id,
    };
    deleteApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setInitialCall(false);
        list(1, true, search);
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
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
        }}
      >
        <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
          <TextAtom style={styles.filterText}>
            {showFilter
              ? strings.hostelManagement.floorDetails.hideFilter
              : strings.hostelManagement.floorDetails.showFilter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom style={styles.filterButton} onPress={downloadPdf}>
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>
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
        renderItem={renderlist}
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
              list(1, false, '');
            }}
          />
        }
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              conferenceStatusList={conferenceStatusList}
              selectedConferenceStatus={selectedConferenceStatus}
              setSelectedConferenceStatus={setSelectedConferenceStatus}
              hitFilterApi={hitFilterApi}
            />
          ) : null
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? list(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddConferenceForm, {
            onDone: () => list(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default ConferenceMasterDetails;

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
  generateBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  applyBtn: {
    width: vw(150),
    height: vh(35),
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingVertical: vh(2),
    paddingHorizontal: vw(14),
    borderRadius: vw(8),
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
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
  iconSmall: { width: vw(15), height: vw(15) },
});
