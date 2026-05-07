import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  adminFontSizes,
  colors,
  fonts,
  images,
  screensName,
  SvgStar,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import FormSearch from '../../../../../../components/templates/FormSearch';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';
import { useReportListFacultyFeedbackReportMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import SubTab from '../../../../../../components/molecules/SubTab';
import { SvgDelete, SvgEye } from '../../../../../../constants/svgs';
import { useFacultyCenter } from '../context/FacultyCenterContext';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

interface Props {
  navigation: NavigationType;
}

const FacultyClassReportFeedbackList = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [reportListFacultyFeedbackReportApi] =
    useReportListFacultyFeedbackReportMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<
    'trainee' | 'observer' | 'training' | 'faculty'
  >('trainee');
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [facultyNameList, setFacultyNameList] = useState<any>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const { center: centerSerach, setCenter: setCenterSerach } =
    useFacultyCenter();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFilter = useCallback(() => setShowFilter(true), []);
  const closeFilter = useCallback(() => setShowFilter(false), []);

  const toggleSearchShow = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearch(prev => !prev);
  }, []);

  useLayoutEffect(() => {
    // Header handled by FacultyManagement tabbed screen
  }, [navigation]);

  const getCentreFilter = useCallback(() => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  }, [centerSerach]);

  const listFacultyFeedbackReports = useCallback(
    (
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
          setData((prev: any) =>
            pageNumber !== 1 ? [...prev, ...newData] : newData,
          );

          setPage(pageNumber);
          const count = res?.data?.totalCount ?? 0;
          setTotalCount(count);
          setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < count);
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
    },
    [getCentreFilter, reportListFacultyFeedbackReportApi],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      listFacultyFeedbackReports(1, true, text);
    }, 500);
  };

  const onClearSearch = () => {
    setSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    listFacultyFeedbackReports(1, true, '');
  };

  const StarRating = ({ rating }: any) => {
    if (rating !== undefined && rating !== null) {
      return (
        <ViewAtom style={styles.ratingValueRow}>
          <SvgStar width={vw(14)} height={vw(14)} />
          <TextAtom style={styles.ratingValueText}>{rating ?? '-'}</TextAtom>
        </ViewAtom>
      );
    }
    return null;
  };

  const TraineeFeedbackCard = ({ item, navigation }: any) => (
    <TouchableAtom style={styles.card} onPress={() => {}}>
      <View style={styles.cardHeader}>
        <View>
          <TextAtom style={styles.cardTitle}>
            {item.trainingName ?? 'Training Name'}
          </TextAtom>
          <TextAtom style={styles.cardSubTitle}>
            Batch no - {item.batchNo ?? '1'}
          </TextAtom>
        </View>
        <TouchableAtom onPress={() => {}} style={styles.deleteBtn}>
          <SvgDelete />
        </TouchableAtom>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Faculty Name</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.facultyName ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Trainee name</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.traineeName ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Date Of Class</TextAtom>
          <TextAtom style={styles.infoValue}>{item.classDate ?? '-'}</TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Feedback Date</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.feedbackDate ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Subject Name</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.subjectName ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Topic name</TextAtom>
          <TextAtom style={styles.infoValue}>{item.topicName ?? '-'}</TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Session Handled</TextAtom>
          <StarRating rating={item.sessionHandled} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Subject Knowledge</TextAtom>
          <StarRating rating={item.subjectKnowledge} />
        </View>
      </View>

      <TouchableAtom onPress={() => {}} style={styles.viewMoreBtn}>
        <TextAtom style={styles.viewMoreText}>View More</TextAtom>
      </TouchableAtom>
    </TouchableAtom>
  );

  const TrainingFeedbackCard = ({ item }: any) => (
    <TouchableAtom style={styles.card} onPress={() => {}}>
      <View style={styles.cardHeader}>
        <TextAtom style={styles.cardTitle}>
          {item.facultyName ?? 'Faculty Name'}
        </TextAtom>
        <TouchableAtom onPress={() => {}} style={styles.deleteBtn}>
          <SvgDelete />
        </TouchableAtom>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Session Handled</TextAtom>
          <StarRating rating={item.sessionHandled} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Subject Knowledge</TextAtom>
          <StarRating rating={item.subjectKnowledge} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Communication</TextAtom>
          <StarRating rating={item.communication} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Methodology</TextAtom>
          <StarRating rating={item.methodology} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Interaction</TextAtom>
          <StarRating rating={item.interaction} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Question Handling</TextAtom>
          <StarRating rating={item.questionHandling} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Average Rating</TextAtom>
          <StarRating rating={item.averageRating} />
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Class Count</TextAtom>
          <TextAtom style={styles.infoValue}>{item.classCount ?? '-'}</TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Trainee Count</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.traineeCount ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.gridItem}>
          <TextAtom style={styles.infoLabel}>Feedback Count</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.feedbackCount ?? '-'}
          </TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );

  const FacultyFeedbackCard = ({ item }: any) => (
    <TouchableAtom style={styles.card} onPress={() => {}}>
      <View style={styles.cardHeader}>
        <TextAtom style={styles.cardTitle}>
          {item.facultyName ?? 'Faculty Name'}
        </TextAtom>
        <TouchableAtom onPress={() => {}} style={styles.viewBtn}>
          <SvgEye />
        </TouchableAtom>
      </View>

      <View style={styles.facultyInfoRow}>
        <View style={styles.facultyInfoItem}>
          <TextAtom style={styles.infoLabel}>Class Count</TextAtom>
          <TextAtom style={styles.infoValue}>
            {item.totalClassCount ?? '4'}
          </TextAtom>
        </View>
        <View style={styles.facultyInfoItem}>
          <TextAtom style={styles.infoLabel}>Rating</TextAtom>
          <StarRating rating={item.rating ?? '3.2'} />
        </View>
        <View style={styles.facultyInfoItem}>
          <TextAtom style={styles.infoLabel}>Average Rating</TextAtom>
          <StarRating rating={item.averageRating ?? '3'} />
        </View>
      </View>
    </TouchableAtom>
  );

  const renderFeedbackItem = ({ item, index }: any) => {
    switch (activeSecondaryTab) {
      case 'trainee':
        return (
          <TraineeFeedbackCard
            item={item}
            index={index}
            navigation={navigation}
          />
        );
      case 'training':
        return (
          <TrainingFeedbackCard
            item={item}
            index={index}
            navigation={navigation}
          />
        );
      case 'faculty':
        return (
          <FacultyFeedbackCard
            item={item}
            index={index}
            navigation={navigation}
          />
        );
      default:
        return null;
    }
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
        data={facultyNameList}
        value={selectedFaculty?.id}
        onChange={(item: any) => setSelectedFaculty(item)}
        labelField="name"
        valueField="id"
        searchable={true}
        labelStyle={{ fontFamily: fonts.Inter_Regular, color: '#384048' }}
      />
      <ViewAtom style={styles.buttonRow}>
        <View style={{ marginRight: vw(4), flex: 1 }}>
          <FormWhiteButton
            onPress={clearFilter}
            title={strings.lms.facultyManagement.details.clearFilter}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
        <View style={{ marginLeft: vw(4), flex: 1 }}>
          <FormGradientButton
            onPress={applyFilter}
            title={strings.lms.facultyManagement.details.applyFilter}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedFaculty({});
    listFacultyFeedbackReports(1, true, search, []);
    closeFilter();
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFaculty?.id) {
      filters.push(['facultyId', '=', selectedFaculty.id]);
    }

    listFacultyFeedbackReports(1, true, search, filters);
    closeFilter();
  };

  const getFaculty = useCallback(() => {
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
  }, [commonDropdownApi, getCentreFilter]);

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyFeedbackReports(1, true, '');
      }
    }, [
      firstTimeLoad,
      centerSerach,
      getFaculty,
      listFacultyFeedbackReports,
      search,
    ]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyFeedbackReports(1, true, '');
  }, [centerSerach, listFacultyFeedbackReports]);

  const headerConfig: AdminListHeaderConfig = useMemo(
    () => ({
      title:
        activeSecondaryTab === 'trainee'
          ? 'By Trainee'
          : activeSecondaryTab === 'training'
          ? 'By Training'
          : activeSecondaryTab === 'faculty'
          ? 'Faculty Wise'
          : 'Feedback',
      count: totalCount,
      search: {
        visible: true,
        onPress: toggleSearchShow,
      },
      filter: {
        visible: true,
        onPress: openFilter,
      },
    }),
    [openFilter, totalCount, activeSecondaryTab],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <SubTab
        tabs={[
          { label: 'Trainee', value: 'trainee' },
          { label: 'Observer', value: 'observer' },
          { label: 'Training', value: 'training' },
          { label: 'Faculty', value: 'faculty' },
        ]}
        activeTab={activeSecondaryTab}
        onTabChange={value => setActiveSecondaryTab(value as any)}
        style={{ marginTop: vh(10), marginBottom: vh(15) }}
      />

      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader config={headerConfig} />
      </View>
      {showSearch && (
        <FormSearch
          value={search}
          onChangeText={onChangeSearch}
          onClear={onClearSearch}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderFeedbackItem}
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

      <AdminBottomModal visible={showFilter} onClose={closeFilter}>
        <FilterForm />
      </AdminBottomModal>
    </SafeAreaView>
  );
};

export default FacultyClassReportFeedbackList;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(10),
    paddingHorizontal: vw(15),
    paddingVertical: vh(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: vh(15),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vh(15),
  },
  cardTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.black,
  },
  cardSubTitle: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginTop: vh(2),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: vh(12),
  },
  infoLabel: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  infoValue: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginTop: vh(2),
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(6),
    marginTop: vh(2),
  },
  ratingValueText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  viewMoreBtn: {
    marginTop: vh(10),
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    color: '#CD9F3E',
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  deleteBtn: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(15),
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtn: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(15),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facultyInfoItem: {
    flex: 1,
  },
  filterContainer: { paddingHorizontal: vw(15) },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(5),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
});
