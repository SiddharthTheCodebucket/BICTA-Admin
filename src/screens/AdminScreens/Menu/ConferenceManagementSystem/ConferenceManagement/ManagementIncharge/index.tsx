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
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useAppSelector } from '../../../../../../hooks';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useConferenceListManagementInchargeDetailsMutation } from '../../../../../../injectEndpoints/conferenceManagementEndpoints';
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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
}

const VendorCard: React.FC<VendorCardProps> = ({ item, index, navigation }) => {
  const nodalOfficerNames =
    item?.nodalOfficers?.length > 0
      ? item.nodalOfficers.map((o: any) => o.name).join(', ')
      : '-';
  const protocolCount =
    item?.protocolOfficersNameCount ?? item?.protocolOfficers?.length ?? 0;

  const liaisonCount =
    item?.liaisonOfficersNameCount ?? item?.liaisonOfficers?.length ?? 0;

  return (
    <ViewAtom style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, { flex: 1 }]}>
          Sr. No: {index + 1}
        </TextAtom>
        <View style={{ flexDirection: 'row', gap: vw(10) }}>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.navigate(screensName.ManagementInchargeDetails, {
                item: item,
              });
            }}
          >
            <ImageAtom
              source={images.eyeOpen}
              style={{
                tintColor: colors.primary,
                width: vw(15),
                height: vw(15),
              }}
            />
          </TouchableAtom>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Conference Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.conferenceName ?? '-'}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Nodal Officers</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {nodalOfficerNames}
        </TextAtom>
      </View>

      <View style={styles.threeColRow}>
        <View style={styles.colLeft}>
          <TextAtom style={styles.labelMid}>Protocol Officer</TextAtom>
          <TextAtom style={styles.value}>{protocolCount}</TextAtom>
        </View>

        <View style={styles.colCenter}>
          <TextAtom style={styles.labelMid}>Liaison Officers</TextAtom>
          <TextAtom style={styles.value}>{liaisonCount}</TextAtom>
        </View>

        <View style={styles.colRight}>
          <TextAtom style={styles.labelRightMid}>Status</TextAtom>
          <TextAtom style={styles.valueRight}>{item.status}</TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  conferenceNameList: any[];
  selectedConferenceName: any;
  setSelectedConferenceName: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  conferenceNameList,
  selectedConferenceName,
  setSelectedConferenceName,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Conference Name'}
      placeholder={'Conference Name'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Conference Name',
          Data: conferenceNameList,
          selectedData: selectedConferenceName,
          setSelectedData: (data: any) => {
            setSelectedConferenceName(data);
            hitFilterApi({ conferenceName: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedConferenceName?.name}
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

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const ManagementIncharge = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listApi] = useConferenceListManagementInchargeDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);

  const [conferenceNameList, setConferenceNameList] = useState<any>([]);
  const [selectedConferenceName, setSelectedConferenceName] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Management Incharge List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        list(1, true, '');
        setFirstTimeLoad(false);
        getConferenceNameList();
      }
    }, [centerSerach, search, firstTimeLoad]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    list(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const list = (
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
        attributes: ['createdAt'],
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
    listApi(params)
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

        if (res.data.exportUrl) {
          downloadAndOpenFile(res.data.exportUrl);
        }

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
      list(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    list(1, true, '');
  };

  const renderlist = useCallback(
    ({ item, index }: any) => (
      <VendorCard item={item} index={index} navigation={navigation} />
    ),
    [navigation],
  );

  const clearFilter = () => {
    setSelectedConferenceName({});
    list(1, true, search, []);
  };

  const buildFilters = (status = selectedConferenceName) => {
    const filters: any[] = [];

    if (status.id) {
      filters.push(['conferenceId', '=', status.id]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    list(1, true, search, filters);
    setShowFilter(false);
  };

  const hitFilterApi = ({ conferenceName }: any = {}) => {
    const filters = buildFilters(conferenceName ?? selectedConferenceName);

    list(1, true, search, filters);
  };

  const downloadPdf = () => {
    const filters = buildFilters();
    list(1, true, search, filters, {
      exportFlag: true,
    });
  };

  const getConferenceNameList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_conference_filter_for_management_incharge',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setConferenceNameList(resData);
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
            {showFilter
              ? strings.hostelManagement.floorDetails.hideFilter
              : strings.hostelManagement.floorDetails.showFilter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom style={styles.filterButton} onPress={downloadPdf}>
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
        renderItem={renderlist}
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
              list(1, false, '');
            }}
          />
        }
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              conferenceNameList={conferenceNameList}
              selectedConferenceName={selectedConferenceName}
              setSelectedConferenceName={setSelectedConferenceName}
              hitFilterApi={hitFilterApi}
            />
          ) : null
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? list(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default ManagementIncharge;

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
  labelMid: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
  },
  labelRightMid: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
    textAlign: 'right',
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
  generateBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  applyBtn: {
    width: vw(150),
    height: vh(35),
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingVertical: vh(2),
    paddingHorizontal: vw(14),
    borderRadius: vw(8),
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },

  threeColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  colLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },

  colCenter: {
    flex: 1,
    alignItems: 'center',
  },

  colRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
