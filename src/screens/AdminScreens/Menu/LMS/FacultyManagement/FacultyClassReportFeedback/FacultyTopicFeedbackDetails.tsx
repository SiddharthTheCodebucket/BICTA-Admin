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
import {
  useReportListFacultyFeedbackReportMutation,
  useReportListFacultySubFeedbackReportMutation,
  useReportListFacultyTopicFeedbackReportMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';

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

const FacultyTopicFeedbackDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const item = props.route?.params?.item;

  const [reportListFacultyTopicFeedbackApi] =
    useReportListFacultyTopicFeedbackReportMutation();
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
  const [centerSearch, setCenterSearch] = React.useState<any>({});

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.facultyClassReportFeedback.topic.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSearch?.name && search === '') {
        setFirstTimeLoad(false);
        listTopicFeedbackDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSearch, search]),
  );

  useEffect(() => {
    if (!centerSearch?.name) return;
    listTopicFeedbackDetails(1, true, '');
  }, [centerSearch]);

  const getCentreFilter = () => {
    if (!centerSearch?.name) return null;

    if (centerSearch.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSearch.name];
  };

  const listTopicFeedbackDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      facultyId: item.facultyId,
      subjectId: item.subjectId,
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

    reportListFacultyTopicFeedbackApi(params)
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
      listTopicFeedbackDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTopicFeedbackDetails(1, true, '');
  };

  const StarRating = ({ rating }: any) => {
    const rounded = Math.round(rating);

    const stars = Array(5)
      .fill(0)
      .map((_, i) => (
        <TextAtom key={i} style={styles.starText}>
          {i < rounded ? '★' : '☆'}
        </TextAtom>
      ));

    return <ViewAtom style={styles.starContainer}>{stars}</ViewAtom>;
  };

  const TopicFeedbackCard = ({ item, index, navigation }: any) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.TopicFeedbackCountDetails, {
            item: item,
          });
        }}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={styles.srNoLabel}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback.topic
                .srNo
            }{' '}
            {index + 1}
          </TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback.topic
                .subjectName
            }
          </TextAtom>
          <TextAtom style={styles.value}>{item.subject ?? '-'}</TextAtom>
        </View>
        <ViewAtom style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.topic
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
                strings.lms.facultyManagement.facultyClassReportFeedback.topic
                  .averageRating
              }
            </TextAtom>
            <StarRating rating={item.averageRating} />
          </View>
        </ViewAtom>
      </TouchableAtom>
    );
  };

  const renderTopicFeedbackItem = ({ item, index }: any) => {
    return (
      <TopicFeedbackCard item={item} index={index} navigation={navigation} />
    );
  };

  const listTopicFeedbackReports = (
    searchKeyword: string,
    filters: any[] = [],
  ) => {
    listTopicFeedbackDetails(1, true, searchKeyword, filters);
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
              .applyFilter
          }
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .clearFilter
          }
          containerStyle={styles.clearBtn}
          bttnTextStyle={styles.primaryText}
        />
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedFaculty({});
    listTopicFeedbackReports(search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFaculty?.id) {
      filters.push(['facultyId', '=', selectedFaculty.id]);
    }

    listTopicFeedbackReports(search, filters);
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
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={styles.searchBox}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTopicFeedbackItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .noDataFound
              }
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
              listTopicFeedbackDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTopicFeedbackDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default FacultyTopicFeedbackDetails;

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
  searchBox: { marginTop: vh(15) },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
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
  primaryText: { color: colors.primary },
});
