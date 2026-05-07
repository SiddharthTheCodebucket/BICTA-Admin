/* eslint-disable eslint-comments/no-unused-disable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
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
import { useListTrainingWiseFacultyMutation } from '../../../../../../injectEndpoints/feedbackManagementEndpoints';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useAppSelector } from '../../../../../../hooks';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  navigation: NavigationType;
  appliedFilters: any[];
}
const ListPermissionCard = ({
  item,
  index,
  navigation,
  appliedFilters,
}: ListPermissionProps) => {
  return (
    <TouchableAtom
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        navigation.navigate(screensName.FacultyFeedbackTrainingWiseDetails, {
          data: item,
        });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Faculty Name'}</TextAtom>
        <TextAtom style={styles.value}>{item.facultyName ?? '-'}</TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Designation'}</TextAtom>
        <TextAtom style={styles.value}>{item.designation ?? '-'}</TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Department'}</TextAtom>
          <TextAtom style={styles.value}>{item.department ?? '-'}</TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelCount}>{'Class Count'}</TextAtom>
          <TouchableAtom
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate(screensName.ClassCountList, {
                appliedFilters,
                item,
              });
            }}
          >
            <TextAtom style={[styles.value, { color: colors.primary }]}>
              {item.classCount ?? '-'}
            </TextAtom>
          </TouchableAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TextAtom style={styles.labelCount}>{'Trainee Count'}</TextAtom>
          <ViewAtom>
            <TextAtom style={[styles.value, { textAlign: 'center' }]}>
              {item.traineeCount ?? '-'}
            </TextAtom>
          </ViewAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRightCount}>{'Feedback Count'}</TextAtom>
          <TouchableAtom
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate(screensName.FeedbackCountList, {
                appliedFilters,
                item,
              });
            }}
          >
            <TextAtom style={[styles.valueRight, { color: colors.primary }]}>
              {item.feedbackCount ?? '-'}
            </TextAtom>
          </TouchableAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  trainingList: any[];
  selectedTraining: any[];
  addTraining: (d: any) => void;
  removeTraining: (d: any) => void;
  facultyList: any[];
  selectedFaculty: any[];
  addFaculty: (d: any) => void;
  removeFaculty: (d: any) => void;
  startDate: any;
  setStartDate: (v: any) => void;
  endDate: any;
  setEndDate: (v: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

const FilterForm = ({
  navigation,
  trainingList,
  selectedTraining,
  addTraining,
  removeTraining,
  facultyList,
  selectedFaculty,
  addFaculty,
  removeFaculty,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  clearFilter,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Training'}
      placeholder={'Training'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Training',
          Data: trainingList,
          selectedData: {},
          setSelectedData: (item: any) => {
            addTraining(item);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={''}
    />
    <ViewAtom style={{ marginTop: vh(0) }}>
      {selectedTraining?.length > 0 && (
        <ViewAtom style={styles.permissionScrollWrapper}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled
          >
            <ViewAtom style={styles.chipContainer}>
              {selectedTraining.map((item: any) => (
                <ViewAtom key={item.id} style={styles.chip}>
                  <TextAtom style={styles.chipText}>{item.name}</TextAtom>

                  <TouchableOpacity
                    onPress={() => removeTraining(item.id)}
                    style={styles.crossBtn}
                  >
                    <TextAtom style={styles.crossText}>✕</TextAtom>
                  </TouchableOpacity>
                </ViewAtom>
              ))}
            </ViewAtom>
          </KeyboardAwareScrollView>
        </ViewAtom>
      )}
    </ViewAtom>

    <DropDownOrganism
      label={'Faculty'}
      placeholder={'Faculty'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Faculty',
          Data: facultyList,
          selectedData: {},
          setSelectedData: (item: any) => {
            addFaculty(item);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={''}
    />

    <ViewAtom style={{ marginTop: vh(0) }}>
      {selectedFaculty?.length > 0 && (
        <ViewAtom style={styles.permissionScrollWrapper}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled
          >
            <ViewAtom style={styles.chipContainer}>
              {selectedFaculty.map((item: any) => (
                <ViewAtom key={item.id} style={styles.chip}>
                  <TextAtom style={styles.chipText}>{item.name}</TextAtom>

                  <TouchableOpacity
                    onPress={() => removeFaculty(item.id)}
                    style={styles.crossBtn}
                  >
                    <TextAtom style={styles.crossText}>✕</TextAtom>
                  </TouchableOpacity>
                </ViewAtom>
              ))}
            </ViewAtom>
          </KeyboardAwareScrollView>
        </ViewAtom>
      )}
    </ViewAtom>

    <DateInputOrganism
      label={strings.hostelReport.startDate}
      placeholder={strings.hostelReport.startDate}
      value={startDate}
      onChangeText={setStartDate}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />
    <DateInputOrganism
      label={strings.hostelReport.endDate}
      placeholder={strings.hostelReport.endDate}
      value={endDate}
      onChangeText={setEndDate}
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

const FacultyFeedbackTrainingWise = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFeedbackResponseApi] = useListTrainingWiseFacultyMutation();
  const center = useGetCentre();
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [trainingList, setTrainingList] = useState<any>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>([]);
  const [facultyList, setFacultyList] = useState<any>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>([]);
  const [startDate, setStartDate] = useState(
    moment().subtract(7, 'days').format('DD-MM-YYYY'),
  );
  const [endDate, setEndDate] = useState(moment().format('DD-MM-YYYY'));

  const [exportUrlExcel, setExportUrlExcel] = useState('');
  const [exportUrlPdf, setExportUrlPdf] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Feedback Training');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);

        listFeedbackResponse(1, true, search);
        getTrainingList();
        getFacultyList();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (firstTimeLoad) return;
    if (!startDate || !endDate) return;

    const timer = setTimeout(() => {
      hitFilterApi(selectedTraining, selectedFaculty, startDate, endDate);
    }, 400);

    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFeedbackResponse(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    if (exportUrlExcel) {
      downloadAndOpenFile(exportUrlExcel);
    }
  }, [exportUrlExcel]);

  useEffect(() => {
    if (exportUrlPdf) {
      downloadAndOpenFile(exportUrlPdf);
    }
  }, [exportUrlPdf]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listFeedbackResponse = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();

    const params: any = {
      search: keyword ?? '',
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: centreFilter ?? [],
    };

    if (selectedFaculty.length > 0) {
      params.selectedFacultyIds = selectedFaculty.map((f: any) => String(f.id));
    }

    if (selectedTraining.length > 0) {
      params.selectedTrainingIds = selectedTraining.map((t: any) => t.id);
    }

    if (startDate) {
      params.startDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    if (endDate) {
      params.endDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    listFeedbackResponseApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];

        setData(pageNumber === 1 ? newData : [...data, ...newData]);

        setExportUrlExcel(res.data?.exportUrlExcel);
        setExportUrlPdf(res.data?.exportUrlPdf);
        setAppliedFilters(res.data?.appliedFilters || []);

        const totalCount = res.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
        setPage(pageNumber);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      })
      .finally(() => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listFeedbackResponse(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listFeedbackResponse(1, true, '');
  };

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard
      item={item}
      index={index}
      navigation={navigation}
      appliedFilters={appliedFilters}
    />
  );

  const clearFilter = () => {
    setSelectedTraining([]);
    setSelectedFaculty([]);
    setStartDate(moment().subtract(7, 'days').format('DD-MM-YYYY'));
    setEndDate(moment().format('DD-MM-YYYY'));
    listFeedbackResponse(1, true, search);
  };

  const applyFilter = () => {
    setPage(1);
    setPagination(false);
    listFeedbackResponse(1, true, search);
  };

  const getTrainingList = () => {
    setInitialCall(true);
    const params = {
      listType: 'training_name_filter_for_faculty_feedback',
      bipardCentre: center,
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

  const getFacultyList = () => {
    setInitialCall(true);
    const params = {
      listType: 'faculty_name_filter_for_faculty_feedback',
      bipardCentre: center,
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let data = res.data || [];
        const formattedData = data.map((q: any) => ({
          ...q,
          name: `${q.id}, ${q.name}`,
        }));
        setFacultyList(formattedData);
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
    training = selectedTraining,
    faculty = selectedFaculty,
    sd = startDate,
    ed = endDate,
    exportFlag = false,
  ) => {
    setInitialCall(true);

    const params: any = {
      search,
      pageNo: 1,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: getCentreFilter() ?? [],
      exportFlag,
    };

    if (faculty.length) {
      params.selectedFacultyIds = faculty.map((f: any) => String(f.id));
    }

    if (training.length) {
      params.selectedTrainingIds = training.map((t: any) => t.id);
    }

    if (sd) params.startDate = moment(sd, 'DD-MM-YYYY').format('YYYY-MM-DD');
    if (ed) params.endDate = moment(ed, 'DD-MM-YYYY').format('YYYY-MM-DD');

    listFeedbackResponseApi(params)
      .unwrap()
      .then((res: any) => {
        setData(res.data?.data || []);
        setExportUrlExcel(res.data?.exportUrlExcel);
        setExportUrlPdf(res.data?.exportUrlPdf);
        setAppliedFilters(res.data?.appliedFilters || []);
        setNextPageAvailable(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      })
      .finally(() => {
        setInitialCall(false);
      });
  };

  const addTraining = (item: any) => {
    const exists = selectedTraining.some((t: any) => t.id === item.id);

    if (exists) return;
    const updatedTraining = [...selectedTraining, item];
    setSelectedTraining(updatedTraining);
    hitFilterApi(updatedTraining, selectedFaculty, startDate, endDate);
  };
  const removeTraining = (id: number) => {
    const updatedTraining = selectedTraining.filter(
      (item: any) => item.id !== id,
    );

    setSelectedTraining(updatedTraining);

    hitFilterApi(updatedTraining, selectedFaculty, startDate, endDate);
  };

  const addFaculty = (item: any) => {
    const exists = selectedFaculty.some((f: any) => f.id === item.id);
    if (exists) return;

    const updatedFaculty = [...selectedFaculty, item];
    setSelectedFaculty(updatedFaculty);

    hitFilterApi(selectedTraining, updatedFaculty, startDate, endDate);
  };

  const removeFaculty = (id: number) => {
    const updatedFaculty = selectedFaculty.filter(
      (item: any) => item.id !== id,
    );

    setSelectedFaculty(updatedFaculty);

    hitFilterApi(selectedTraining, updatedFaculty, startDate, endDate);
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    if (selectedTraining.length === 0 && selectedFaculty.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select at least one Training or Faculty to export',
      });
      return;
    }
    hitFilterApi(selectedTraining, selectedFaculty, startDate, endDate, true);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <TextAtom
        numberOfLines={0}
        style={{
          color: colors.black,
          fontFamily: fonts.Roboto_Medium,
          fontSize: vw(10),
          width: vw(328),
          alignSelf: 'center',
          marginTop: vh(4),
        }}
      >
        Training-wise Faculty Feedback Report (Weekly Summary).Apply filters to
        view previous data
      </TextAtom>
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
          onPress={() => handleExport('excel')}
        >
          <ImageAtom
            source={images.download}
            style={styles.downloadIconStyle}
          />
          <TextAtom style={styles.downloadText}>
            {strings.vendor.excel}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => handleExport('pdf')}
        >
          <ImageAtom
            source={images.download}
            style={styles.downloadIconStyle}
          />
          <TextAtom style={styles.downloadText}>{strings.vendor.pdf}</TextAtom>
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
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              trainingList={trainingList}
              selectedTraining={selectedTraining}
              addTraining={addTraining}
              removeTraining={removeTraining}
              facultyList={facultyList}
              selectedFaculty={selectedFaculty}
              addFaculty={addFaculty}
              removeFaculty={removeFaculty}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
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
              listFeedbackResponse(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFeedbackResponse(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={BedItemSeparator}
      />
    </SafeAreaView>
  );
};

export default FacultyFeedbackTrainingWise;

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
  labelCount: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
  },
  labelRightCount: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
    textAlign: 'right',
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
    alignItems: 'center',
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
  downloadIconStyle: {
    tintColor: colors.black,
    resizeMode: 'contain',
    width: vw(10),
    height: vw(10),
  },
  downloadText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(8),
  },
  permissionScrollWrapper: {
    maxHeight: vh(160),
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: vw(6),
    marginHorizontal: vw(6),
  },
  crossText: {
    color: colors.white,
    fontSize: vw(12),
    fontWeight: 'bold',
  },

  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
  },
  noPermissionText: {
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(6),
    textAlign: 'center',
    marginBottom: vh(8),
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(5),
    marginBottom: vh(8),
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: vw(14),
    paddingVertical: vh(6),
    paddingHorizontal: vh(12),
    marginRight: vw(8),
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginLeft: vh(3),
  },

  chipText: {
    color: colors.primary,
    fontSize: vw(12),
    marginRight: vw(6),
  },

  crossBtn: {
    width: vw(18),
    height: vw(18),
    borderRadius: vw(9),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
