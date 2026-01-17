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
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useMessManagementMessStockReportMutation } from '../../../../../../injectEndpoints/messManagementEndpoints';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
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

interface FloorCardProps {
  item: any;
  index: number;
}

const FloorCard = ({ item, index }: FloorCardProps) => {
  return (
    <View style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.srNo} {index + 1}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>{'Item Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.itemName ?? '-'}</TextAtom>
        </View>

        <View style={styles.flex1End}>
          <TextAtom style={styles.labelRight}>{'Brand Name'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.itemBrandName ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>{'Item Type'}</TextAtom>
          <TextAtom style={styles.value}>{item.itemTypeName ?? '-'}</TextAtom>
        </View>

        <View style={styles.flex1End}>
          <TextAtom style={styles.labelRight}>{'Unit'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.measurementUnitName ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>{'Stock In'}</TextAtom>
          <TextAtom style={styles.value}>
            {item.stockInQuantity ?? '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextAtom style={styles.labelRight}>{'Stock Out'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.stockOutQuantity ?? '-'}
          </TextAtom>
        </View>

        <View style={styles.flex1End}>
          <TextAtom style={styles.labelRight}>{'Current Stock'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.currentStock ?? '-'}
          </TextAtom>
        </View>
      </View>
    </View>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  brandList: any[];
  selectedBrand: any;
  setSelectedBrand: (d: any) => void;
  typeList: any[];
  selectedType: any;
  setSelectedType: (d: any) => void;
  itemList: any[];
  selectedItem: any;
  setSelectedItem: (d: any) => void;
  startDate: any;
  endDate: any;
  setStartDate: (d: any) => void;
  setEndDate: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (
    brand?: any,
    type?: any,
    list?: any,
    startDate?: any,
    endDate?: any,
  ) => void;
  getTypeList: (d: any) => void;
  getItemList: (d: any, e: any) => void;
}

const FilterForm = ({
  navigation,
  brandList,
  selectedBrand,
  setSelectedBrand,
  typeList,
  selectedType,
  setSelectedType,
  itemList,
  selectedItem,
  setSelectedItem,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  clearFilter,
  hitFilterApi,
  getTypeList,
  getItemList,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Brand'}
      placeholder={'Brand'}
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: 'Brand',
          Data: brandList,
          selectedData: selectedBrand,
          setSelectedData: (data: any) => {
            setSelectedBrand(data);
            getTypeList(data.id);
            setSelectedType({});
            setSelectedItem({});
            hitFilterApi({ brand: data });
          },
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={selectedBrand?.name}
      errorMessage=""
    />
    <DropDownOrganism
      label={'Type'}
      placeholder={'Type'}
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: 'Type',
          Data: typeList,
          selectedData: selectedType,
          setSelectedData: (data: any) => {
            setSelectedType(data);
            getItemList(data.id, selectedBrand.id);
            setSelectedItem({});
            hitFilterApi({ type: data });
          },
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={selectedType?.name}
      errorMessage=""
    />

    <DropDownOrganism
      label={'Item'}
      placeholder={'Item'}
      onPress={() =>
        navigation.navigate('DropDownModal', {
          name: 'Item',
          Data: itemList,
          selectedData: selectedItem,
          setSelectedData: (data: any) => {
            setSelectedItem(data);
            hitFilterApi({ typeid: selectedType.id, item: data });
          },
          typeName: 'name',
          typeId: 'id',
        })
      }
      inputText={selectedItem?.name}
      errorMessage=""
    />

    <DateInputOrganism
      label={strings.hostelManagement.bedAvailability.startDate}
      placeholder={strings.hostelManagement.bedAvailability.startDate}
      value={startDate}
      onChangeText={(val: any) => {
        setStartDate(val);
        hitFilterApi({ startDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <DateInputOrganism
      label={strings.hostelManagement.bedAvailability.endDate}
      placeholder={strings.hostelManagement.bedAvailability.endDate}
      value={endDate}
      onChangeText={(val: any) => {
        setEndDate(val);
        hitFilterApi({ endDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.hostelManagement.floorDetails.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.hostelManagement.floorDetails.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={{ color: colors.primary }}
      />
    </ViewAtom>
  </View>
);

const FloorItemSeparator = () => <View style={styles.itemSeparator} />;

const StockReportDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [messStockDetailsApi] = useMessManagementMessStockReportMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [brandList, setBrandList] = useState<any>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>({});

  const [typeList, setTypeList] = useState<any>([]);
  const [selectedType, setSelectedType] = useState<any>({});

  const [itemList, setItemList] = useState<any>([]);
  const [selectedItem, setSelectedItem] = useState<any>({});

  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Stock Report Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        messStockDetails(1, true, '');
        getBrandList();
        setFirstTimeLoad(false);
      }
    }, [centerSerach, search, firstTimeLoad]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    messStockDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const messStockDetails = (
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
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      messId: item.id,
      ...extraParams,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    messStockDetailsApi(params)
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

        if (res.data.exportUrlExcel) {
          downloadAndOpenFile(res.data.exportUrlExcel);
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
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      messStockDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    messStockDetails(1, true, '');
  };

  const renderListFloorDetails = ({ item, index }: any) => (
    <FloorCard item={item} index={index} />
  );

  const clearFilter = () => {
    setSelectedBrand({});
    setSelectedType({});
    setSelectedItem({});
    setStartDate('');
    setEndDate('');
    messStockDetails(1, true, search, []);
  };

  const buildParams = ({
    brand = selectedBrand,
    type = selectedType,
    item = selectedItem,
    startDate: sDate = startDate,
    endDate: eDate = endDate,
  } = {}) => {
    const params: any = {};

    if (brand?.id) {
      params.itemBrand = brand.id;
    }

    if (type?.id) {
      params.itemType = type.id;
    }

    if (item?.id) {
      params.itemId = item.id;
    }

    if (sDate) {
      params.startDate = moment(sDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    if (eDate) {
      params.endDate = moment(eDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    return params;
  };

  const hitFilterApi = (payload = {}) => {
    const params = buildParams(payload);

    messStockDetails(1, true, search, [], params);
  };

  const applyFilter = () => {
    const params = buildParams();
    messStockDetails(1, true, search, [], params);
    setShowFilter(false);
  };

  const getBrandList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_item_brand_filter_for_mess_stock_report',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setBrandList(res.data);
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

  const getTypeList = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'select_item_type_filter_for_mess_stock_report',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTypeList(res.data);
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

  const getItemList = (typeid: any, id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'select_item_name_filter_for_mess_stock_report',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id, typeid],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setItemList(res.data);
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

  const downloadPdf = () => {
    const parmas = buildParams();
    messStockDetails(1, true, search, [], {
      ...parmas,
      exportFlagExcel: true,
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
        renderItem={renderListFloorDetails}
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
              brandList={brandList}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              typeList={typeList}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              itemList={itemList}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hitFilterApi={hitFilterApi}
              getItemList={getItemList}
              getTypeList={getTypeList}
            />
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
              messStockDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);

          nextPageAvailable
            ? messStockDetails(page + 1, false, search, [])
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={FloorItemSeparator}
      />
    </SafeAreaView>
  );
};

export default StockReportDetails;

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
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  flex1: {
    flex: 1,
  },
  flex1End: {
    flex: 1,
    alignItems: 'flex-end',
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
  loadingContainer: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: vh(10),
  },
});
