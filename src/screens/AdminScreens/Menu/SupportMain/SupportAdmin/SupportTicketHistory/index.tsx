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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import moment from 'moment';
import {
  useDeleteSupportRaiseComplainMutation,
  useListSupportRaiseComplainMutation,
} from '../../../../../../injectEndpoints/supportEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

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

interface FilterArgs {
  status?: any;
  category?: any;
  subCategory?: any;
  startDate?: any;
  endDate?: any;
}

interface ComplainCardProps {
  item: any;
  index: number;
  navigation: NavigationType;
  onDelete: (id: any) => void;
  onRefresh: () => void;
}

const getStatusBgColor = (status?: string) => {
  switch (status) {
    case 'New':
      return '#FFE7A3';
    case 'In-progress':
      return '#2F6FDB';
    case 'Resolved':
      return '#6FB25D';
    case 'Re-open':
      return '#F39C34';
    case 'Response awaited':
      return '#8E44AD';
    default:
      return '#E0E0E0';
  }
};

const ComplainCard = ({
  item,
  index,
  navigation,
  onDelete,
  onRefresh,
}: ComplainCardProps) => {
  const handleDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.hostelManagement.deleteConfirmation,
      message:
        'Are you sure you want to delete this item? This action cannot be undone.',
      okText: strings.hostelManagement.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => onDelete(item.id),
      cancelFunction: () => {},
    });
  };

  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.SupportTicketHistoryDetails, {
          data: item,
        });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>

        <View style={styles.actionRow}>
          <TouchableAtom
            style={styles.deleteButton}
            onPress={() =>
              navigation.navigate(screensName.SupportTicketHistoryReply, {
                item,
                onDone: onRefresh,
              })
            }
          >
            <ImageAtom source={images.reply} style={styles.iconSmall} />
          </TouchableAtom>
          <TouchableAtom
            style={styles.deleteButton}
            onPress={() => {
              navigation.navigate(screensName.SupportTicketResponseDetails, {
                item: item,
              });
            }}
          >
            <ImageAtom source={images.eyeOpen} style={styles.iconSmall} />
          </TouchableAtom>
          <TouchableAtom style={styles.deleteButton} onPress={handleDelete}>
            <ImageAtom source={images.delete} style={styles.iconSmall} />
          </TouchableAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Tracking Id'}</TextAtom>
          <TextAtom style={styles.value}>{item.trackingId ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Status'}</TextAtom>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor(item.currentStatus) },
            ]}
          >
            <TextAtom style={[styles.statusText]}>
              {item.currentStatus}
            </TextAtom>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Category'}</TextAtom>
        <TextAtom style={styles.value}>{item.category ?? '-'}</TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Sub Category'}</TextAtom>
        <TextAtom style={styles.value}>{item.subCategory ?? '-'}</TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Primary Issue Type'}</TextAtom>
        <TextAtom style={styles.value}>{item.primaryIssueType ?? '-'}</TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Issue Type'}</TextAtom>
        <TextAtom style={styles.value}>{item.issueType ?? '-'}</TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Complainant Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.name ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>
            {'Complaint Created Date'}
          </TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {moment(item.createdAt).format('DD-MM-YYYY hh:mm') ?? '-'}
          </TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  ticketStatusList: any[];
  selectedTicketStatus: any;
  setSelectedTicketStatus: (d: any) => void;
  categoryList: any[];
  selectedCategoryList: any;
  setSelectedCategoryList: (d: any) => void;
  subCategoryList: any[];
  selectedSubCategoryList: any;
  setSelectedSubCategoryList: (d: any) => void;
  startDate: any;
  endDate: any;
  setStartDate: (v: any) => void;
  setEndDate: (v: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  getSubCategoryList: (id: any) => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  ticketStatusList,
  selectedTicketStatus,
  setSelectedTicketStatus,
  categoryList,
  selectedCategoryList,
  setSelectedCategoryList,
  subCategoryList,
  selectedSubCategoryList,
  setSelectedSubCategoryList,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyFilter,
  clearFilter,
  getSubCategoryList,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Ticket Status'}
      placeholder={'Ticket Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Ticket Status',
          Data: ticketStatusList,
          selectedData: selectedTicketStatus,
          setSelectedData: (data: any) => {
            setSelectedTicketStatus(data);
            hitFilterApi({ status: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedTicketStatus?.name}
    />
    <DropDownOrganism
      label={'Category'}
      placeholder={'Category'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Category',
          Data: categoryList,
          selectedData: selectedCategoryList,
          setSelectedData: (data: any) => {
            setSelectedCategoryList(data);
            getSubCategoryList(data.id);
            setSelectedSubCategoryList({});
            hitFilterApi({
              category: data,
              subCategory: {},
            });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedCategoryList?.name}
    />
    <DropDownOrganism
      label={'Sub Category'}
      placeholder={'Sub Category'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Sub Category',
          Data: subCategoryList,
          selectedData: selectedSubCategoryList,
          setSelectedData: (data: any) => {
            setSelectedSubCategoryList(data);
            hitFilterApi({
              subCategory: data,
            });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedSubCategoryList?.name}
    />
    <DateInputOrganism
      label={strings.hostelReport.startDate}
      placeholder={strings.hostelReport.startDate}
      value={startDate}
      onChangeText={(val: any) => {
        setStartDate(val);
        hitFilterApi({
          startDate: val,
        });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />
    <DateInputOrganism
      label={strings.hostelReport.endDate}
      placeholder={strings.hostelReport.endDate}
      value={endDate}
      onChangeText={(val: any) => {
        setEndDate(val);
        hitFilterApi({
          endDate: val,
        });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
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

const BedItemSeparator = () => <View style={styles.itemSeparator} />;

const SupportTicketHistory = (props: Props) => {
  const { navigation } = props;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listComplainApi] = useListSupportRaiseComplainMutation();
  const [deleteComplainApi] = useDeleteSupportRaiseComplainMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);

  const [ticketStatusList, setTicketStatusList] = useState<any>([]);
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<any>({});
  const [categoryList, setCategoryList] = useState<any>([]);
  const [selectedCategoryList, setSelectedCategoryList] = useState<any>({});
  const [subCategoryList, setSubCategoryList] = useState<any>([]);
  const [selectedSubCategoryList, setSelectedSubCategoryList] = useState<any>(
    {},
  );
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');
  const [exportUrl, setExportUrl] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Support Ticket History');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && search === '') {
        getTicketStatusList();
        getCategoryList();
      }
    }, [firstTimeLoad, search]),
  );
  useEffect(() => {
    if (firstTimeLoad && search === '') {
      setFirstTimeLoad(false);
      listComplain(1, true, search, []);
    }
  }, []);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listComplain = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      exportFlag: true,
    };

    listComplainApi(params)
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
        setExportUrl(res.data.exportUrl);

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
      listComplain(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listComplain(1, true, '');
  };

  const renderListComplainDetails = ({ item, index }: any) => (
    <ComplainCard
      item={item}
      index={index}
      navigation={navigation}
      onDelete={deleteSupportData}
      onRefresh={() => listComplain(1, true, search)}
    />
  );

  const clearFilter = () => {
    setSelectedTicketStatus({});
    setSelectedCategoryList({});
    setSelectedSubCategoryList({});
    setStartDate('');
    setEndDate('');
    listComplain(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedTicketStatus?.id) {
      filters.push(['currentStatusId', '=', selectedTicketStatus.id]);
    }

    if (selectedCategoryList?.id) {
      filters.push(['categoryId', '=', selectedCategoryList.id]);
    }

    if (selectedSubCategoryList?.id) {
      filters.push(['subCategoryId', '=', selectedSubCategoryList.id]);
    }

    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['createdDate', '>=', formatted]);
    }

    if (endDate) {
      const formatted = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['createdDate', '<=', formatted]);
    }

    listComplain(1, true, search, filters);
  };

  const getTicketStatusList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_resolve_complain_current_status',
      bipardCentre: [],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTicketStatusList(res.data);
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

  const getCategoryList = () => {
    setInitialCall(true);
    const params = {
      listType: 'support_category_filter_for_raise_complain',
      bipardCentre: [],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setCategoryList(res.data);
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

  const getSubCategoryList = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'support_sub_category_filter_for_raise_complain',
      replacements: [id, '%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setSubCategoryList(res.data);
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

  const hitFilterApi = ({
    status = selectedTicketStatus,
    category = selectedCategoryList,
    subCategory = selectedSubCategoryList,
    startDate: sDate = startDate,
    endDate: eDate = endDate,
  }: FilterArgs = {}) => {
    const filters: any[] = [];

    if (status?.id) {
      filters.push(['currentStatusId', '=', status.id]);
    }

    if (category?.id) {
      filters.push(['categoryId', '=', category.id]);
    }

    if (subCategory?.id) {
      filters.push(['subCategoryId', '=', subCategory.id]);
    }

    if (sDate) {
      filters.push([
        'createdDate',
        '>=',
        moment(sDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (eDate) {
      filters.push([
        'createdDate',
        '<=',
        moment(eDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    listComplain(1, true, search, filters);
  };

  const deleteSupportData = (id: any) => {
    setInitialCall(true);
    const params = {
      id: id,
    };
    deleteComplainApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setFirstTimeLoad(true);
        setInitialCall(false);
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
              ? strings.hostelManagement.bedAvailability.hideFilter
              : strings.hostelManagement.bedAvailability.showFilter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (exportUrl) {
              downloadAndOpenFile(exportUrl);
            }
          }}
        >
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>

      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListComplainDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.noDataFound}
            </TextAtom>
          )
        }
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              getSubCategoryList={getSubCategoryList}
              hitFilterApi={hitFilterApi}
              ticketStatusList={ticketStatusList}
              selectedTicketStatus={selectedTicketStatus}
              setSelectedTicketStatus={setSelectedTicketStatus}
              categoryList={categoryList}
              selectedCategoryList={selectedCategoryList}
              setSelectedCategoryList={setSelectedCategoryList}
              subCategoryList={subCategoryList}
              selectedSubCategoryList={selectedSubCategoryList}
              setSelectedSubCategoryList={setSelectedSubCategoryList}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listComplain(1, false, '');
            }}
          />
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(10) }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listComplain(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={BedItemSeparator}
      />
    </SafeAreaView>
  );
};

export default SupportTicketHistory;

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
  statusBadge: {
    paddingHorizontal: vw(8),
    paddingVertical: vh(4),
    borderRadius: vw(10),
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
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
    backgroundColor: colors.pharmacy_yellow,
    borderColor: colors.warningOrange,
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
  actionRow: { flexDirection: 'row', gap: vw(10) },
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
    tintColor: colors.primary,
  },
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
  editBtn: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSm: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteBtn: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmDelete: {
    width: vw(15),
    height: vw(15),
  },
});
