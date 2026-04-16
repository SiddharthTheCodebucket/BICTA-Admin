import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import SubTab from '../../../../../../components/molecules/SubTab';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useExtendTrainingEndDateMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { globalStyles } from '../../../../../../utils/globalStyles';

interface Props {
  navigation: NavigationType;
  route?: any;
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

const TimeTableList = (props: Props) => {
  const { navigation, route } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listTimeTablesApi] = useCommonDropdownListMutation();

  const [extendTimeTableEndDateApi] = useExtendTrainingEndDateMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [dateExtendedModal, setDateExtendedModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [selectedItems] = useState<any>([]);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<string>(
    strings.lms.classRoomManagement.currentTraining,
  );

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.classRoomManagement.timeTableData,
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
        listTimeTables(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTimeTables(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    listTimeTables(1, true, search);
  }, [activeTab]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }
    return [centerSerach.name];
  };

  const listTimeTables = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      listType: 'class_room_management_training_name_list',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listTimeTablesApi(params)
      .unwrap()
      .then((res: any) => {
        let newData = res.data ?? [];

        // 🔥 FILTER HERE
        newData = newData.filter((item: any) =>
          activeTab === strings.lms.classRoomManagement.currentTraining
            ? item.isCourseActive === 'Yes'
            : item.isCourseActive === 'No',
        );

        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);

        setNextPageAvailable(false); // UI-side pagination handled now
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

  const headerConfig: AdminListHeaderConfig = useMemo(
    () => ({
      title: strings.lms.classRoomManagement.timeTableData,
      count: data.length,
      search: {
        visible: true,
        onPress: () => setIsSearchVisible(prev => !prev),
      },
      filter: {
        visible: false,
      },
      create: {
        visible: true,
        onPress: () => {},
      },
    }),
    [data.length],
  );

  const handleSearch = useCallback(
    debounce((text: string) => {
      listTimeTables(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTimeTables(1, true, '');
  };

  const TimeTableCard = ({ item, index, isSelected }: any) => {
    return (
      <TouchableAtom
        onPress={() => {}}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={0} style={[styles.label, { flex: 1 }]}>
            {item.name || '-'}
          </TextAtom>
        </View>

        <View style={globalStyles.infoRow}>
          <View style={{ flex: 0.4 }}>
            <TextAtom style={globalStyles.infoLabel}>
              {strings.lms.classRoomManagement.noOfClasses}
            </TextAtom>
            <TextAtom style={globalStyles.infoValue}>
              {item.noOfBatch ?? '-'}
            </TextAtom>
          </View>

          <View style={{ flex: 0.6 }}>
            <TextAtom style={globalStyles.infoLabel}>
              {strings.lms.classRoomManagement.startDate}
            </TextAtom>
            <TextAtom style={globalStyles.infoValue}>
              {moment(item.courseStartDate).format('DD-MM-YYYY')} -{' '}
              {moment(item.courseEndDate).format('DD-MM-YYYY')}
            </TextAtom>
          </View>
        </View>

        {activeTab === strings.lms.classRoomManagement.currentTraining && (
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TouchableOpacity style={styles.cardButtons} onPressIn={() => {}}>
                <TextAtom style={styles.cardButtonText}>{'View'}</TextAtom>
              </TouchableOpacity>
            </View>
            <View style={globalStyles.infoCol}>
              <TouchableOpacity style={styles.cardButtons} onPressIn={() => {}}>
                <TextAtom style={styles.cardButtonText}>{'Approve'}</TextAtom>
              </TouchableOpacity>
            </View>
            <View style={globalStyles.infoCol}>
              <TouchableOpacity
                style={[
                  styles.cardButtons,
                  {
                    backgroundColor: '#EFFFF1',
                  },
                ]}
                onPressIn={() => {}}
              >
                <TextAtom
                  style={[
                    styles.cardButtonText,
                    {
                      color: '#078A17',
                    },
                  ]}
                >
                  {'Create'}
                </TextAtom>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === strings.lms.classRoomManagement.previousTraining && (
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>
                {strings.lms.classRoomManagement.timeTable}
              </TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {strings.lms.classRoomManagement.trainingEnd}
              </TextAtom>
            </View>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>{'Action'}</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {strings.lms.classRoomManagement.trainingEnd}
              </TextAtom>
            </View>
          </View>
        )}
      </TouchableAtom>
    );
  };

  const renderTimeTableItem = ({ item, index }: any) => {
    return (
      <TimeTableCard
        item={item}
        index={index}
        navigation={navigation}
        isSelected={selectedItems.some((x: any) => x.id === item.id)}
      />
    );
  };

  const DateExtendModal = () => {
    return (
      <Modal
        visible={dateExtendedModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDateExtendedModal(false);
          setSelectedDate('');
          setSelectedItem({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableAtom
              style={styles.modalCloseBtn}
              onPress={() => {
                setDateExtendedModal(false);
                setSelectedDate('');
                setSelectedItem({});
              }}
            >
              <TextAtom style={styles.modalCloseText}>×</TextAtom>
            </TouchableAtom>

            <TextAtom style={styles.modalTitle}>
              {strings.lms.classRoomManagement.extendedDate}
            </TextAtom>

            {selectedItem && (
              <View style={styles.modalFieldBox}>
                <TextAtom numberOfLines={0} style={styles.modalEntityName}>
                  {strings.lms.classRoomManagement.extendDateOf}: "
                  {selectedItem.trainingFullName}"
                </TextAtom>

                <TextAtom style={styles.modalDurationText}>
                  {strings.lms.classRoomManagement.duration}:{' '}
                  {moment(selectedItem?.courseStartDate).format('DD-MMM-YYYY')}
                  {' to '}
                  {moment(selectedItem?.courseEndDate).format('DD-MMM-YYYY')}
                </TextAtom>
              </View>
            )}

            <DateInputOrganism
              label={strings.lms.classRoomManagement.startDate}
              placeholder={strings.lms.classRoomManagement.startDate}
              value={selectedDate}
              onChangeText={(val: any) => {
                setSelectedDate(val);
              }}
              fieldName="date"
              dateFormat="DD-MM-YYYY"
              isMandatory
              containerStyle={{ width: vw(300) }}
              labelStyle={{ width: vw(300) }}
            />

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableAtom
                style={styles.modalExtendBtn}
                onPress={() => {
                  if (isNullUndefined(selectedDate)) {
                    Toast.show({
                      type: 'error',
                      text2: strings.lms.classRoomManagement.dateIsRequired,
                    });
                    return;
                  }
                  extendTrainingEndDate(selectedItem.id, selectedDate);
                }}
              >
                <TextAtom style={styles.modalExtendText}>
                  {strings.lms.classRoomManagement.extend}
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const extendTrainingEndDate = (id: any, date: string) => {
    setInitialCall(true);
    const params = {
      trainingId: id,
      newEndDate: moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    };
    extendTimeTableEndDateApi(params)
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader config={headerConfig} />
      </View>

      {isSearchVisible && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={{ marginTop: vh(15) }}
        />
      )}
      <SubTab
        tabs={[
          {
            label: strings.lms.classRoomManagement.currentTraining,
            value: strings.lms.classRoomManagement.currentTraining,
          },
          {
            label: strings.lms.classRoomManagement.previousTraining,
            value: strings.lms.classRoomManagement.previousTraining,
          },
        ]}
        activeTab={activeTab}
        onTabChange={value => setActiveTab(value)}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTimeTableItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.locationDetails.noDataFound}
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
              listTimeTables(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTimeTables(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <DateExtendModal />
    </SafeAreaView>
  );
};

export default TimeTableList;

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
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.selectedCardBg,
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
    backgroundColor: colors.transparent,
    zIndex: 998,
  },
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(6),
  },

  fileInput: {
    flex: 1,
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(6),
    paddingHorizontal: vw(10),
    paddingVertical: vh(6),
    fontSize: vw(14),
    color: colors.black,
  },

  checkBtn: {
    marginLeft: vw(10),
    padding: vw(6),
    borderRadius: vw(6),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  fileDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh(8),
    paddingHorizontal: vw(10),
    borderWidth: vw(1),
    borderColor: colors.grey_3,
    borderRadius: vw(6),
    backgroundColor: colors.lightGrey,
    marginTop: vh(6),
  },

  fileText: {
    fontSize: vw(14),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  flex1: { flex: 1 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.transparentBlack,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  modalCloseBtn: { position: 'absolute', top: 10, right: 10, padding: 5 },
  modalCloseText: { fontSize: vw(22), color: colors.red_2 },
  modalTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    marginBottom: vh(15),
    color: colors.primary,
    textAlign: 'center',
  },
  modalFieldBox: { marginBottom: vh(12) },
  modalEntityName: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  modalDurationText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    marginTop: vh(4),
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
  },
  modalExtendBtn: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: colors.green,
    borderRadius: vw(6),
  },
  modalExtendText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },
  headerBox: { height: 'auto' },
  paginationLoader: { marginTop: vh(10) },
  itemSeparator: { height: vh(10) },

  cardButtons: {
    backgroundColor: '#E5FBFF',
    borderRadius: vw(4),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
    justifyContent: 'center',
    alignItems: 'center',
    height: vh(36),
  },
  cardButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: 14,
    color: '#1C4371',
  },
});
