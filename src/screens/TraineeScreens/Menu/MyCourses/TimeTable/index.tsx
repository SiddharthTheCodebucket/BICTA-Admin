import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import moment from 'moment';
import { colors, fonts, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import { useAppSelector } from '../../../../../hooks';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import {
  useFeedbackListFacultyMutation,
  useListClassroomTimeTableMutation,
  useListWeekOfMonthMutation,
} from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TimeTable = (props: Props) => {
  const { navigation } = props;
  const [showFilter, setShowFilter] = useState(false);

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [weekDropdownListApi] = useListWeekOfMonthMutation();
  const [listClassroomTimeTableApi] = useListClassroomTimeTableMutation();
  const [feedbackListFacultyApi] = useFeedbackListFacultyMutation();
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [loader, setLoader] = useState(false);
  const [error, setError] = useState<any>({});
  const [monthData, setMonthData] = useState<any>([]);
  const [weekData, setWeekData] = useState<any>([]);
  const [selectedMonth, setSelectedMonth] = useState<any>({});
  const [selectedWeek, setSelectedWeek] = useState<any>({});
  const [classroomTimeTableList, setClassroomTimeTableList] = useState<any>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Time Table');
    navigation.BackButtonPress = () => navigation.goBack();
  });
  useEffect(() => {
    getMonthData();
    getClassroomData();
    if (props?.route?.params?.refresh) {
      getMonthData();
      getClassroomData();
    }
  }, [props?.route?.params?.refresh]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const getClassroomData = (filtersParam: any[] = []) => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: filtersParam,
      pageNo: 1,
    };

    listClassroomTimeTableApi(params)
      .unwrap()
      .then((res: any) => {
        setClassroomTimeTableList(res.data?.data || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const feedbackListFaculty = (item: any) => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [
        ['facultyId', '=', item.selectFacultyId],
        ['topicId', '=', item.selectTopicId],
        ['dateOfClass', '=', item.date],
        ['sessionId', '=', item.selectASessionId],
      ],
      pageNo: 1,
      itemsPerPage: 1,
    };
    feedbackListFacultyApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.navigate(screensName.FacultyFeedbackModal, {
          data: res.data?.data[0],
        });
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const getMonthData = () => {
    setLoader(true);
    const params = {
      listType: 'select_month_of_time_table',
      replacements: [Number(crediantialData.traineeDetails.currentTraining)],
    };

    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setMonthData(res.data || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Failed to fetch month list',
        });
      });
  };

  const getWeekData = (id: string) => {
    setLoader(true);
    const params = {
      monthYear: id,
    };
    weekDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        const dropdownWeek = res?.data?.map((item: any) => ({
          id: item.startOfWeek,
          name: item.name,
          ...item,
        }));
        setWeekData(dropdownWeek || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Failed to fetch week list',
        });
      });
  };

  const clearFilter = () => {
    setSelectedMonth({});
    setWeekData([]);
    setSelectedWeek({});
    getClassroomData();
  };

  const isValidate = () => {
    try {
      const accountInfoSchema = Yup.object().shape({
        selectedWeek: Yup.object({
          name: Yup.string().required('Week is required'),
        }),
        selectedMonth: Yup.object({
          name: Yup.string().required('Month is required'),
        }),
      });
      accountInfoSchema.validateSync({
        selectedMonth: selectedMonth,
        selectedWeek: selectedWeek,
      });
      return true;
    } catch (err: any) {
      setError({
        ...error,
        [err.path]: err.message,
      });
      return false;
    }
  };

  const applyFilter = () => {
    if (!isValidate()) return;
    const filters = [
      ['date', '>=', selectedWeek.startOfWeek],
      ['date', '<=', selectedWeek.endOfWeek],
    ];
    getClassroomData(filters);
  };

  const groupedData = classroomTimeTableList.reduce((acc: any, item: any) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedData).map(date => ({
    date,
    sessions: groupedData[date].sort(
      (a: any, b: any) => Number(a.timeId) - Number(b.timeId),
    ),
  }));

  const renderDateCard = ({ item }: any) => {
    const isExpanded = expandedDate === item.date;
    const dayName = moment(item.date).format('dddd');
    const formattedDate = moment(item.date).format('DD MMM YYYY');

    return (
      <ViewAtom style={styles.dateCardContainer}>
        <TouchableAtom
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setExpandedDate(isExpanded ? null : item.date);
          }}
          style={styles.dateHeader}
        >
          <TextAtom style={styles.dateTitle}>
            {`${dayName}, ${formattedDate}`}
          </TextAtom>

          <TextAtom style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</TextAtom>
        </TouchableAtom>

        {isExpanded && (
          <ViewAtom style={styles.sessionListContainer}>
            {item.sessions.map((session: any, index: number) => {
              const isFeedbackYes = session.isFeedbackSubmitted === 'Yes';
              const backgroundColor = isFeedbackYes
                ? colors.lightGreen
                : colors.lightPrimary;

              return (
                <TouchableAtom
                  key={index}
                  onPress={() => {
                    if (isFeedbackYes) {
                      feedbackListFaculty(session);
                    } else {
                      navigation.navigate(screensName.FacultyFeedbackModal, {
                        data: session,
                        isEdit: true,
                      });
                    }
                  }}
                  style={[styles.sessionCard, { backgroundColor }]}
                >
                  <TextAtom style={styles.sessionTitle}>
                    {session.selectASession} ({session.time})
                  </TextAtom>

                  <ViewAtom style={styles.sessionDetails}>
                    <TextAtom style={styles.sessionLabel}>
                      Subject:{' '}
                      <TextAtom style={styles.sessionValue}>
                        {session.selectSubject}
                      </TextAtom>
                    </TextAtom>

                    <TextAtom style={styles.sessionLabel}>
                      Topic:{' '}
                      <TextAtom style={styles.sessionValue}>
                        {session.selectTopic}
                      </TextAtom>
                    </TextAtom>

                    <TextAtom style={styles.sessionLabel}>
                      Faculty:{' '}
                      <TextAtom style={styles.sessionValue}>
                        {session.selectFaculty}
                      </TextAtom>
                    </TextAtom>
                  </ViewAtom>
                </TouchableAtom>
              );
            })}
          </ViewAtom>
        )}
      </ViewAtom>
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Month'}
        placeholder={'Select a Month'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Month',
            Data: monthData,
            selectedData: selectedMonth,
            setSelectedData: (data: any) => {
              setSelectedMonth(data);
              getWeekData(data.id);
              setSelectedWeek({});
              setError({ ...error, 'selectedMonth.name': '' });
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedMonth?.name}
        isMandatory
        errorMessage={error['selectedMonth.name']}
      />

      <DropDownOrganism
        label={'Week'}
        placeholder={'Select a Week'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Week',
            Data: weekData,
            selectedData: selectedWeek,
            setSelectedData: (data: any) => {
              setSelectedWeek(data);
              setError({ ...error, 'selectedWeek.name': '' });
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedWeek?.name}
        isMandatory
        errorMessage={error['selectedWeek.name']}
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
        </TextAtom>
      </TouchableAtom>

      {showFilter && <FilterForm />}

      <FlatList
        data={groupedArray}
        renderItem={renderDateCard}
        keyExtractor={item => item.date}
        ListEmptyComponent={
          !loader ? (
            <TextAtom style={styles.emptyText}>
              No timetable data found
            </TextAtom>
          ) : null
        }
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

export default TimeTable;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
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
  flatListContainer: { marginTop: vh(10) },
  emptyText: {
    textAlign: 'center',
    color: colors.grey,
    marginTop: vh(20),
  },
  dateCardContainer: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginVertical: vh(8),
    borderRadius: vw(8),
    paddingHorizontal: vw(12),
    paddingVertical: vh(15),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.primary,
  },
  arrowIcon: { fontSize: vw(14), color: colors.black },
  sessionListContainer: { marginTop: vh(10) },
  sessionCard: {
    borderRadius: vw(8),
    padding: vw(12),
    marginBottom: vh(8),
  },
  sessionTitle: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
    textAlign: 'center',
  },
  sessionDetails: { marginTop: vh(8) },
  sessionLabel: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(13),
  },
  sessionValue: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
    fontSize: vw(13),
  },
});
