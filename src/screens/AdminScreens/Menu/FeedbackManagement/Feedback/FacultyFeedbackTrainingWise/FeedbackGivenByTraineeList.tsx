import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import moment from 'moment';

import { colors, fonts, vh, vw, strings } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useListFacultyFeedbackMutation } from '../../../../../../injectEndpoints/feedbackManagementEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useAppSelector } from '../../../../../../hooks';

interface Props {
  navigation: NavigationType;
  route: any;
}

const ITEMS_PER_PAGE = 10;
const BedItemSeparator = () => <View style={styles.itemSeparator} />;

const REQUIRED_PERMISSION = 'LIST FACULTY FEEDBACK WITH RESPONSE REMARK';

const RESTRICTED_KEYS = new Set<string>([
  'sessionHandledId',
  'subjectKnowledgeId',
  'communicationId',
  'methodology',
  'interaction',
  'questionHandling',
]);

const FeedbackGivenByTraineeList = ({ navigation, route }: Props) => {
  const appliedFilters = route.params?.appliedFilters || [];
  const item = route.params?.item;

  const [listFacultyFeedback] = useListFacultyFeedbackMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Feedback By Trainee');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchList(1, true);
    }, []),
  );

  const { crediantialData } = useAppSelector(state => state.Auth);
  const permissions = crediantialData?.globalPermissions?.permissions || [];

  const hasResponsePermission = useMemo(() => {
    return permissions.some(
      (p: any) =>
        p.permissionName?.trim().toLowerCase() ===
        REQUIRED_PERMISSION.toLowerCase(),
    );
  }, [permissions]);

  const hasValue = (value: any) =>
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && value.trim() === '');

  const getDate = (key: string) => {
    const obj = appliedFilters.find((f: any) => f.name === key);
    return obj?.value ? moment(obj.value).format('YYYY-MM-DD') : null;
  };

  const fetchList = (pageNo: number, initial = false) => {
    initial ? setInitialLoading(true) : setPaginationLoading(true);

    const params = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [
        ['userType', '=', 'TRAINEE'],
        ['facultyId', '=', item?.facultyId],
        ['dateOfClass', '>=', getDate('startDate')],
        ['dateOfClass', '<=', getDate('endDate')],
        ['trainingId', 'IN', [String(item?.id)]],
      ],
      pageNo,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    listFacultyFeedback(params)
      .unwrap()
      .then((res: any) => {
        const newData = res?.data?.data ?? [];
        setData(prev => (pageNo === 1 ? newData : [...prev, ...newData]));

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNo * ITEMS_PER_PAGE < totalCount);
        setPage(pageNo);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => {
        setInitialLoading(false);
        setPaginationLoading(false);
        setRefreshing(false);
      });
  };

  const renderItem = ({ item, index }: any) => {
    const showSession =
      hasResponsePermission || hasValue(item.sessionHandledId);

    const showKnowledge =
      hasResponsePermission || hasValue(item.subjectKnowledgeId);

    const showCommunication =
      hasResponsePermission || hasValue(item.communicationId);

    const showMethodology = hasResponsePermission || hasValue(item.methodology);

    const showInteraction = hasResponsePermission || hasValue(item.interaction);

    const showQuestionHandling =
      hasResponsePermission || hasValue(item.questionHandling);

    return (
      <ViewAtom style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, styles.flex1]}>
            {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Trainee Name (ID)'}</TextAtom>
          <TextAtom style={styles.value}>
            {item.traineeName} ({item.traineeId})
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Training Name'}</TextAtom>
          <TextAtom style={[styles.value]}>{item.trainingName ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Subject Name'}</TextAtom>
          <TextAtom style={[styles.value]}>{item.subjectName ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Topic Name'}</TextAtom>
          <TextAtom style={[styles.value]}>{item.topicName ?? '-'}</TextAtom>
        </View>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.labelCount}>{'Batch No'}</TextAtom>

            <TextAtom style={[styles.value]}>{item.batchNo ?? '-'}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <TextAtom style={styles.labelCount}>{'Date Of Class'}</TextAtom>
            <ViewAtom>
              <TextAtom style={[styles.value, { textAlign: 'center' }]}>
                {moment(item.dateOfClass).format('DD-MM-YYYY') ?? '-'}
              </TextAtom>
            </ViewAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRightCount}>
              {'Feedback Date'}
            </TextAtom>

            <TextAtom style={[styles.valueRight]}>
              {moment(item.createdDate).format('DD-MM-YYYY') ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.rowBetween}>
          {showSession && (
            <View style={{ flex: 1 }}>
              <TextAtom style={styles.labelCount}>{'Session'}</TextAtom>
              <TextAtom style={styles.value}>{item.sessionHandledId}</TextAtom>
            </View>
          )}

          {showKnowledge && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TextAtom style={styles.labelCount}>{'Knowledge'}</TextAtom>
              <TextAtom style={[styles.value, { textAlign: 'center' }]}>
                {item.subjectKnowledgeId}
              </TextAtom>
            </View>
          )}

          {showCommunication && (
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TextAtom style={styles.labelRightCount}>
                {'Communication'}
              </TextAtom>
              <TextAtom style={styles.valueRight}>
                {item.communicationId}
              </TextAtom>
            </View>
          )}
        </View>

        <View style={styles.rowBetween}>
          {showMethodology && (
            <View style={{ flex: 1 }}>
              <TextAtom style={styles.labelCount}>{'Methodology'}</TextAtom>
              <TextAtom style={styles.value}>{item.methodology}</TextAtom>
            </View>
          )}

          {showInteraction && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TextAtom style={styles.labelCount}>{'Interaction'}</TextAtom>
              <TextAtom style={[styles.value, { textAlign: 'center' }]}>
                {item.interaction}
              </TextAtom>
            </View>
          )}

          {showQuestionHandling && (
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TextAtom style={styles.labelRightCount}>
                {'Q. Handling'}
              </TextAtom>
              <TextAtom style={styles.valueRight}>
                {item.questionHandling}
              </TextAtom>
            </View>
          )}
        </View>
      </ViewAtom>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FullscreenLoading isVisible={initialLoading} />

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: vh(30), paddingTop: vh(10) }}
        ItemSeparatorComponent={BedItemSeparator}
        ListEmptyComponent={
          initialLoading ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          paginationLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchList(1);
            }}
            colors={[colors.primary]}
          />
        }
        onEndReached={() => {
          if (nextPageAvailable && !paginationLoading) {
            fetchList(page + 1);
          }
        }}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
};

const MiniBlock = ({ label, value }: any) => (
  <View style={styles.miniBlock}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value ?? '-'}</TextAtom>
  </View>
);

const MiniBlockFull = ({ label, value }: any) => (
  <View style={{ marginBottom: vh(6) }}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value ?? '-'}</TextAtom>
  </View>
);

const Score = ({ label, value }: any) => (
  <View style={styles.scoreBox}>
    <TextAtom style={styles.scoreLabel}>{label}</TextAtom>
    <TextAtom style={styles.scoreValue}>{value ?? '-'}</TextAtom>
  </View>
);

export default FeedbackGivenByTraineeList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

  headerRow: {
    padding: vh(10),
    backgroundColor: colors.lightGray2,
  },
  headerText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
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
  flex1: { flex: 1 },
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  srNo: {
    flex: 0.5,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.black,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
  },
  topLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
  },

  topValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    marginBottom: vh(4),
  },

  miniBlock: {
    marginBottom: vh(6),
  },

  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(6),
  },

  scoreBox: {
    width: '30%',
    backgroundColor: colors.lightGray2,
    borderRadius: vw(6),
    paddingVertical: vh(6),
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: vw(11),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },

  scoreValue: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
  },
  itemSeparator: { height: vh(10) },
  labelCount: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
  },
  labelRightCount: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
    textAlign: 'right',
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
    textAlign: 'right',
  },
});
