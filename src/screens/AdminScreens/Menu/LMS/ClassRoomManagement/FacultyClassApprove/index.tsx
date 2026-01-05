import React, {
  createRef,
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
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import {
  useExtendTrainingEndDateMutation,
  useListClassroomTimeTableManageMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

const FacultyClassApprove = (props: Props) => {
  const { navigation } = props;

  const input1_ref: any = createRef();

  const [listFacultyClassApprovalsApi] =
    useListClassroomTimeTableManageMutation();

  const [extendFacultyClassApproveEndDateApi] =
    useExtendTrainingEndDateMutation();
  const [dropDownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [dateExtendedModal, setDateExtendedModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [selectedItems] = useState<any>([]);

  const [startDate, setStartDate] = useState<any>('');

  const [trainingStartLimit, setTrainingStartLimit] = useState<any>(null);
  const [trainingEndLimit, setTrainingEndLimit] = useState<any>(null);

  const ITEMS_PER_PAGE = 10;

  const [search] = React.useState('');
  const [centerSerach] = React.useState<any>({});

  const [selectedBipardLocation, setSelectedBipardLocation] = useState<any>({});
  const [trainingNameList, setTrainingNameList] = useState<any>({});
  const [bacthNameList, setBacthNameList] = useState<any>({});
  const [selectedTrainingName, setSelectedTrainingName] = useState<any>({});
  const [selectedBacthName, setSelectedBacthName] = useState<any>({});
  const [selectedTrainingDuration, setSelectedTrainingDuration] =
    useState<any>('');

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.classRoomManagement.facultyClassApprove,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyClassApprovals(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyClassApprovals(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    listFacultyClassApprovals(1, true, search);
  }, []);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }
    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listFacultyClassApprovals = (
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
        attributes: ['cmtt.created_at'],
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

    listFacultyClassApprovalsApi(params)
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

  const FacultyClassApproveCard = ({ item, index, isSelected }: any) => {
    return (
      <TouchableAtom
        onPress={() => {
          navigation.navigate(screensName.FacultyClassApproveDetails, {
            data: item,
          });
        }}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            {strings.lms.locationDetails.srNo} {index + 1}
          </TextAtom>
          <View style={{ flexDirection: 'row', gap: vw(15) }}></View>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.classRoomManagement.trainingName}
          </TextAtom>
          <TextAtom style={styles.value}>{item.trainingName || '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.classRoomManagement.days}
          </TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.courseStartDate).format('DD-MM-YYYY')}
          </TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.classRoomManagement.session}
          </TextAtom>
          <TextAtom style={styles.value}>{item.selectASession}</TextAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderFacultyClassApproveItem = ({ item, index }: any) => {
    return (
      <FacultyClassApproveCard
        item={item}
        index={index}
        navigation={navigation}
        isSelected={selectedItems.some((x: any) => x.id === item.id)}
      />
    );
  };

  const getTrainingNameList = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'classroom_management_select_training_name',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    dropDownApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingNameList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };
  const getBatchList = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'classroom_management_select_batch_name',
      bipardCentre: [selectedBipardLocation.name],
      replacements: ['%%', id],
    };
    dropDownApi(params)
      .unwrap()
      .then((res: any) => {
        setBacthNameList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  const getTrainingDuration = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'classroom_management_select_training_duration',
      bipardCentre: [strings.dashboardIndex.gaya],
      replacements: [id],
    };
    dropDownApi(params)
      .unwrap()
      .then((res: any) => {
        const startMoment = moment(res.data[0].courseStartDate, 'YYYY-MM-DD');
        const endMoment = moment(res.data[0].courseEndDate, 'YYYY-MM-DD');

        const startStr = startMoment.format('DD-MM-YYYY');
        const endStr = endMoment.format('DD-MM-YYYY');

        const data = `${startStr} - ${endStr}`;
        setSelectedTrainingDuration(data);

        setTrainingStartLimit(startMoment.toDate());
        setTrainingEndLimit(endMoment.toDate());

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };
  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.lms.classRoomManagement.bipardLocation}
        placeholder={strings.lms.classRoomManagement.bipardLocation}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.classRoomManagement.bipardLocation,
            Data: [
              {
                id: strings.dashboardIndex.gaya,
                name: strings.dashboardIndex.gaya,
              },
              {
                id: strings.dashboardIndex.patna,
                name: strings.dashboardIndex.patna,
              },
            ],
            selectedData: selectedBipardLocation,
            setSelectedData: (data: any) => {
              setSelectedBipardLocation(data);
              getTrainingNameList(data.name);
              setSelectedTrainingName({});
              setSelectedBacthName({});
              setStartDate('');
              setSelectedTrainingDuration('');
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedBipardLocation?.name}
      />
      <DropDownOrganism
        label={strings.lms.classRoomManagement.trainingName}
        placeholder={strings.lms.classRoomManagement.trainingName}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.classRoomManagement.trainingName,
            Data: trainingNameList,
            selectedData: selectedTrainingName,
            setSelectedData: (data: any) => {
              setSelectedTrainingName(data);
              getBatchList(data.id);
              getTrainingDuration(data.id);
              setSelectedBacthName({});
              setStartDate('');
              setSelectedTrainingDuration('');
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedTrainingName?.name}
      />
      <DropDownOrganism
        label={strings.lms.classRoomManagement.batchName}
        placeholder={strings.lms.classRoomManagement.batchName}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.classRoomManagement.batchName,
            Data: bacthNameList,
            selectedData: selectedBacthName,
            setSelectedData: (data: any) => {
              setSelectedBacthName(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedBacthName?.name}
      />
      <DateInputOrganism
        label={strings.lms.classRoomManagement.startDate}
        placeholder={strings.lms.classRoomManagement.startDate}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
        minDate={trainingStartLimit}
        maxDate={trainingEndLimit}
      />
      <TextInputOrganisms
        label={strings.lms.classRoomManagement.duration}
        placeholder={strings.lms.classRoomManagement.duration}
        ref={input1_ref}
        onSubmitEditing={() => Keyboard.dismiss()}
        value={selectedTrainingDuration}
        autoCapitalize={'none'}
        returnKeyType={'next'}
        onChangeText={(val: string) => {}}
        disabled
        editable={false}
      />
      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText={strings.lms.locationDetails.applyFilter}
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={strings.lms.locationDetails.clearFilter}
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary }}
        />
      </ViewAtom>
    </View>
  );
  const clearFilter = () => {
    setSelectedBipardLocation({});
    setSelectedTrainingName({});
    setSelectedBacthName({});
    setStartDate('');
    setSelectedTrainingDuration('');
    listFacultyClassApprovals(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (selectedTrainingName?.id) {
      filters.push(['trainingNameId', '=', selectedTrainingName?.id]);
    }
    if (selectedBacthName?.id) {
      filters.push(['batchNoId', '=', selectedBacthName?.id]);
    }
    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['date', '=', formatted]);
    }
    listFacultyClassApprovals(1, true, search, filters);
    setShowFilter(false);
  };

  const DateExtendModal = () => {
    return (
      <Modal
        visible={dateExtendedModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDateExtendedModal(false);
          setSelectedDate('');
          setSelectedItem({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableAtom
              style={styles.modalCloseBtn}
              onPress={() => {
                setDateExtendedModal(false);
                setSelectedDate('');
                setSelectedItem({});
              }}
            >
              <TextAtom style={styles.modalCloseText}>×</TextAtom>
            </TouchableAtom>

            <TextAtom style={styles.modalTitle}>
              {strings.lms.classRoomManagement.extendedDate}
            </TextAtom>

            {selectedItem && (
              <View style={styles.modalFieldBox}>
                <TextAtom numberOfLines={0} style={styles.modalEntityName}>
                  {strings.lms.classRoomManagement.extendDateOf}: "
                  {selectedItem.trainingFullName}"
                </TextAtom>

                <TextAtom style={styles.modalDurationText}>
                  {strings.lms.classRoomManagement.duration}:{' '}
                  {moment(selectedItem?.courseStartDate).format('DD-MMM-YYYY')}
                  {' to '}
                  {moment(selectedItem?.courseEndDate).format('DD-MMM-YYYY')}
                </TextAtom>
              </View>
            )}

            <DateInputOrganism
              label={strings.lms.classRoomManagement.startDate}
              placeholder={strings.lms.classRoomManagement.startDate}
              value={selectedDate}
              onChangeText={(val: any) => {
                setSelectedDate(val);
              }}
              fieldName="date"
              dateFormat="DD-MM-YYYY"
              isMandatory
              containerStyle={{ width: vw(300) }}
              labelStyle={{ width: vw(300) }}
            />

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableAtom
                style={styles.modalExtendBtn}
                onPress={() => {
                  if (isNullUndefined(selectedDate)) {
                    Toast.show({
                      type: 'error',
                      text2: strings.lms.classRoomManagement.dateIsRequired,
                    });
                    return;
                  }
                  extendTrainingEndDate(selectedItem.id, selectedDate);
                }}
              >
                <TextAtom style={styles.modalExtendText}>
                  {strings.lms.classRoomManagement.extend}
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const extendTrainingEndDate = (id: any, date: string) => {
    setInitialCall(true);
    const params = {
      trainingId: id,
      newEndDate: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    };
    extendFacultyClassApproveEndDateApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setInitialCall(false);
        setFirstTimeLoad(true);
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
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter
            ? strings.lms.classRoomManagement.hideFilter
            : strings.lms.classRoomManagement.showFilter}
        </TextAtom>
      </TouchableAtom>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderFacultyClassApproveItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.locationDetails.noDataFound}
            </TextAtom>
          )
        }
        ListHeaderComponent={showFilter ? <FilterForm /> : null}
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.paginationLoader}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listFacultyClassApprovals(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyClassApprovals(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <DateExtendModal />
    </SafeAreaView>
  );
};

export default FacultyClassApprove;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: vw(10),
    marginTop: vh(5),
  },
  tabButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: colors.lightGray2,
    borderRadius: vw(6),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  activeTabText: {
    color: colors.white,
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
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
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
    backgroundColor: colors.transparent,
    zIndex: 998,
  },
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(6),
  },

  fileInput: {
    flex: 1,
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(6),
    paddingHorizontal: vw(10),
    paddingVertical: vh(6),
    fontSize: vw(14),
    color: colors.black,
  },

  checkBtn: {
    marginLeft: vw(10),
    padding: vw(6),
    borderRadius: vw(6),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  fileDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh(8),
    paddingHorizontal: vw(10),
    borderWidth: vw(1),
    borderColor: colors.grey_3,
    borderRadius: vw(6),
    backgroundColor: colors.lightGrey,
    marginTop: vh(6),
  },

  fileText: {
    fontSize: vw(14),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  flex1: { flex: 1 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.transparentBlack,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  modalCloseBtn: { position: 'absolute', top: 10, right: 10, padding: 5 },
  modalCloseText: { fontSize: vw(22), color: colors.red_2 },
  modalTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    marginBottom: vh(15),
    color: colors.primary,
    textAlign: 'center',
  },
  modalFieldBox: { marginBottom: vh(12) },
  modalEntityName: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  modalDurationText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    marginTop: vh(4),
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
  },
  modalExtendBtn: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: colors.green,
    borderRadius: vw(6),
  },
  modalExtendText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },
  paginationLoader: { marginTop: vh(10) },
  itemSeparator: { height: vh(10) },
});
