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
  screensName,
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
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useListPatientSymptomsDetailsMutation } from '../../../../../../injectEndpoints/phcEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
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

const BasicPatientDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listPatientSymptomsDetailsApi] =
    useListPatientSymptomsDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [trainingList, setTrainingList] = useState<any>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>({});
  const [batchList, setBatchList] = useState<any>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>({});
  const [selectedPatientType, setSelectedPatientType] = useState<any>({});
  const [bloodGroupList, setBloodGroupList] = useState<any>([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<any>({});
  const [doctorList, setDoctorList] = useState<any>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>({});
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<any>({});
  const [toDate, setToDate] = useState('');
  const [fromDate, setFromDate] = useState('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Patient Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        getTrainingList();
        getBloodGroup();
        getDoctorList();
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

    listPatientSymptomsDetailsApi(params)
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
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.PatientDetailDetails, {
            data: item,
          });
        }}
      >
        <View style={[styles.rowBetween]}>
          <View style={[styles.rowBetween]}>
            <View style={{ flex: 1 }}>
              <TextAtom style={styles.label}> Sr. No</TextAtom>
              <TextAtom style={styles.value}>{index + 1}</TextAtom>
            </View>
            <View style={{ flex: 1, alignSelf: 'flex-end' }}>
              <TextAtom style={styles.labelRight}>ID</TextAtom>
              <TextAtom style={styles.valueRight}>
                {item.uniqueId ?? '-'}
              </TextAtom>
            </View>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Patient Type</TextAtom>
            <TextAtom style={styles.value}>{item.patientType ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1, alignSelf: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Visit Count</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.visitCount ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Name</TextAtom>
          <TextAtom style={styles.value}>{item.name ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Training Name</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Training'}
        placeholder={'Training'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Training',
            Data: trainingList,
            selectedData: selectedTraining,
            setSelectedData: (data: any) => {
              setSelectedTraining(data);
              getBacth(data.id);
              setSelectedBatch({});
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedTraining?.name}
      />
      <DropDownOrganism
        label={'Batch'}
        placeholder={'Batch'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Batch',
            Data: batchList,
            selectedData: selectedBatch,
            setSelectedData: (data: any) => {
              setSelectedBatch(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedBatch?.name}
      />
      <DropDownOrganism
        label={'Patient Type'}
        placeholder={'Patient Type'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Patient Type',
            Data: [
              { id: 'trainee', name: 'OT' },
              { id: 'Other', name: 'Other' },
            ],
            selectedData: selectedPatientType,
            setSelectedData: (data: any) => {
              setSelectedPatientType(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedPatientType?.name}
      />
      <DropDownOrganism
        label={'Blood Group'}
        placeholder={'Blood Group'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Blood Group',
            Data: bloodGroupList,
            selectedData: selectedBloodGroup,
            setSelectedData: (data: any) => {
              setSelectedBloodGroup(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedBloodGroup?.name}
      />
      <DropDownOrganism
        label={'Doctor'}
        placeholder={'Doctor'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Doctor',
            Data: doctorList,
            selectedData: selectedDoctor,
            setSelectedData: (data: any) => {
              setSelectedDoctor(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedDoctor?.name}
      />
      <DropDownOrganism
        label={'Treatment Type'}
        placeholder={'Treatment Type'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Treatment Type',
            Data: [
              { id: 'OPD', name: 'OPD' },
              { id: 'IPD', name: 'IPD' },
            ],
            selectedData: selectedTreatmentType,
            setSelectedData: (data: any) => {
              setSelectedTreatmentType(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedTreatmentType?.name}
      />
      <DateInputOrganism
        label={'To Date'}
        placeholder={'To Date'}
        value={toDate}
        onChangeText={(val: any) => {
          setToDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <DateInputOrganism
        label={'From Date'}
        placeholder={'From Date'}
        value={fromDate}
        onChangeText={(val: any) => {
          setFromDate(val);
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
    setSelectedTraining({});
    setSelectedBatch({});
    setSelectedPatientType({});
    setSelectedBloodGroup({});
    setSelectedDoctor({});
    setSelectedTreatmentType({});
    setToDate('');
    setFromDate('');
    listFacultyDetails(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any = [];

    if (selectedTraining?.id) {
      filters.push(['trainingId', '=', selectedTraining.id]);
    }

    if (selectedBatch?.id) {
      filters.push(['batchId', '=', selectedBatch.id]);
    }

    if (selectedPatientType?.id) {
      filters.push(['patientType', '=', selectedPatientType.id]);
    }

    if (selectedBloodGroup?.id) {
      filters.push(['bloodGroup', '=', selectedBloodGroup.id]);
    }

    if (selectedDoctor?.id) {
      filters.push(['assignDoctorId', '=', selectedDoctor.id]);
    }

    if (selectedTreatmentType?.id) {
      filters.push(['treatmentTypes', '=', selectedTreatmentType.id]);
    }

    if (toDate) {
      const formatted = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['currentDatetime', '>=', formatted]);
    }

    if (fromDate) {
      const formatted = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['currentDatetime', '<=', formatted]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    listFacultyDetails(1, true, search, filters);
  };

  const getTrainingList = () => {
    setInitialCall(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingList(res.data);
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

  const getBacth = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'trainee_batch_no_filter',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setBatchList(res.data);
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
  const getBloodGroup = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_blood_group',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setBloodGroupList(res.data);
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
  const getDoctorList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_phc_doctors',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setDoctorList(res.data);
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
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
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

export default BasicPatientDetails;

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
