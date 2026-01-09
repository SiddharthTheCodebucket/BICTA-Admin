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
import {
  useDeleteFeedbackResponseMutation,
  useListFeedbackResponseMutation,
} from '../../../../../../injectEndpoints/feedbackManagementEndpoints';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useAppSelector } from '../../../../../../hooks';

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
  onDelete: (id: any) => void;
}

const ListPermissionCard = ({
  item,
  index,
  navigation,
  onDelete,
}: ListPermissionProps) => {
  const handleDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.guest.deleteConfirmation,
      message: strings.guest.deleteItemConfirmation,
      okText: strings.guest.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => onDelete(item.id),
      cancelFunction: () => {},
    });
  };
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.MessFeedbackResponseDetails, {
          data: item,
        });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>
        <TouchableAtom style={styles.deleteButton} onPress={handleDelete}>
          <ImageAtom source={images.delete} style={styles.iconSmall} />
        </TouchableAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Trainee Name'}</TextAtom>
        <TextAtom style={styles.value}>{item.traineeName ?? '-'}</TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Training Name'}</TextAtom>
        <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Batch Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.batchName ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Batch Number'}</TextAtom>
          <TextAtom style={styles.valueRight}>{item.batchNo ?? '-'}</TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  feedbackCategory: any[];
  selectedFeedbackCategory: any;
  setSelectedFeedbackCategory: (d: any) => void;
  feedbackSubCategory: any[];
  selectedFeedbackSubCategory: any;
  setSelectedFeedbackSubCategory: (d: any) => void;
  feedbackTopic: any[];
  selectedFeedbackTopic: any;
  setSelectedFeedbackTopic: (d: any) => void;
  feedbackResponse: any[];
  selectedFeedbackResponse: any;
  setSelectedFeedbackResponse: (d: any) => void;
  hostel: any[];
  selectedHostel: any;
  setSelectedHostel: (d: any) => void;
  floor: any[];
  selectedFloor: any;
  setSelectedFloor: (d: any) => void;
  room: any[];
  selectedRoom: any;
  setSelectedRoom: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  getFeedbackSubCategory: (id: any) => void;
  getFeedbackTopic: (id: any) => void;
  getFloor: (id: any) => void;
  getRoom: (id: any) => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
  tenantId: number;
}

const FilterForm = ({
  navigation,
  feedbackCategory,
  selectedFeedbackCategory,
  setSelectedFeedbackCategory,
  feedbackSubCategory,
  selectedFeedbackSubCategory,
  setSelectedFeedbackSubCategory,
  feedbackTopic,
  selectedFeedbackTopic,
  setSelectedFeedbackTopic,
  feedbackResponse,
  selectedFeedbackResponse,
  setSelectedFeedbackResponse,
  hostel,
  selectedHostel,
  setSelectedHostel,
  floor,
  selectedFloor,
  setSelectedFloor,
  room,
  selectedRoom,
  setSelectedRoom,
  applyFilter,
  clearFilter,
  getFeedbackSubCategory,
  getFeedbackTopic,
  getFloor,
  getRoom,
  hitFilterApi,
  tenantId,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Feedback Category'}
      placeholder={'Feedback Category'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Feedback Category',
          Data: feedbackCategory,
          selectedData: selectedFeedbackCategory,
          setSelectedData: (data: any) => {
            setSelectedFeedbackCategory(data);
            setSelectedFeedbackSubCategory({});
            setSelectedFeedbackTopic({});
            getFeedbackSubCategory(data.id);
            hitFilterApi(data, selectedFeedbackCategory);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFeedbackCategory?.name}
      isDisabled={tenantId !== 3}
    />
    <DropDownOrganism
      label={'Feedback Sub Category'}
      placeholder={'Feedback Sub Category'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Feedback Sub Category',
          Data: feedbackSubCategory,
          selectedData: selectedFeedbackSubCategory,
          setSelectedData: (data: any) => {
            setSelectedFeedbackSubCategory(data);
            setSelectedFeedbackTopic({});
            getFeedbackTopic(data.id);
            hitFilterApi(selectedFeedbackSubCategory, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFeedbackSubCategory?.name}
    />
    <DropDownOrganism
      label={'Feedback Topic'}
      placeholder={'Feedback Topic'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Feedback Topic',
          Data: feedbackTopic,
          selectedData: selectedFeedbackTopic,
          setSelectedData: (data: any) => {
            setSelectedFeedbackTopic(data);
            hitFilterApi(selectedFeedbackTopic, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFeedbackTopic?.name}
    />
    <DropDownOrganism
      label={'Feedback Topic'}
      placeholder={'Feedback Topic'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Feedback Topic',
          Data: feedbackTopic,
          selectedData: selectedFeedbackTopic,
          setSelectedData: (data: any) => {
            setSelectedFeedbackTopic(data);
            hitFilterApi(selectedFeedbackTopic, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFeedbackTopic?.name}
    />
    <DropDownOrganism
      label={'Feedback Response'}
      placeholder={'Feedback Response'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Feedback Response',
          Data: feedbackResponse,
          selectedData: selectedFeedbackResponse,
          setSelectedData: (data: any) => {
            setSelectedFeedbackResponse(data);
            hitFilterApi(selectedFeedbackResponse, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFeedbackResponse?.name}
    />
    <DropDownOrganism
      label={'Hostel'}
      placeholder={'Hostel'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Hostel',
          Data: hostel,
          selectedData: selectedHostel,
          setSelectedData: (data: any) => {
            setSelectedHostel(data);
            setSelectedFloor({});
            setSelectedRoom({});
            getFloor(data.id);
            hitFilterApi(selectedHostel, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedHostel?.name}
    />
    <DropDownOrganism
      label={'Floor'}
      placeholder={'Floor'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Floor',
          Data: floor,
          selectedData: selectedFloor,
          setSelectedData: (data: any) => {
            setSelectedFloor(data);
            setSelectedRoom({});
            getRoom(data.id);
            hitFilterApi(selectedFloor, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedFloor?.name}
    />
    <DropDownOrganism
      label={'Room'}
      placeholder={'Room'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Room',
          Data: room,
          selectedData: selectedRoom,
          setSelectedData: (data: any) => {
            setSelectedRoom(data);
            hitFilterApi(selectedRoom, data);
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedRoom?.name}
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

const MessFeedbackResponse = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFeedbackResponseApi] = useListFeedbackResponseMutation();
  const [deleteFeedbackResponseApi] = useDeleteFeedbackResponseMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [feedbackCategory, setFeedbackCategory] = useState<any>([]);
  const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState<any>(
    {},
  );
  const [feedbackSubCategory, setFeedbackSubCategory] = useState<any>([]);
  const [selectedFeedbackSubCategory, setSelectedFeedbackSubCategory] =
    useState<any>({});
  const [feedbackTopic, setFeedbackTopic] = useState<any>([]);
  const [selectedFeedbackTopic, setSelectedFeedbackTopic] = useState<any>({});
  const [feedbackResponse, setFeedbackResponse] = useState<any>([]);
  const [selectedFeedbackResponse, setSelectedFeedbackResponse] = useState<any>(
    {},
  );
  const [hostel, setHostel] = useState<any>([]);
  const [selectedHostel, setSelectedHostel] = useState<any>({});
  const [floor, setFloor] = useState<any>([]);
  const [selectedFloor, setSelectedFloor] = useState<any>({});
  const [room, setRoom] = useState<any>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>({});
  const [exportUrl, setExportUrl] = useState<any>('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Mess Feedback Response');
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

        const defaultFilters =
          crediantialData.user[0].tenantId === 3
            ? [['categoryId', '=', 1]]
            : [];
        listFeedbackResponse(1, true, search, defaultFilters);
        getFeedbackCategory();
        getFeedbackResponse();
        getHostel();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFeedbackResponse(1, true, '');
  }, [centerSerach]);

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
    filtersArray: any[] = [],
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
      exportFlag: true,
      bipardCentre: [],
    };
    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listFeedbackResponseApi(params)
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
        setExportUrl(res.data.exportUrl);

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

  const deleteFeedback = (id: any) => {
    setInitialCall(true);

    deleteFeedbackResponseApi({ id: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setInitialCall(false);
        setFirstTimeLoad(true);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
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
      onDelete={deleteFeedback}
    />
  );

  const clearFilter = () => {
    setSelectedFeedbackSubCategory({});
    setSelectedFeedbackTopic({});
    setSelectedFeedbackResponse({});
    setSelectedHostel({});
    setSelectedRoom({});
    setSelectedFloor({});

    const defaultFilters =
      crediantialData.user[0].tenantId === 3 ? [['categoryId', '=', 1]] : [];

    listFeedbackResponse(1, true, search, defaultFilters);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFeedbackCategory?.id) {
      filters.push(['categoryId', '=', selectedFeedbackCategory.id]);
    }

    if (selectedFeedbackSubCategory?.id) {
      filters.push(['subCategoryId', '=', selectedFeedbackSubCategory.id]);
    }

    if (selectedFeedbackTopic?.id) {
      filters.push(['topicId', '=', selectedFeedbackTopic.id]);
    }
    if (selectedFeedbackResponse?.id) {
      filters.push(['response', '=', selectedFeedbackResponse.id]);
    }
    if (selectedHostel?.id) {
      filters.push(['hostelId', '=', selectedHostel.id]);
    }
    if (selectedFloor?.id) {
      filters.push(['floorId', '=', selectedFloor.id]);
    }
    if (selectedRoom?.id) {
      filters.push(['floorId', '=', selectedRoom.id]);
    }
    listFeedbackResponse(1, true, search, filters);
  };

  const getFeedbackCategory = () => {
    setInitialCall(true);
    const params = {
      listType: 'feedback_category',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFeedbackCategory(res.data);
        const defaultCat = res.data.find((i: any) => i.id === 1);
        if (defaultCat) {
          setSelectedFeedbackCategory(defaultCat);
          getFeedbackSubCategory(defaultCat.id);
        }
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

  const getFeedbackSubCategory = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'feedback_sub_category',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFeedbackSubCategory(res.data);
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

  const getFeedbackTopic = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'feedback_topic',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFeedbackTopic(res.data);
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

  const getFeedbackResponse = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_feedback_response',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFeedbackResponse(res.data);
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
  const getHostel = () => {
    setInitialCall(true);
    const params = {
      listType: 'filter_hostel_name_for_bed_details',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setHostel(res.data);
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

  const getFloor = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'filter_floor_name_for_bed_details',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFloor(res.data);
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

  const getRoom = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'filter_room_no_for_bed_details',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', selectedFloor.id, id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setRoom(res.data);
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
    category = selectedFeedbackCategory,
    subCategory = selectedFeedbackSubCategory,
    topic = selectedFeedbackTopic,
    response = selectedFeedbackResponse,
    hostelData = selectedHostel,
    floorData = selectedFloor,
    roomData = selectedRoom,
  ) => {
    const filters: any[] = [];

    if (category?.id) {
      filters.push(['categoryId', '=', category.id]);
    }

    if (subCategory?.id) {
      filters.push(['subCategoryId', '=', subCategory.id]);
    }

    if (topic?.id) {
      filters.push(['topicId', '=', topic.id]);
    }

    if (response?.id) {
      filters.push(['response', '=', response.id]);
    }

    if (hostelData?.id) {
      filters.push(['hostelId', '=', hostelData.id]);
    }

    if (floorData?.id) {
      filters.push(['floorId', '=', floorData.id]);
    }

    if (roomData?.id) {
      filters.push(['roomId', '=', roomData.id]);
    }

    listFeedbackResponse(1, true, search, filters);
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
              ? strings.hostelManagement.bedAvailability.hideFilter
              : strings.hostelManagement.bedAvailability.showFilter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (exportUrl) {
              downloadAndOpenFile(exportUrl);
            }
          }}
        >
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
              feedbackCategory={feedbackCategory}
              selectedFeedbackCategory={selectedFeedbackCategory}
              setSelectedFeedbackCategory={setSelectedFeedbackCategory}
              feedbackSubCategory={feedbackSubCategory}
              selectedFeedbackSubCategory={selectedFeedbackSubCategory}
              setSelectedFeedbackSubCategory={setSelectedFeedbackSubCategory}
              feedbackTopic={feedbackTopic}
              selectedFeedbackTopic={selectedFeedbackTopic}
              setSelectedFeedbackTopic={setSelectedFeedbackTopic}
              feedbackResponse={feedbackResponse}
              selectedFeedbackResponse={selectedFeedbackResponse}
              setSelectedFeedbackResponse={setSelectedFeedbackResponse}
              hostel={hostel}
              selectedHostel={selectedHostel}
              setSelectedHostel={setSelectedHostel}
              floor={floor}
              selectedFloor={selectedFloor}
              setSelectedFloor={setSelectedFloor}
              room={room}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              getFeedbackSubCategory={getFeedbackSubCategory}
              getFeedbackTopic={getFeedbackTopic}
              getFloor={getFloor}
              getRoom={getRoom}
              hitFilterApi={hitFilterApi}
              tenantId={crediantialData.user[0].tenantId}
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

export default MessFeedbackResponse;

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
});
