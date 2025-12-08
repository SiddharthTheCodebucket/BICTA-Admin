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
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import FloatingButton from '../../../../../components/organisms/FloatingButton';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import {
  useBedDetailsRoomMutation,
  useDeleteBedDetailsRoomMutation,
  useUpdateBedDetailsRoomMutation,
} from '../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import {
  useDeleteFacultyDetailsMutation,
  useListFacultyDetailsMutation,
  useListKnowledgeManagementMutation,
  useListKnowledgeManagementSubTopicMutation,
  useUpdateFacultyDetailsMutation,
} from '../../../../../injectEndpoints/lmsEndpoints';

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

const SubjectTopic = (props: Props) => {
  const { navigation } = props;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFacultyDetailsApi] = useListKnowledgeManagementSubTopicMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [userList, setUserList] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Subject Topic Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyDetails(1, true, '');
        getUser();
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
      bipardCentre: [],
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listFacultyDetailsApi(params)
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
          navigation.navigate(screensName.FacultySubjectFeedbackDetails, {
            item: item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Subject</TextAtom>
          <TextAtom style={styles.value}>{item.subject ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Description</TextAtom>
          <TextAtom style={styles.value}>{item.description ?? '-'}</TextAtom>
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
        label={'User Type'}
        placeholder={'User Type'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'User Type',
            Data: userList,
            selectedData: selectedUser,
            setSelectedData: (data: any) => {
              setSelectedUser(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedUser?.name}
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
    setSelectedUser({});
    listFacultyDetails(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedUser?.id) {
      filters.push(['userTypeId', '=', selectedUser.id]);
    }
    listFacultyDetails(1, true, search, filters);
  };

  const getUser = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_user_type',
      bipardCentre: getCentreFilter(),
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setUserList(res.data);
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
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
        </TextAtom>
      </TouchableAtom>
      {showFilter && <FilterForm />}
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

export default SubjectTopic;

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
