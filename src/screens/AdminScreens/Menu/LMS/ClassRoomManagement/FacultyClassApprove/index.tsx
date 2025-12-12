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
  ScrollView,
  TextInput,
  Modal,
  Keyboard,
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
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
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

const FacultyClassApprove = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const input1_ref: any = createRef();
  const [downloadApi] = useDownloadTrainingCategoryMutation();
  const [listTrainingDetailsApi] = useListClassroomTimeTableManageMutation();
  const [addFileNoTrainingDetailsApi] = useAddFileNoTrainingDetailsMutation();
  const [updateTraineeLoginDetailsApi] = useUpdateTraineeLoginDetailsMutation();
  const [extendTrainingEndDateApi] = useExtendTrainingEndDateMutation();
  const [deleteTrainingDetailsApi] = useDeleteTrainingDetailsMutation();
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

  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  const [trainingStartLimit, setTrainingStartLimit] = useState<any>(null);
  const [trainingEndLimit, setTrainingEndLimit] = useState<any>(null);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [selectedBipardLocation, setSelectedBipardLocation] = useState<any>({});
  const [trainingNameList, setTrainingNameList] = useState<any>({});
  const [bacthNameList, setBacthNameList] = useState<any>({});
  const [selectedTrainingName, setSelectedTrainingName] = useState<any>({});
  const [selectedBacthName, setSelectedBacthName] = useState<any>({});
  const [selectedTrainingDuration, setSelectedTrainingDuration] =
    useState<any>('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Class Approve');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTrainingDetais(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingDetais(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    listTrainingDetais(1, true, search);
  }, []);

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

  const listTrainingDetais = (
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

    listTrainingDetailsApi(params)
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

        const totalCountApi = res?.data?.totalCount ?? 0;
        setTotalCount(totalCountApi);
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
      listTrainingDetais(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingDetais(1, true, '');
  };

  const handleSelectAll = () => {
    if (selectedItems.length === totalCount) {
      setSelectedItems([]);
      listTrainingDetais(1, true, search);
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

      listTrainingDetailsApi(params)
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
            text2: err.data?.message || 'Something went wrong',
          });
        });
    }
  };

  const downloadTraining = async () => {
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
        listTrainingDetais(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const TraineeCard = ({ item, index, isSelected }: any) => {
    const [statusValue, setStatusValue] = useState(item.isLoginAllowed ?? null);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const [fileNo, setFileNo] = useState(item.fileNo || '');
    const [isEditingFile, setIsEditingFile] = useState(!item.fileNo);
    const [loadingFileSave, setLoadingFileSave] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: 'Status Change Confirmation',
        message: `Are you sure you want to change the status to "${newStatus}"?`,
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateTraineeLoginDetails(item.id, newStatus);
        },
        cancelFunction: () => {},
      });
    };

    const updateTraineeLoginDetails = (id: any, newStatus: string) => {
      setInitialCall(true);
      const params = {
        trainingId: id,
        isLoginAllowed: newStatus,
      };
      updateTraineeLoginDetailsApi(params)
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
            text2: err.data?.message || 'Something went wrong',
          });
        });
    };

    const saveFileNo = () => {
      if (!fileNo?.trim()) {
        Toast.show({ type: 'error', text2: 'File No cannot be empty!' });
        return;
      }

      setLoadingFileSave(true);

      const params = {
        id: item.id,
        fileNo: fileNo,
      };

      addFileNoTrainingDetailsApi(params)
        .unwrap()
        .then(res => {
          Toast.show({ type: 'success', text2: res.data.message });
          setIsEditingFile(false);
          setLoadingFileSave(false);
          listTrainingDetais(1, false, '');
        })
        .catch(err => {
          setLoadingFileSave(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Error updating File No',
          });
        });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this item?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteTrainingDetails(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteTrainingDetails = (id: any) => {
      setInitialCall(true);
      const params = {
        course_id: id,
      };
      deleteTrainingDetailsApi(params)
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
            text2: err.data?.message || 'Something went wrong',
          });
        });
    };

    return (
      <TouchableAtom
        onPress={() => {
          navigation.navigate(screensName.FacultyClassApproveDetails, {
            data: item,
          });
        }}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
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

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Training Name</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName || '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Days</TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.courseStartDate).format('DD-MM-YYYY')}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Session</TextAtom>
          <TextAtom style={styles.value}>{item.selectASession}</TextAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => {
    return (
      <TraineeCard
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
      bipardCentre: ['Gaya'],
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
        label={'Bipard Location'}
        placeholder={'Bipard Location'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Bipard Location',
            Data: [
              { id: 'Gaya', name: 'Gaya' },
              { id: 'Patna', name: 'Patna' },
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
        label={'Training Name'}
        placeholder={'Training Name'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Training Name',
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
        label={'Batch Name'}
        placeholder={'Batch Name'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Batch Name',
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
        label={'Start Date'}
        placeholder={'Start Date'}
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
        label={'Duration'}
        placeholder={'Duration'}
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
    setSelectedBipardLocation({});
    setSelectedTrainingName({});
    setSelectedBacthName({});
    setStartDate('');
    setSelectedTrainingDuration('');
    listTrainingDetais(1, true, search, []);
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
    listTrainingDetais(1, true, search, filters);
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
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <View
            style={{
              width: '90%',
              backgroundColor: colors.white,
              borderRadius: 10,
              padding: 20,
              position: 'relative',
            }}
          >
            <TouchableAtom
              style={{ position: 'absolute', top: 10, right: 10, padding: 5 }}
              onPress={() => {
                setDateExtendedModal(false);
                setSelectedDate('');
                setSelectedItem({});
              }}
            >
              <TextAtom style={{ fontSize: vw(22), color: colors.red_2 }}>
                ×
              </TextAtom>
            </TouchableAtom>

            <TextAtom
              style={{
                fontSize: vw(16),
                fontFamily: fonts.Roboto_Bold,
                marginBottom: vh(15),
                color: colors.primary,
                textAlign: 'center',
              }}
            >
              Extended Date
            </TextAtom>

            {selectedItem && (
              <View style={{ marginBottom: vh(12) }}>
                <TextAtom
                  numberOfLines={0}
                  style={{
                    fontSize: vw(14),
                    fontFamily: fonts.Roboto_Medium,
                    color: colors.black,
                  }}
                >
                  Extend Date of: "{selectedItem.trainingFullName}"
                </TextAtom>

                <TextAtom
                  style={{
                    fontSize: vw(14),
                    fontFamily: fonts.Roboto_Regular,
                    color: colors.grey,
                    marginTop: vh(4),
                  }}
                >
                  Duration:{' '}
                  {moment(selectedItem?.courseStartDate).format('DD-MMM-YYYY')}
                  {' to '}
                  {moment(selectedItem?.courseEndDate).format('DD-MMM-YYYY')}
                </TextAtom>
              </View>
            )}

            <DateInputOrganism
              label="Start Date"
              placeholder="Start Date"
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 25,
              }}
            >
              <TouchableAtom
                style={{
                  paddingVertical: vh(8),
                  paddingHorizontal: vw(20),
                  backgroundColor: colors.green,
                  borderRadius: vw(6),
                }}
                onPress={() => {
                  if (isNullUndefined(selectedDate)) {
                    Toast.show({
                      type: 'error',
                      text2: 'Date is required',
                    });
                    return;
                  }
                  extendTrainingEndDate(selectedItem.id, selectedDate);
                }}
              >
                <TextAtom
                  style={{
                    color: colors.white,
                    fontFamily: fonts.Roboto_Medium,
                  }}
                >
                  Extend
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
    extendTrainingEndDateApi(params)
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
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
        </TextAtom>
      </TouchableAtom>
      {/* 
      <View style={{ height: vh(130) }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
              onPress={handleSelectAll}
            >
              <TextAtom style={styles.filterText}>
                {selectedItems?.length === totalCount
                  ? 'Unselect All'
                  : 'Select All'}
              </TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={styles.filterButton}
              onPress={() => {
                if (selectedItems.length === 0) {
                  Toast.show({
                    type: 'error',
                    text2: 'Select to download',
                  });
                  return;
                }
                downloadTraining();
              }}
            >
              <ImageAtom
                source={images.download}
                style={{ tintColor: colors.black }}
              />
            </TouchableAtom>
          </View>
          {showFilter && <FilterForm />}

          {crediantialData.user[0].tenantId === 3 && (


            <DropDownOrganism
            label={''}
            placeholder={'Centers'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Center',
                Data: [
                  { id: 'All Centers', name: 'All Centers' },
                  { id: 'Gaya', name: 'Gaya' },
                  { id: 'Patna', name: 'Patna' },
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
      </View> */}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
        }
        ListHeaderComponent={showFilter ? <FilterForm /> : null}
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(10) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTrainingDetais(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTrainingDetais(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
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
    backgroundColor: '#EAEAEA',
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
    backgroundColor: '#F3F8FF',
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
});
