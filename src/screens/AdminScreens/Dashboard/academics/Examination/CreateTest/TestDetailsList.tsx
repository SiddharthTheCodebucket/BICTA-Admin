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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  useListAssessmentCreateTestMutation,
  useUpdateAssessmentCreateTestMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TestDetailsList = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item;

  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [listAssessmentAssignmentApi] = useListAssessmentCreateTestMutation();
  const [updateAssessmentCreateTestApi] =
    useUpdateAssessmentCreateTestMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search] = React.useState('');
  const [centerSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.testDetailsList.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTestDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTestDetails(1, true, '');
  }, [centerSerach]);

  const listTestDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const params: any = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: item?.id ? ['trainingNameId', '=', item.id] : [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
    };
    listAssessmentAssignmentApi(params)
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
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const TestDetailCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.examination.testDetailsList.statusChangeConf,
        message: strings.lms.examination.testDetailsList.statusChangeMsg,
        okText: strings.lms.examination.testDetailsList.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateTestStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateTestStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        idForChangeStatus: id,
      };
      updateAssessmentCreateTestApi(params)
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
            text2: err.data?.message || strings.something_went_wrong_,
          });
        });
    };

    const getTimeDifference = (start: any, end: any) => {
      if (!start || !end) return '-';

      const startMoment = moment(start, 'HH:mm:ss');
      const endMoment = moment(end, 'HH:mm:ss');

      if (!startMoment.isValid() || !endMoment.isValid()) return '-';

      const diff = moment.duration(endMoment.diff(startMoment));
      const hours = diff.hours();
      const minutes = diff.minutes();

      return `${hours} hr ${minutes} min`;
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom style={styles.flex1Label}>
            {strings.lms.examination.testDetailsList.srNo} {index + 1}
          </TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.examination.testDetailsList.testName}
          </TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.testName ?? '-'}
          </TextAtom>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.lms.examination.testDetailsList.noOfQuestions}
            </TextAtom>
            <TextAtom style={styles.value}>
              {item.noOfQuestions ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.flexAlignEnd}>
            <TextAtom style={styles.labelRight}>
              {strings.lms.examination.testDetailsList.testType}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.typeOfTest ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.lms.examination.testDetailsList.testStartDate}
            </TextAtom>

            <TextAtom style={styles.value}>
              {moment(item.quizStartDate, 'YYYY-MM-DD').format('DD-MM-YYYY') ??
                '-'}
            </TextAtom>
          </View>
          <View style={styles.flexAlignEnd}>
            <TextAtom style={styles.labelRight}>
              {strings.lms.examination.testDetailsList.testEndDate}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {moment(item.quizEndDate, 'YYYY-MM-DD').format('DD-MM-YYYY') ??
                '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.lms.examination.testDetailsList.timeLimit}
            </TextAtom>
            <TextAtom style={styles.value}>
              {getTimeDifference(item.testStartTime, item.testEndTime)}
            </TextAtom>
          </View>
          <View style={styles.flexAlignEnd}>
            <TextAtom style={styles.labelRight}>
              {strings.lms.examination.testDetailsList.negativeMarking}
            </TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.negativeMarking ?? '-'}
            </TextAtom>
          </View>
        </View>

        {showStatusMenu && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(false)}
            style={styles.overlay}
          />
        )}

        <View style={styles.statusContainer}>
          <TextAtom style={styles.label}>
            {strings.lms.examination.testDetailsList.status}
          </TextAtom>

          <TouchableAtom
            onPress={() => setShowStatusMenu(!showStatusMenu)}
            style={[
              styles.statusBox,
              statusValue === 'Active' ? styles.activeBox : styles.inActiveBox,
            ]}
          >
            <TextAtom
              style={[
                styles.statusText,
                statusValue === 'Active'
                  ? styles.activeText
                  : styles.inActiveText,
              ]}
            >
              {statusValue}
            </TextAtom>
            <ImageAtom source={images.downArrow} />
          </TouchableAtom>

          {showStatusMenu && (
            <View style={styles.dropMenu}>
              <TouchableAtom
                style={styles.dropItem}
                onPress={() => onSelectStatus('Active')}
              >
                <TextAtom style={styles.dropText}>Active</TextAtom>
              </TouchableAtom>

              <TouchableAtom
                style={styles.dropItem}
                onPress={() => onSelectStatus('InActive')}
              >
                <TextAtom style={styles.dropText}>InActive</TextAtom>
              </TouchableAtom>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTestDetailItem = ({ item, index }: any) => {
    return <TestDetailCard item={item} index={index} navigation={navigation} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTestDetailItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.testDetailsList.noDataFound}
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
              listTestDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTestDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default TestDetailsList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
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
    backgroundColor: colors.lightRedBg,
    borderColor: colors.darkRed,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  flex1Label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  flex1: { flex: 1 },
  flexAlignEnd: { flex: 1, alignItems: 'flex-end' },
  statusContainer: { marginTop: vh(0), zIndex: 999 },
  dropText: { color: colors.black },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
});
