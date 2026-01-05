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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
import {
  useApproveTrainingIdCardMutation,
  useDownloadTrainingIdCardMutation,
  useListTraineeRegistrationMutation,
  useListTrainingBatchDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';
import { useDeleteTraineeRegistrationMutation } from '../../../../../../injectEndpoints/profileEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';

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

const TraineeRegistration = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonListApi] = useCommonDropdownListMutation();
  const [listTraineeDetailsApi] = useListTraineeRegistrationMutation();
  const [deleteTraineeDetailsApi] = useDeleteTraineeRegistrationMutation();
  const [listTrainingBatchDetailsApi] = useListTrainingBatchDetailsMutation();
  const [approveTrainingIdCardApi] = useApproveTrainingIdCardMutation();
  const [downloadTrainingIdCardApi] = useDownloadTrainingIdCardMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [showIdModal, setShowIdModal] = useState(false);
  const [ccSignature, setCcSignature] = useState<any>({});

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
  const [pregnancyList] = useState<any>([
    { id: 'Yes', name: 'No' },
    { id: 'No', name: 'No' },
  ]);
  const [selectedPregnancy, setSelectedPregnancy] = useState<any>({});

  const [selectedItems] = useState<any>([]);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<
    'Current Course' | 'Complete Course'
  >('Current Course');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Registration');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTraineeDetais(1, true, '');
        getTrainingList();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTraineeDetais(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    listTraineeDetais(1, true, search);
  }, [activeTab]);

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

  const listTraineeDetais = (
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
        attributes: ['created_at'],
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

    if (activeTab === 'Complete Course') {
      params.isCourseActive = false;
    } else {
      params.isCourseActive = true;
    }

    listTraineeDetailsApi(params)
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
      listTraineeDetais(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTraineeDetais(1, true, '');
  };

  const TraineeCard = ({ item, index, isSelected }: any) => {
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
        traineeId: id,
      };
      deleteTraineeDetailsApi(params)
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
          navigation.navigate(screensName.TraineeRegistrationDetails, {
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
            <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                navigation.navigate(screensName.AddTraineeRegistration, {
                  item: item,
                  onDone: () => listTraineeDetais(1, true, search),
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
            </TouchableAtom>

            <TouchableAtom
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
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Id</TextAtom>
            <TextAtom style={styles.value}>{item.traineeId || '-'}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>U.Id</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.userUniqueId || '-'}
            </TextAtom>
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Name</TextAtom>
            <TextAtom style={styles.value}>{item.name}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Training Centre</TextAtom>
            <TextAtom style={styles.valueRight}>{item.trainingCentre}</TextAtom>
          </View>
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
              listTrainingBatchDetails(data.id);
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
            typeName: 'batchName',
            typeId: 'id',
          });
        }}
        inputText={selectedBatch?.batchName}
      />

      <DropDownOrganism
        label={'Pregnancy'}
        placeholder={'Pregnancy'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Pregnancy',
            Data: pregnancyList,
            selectedData: selectedPregnancy,
            setSelectedData: (data: any) => {
              setSelectedPregnancy(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedPregnancy?.name}
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
    setSelectedPregnancy({});
    listTraineeDetais(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (selectedTraining.id) {
      filters.push(['nameOfTrainingProgrammeId', '=', selectedTraining.id]);
    }
    if (selectedBatch.id) {
      filters.push(['batchNoId', '=', selectedBatch.id]);
    }
    if (selectedPregnancy.id) {
      filters.push(['pregnancyStatus', '=', selectedPregnancy.id]);
    }
    listTraineeDetais(1, true, search, filters);
  };

  const getTrainingList = () => {
    setInitialCall(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const listTrainingBatchDetails = (id: any) => {
    setInitialCall(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['asc'],
      },
      filters: ['trainingNameId', '=', id],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [],
    };
    listTrainingBatchDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        setBatchList(res.data.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const handleGenerateId = () => {
    if (!ccSignature.uri) {
      Toast.show({ type: 'error', text2: 'Upload CC Signature first' });
      return;
    }

    setInitialCall(true);

    const formData = new FormData();
    formData.append('trainingId', selectedTraining.id);
    formData.append('batchId', selectedBatch.id);

    formData.append('ccSign', {
      uri: ccSignature.uri,
      type: ccSignature.type,
      name: ccSignature.name,
    });
    approveTrainingIdCardApi(formData)
      .unwrap()
      .then(res => {
        setInitialCall(false);
        if (!isNullUndefined(res?.pdfUrl)) {
          downloadAndOpenFile(res?.pdfUrl);
        }
        Toast.show({ type: 'success', text2: res.data.message });
      })
      .catch(err => {
        setInitialCall(false);
        Toast.show({ type: 'error', text2: err.message });
      });
  };

  const handleDownloadId = () => {
    setInitialCall(true);

    let params = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: null,
      isCourseActive: true,
      bipardCentre: [],
      trainingId: selectedTraining.id,
      batchId: selectedBatch.id,
    };

    downloadTrainingIdCardApi(params)
      .unwrap()
      .then(res => {
        setInitialCall(false);

        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((item: any) => {
            if (item?.pdfUrl) {
              downloadAndOpenFile(item.pdfUrl);
            }
          });

          Toast.show({
            type: 'success',
            text2: `Downloaded ${res.data.length} ID Card(s)`,
          });
        } else {
          Toast.show({
            type: 'error',
            text2: 'No PDF found',
          });
        }
      })
      .catch(err => {
        setInitialCall(false);
        Toast.show({ type: 'error', text2: err.message });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={{ height: 'auto' }}>
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
              onPress={() => {
                if (!selectedTraining?.id || !selectedBatch?.id) {
                  Toast.show({
                    type: 'error',
                    text2: 'Select Training and Batch first',
                  });
                  return;
                }
                setShowIdModal(true);
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
      </View>
      <View style={styles.tabRow}>
        {['Current Course', 'Complete Course'].map(tab => (
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
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
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
              listTraineeDetais(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTraineeDetais(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddTraineeRegistration, {
            onDone: () => listTraineeDetais(1, true, search),
          });
        }}
      />

      <Modal
        visible={showIdModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: vw(20),
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: vw(10),
              padding: vw(20),
            }}
          >
            {/* Close Button */}
            <TouchableAtom
              onPress={() => setShowIdModal(false)}
              style={{
                position: 'absolute',
                top: vh(10),
                right: vw(10),
                backgroundColor: colors.grey_1,
                width: vw(30),
                height: vw(30),
                borderRadius: vw(15),
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              <TextAtom
                style={{
                  fontSize: vw(16),
                  fontFamily: fonts.Roboto_Bold,
                  color: colors.black,
                  marginTop: -2,
                }}
              >
                ×
              </TextAtom>
            </TouchableAtom>

            <TextAtom
              style={{
                fontSize: vw(18),
                fontFamily: fonts.Roboto_Bold,
                marginBottom: vh(10),
                color: colors.primary,
              }}
            >
              ID Card Panel
            </TextAtom>

            <ImageUploadOrganism
              label={'photo'}
              buttonText={strings.choose_file}
              onSelectImage={(file: any) => {
                setCcSignature(file);
              }}
              defaultImage={ccSignature.uri}
              isMandatory
              buttonContainer={{ width: vw(280) }}
              labelStyle={{ width: vw(280) }}
              preview={{
                width: vw(280),
                resizeMode: 'contain',
              }}
            />

            {/* Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: vh(20),
              }}
            >
              <TouchableAtom
                disabled={!ccSignature?.uri}
                style={{
                  backgroundColor: ccSignature?.uri
                    ? colors.primary
                    : colors.grey_1,
                  paddingVertical: vh(10),
                  paddingHorizontal: vw(10),
                  borderRadius: vw(25),
                }}
                onPress={handleGenerateId}
              >
                <TextAtom
                  style={{
                    color: colors.white,
                    fontFamily: fonts.Roboto_Regular,
                    fontSize: vw(12),
                  }}
                >
                  Generate ID Card
                </TextAtom>
              </TouchableAtom>

              <TouchableAtom
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: vh(10),
                  paddingHorizontal: vw(20),
                  borderRadius: vw(25),
                }}
                onPress={handleDownloadId}
              >
                <TextAtom
                  style={{
                    color: colors.white,
                    fontFamily: fonts.Roboto_Regular,
                    fontSize: vw(12),
                  }}
                >
                  Download ID Card
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TraineeRegistration;

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
