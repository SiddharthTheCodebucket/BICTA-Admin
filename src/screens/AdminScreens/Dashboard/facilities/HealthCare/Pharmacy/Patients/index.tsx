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
  Modal,
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
import ViewAtom from '../../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import { useListPatientPrescriptionsMutation } from '../../../../../../../injectEndpoints/phcEndpoints';
import { downloadAndOpenFile } from '../../../../../../../utils/CommonFunction';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

const Patients = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listPatientPrescriptionsApi] = useListPatientPrescriptionsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [dateTimeList, setDateTimeList] = useState<any>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<any>({});

  const [exportUrl, setExportUrl] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.patients_details);
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listPatients(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listPatients(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    generateMonthYearList();
  }, []);

  const generateMonthYearList = () => {
    let list: any = [];
    const currentYear = new Date().getFullYear(); // 2025
    const nextYear = currentYear + 1; // 2026

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    [currentYear, nextYear].forEach(year => {
      months.forEach((month, index) => {
        const id = `${year}-${String(index + 1).padStart(2, '0')}`;

        list.push({
          id: id, // "2025-01"
          name: `${month} ${year}`, // "January 2025"
        });
      });
    });

    setDateTimeList(list);
  };

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

  const listPatients = (
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

    listPatientPrescriptionsApi(params)
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

        if (res?.data?.exportUrl) {
          setExportUrl(res.data.exportUrl);
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
      listPatients(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listPatients(1, true, '');
  };
  const toggleCard = (id: string | number) => {
    const key = String(id);
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const BedCard = ({ item, index, navigation }: any) => {
    const key = String(item.id ?? index);
    const isExpanded = !!expandedIds[key];
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.PatientDetails, {
            data: item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10), alignItems: 'flex-start' }]}>
          <TextAtom style={[styles.titleName, { flex: 1 }]}>
            {item.name || `Patient ${index + 1}`}
          </TextAtom>
          <TouchableAtom onPress={() => {}} style={styles.deleteButton}>
            <Icon name="delete-outline" size={18} color={colors.inactive_red} />
          </TouchableAtom>
        </View>
        <TextAtom style={styles.label}>Training Programme</TextAtom>
        <TextAtom style={[styles.value, { marginBottom: vh(10) }]}>
          {item.trainingProgramme || '-'}
        </TextAtom>
        <View style={[styles.rowBetween, { alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Batch</TextAtom>
            <TextAtom style={styles.value}>{item.batch ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignSelf: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>{strings.patient_type}</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.patientType ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>{strings.symptom_id}</TextAtom>
            <TextAtom style={styles.value}>{item.symptomId ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.labelRight}>Prescription ID</TextAtom>
            <TextAtom style={styles.valueRight}>{item.prescriptionId ?? '-'}</TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Age (Years)</TextAtom>
            <TextAtom style={styles.value}>{item.age ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.labelRight}>Gender</TextAtom>
            <TextAtom style={styles.valueRight}>{item.gender ?? '-'}</TextAtom>
          </View>
        </View>
        <TextAtom style={styles.label}>Blood Group</TextAtom>
        <TextAtom style={styles.value}>{item.bloodGroup ?? '-'}</TextAtom>
        {isExpanded && (
          <>
            <TextAtom style={styles.label}>Primary Observations</TextAtom>
            <TextAtom style={styles.value}>{item.primaryObservations ?? '-'}</TextAtom>
            <TextAtom style={styles.label}>Medicines</TextAtom>
            <TextAtom style={styles.value}>{item.medicines ?? '-'}</TextAtom>
          </>
        )}
        <TouchableAtom onPress={() => toggleCard(key)}>
          <TextAtom style={styles.viewMoreText}>{isExpanded ? 'View Less' : 'View More'}</TextAtom>
        </TouchableAtom>
        {isExpanded && (
          <View>
            <TextAtom style={styles.label}>Unique ID</TextAtom>
            <TextAtom style={styles.value}>{item.uniqueId ?? '-'}</TextAtom>
          </View>
        )}
      </TouchableAtom>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.month_year}
        placeholder={strings.month_year}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.month_year,
            Data: dateTimeList,
            selectedData: selectedDateTime,
            setSelectedData: (data: any) => {
              setSelectedDateTime(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedDateTime?.name}
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
    setSelectedDateTime({});
    listPatients(1, true, search, []);
  };

  const applyFilter = () => {
    const filters: any = [];

    const paramsFilter = {
      yearMonth: selectedDateTime?.id || null,
      exportFlag: true,
      exportFlagExcel: true,
    };

    listPatients(1, true, search, filters, paramsFilter);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={styles.headerRow}>
        <TextAtom style={styles.mainTitle}>Prescription Details (99877)</TextAtom>
        <TouchableAtom style={styles.iconBtn}>
          <Icon name="magnify" size={22} color={colors.black} />
        </TouchableAtom>
        <TouchableAtom style={styles.iconBtn} onPress={toggleFilter}>
          <Icon name="filter-variant" size={20} color={colors.black} />
        </TouchableAtom>
        <TouchableAtom
          style={styles.createBtn}
          onPress={() => {}}
        >
          <TextAtom style={styles.createText}>+ Create</TextAtom>
        </TouchableAtom>
      </View>
      <TouchableAtom
          style={styles.downloadBtn}
          onPress={() => {
            if (selectedDateTime?.id) {
              if (exportUrl) {
                downloadAndOpenFile(exportUrl);
              }
            } else {
              Toast.show({
                type: 'error',
                text2: strings.apply_month_year_filter_before_downloading,
              });
            }
          }}
        >
          <ImageAtom source={images.download} style={{ tintColor: colors.primary_dark_blue }} />
      </TouchableAtom>
      <Modal visible={showFilter} transparent animationType="slide">
        <TouchableAtom style={styles.modalOverlay} onPress={toggleFilter} />
        <View style={styles.filterBottomSheet}>
          <View style={styles.sheetHandle} />
          <FilterForm />
        </View>
      </Modal>
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
              listPatients(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listPatients(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default Patients;

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
  titleName: { fontFamily: fonts.Roboto_Medium, fontSize: vw(15), color: colors.primary_dark_blue },
  deleteButton: { borderWidth: 1, borderColor: colors.light_gray, borderRadius: 8, padding: 4 },
  viewMoreText: { color: '#CA8A04', fontFamily: fonts.Roboto_Medium, marginTop: vh(6) },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: vw(15), marginTop: vh(8) },
  mainTitle: { flex: 1, color: colors.black, fontFamily: fonts.Roboto_Medium, fontSize: vw(16) },
  iconBtn: { marginHorizontal: vw(3) },
  createBtn: { backgroundColor: colors.primary_dark_blue, borderRadius: 10, paddingHorizontal: vw(12), paddingVertical: vh(8), marginLeft: vw(5) },
  createText: { color: colors.white, fontFamily: fonts.Roboto_Medium },
  downloadBtn: { alignSelf: 'flex-end', marginRight: vw(15), marginTop: vh(8) },
  filterText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  filterContainer: { paddingHorizontal: vw(15) },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  filterBottomSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: vh(25), paddingTop: vh(12) },
  sheetHandle: { alignSelf: 'center', width: vw(80), height: 5, borderRadius: 10, backgroundColor: colors.grey, marginBottom: vh(16) },
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
    backgroundColor: colors.pharmacy_green,
    borderRadius: 5,
    padding: 10,
  },
});
