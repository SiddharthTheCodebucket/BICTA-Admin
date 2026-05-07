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
} from '../../../../../../../constants';
import { useAppSelector } from '../../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import { useListPharmacyReportMutation } from '../../../../../../../injectEndpoints/phcEndpoints';
import { downloadAndOpenFile } from '../../../../../../../utils/CommonFunction';
import DateInputOrganism from '../../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';

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

const StockReport = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listPharmacyReportApi] = useListPharmacyReportMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [medicineTypeList, setMedicineTypeList] = useState<any>([]);
  const [selectedMedicineType, setSelectedMedicineType] = useState<any>({});
  const [medicineList, setMedicineList] = useState<any>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>({});
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.stock_report);
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        getMedicineTypeList();
        setFirstTimeLoad(false);
        listStockReports(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listStockReports(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.all_centers) {
      return ['Gaya', 'Patna'];
    }

    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listStockReports = (
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
      ...extraParams,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listPharmacyReportApi(params)
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

        if (res?.data?.exportUrlExcel) {
          downloadAndOpenFile(res.data.exportUrlExcel);
        }

        if (res?.data?.exportUrlPdf) {
          downloadAndOpenFile(res.data.exportUrlPdf);
        }
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

  const handleSearch = useCallback(
    debounce((text: string) => {
      listStockReports(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listStockReports(1, true, '');
  };
  const BedCard = ({ item, index, navigation }: any) => {
    return (
      <ViewAtom style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{strings.medicine_name}</TextAtom>
          <TextAtom style={styles.value}>{item.medicineName ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{strings.medicine_type}</TextAtom>
          <TextAtom style={styles.value}>{item.medicineType ?? '-'}</TextAtom>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Opening Stock</TextAtom>
            <TextAtom style={styles.value}>{item.openingStock ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignSelf: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Stock Added Today</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.todayStockAddition ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Distributed Quantity</TextAtom>
            <TextAtom style={styles.value}>{item.distribution ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignSelf: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Closing Stock</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.closingStock ?? '-'}
            </TextAtom>
          </View>
        </View>
      </ViewAtom>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.medicine_type}
        placeholder={strings.medicine_type}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Medicine Type',
            Data: medicineTypeList,
            selectedData: selectedMedicineType,
            setSelectedData: (data: any) => {
              setSelectedMedicineType(data);
              getMedicine(data.id);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedMedicineType?.name}
      />
      <DropDownOrganism
        label={strings.medicine}
        placeholder={strings.medicine}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Medicine',
            Data: medicineList,
            selectedData: selectedMedicine,
            setSelectedData: (data: any) => {
              setSelectedMedicine(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedMedicine?.name}
      />
      <DateInputOrganism
        label={strings.start_date}
        placeholder={strings.start_date}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <DateInputOrganism
        label={strings.end_date}
        placeholder={strings.end_date}
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
          bttnText={strings.apply_filter}
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={strings.clear_filter}
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary }}
        />
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedMedicineType({});
    setSelectedMedicine({});
    setStartDate('');
    setEndDate('');
    listStockReports(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any = [];

    if (selectedMedicine?.id) {
      filters.push(['medicineName', '=', selectedMedicine.id]);
    }

    if (selectedMedicineType?.id) {
      filters.push(['medicineType', '=', selectedMedicineType.id]);
    }

    if (startDate) {
      const sd = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['startDate', '>=', sd]);
    }

    if (endDate) {
      const ed = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['endDate', '<=', ed]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();

    listStockReports(1, true, search, filters, {
      exportFlagExcel: false,
      exportFlagPdf: false,
    });
  };

  const downloadExcel = () => {
    const filters = buildFilters();

    if (filters.length === 0) {
      Toast.show({
        type: 'error',
        text2: strings.apply_at_least_one_filter_before_downloading,
      });
      return;
    }

    listStockReports(1, true, search, filters, {
      exportFlagExcel: true,
      exportFlagPdf: false,
    });
  };

  const downloadPdf = () => {
    const filters = buildFilters();

    if (filters.length === 0) {
      Toast.show({
        type: 'error',
        text2: strings.apply_at_least_one_filter_before_downloading,
      });
      return;
    }

    listStockReports(1, true, search, filters, {
      exportFlagPdf: true,
      exportFlagExcel: false,
    });
  };

  const getMedicineTypeList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_medicine_type_filter_for_pharmacy_report',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setMedicineTypeList(res.data);
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

  const getMedicine = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'select_medicine_filter_for_pharmacy_report',
      bipardCentre: getCentreFilter(),
      replacements: [id, '%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setMedicineList(res.data);
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
            {showFilter ? strings.hide_filter : strings.show_filter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            downloadExcel();
          }}
        >
          <ImageAtom
            source={images.download}
            style={{
              tintColor: colors.black,
              resizeMode: 'contain',
              width: vw(10),
              height: vw(10),
              alignSelf: 'center',
            }}
          />
          <TextAtom
            style={{
              color: colors.black,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(8),
            }}
          >
            Excel
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            downloadPdf();
          }}
        >
          <ImageAtom
            source={images.download}
            style={{
              tintColor: colors.black,
              resizeMode: 'contain',
              width: vw(10),
              height: vw(10),
              alignSelf: 'center',
            }}
          />
          <TextAtom
            style={{
              color: colors.black,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(8),
            }}
          >
            Pdf
          </TextAtom>
        </TouchableAtom>
      </View>

      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.center}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Center',
              Data: [
                { id: strings.all_centers, name: strings.all_centers },
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
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
        renderItem={renderListBedDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.no_data_found}
            </TextAtom>
          )
        }
        ListHeaderComponent={<View>{showFilter && <FilterForm />}</View>}
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
              listStockReports(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listStockReports(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
      {/* <FloatingButton
        onButtonPress={() => {
          // navigation.navigate(screensName.AddFacultyDetails);
        }}
      /> */}
    </SafeAreaView>
  );
};

export default StockReport;

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
    backgroundColor: colors.light_gray_bg,
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
    backgroundColor: colors.light_green_bg,
    borderColor: colors.dark_green_border,
  },

  inActiveBox: {
    backgroundColor: colors.light_red_bg,
    borderColor: colors.dark_red_border,
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: colors.active_green },
  inActiveText: { color: colors.inactive_red },

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
  hardcodedStyle: {
    color: colors.pharmacy_yellow,
    fontSize: 16,
  },
});
