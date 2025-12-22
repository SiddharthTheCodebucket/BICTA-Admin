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
  ScrollView,
  TextInput,
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
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
import {
  useAddFileNoTrainingDetailsMutation,
  useDeleteTrainingDetailsMutation,
  useDownloadTrainingCategoryMutation,
  useExtendTrainingEndDateMutation,
  useListClassroomTimeTableManageMutation,
  useListTrainingDetailsMutation,
  useUpdateTraineeLoginDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

const TimeTable = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [downloadApi] = useDownloadTrainingCategoryMutation();
  const [listTimeTablesApi] = useCommonDropdownListMutation();
  const [addFileNoTimeTableApi] = useAddFileNoTrainingDetailsMutation();
  const [updateTimeTableLoginDetailsApi] =
    useUpdateTraineeLoginDetailsMutation();
  const [extendTimeTableEndDateApi] = useExtendTrainingEndDateMutation();
  const [deleteTimeTableApi] = useDeleteTrainingDetailsMutation();

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

  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<string>(
    strings.lms.classRoomManagement.currentTraining,
  );

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.classRoomManagement.timeTableData,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTimeTables(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTimeTables(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    listTimeTables(1, true, search);
  }, [activeTab]);

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

  const listTimeTables = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      listType: 'class_room_management_training_name_list',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listTimeTablesApi(params)
      .unwrap()
      .then((res: any) => {
        let newData = res.data ?? [];

        // 🔥 FILTER HERE
        newData = newData.filter((item: any) =>
          activeTab === strings.lms.classRoomManagement.currentTraining
            ? item.isCourseActive === 'Yes'
            : item.isCourseActive === 'No',
        );

        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);

        const totalCountApi = newData.length;
        setTotalCount(totalCountApi);
        setNextPageAvailable(false); // UI-side pagination handled now
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
      listTimeTables(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTimeTables(1, true, '');
  };

  const handleSelectAll = () => {
    if (selectedItems.length === totalCount) {
      setSelectedItems([]);
      listTimeTables(1, true, search);
    } else {
      setInitialCall(true);

      const params: any = {
        search,
        sort: {
          attributes: ['created_at'],
          sorts: ['desc'],
        },
        filters: [],
        pageNo: 1,
        itemsPerPage: totalCount,

        bipardCentre: getCentreFilter() ?? [],
      };

      if (activeTab === strings.lms.classRoomManagement.previousTraining) {
        params.isCourseActive = false;
      } else {
        params.isCourseActive = true;
      }

      listTimeTablesApi(params)
        .unwrap()
        .then((res: any) => {
          const fullData = res.data?.data ?? [];
          setData(fullData);
          setSelectedItems(fullData);
          setNextPageAvailable(false);
          setInitialCall(false);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong_,
          });
        });
    }
  };

  const downloadTimeTables = async () => {
    setInitialCall(true);

    const params: any = {
      category: selectedItems,
    };

    downloadApi(params)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);
        const fileUrl = res.data?.fileUrl ?? '';
        if (fileUrl) {
        }
        downloadAndOpenFile(fileUrl);
        setSelectedItems([]);
        listTimeTables(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const TimeTableCard = ({ item, index, isSelected }: any) => {
    const [statusValue, setStatusValue] = useState(item.isLoginAllowed ?? null);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const [fileNo, setFileNo] = useState(item.fileNo || '');
    const [isEditingFile, setIsEditingFile] = useState(!item.fileNo);
    const [loadingFileSave, setLoadingFileSave] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.assignmentDetailsList.statusChangeConf,
        message: `${strings.lms.assignmentDetailsList.statusChangeMsg} "${newStatus}"?`,
        okText: strings.lms.assignmentDetailsList.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateTimeTableLoginDetails(item.id, newStatus);
        },
        cancelFunction: () => {},
      });
    };

    const updateTimeTableLoginDetails = (id: any, newStatus: string) => {
      setInitialCall(true);
      const params = {
        trainingId: id,
        isLoginAllowed: newStatus,
      };
      updateTimeTableLoginDetailsApi(params)
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

    const saveFileNo = () => {
      if (!fileNo?.trim()) {
        Toast.show({
          type: 'error',
          text2: strings.lms.classRoomManagement.fileNoNotEmpty,
        });
        return;
      }

      setLoadingFileSave(true);

      const params = {
        id: item.id,
        fileNo: fileNo,
      };

      addFileNoTimeTableApi(params)
        .unwrap()
        .then(res => {
          Toast.show({ type: 'success', text2: res.data.message });
          setIsEditingFile(false);
          setLoadingFileSave(false);
          listTimeTables(1, false, '');
        })
        .catch(err => {
          setLoadingFileSave(false);
          Toast.show({
            type: 'error',
            text2:
              err.data?.message ||
              strings.lms.classRoomManagement.errorUpdatingFileNo,
          });
        });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.locationDetails.deleteConfirmation,
        message: strings.lms.locationDetails.deleteMsg,
        okText: strings.lms.locationDetails.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteTimeTable(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteTimeTable = (id: any) => {
      setInitialCall(true);
      const params = {
        course_id: id,
      };
      deleteTimeTableApi(params)
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
      <TouchableAtom
        onPress={() => {}}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            {strings.lms.locationDetails.srNo} {index + 1}
          </TextAtom>
          <View style={{ flexDirection: 'row', gap: vw(15) }}>
            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setSelectedItem(item);
                setDateExtendedModal(true);
                setSelectedDate('');
              }}
            >
              <ImageAtom
                source={images.extended}
                style={{
                  tintColor: colors.green,
                  width: vw(15),
                  height: vw(15),
                  resizeMode: 'contain',
                }}
              />
            </TouchableAtom> */}

            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                // navigation.navigate(screensName.AddCreateTour, { item: item });
              }}
            >
              <ImageAtom
                source={images.link}
                style={{
                  tintColor: colors.green,
                  width: vw(15),
                  height: vw(15),
                }}
              />
            </TouchableAtom> */}
            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                navigation.navigate(screensName.AddTrainingDetails, {
                  item: item,
                });
              }}
            >
              <ImageAtom
                source={images.edit_pencil}
                style={{
                  tintColor: colors.green,
                  width: vw(15),
                  height: vw(15),
                }}
              />
            </TouchableAtom> */}

            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.red_2,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => handleDelete()}
            >
              <ImageAtom
                source={images.delete}
                style={{ width: vw(15), height: vw(15) }}
              />
            </TouchableAtom> */}
          </View>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.classRoomManagement.trainingName}
          </TextAtom>
          <TextAtom style={styles.value}>{item.name || '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.classRoomManagement.noOfClasses}
          </TextAtom>
          <TextAtom style={styles.value}>{item.noOfBatch ?? '-'}</TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.lms.classRoomManagement.startDate}
            </TextAtom>
            <TextAtom style={styles.value}>
              {moment(item.courseStartDate).format('DD-MM-YYYY')} -{' '}
              {moment(item.courseEndDate).format('DD-MM-YYYY')}
            </TextAtom>
          </View>
        </View>

        {activeTab === strings.lms.classRoomManagement.previousTraining && (
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <TextAtom style={styles.label}>
                {strings.lms.classRoomManagement.timeTable}
              </TextAtom>
              <TextAtom style={styles.value}>
                {strings.lms.classRoomManagement.trainingEnd}
              </TextAtom>
            </View>
          </View>
        )}
      </TouchableAtom>
    );
  };

  const renderTimeTableItem = ({ item, index }: any) => {
    return (
      <TimeTableCard
        item={item}
        index={index}
        navigation={navigation}
        isSelected={selectedItems.some((x: any) => x.id === item.id)}
      />
    );
  };
  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DateInputOrganism
        label={strings.lms.classRoomManagement.startDate}
        placeholder={strings.lms.classRoomManagement.startDate}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <DateInputOrganism
        label={strings.lms.classRoomManagement.endDate}
        placeholder={strings.lms.classRoomManagement.endDate}
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
    setStartDate('');
    setEndDate('');
    listTimeTables(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseStartDate', '>=', formatted]);
    }

    if (endDate) {
      const formatted = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseEndDate', '<=', formatted]);
    }
    listTimeTables(1, true, search, filters);
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
    extendTimeTableEndDateApi(params)
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

      <View style={styles.headerBox}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}
          > */}
          {/* <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
              <TextAtom style={styles.filterText}>
                {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
              </TextAtom>
            </TouchableAtom> */}
          {/* <TouchableAtom
              style={styles.filterButton}
              onPress={handleSelectAll}
            >
              <TextAtom style={styles.filterText}>
                {selectedItems?.length === totalCount
                  ? strings.lms.classRoomManagement.unselectAll
                  : strings.lms.classRoomManagement.selectAll}
              </TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={styles.filterButton}
              onPress={() => {
                if (selectedItems.length === 0) {
                  Toast.show({
                    type: 'error',
                    text2: strings.lms.classRoomManagement.selectToDownload,
                  });
                  return;
                }
                downloadTimeTables();
              }}
            >
              <ImageAtom
                source={images.download}
                style={{ tintColor: colors.black }}
              />
            </TouchableAtom>
          </View>
          {showFilter && <FilterForm />} */}

          {crediantialData.user[0].tenantId === 3 && (
            <DropDownOrganism
              label={''}
              placeholder={strings.lms.locationDetails.centers}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Center',
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
                  setSelectedData: setCenterSerach,
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={centerSerach?.name}
              containerStyle={{ marginBottom: vh(5) }}
            />
          )}
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={{ marginTop: vh(10) }}
          />
        </ScrollView>
      </View>
      <View style={styles.tabRow}>
        {[
          strings.lms.classRoomManagement.currentTraining,
          strings.lms.classRoomManagement.previousTraining,
        ].map(tab => (
          <TouchableAtom
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <TextAtom
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </TextAtom>
          </TouchableAtom>
        ))}
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTimeTableItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              {strings.lms.locationDetails.noDataFound}
            </TextAtom>
          ) : null
        }
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
              listTimeTables(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTimeTables(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
      {/* <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddTrainingDetails);
        }}
      /> */}

      <DateExtendModal />
    </SafeAreaView>
  );
};

export default TimeTable;

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
    backgroundColor: colors.selectedCardBg,
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
  headerBox: { height: 'auto' },
  paginationLoader: { marginTop: vh(10) },
  itemSeparator: { height: vh(10) },
});
