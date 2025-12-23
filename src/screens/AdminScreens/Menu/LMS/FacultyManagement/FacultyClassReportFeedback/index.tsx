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
import { useReportListFacultyFeedbackReportMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';

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

const FacultyClassReportFeedback = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [reportListFacultyFeedbackReportApi] =
    useReportListFacultyFeedbackReportMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [url, setUrl] = useState('');

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [facultyNameList, setFacultyNameList] = useState<any>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.facultyClassReportFeedback.main.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyFeedbackReports(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyFeedbackReports(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listFacultyFeedbackReports = (
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
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    reportListFacultyFeedbackReportApi(params)
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
        setUrl(res.data.exportUrl);

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

  const handleSearch = useCallback(
    debounce((text: string) => {
      listFacultyFeedbackReports(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listFacultyFeedbackReports(1, true, '');
  };

  const StarRating = ({ rating }: any) => {
    const rounded = Math.round(rating);

    const stars = new Array(5).fill(0).map((_, i) => (
      <TextAtom key={i.toString() + 'ewrio'} style={styles.starText}>
        {i < rounded ? '★' : '☆'}
      </TextAtom>
    ));

    return <ViewAtom style={styles.starContainer}>{stars}</ViewAtom>;
  };

  const FacultyFeedbackCard = ({ item, index, navigation }: any) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.FacultySubjectFeedbackDetails, {
            item: item,
          });
        }}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={styles.srNoLabel}>
            {strings.lms.facultyManagement.facultyClassReportFeedback.main.srNo}{' '}
            {index + 1}
          </TextAtom>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback.main
                .facultyName
            }
          </TextAtom>
          <TextAtom style={styles.value}>{item.facultyName ?? '-'}</TextAtom>
        </View>

        <ViewAtom style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .classCount
              }
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.totalClassCount ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.ratingBox}>
            <TextAtom style={styles.label}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .rating
              }
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.averageRating ?? '-'}
            </TextAtom>
          </View>
        </ViewAtom>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback.main
                .averageRating
            }
          </TextAtom>
          <StarRating rating={item.averageRating} />
        </View>
      </TouchableAtom>
    );
  };

  const renderFacultyFeedbackItem = ({ item, index }: any) => {
    return (
      <FacultyFeedbackCard item={item} index={index} navigation={navigation} />
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={
          strings.lms.facultyManagement.facultyClassReportFeedback.main.faculty
        }
        placeholder={
          strings.lms.facultyManagement.facultyClassReportFeedback.main.faculty
        }
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.facultyManagement.facultyClassReportFeedback.main
              .faculty,
            Data: facultyNameList,
            selectedData: selectedFaculty,
            setSelectedData: (data: any) => {
              setSelectedFaculty(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedFaculty?.name}
      />

      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .applyFilter || 'Apply Filter'
          }
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .clearFilter || 'Clear Filter'
          }
          containerStyle={styles.clearBtn}
          bttnTextStyle={styles.primaryText}
        />
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedFaculty({});
    listFacultyFeedbackReports(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFaculty?.id) {
      filters.push(['facultyId', '=', selectedFaculty.id]);
    }

    listFacultyFeedbackReports(1, true, search, filters);
  };

  const getFaculty = () => {
    setInitialCall(true);

    const params = {
      listType: 'filter_by_faculty_in_feedback',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const modifiedList = res.data.map((item: any) => ({
          ...item,
          id: item.id,
          name: `${item.id}, ${item.name}, ${item.designation || ''}`.trim(),
        }));

        setFacultyNameList(modifiedList);
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={styles.topActionRow}>
        <TouchableAtom style={styles.filterTrigger} onPress={toggleFilter}>
          <TextAtom style={styles.filterTriggerText}>
            {showFilter
              ? strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .hideFilter || 'Hide Filter ▲'
              : strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .showFilter || 'Show Filter ▼'}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.downloadButton}
          onPress={() => {
            if (!isNullUndefined(url)) {
              downloadAndOpenFile(url);
            }
          }}
        >
          <ImageAtom source={images.download} style={styles.downloadIcon} />
        </TouchableAtom>
      </View>
      {showFilter && <FilterForm />}
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .centers
          }
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.facultyClassReportFeedback
                .main.center,
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
          containerStyle={styles.centerDropdown}
        />
      )}
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={styles.searchBox}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderFacultyFeedbackItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .noDataFound
              }
            </TextAtom>
          )
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
              listFacultyFeedbackReports(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyFeedbackReports(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default FacultyClassReportFeedback;

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
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
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
  filterTrigger: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  filterTriggerText: {
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
  starText: {
    fontSize: vw(16),
    color: colors.primary,
    marginRight: vw(2),
  },
  starContainer: { flexDirection: 'row' },
  cardHeader: { marginBottom: vh(10), flexDirection: 'row' },
  srNoLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  flex1: { flex: 1 },
  ratingBox: { flex: 1, alignItems: 'flex-end' },
  downloadButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  downloadIcon: { tintColor: colors.black },
  topActionRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  centerDropdown: { marginBottom: vh(-10) },
  searchBox: { marginTop: vh(15) },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  primaryText: { color: colors.primary },
});
