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
  useReportListFeedbackTrainneDetailsMutation,
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

const ratingRows = [
  { id: 1, label: '⭐', countKey: 'oneRating', idListKey: 'oneRatingIds' },
  { id: 2, label: '⭐⭐', countKey: 'twoRating', idListKey: 'twoRatingIds' },
  {
    id: 3,
    label: '⭐⭐⭐',
    countKey: 'threeRating',
    idListKey: 'threeRatingIds',
  },
  {
    id: 4,
    label: '⭐⭐⭐⭐',
    countKey: 'fourRating',
    idListKey: 'fourRatingIds',
  },
  {
    id: 5,
    label: '⭐⭐⭐⭐⭐',
    countKey: 'fiveRating',
    idListKey: 'fiveRatingIds',
  },
];

const TopicFeedbackCountDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item;

  const [reportListFeedbackTraineeDetailsApi] =
    useReportListFeedbackTrainneDetailsMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [url, setUrl] = useState('');

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [facultyNameList, setFacultyNameList] = useState<any>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSearch, setCenterSearch] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.facultyClassReportFeedback.traineeDetail
        .title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSearch?.name && search === '') {
        setFirstTimeLoad(false);
      }
    }, [firstTimeLoad, centerSearch, search]),
  );

  const getCentreFilter = () => {
    if (!centerSearch?.name) return null;

    if (centerSearch.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSearch.name];
  };

  const listTopicRatingDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      facultyId: item.facultyId,
      topicId: item.topicId,
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    reportListFeedbackTraineeDetailsApi(params)
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

  const TraineeDetailCard = ({ item, index }: any) => {
    return (
      <ViewAtom style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom style={styles.srNoLabel}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback
                .traineeDetail.srNo
            }
            : {index + 1}
          </TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback
                .traineeDetail.traineeName
            }
          </TextAtom>
          <TextAtom style={styles.value}>{item.name ?? '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback
                .traineeDetail.trainingName
            }
          </TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback
                .traineeDetail.batchNo
            }
          </TextAtom>
          <TextAtom style={styles.value}>{item.batchNo ?? '-'}</TextAtom>
        </View>
      </ViewAtom>
    );
  };

  const renderTraineeItem = ({ item, index }: any) => {
    return <TraineeDetailCard item={item} index={index} />;
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

  const RatingRow = ({ row, index }: any) => {
    const count = item[row.countKey];
    const traineeIds = item[row.idListKey];

    return (
      <TouchableOpacity
        style={styles.row}
        disabled={count === 0}
        onPress={() => {
          listTopicRatingDetails(1, true, '', [
            ['traineeId', 'IN', traineeIds],
          ]);
        }}
      >
        <TextAtom style={styles.cell}>{index + 1}</TextAtom>
        <TextAtom style={styles.cell}>{row.label}</TextAtom>

        <TextAtom
          style={[
            styles.cell,
            { color: count > 0 ? colors.primary : colors.grey },
          ]}
        >
          {count}
        </TextAtom>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.tableHeader}>
        <TextAtom style={styles.headerText}>
          {
            strings.lms.facultyManagement.facultyClassReportFeedback
              .traineeDetail.srNo
          }
        </TextAtom>
        <TextAtom style={styles.headerText}>
          {
            strings.lms.facultyManagement.facultyClassReportFeedback
              .traineeDetail.rating
          }
        </TextAtom>
        <TextAtom style={styles.headerText}>
          {
            strings.lms.facultyManagement.facultyClassReportFeedback
              .traineeDetail.traineeCount
          }
        </TextAtom>
      </View>
      <View style={styles.ratingTableContainer}>
        {ratingRows.map((row, index) => (
          <RatingRow key={index} row={row} index={index} />
        ))}
      </View>

      {data.length >= 1 && (
        <>
          <TextAtom style={styles.feedbackHeading}>
            {
              strings.lms.facultyManagement.facultyClassReportFeedback
                .traineeDetail.feedbackHeading
            }
          </TextAtom>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderTraineeItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              !initialCall && data.length >= 1 ? (
                <TextAtom style={styles.emptyText}>
                  {
                    strings.lms.facultyManagement.facultyClassReportFeedback
                      .traineeDetail.noDataFound
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
                  listTopicRatingDetails(1, false, '');
                }}
              />
            }
            onEndReached={() => {
              setPagination(true);
              nextPageAvailable
                ? listTopicRatingDetails(page + 1, false, search)
                : setPagination(false);
            }}
            contentContainerStyle={styles.flatListContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default TopicFeedbackCountDetails;

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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vh(8),
    marginHorizontal: vw(15),
    borderBottomWidth: 1,
    borderColor: colors.grey,
  },
  headerText: {
    flex: 1,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: vh(8),
    borderBottomWidth: 1,
    borderColor: colors.chinese_silver,
  },
  cell: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    textAlign: 'center',
    color: colors.black,
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
  feedbackHeading: {
    width: vw(328),
    alignSelf: 'center',
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    marginTop: vh(20),
  },
  cardHeader: { marginBottom: vh(10), flexDirection: 'row' },
  srNoLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  flex1: { flex: 1 },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  ratingTableContainer: { marginHorizontal: vw(15), marginTop: vh(5) },
});
