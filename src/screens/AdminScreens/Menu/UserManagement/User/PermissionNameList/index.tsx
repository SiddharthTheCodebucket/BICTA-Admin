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
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
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
import { useListPermissionsNameMutation } from '../../../../../../injectEndpoints/userTypeEndpoints';

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

interface ListPermissionProps {
  item: any;
  index: number;
}

const ListPermissionCard = ({ item, index }: ListPermissionProps) => {
  return (
    <ViewAtom style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>
        <TextAtom style={[styles.label, styles.flex1]}>
          {'Id:'} {item.id}
        </TextAtom>

        <TextAtom style={[styles.label, styles.flex1]}>
          {'Status:'} {item.status}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Permission Name'}</TextAtom>
        <TextAtom style={styles.value}>{item.permissionName ?? '-'}</TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Module'}</TextAtom>
        <TextAtom style={styles.value}>{item.module ?? '-'}</TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Parent Module'}</TextAtom>
        <TextAtom style={styles.value}>{item.parent ?? '-'}</TextAtom>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Date of Creation'}</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.createdDate).format('DD-MM-YYYY') ?? '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Date of Updation'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {moment(item.updatedDate).format('DD-MM-YYYY') ?? '-'}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  parentModuleList: any[];
  selectedParentModule: any;
  setSelectedParentModule: (d: any) => void;
  moduleList: any[];
  selectedModule: any;
  setSelectedModule: (d: any) => void;
  statusList: any[];
  selectedStatus: any;
  setSelectedStatus: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  getSubModuleList: (id: any) => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  parentModuleList,
  selectedParentModule,
  setSelectedParentModule,
  moduleList,
  selectedModule,
  setSelectedModule,
  statusList = [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'In-Active' },
  ],
  selectedStatus,
  setSelectedStatus,
  applyFilter,
  clearFilter,
  getSubModuleList,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Parent Module'}
      placeholder={'Parent Module'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Parent Module',
          Data: parentModuleList,
          selectedData: selectedParentModule,
          setSelectedData: (data: any) => {
            setSelectedParentModule(data);
            getSubModuleList(data.id);
            hitFilterApi(data, selectedModule, selectedStatus);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedParentModule?.name}
    />
    <DropDownOrganism
      label={'Module'}
      placeholder={'Module'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Module',
          Data: moduleList,
          selectedData: selectedModule,
          setSelectedData: (data: any) => {
            setSelectedModule(data);
            hitFilterApi(selectedParentModule, data, selectedStatus);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedModule?.name}
    />
    <DropDownOrganism
      label={'Status'}
      placeholder={'Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Status',
          Data: statusList,
          selectedData: selectedStatus,
          setSelectedData: (data: any) => {
            setSelectedStatus(data);
            hitFilterApi(selectedParentModule, selectedModule, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedStatus?.name}
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

const PermissionNameList = (props: Props) => {
  const { navigation } = props;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listPermissionNameApi] = useListPermissionsNameMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [parentModuleList, setParentModuleList] = useState<any>([]);
  const [selectedParentModule, setSelectedParentModule] = useState<any>({});
  const [moduleList, setModuleList] = useState<any>([]);
  const [selectedModule, setSelectedModule] = useState<any>({});
  const [selectedStatus, setSelectedStatus] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Permission Name List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && search === '') {
        getParentModuleList();
      }
    }, [firstTimeLoad, search]),
  );
  useEffect(() => {
    if (firstTimeLoad && search === '') {
      setFirstTimeLoad(false);
      listPermissionName(1, true, search, []);
    }
  }, []);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listPermissionName = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    listPermissionNameApi(params)
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
      listPermissionName(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listPermissionName(1, true, '');
  };

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard item={item} index={index} />
  );

  const clearFilter = () => {
    setSelectedParentModule({});
    setSelectedModule({});
    setSelectedStatus({});
    listPermissionName(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedParentModule?.id) {
      filters.push(['parent', '=', selectedParentModule.id]);
    }

    if (selectedModule?.id) {
      filters.push(['module', '=', selectedModule.id]);
    }

    if (selectedStatus?.id) {
      filters.push(['status', '=', selectedStatus.id]);
    }

    listPermissionName(1, true, search, filters);
  };

  const getParentModuleList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_global_module',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setParentModuleList(res.data);
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

  const getSubModuleList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_global_sub_module',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%', 'HRMS'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setModuleList(res.data);
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

  const hitFilterApi = (
    parent = selectedParentModule,
    module = selectedModule,
    status = selectedStatus,
  ) => {
    const filters: any[] = [];

    if (parent?.id) {
      filters.push(['parent', '=', parent.id]);
    }

    if (module?.id) {
      filters.push(['module', '=', module.id]);
    }

    if (status?.id) {
      filters.push(['status', '=', status.id]);
    }

    listPermissionName(1, true, search, filters);
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
      </View>
      {showFilter && (
        <FilterForm
          navigation={navigation}
          parentModuleList={parentModuleList}
          selectedParentModule={selectedParentModule}
          setSelectedParentModule={setSelectedParentModule}
          moduleList={moduleList}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          statusList={[
            { id: 'Active', name: 'Active' },
            { id: 'Inactive', name: 'In-Active' },
          ]}
          selectedStatus={selectedStatus}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
          setSelectedStatus={setSelectedStatus}
          getSubModuleList={getSubModuleList}
          hitFilterApi={hitFilterApi}
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
        renderItem={renderListPermissionDetails}
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
              listPermissionName(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listPermissionName(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={BedItemSeparator}
      />
    </SafeAreaView>
  );
};

export default PermissionNameList;

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
