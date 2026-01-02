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
import {
  useDeleteFacultyDetailsMutation,
  useListFacultyDetailsMutation,
  useListKnowledgeManagementMutation,
  useUpdateFacultyDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import {
  useListPatientPrescriptionsMutation,
  useListPharmacyReportMutation,
} from '../../../../../../injectEndpoints/phcEndpoints';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
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

  const [exportUrlExcel, setExportUrlExcel] = useState('');
  const [exportUrlPdf, setExportUrlPdf] = useState('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Stock Report');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        getMedicineTypeList();
        setFirstTimeLoad(false);
        listFacultyDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyDetails(1, true, '');
  }, [centerSerach]);

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

  const listFacultyDetails = (
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
          setExportUrlExcel(res.data.exportUrlExcel);
          downloadAndOpenFile(res.data.exportUrlExcel);
        }

        if (res?.data?.exportUrlPdf) {
          setExportUrlPdf(res.data.exportUrlPdf);
          downloadAndOpenFile(res.data.exportUrlPdf);
        }
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
      listFacultyDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listFacultyDetails(1, true, '');
  };
  const BedCard = ({ item, index, navigation }: any) => {
    const thumbnail =
      item?.thumbnail && item.thumbnail !== null && item.thumbnail !== ''
        ? { uri: item.thumbnail }
        : null;

    return (
      <ViewAtom style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Medicine Name</TextAtom>
          <TextAtom style={styles.value}>{item.medicineName ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Medicine Type</TextAtom>
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
        label={'Medicine Type'}
        placeholder={'Medicine Type'}
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
        label={'Medicine'}
        placeholder={'Medicine'}
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
    setSelectedMedicineType({});
    setSelectedMedicine({});
    setStartDate('');
    setEndDate('');
    listFacultyDetails(1, true, search, []);
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

    listFacultyDetails(1, true, search, filters, {
      exportFlagExcel: false,
      exportFlagPdf: false,
    });
  };

  const downloadExcel = () => {
    const filters = buildFilters();

    if (filters.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Apply at least one filter before downloading.',
      });
      return;
    }

    listFacultyDetails(1, true, search, filters, {
      exportFlagExcel: true,
      exportFlagPdf: false,
    });
  };

  const downloadPdf = () => {
    const filters = buildFilters();

    if (filters.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Apply at least one filter before downloading',
      });
      return;
    }

    listFacultyDetails(1, true, search, filters, {
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
            {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
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
          placeholder={'Center'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Center',
              Data: [
                { id: 'All Centers', name: 'All Centers' },
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
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
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
              listFacultyDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyDetails(page + 1, false, search)
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
    backgroundColor: '#eaeaea',
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
    backgroundColor: '#ddffdd',
    borderColor: '#22aa22',
  },

  inActiveBox: {
    backgroundColor: '#ffdddd',
    borderColor: '#cc2222',
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: '#008800' },
  inActiveText: { color: '#bb0000' },

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
});
