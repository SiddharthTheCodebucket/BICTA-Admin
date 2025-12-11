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

  const [reportListFacultyFeedbackReportApi] =
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
    Header.setNavigation(navigation, 'Topic Rating Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }

    return [centerSerach.name];
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
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const BedCard = ({ item, index, navigation }: any) => {
    return (
      <ViewAtom style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Trainee Name</TextAtom>
          <TextAtom style={styles.value}>{item.name ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Training Name</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Batch No</TextAtom>
          <TextAtom style={styles.value}>{item.batchNo ?? '-'}</TextAtom>
        </View>
      </ViewAtom>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
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
    const count = item[row.countKey]; // e.g. item.oneRating
    const traineeIds = item[row.idListKey]; // e.g. item.oneRatingIds

    return (
      <TouchableOpacity
        style={styles.row}
        disabled={count === 0}
        onPress={() => {
          listFacultyDetails(1, true, '', [['traineeId', 'IN', traineeIds]]);
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
        <TextAtom style={styles.headerText}>Sr. No</TextAtom>
        <TextAtom style={styles.headerText}>Rating</TextAtom>
        <TextAtom style={styles.headerText}>Trainee Count</TextAtom>
      </View>
      <View style={{ marginHorizontal: vw(15), marginTop: vh(5) }}>
        {ratingRows.map((row, index) => (
          <RatingRow key={index} row={row} index={index} />
        ))}
      </View>

      {data.length >= 1 && (
        <>
          <TextAtom
            style={{
              width: vw(328),
              alignSelf: 'center',
              color: colors.primary,
              fontFamily: fonts.Roboto_Medium,
              fontSize: vw(14),
              marginTop: vh(20),
            }}
          >
            Feedback given by following Trainee
          </TextAtom>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data}
            renderItem={renderListBedDetails}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              !initialCall && data.length >= 1 ? (
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
