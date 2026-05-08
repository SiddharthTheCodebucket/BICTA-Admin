import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { SvgEye } from '../../../../../../constants/svgs';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useListExaminationSubmissionTestListMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const InfoBlock = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom style={styles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const ExamResponse = (props: Props) => {
  const { navigation, route } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [listExaminationsApi] = useListExaminationSubmissionTestListMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [search] = useState('');
  const [centerSerach, setCenterSerach] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.examination.examResponse.title,
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
  }, [navigation, route?.params?.suppressHeader]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listExaminations(1, true, '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listExaminations(1, true, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listExaminations = (
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

    listExaminationsApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1 && data.length > 0) {
          setData(prev => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);
        setNextPageAvailable(
          pageNumber * ITEMS_PER_PAGE < (res?.data?.totalCount ?? 0),
        );
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

  const onPressSearch = () => {
    listExaminations(1, true, search);
  };

  const formatDate = (value: any) => {
    if (!value) return '31/03/2026';
    const parsed = moment(value, 'YYYY-MM-DD');
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '31/03/2026';
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TextAtom style={styles.headerTitle}>
        Exam Result{' '}
        <TextAtom style={styles.headerCount}>({data?.length ?? 0})</TextAtom>
      </TextAtom>
      <View style={styles.headerActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressSearch}
          style={styles.headerIconButton}
        >
          <Icon name="magnify" size={24} color={colors.text_black} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
          <Icon name="filter-variant" size={22} color={colors.text_black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExaminationItem = ({ item }: { item: any }) => (
    <TouchableAtom
      style={styles.card}
      onPress={() =>
        navigation.navigate(screensName.TraineeResponseList, {
          data: item,
        })
      }
    >
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={1} style={styles.cardTitle}>
          {item.trainingName ?? 'Training Name here'}
        </TextAtom>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate(screensName.TraineeResponseList, {
              data: item,
            })
          }
        >
          <SvgEye width={16} height={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <InfoBlock
          label="Examination Name"
          value={item.testName ?? 'Pre Evaluation Test'}
        />
        <InfoBlock
          label="Examination Date"
          value={formatDate(item.testStartDate)}
        />
      </View>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      {renderHeader()}

      {/* {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.lms.locationDetails.centers}
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
              setSelectedData: (selectedData: any) => {
                setCenterSerach(selectedData);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={centerSerach?.name}
          containerStyle={styles.centerDropdown}
        />
      )} */}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderExaminationItem}
        keyExtractor={(item, index) => `${item?.id ?? 'exam'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.examResponse.noDataFound}
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
              listExaminations(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listExaminations(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default ExamResponse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  headerRow: {
    height: vh(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  headerCount: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  headerIconButton: {
    width: vw(32),
    height: vw(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListContainer: {
    paddingBottom: vh(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(22),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    paddingRight: vw(10),
  },
  iconButton: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E6E9EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(6),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  centerDropdown: {
    marginBottom: vh(8),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
  paginationLoader: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: vh(10),
  },
});
