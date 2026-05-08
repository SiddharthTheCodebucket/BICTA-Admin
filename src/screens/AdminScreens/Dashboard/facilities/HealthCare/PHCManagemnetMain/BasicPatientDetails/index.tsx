import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
  vh,
  vw,
} from '../../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import {
  ActionPopover,
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../../components/templates';
import { useListPatientSymptomsDetailsMutation } from '../../../../../../../injectEndpoints/phcEndpoints';

type Props = {
  navigation: NavigationType;
};

type PatientTab = 'Trainee' | 'Employee' | 'Other';

const InfoBlock = ({ label, value, danger }: any) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={[styles.infoValue, danger && styles.dangerText]}>
      {value ?? '-'}
    </TextAtom>
  </View>
);

const SelectBox = ({ label, wide, disabled }: any) => (
  <View style={[wide ? styles.fullFilterField : styles.halfFilterField]}>
    <TextAtom style={styles.filterLabel}>{label}</TextAtom>
    <View style={[styles.selectBox, disabled && styles.selectBoxDisabled]}>
      <TextAtom style={[styles.selectText, disabled && styles.selectTextDisabled]}>
        Select
      </TextAtom>
      <Icon
        name={label.includes('Date') ? 'calendar-month-outline' : 'chevron-down'}
        size={22}
        color={disabled ? '#C4CAD5' : colors.text_black}
      />
    </View>
  </View>
);

const BasicPatientDetails = ({ navigation }: Props) => {
  const [listPatientSymptomsDetailsApi] =
    useListPatientSymptomsDetailsMutation();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [activeType, setActiveType] = useState<PatientTab>('Trainee');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search] = useState('');

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Health Centre',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && search === '') {
        setFirstTimeLoad(false);
        listPatientDetails(1, true, '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad, search]),
  );

  useEffect(() => {
    listPatientDetails(1, true, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const listPatientDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [['patientType', '=', activeType], ...filtersArray],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    listPatientSymptomsDetailsApi(params)
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
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const patientIdText = (item: any) =>
    item.uniqueId
      ? `Unique ID: ${item.uniqueId}`
      : `ID: ${item.id ?? 'BIP/GAYA/41727/2026'}`;

  const displayDate = (item: any) =>
    item.currentDatetime
      ? moment(item.currentDatetime).format('DD-MM-YYYY')
      : '13-04-2026';

  const toggleExpand = (item: any) => {
    const id = String(item.id ?? item.uniqueId);
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (item: any, index: number) => {
    const id = String(item.id ?? item.uniqueId);
    return expandedIds[id] ?? index === 1;
  };

  const openVisitDetails = (item: any) => {
    navigation.navigate(screensName.PatientDetailDetails, {
      data: item,
      patientType: activeType,
    });
  };

  const renderHeader = () => (
    <>
      <View style={styles.headerRow}>
        <TextAtom style={styles.headerTitle}>
          Basic Patient Details{' '}
          <TextAtom style={styles.headerCount}>(99877)</TextAtom>
        </TextAtom>
        <View style={styles.headerActions}>
          <TouchableOpacity activeOpacity={0.8} style={styles.iconOnly}>
            <Icon name="magnify" size={24} color={colors.text_black} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconOnly}
            onPress={() => setFilterVisible(true)}
          >
            <Icon name="filter-variant" size={22} color={colors.text_black} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createButton}
            onPress={() =>
              navigation.navigate(screensName.AddBasicPatientDetails, {
                patientType: activeType,
              })
            }
          >
            <TextAtom style={styles.createText}>+ Create</TextAtom>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentRow}>
        {(['Trainee', 'Employee', 'Other'] as PatientTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.85}
            onPress={() => setActiveType(tab)}
            style={[
              styles.segmentButton,
              activeType === tab && styles.segmentButtonActive,
            ]}
          >
            <TextAtom
              style={[
                styles.segmentText,
                activeType === tab && styles.segmentTextActive,
              ]}
            >
              {tab}
            </TextAtom>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderCollapsedFields = (item: any) => {
    if (activeType === 'Trainee') {
      return (
        <>
          <InfoBlock label="Training Programme" value={item.trainingName ?? 'Six Days Residential training Programme for Gram Kachahari Sachiv, Panchayati Raj Depart., Govt. of Bihar (486)'} />
          <View style={styles.infoGrid}>
            <InfoBlock label="Patient Type" value="Trainee" />
            <InfoBlock label="Visit Count" value="04" />
            <InfoBlock label="Batch" value={item.batchNo ?? '01'} />
            <InfoBlock label="DOB" value="10-06-1990" />
            <InfoBlock label="Age (Years)" value="35" />
            <InfoBlock label="Gender" value={item.gender ?? 'Female'} />
          </View>
        </>
      );
    }

    if (activeType === 'Employee') {
      return (
        <View style={styles.infoGrid}>
          <InfoBlock label="Patient Type" value="Employee" />
          <InfoBlock label="Vendor" value={item.vendorName ?? 'Vaishnavi Consultancy Services'} />
          <InfoBlock label="Designation" value={item.designation ?? 'Admin'} />
          <InfoBlock label="Visit Count" value="04" />
          <InfoBlock label="DOB" value="10-06-1990" />
          <InfoBlock label="Age (Years)" value="35" />
          <InfoBlock label="Gender" value={item.gender ?? 'Female'} />
          <InfoBlock label="Blood Group" value={item.bloodGroup ?? 'B+'} />
          <InfoBlock label="Temp (°C)" value="40 °C" danger />
          <InfoBlock label="BP (mmHg)" value={item.bloodPressure ?? '110/70'} />
        </View>
      );
    }

    return (
      <View style={styles.infoGrid}>
        <InfoBlock label="Patient Type" value="Other" />
        <InfoBlock label="Visit Count" value="04" />
        <InfoBlock label="DOB" value="10-06-1990" />
        <InfoBlock label="Age (Years)" value="35" />
        <InfoBlock label="Gender" value={item.gender ?? 'Female'} />
        <InfoBlock label="Blood Group" value={item.bloodGroup ?? 'B+'} />
        <InfoBlock label="Temp (°C)" value="40 °C" danger />
        <InfoBlock label="BP (mmHg)" value={item.bloodPressure ?? '110/70'} />
      </View>
    );
  };

  const renderExpandedFields = (item: any) => (
    <View style={styles.infoGrid}>
      {activeType === 'Trainee' && (
        <>
          <InfoBlock label="Training Programme" value={item.trainingName ?? 'Six Days Residential training Programme for Gram Kachahari Sachiv, Panchayati Raj Depart., Govt. of Bihar (486)'} />
          <InfoBlock label="Batch" value={item.batchNo ?? '01'} />
        </>
      )}
      {activeType === 'Employee' && (
        <>
          <InfoBlock label="Patient Type" value="Employee" />
          <InfoBlock label="Vendor" value={item.vendorName ?? 'Vaishnavi Consultancy Services'} />
          <InfoBlock label="Designation" value={item.designation ?? 'Admin'} />
          <InfoBlock label="Visit Count" value="04" />
        </>
      )}
      {activeType === 'Other' && (
        <>
          <InfoBlock label="Patient Type" value="Other" />
          <InfoBlock label="Visit Count" value="04" />
        </>
      )}
      <InfoBlock label="DOB" value="10-06-1990" />
      <InfoBlock label="Age (Years)" value="35" />
      <InfoBlock label="Gender" value={item.gender ?? 'Female'} />
      <InfoBlock label="Blood Group" value={item.bloodGroup ?? 'B+'} />
      <InfoBlock label="Temp (°C)" value="40 °C" danger />
      <InfoBlock label="BP (mmHg)" value={item.bloodPressure ?? '110/70'} danger={activeType === 'Trainee'} />
      <InfoBlock label="Weight (Kg)" value={item.weight ?? '51'} />
      <InfoBlock label="Doctor" value={item.assignDoctorName ?? 'Dr. Saurav Kumar'} />
      <InfoBlock label="Treatment Type" value={item.treatmentTypes ?? 'OPD'} />
      <InfoBlock label="Visit Date" value={displayDate(item)} />
      <InfoBlock label="Symptoms" value={item.primaryObservations ?? 'Acidity, vomiting'} />
      <View style={styles.photoBlock}>
        <TextAtom style={styles.infoLabel}>Live Photo</TextAtom>
        <View style={styles.photoRow}>
          <View style={styles.photoThumb} />
          <TouchableOpacity activeOpacity={0.85} style={styles.viewButton}>
            <TextAtom style={styles.viewText}>View</TextAtom>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.photoBlock}>
        <TextAtom style={styles.infoLabel}>Profile Photo</TextAtom>
        <View style={styles.photoRow}>
          <View style={styles.photoThumb} />
          <TouchableOpacity activeOpacity={0.85} style={styles.viewButton}>
            <TextAtom style={styles.viewText}>View</TextAtom>
          </TouchableOpacity>
        </View>
      </View>
      <InfoBlock label="Created By" value={item.createdBy ?? 'Vishal Pathak'} />
      <InfoBlock label="Updated By" value={item.updatedBy ?? 'Vishal Pathak'} />
    </View>
  );

  const renderListItem = ({ item, index }: { item: any; index: number }) => {
    const expanded = isExpanded(item, index);
    const id = String(item.id ?? item.uniqueId ?? index);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.cardTitleWrap}
            onPress={() => openVisitDetails(item)}
          >
            <TextAtom numberOfLines={2} style={styles.cardTitle}>
              {item.name ?? 'Gita Kumari'}{' '}
              <TextAtom style={styles.cardSubtitle}>({patientIdText(item)})</TextAtom>
            </TextAtom>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.menuButton}
            onPress={() => setOpenMenuId(id)}
          >
            <Icon name="dots-vertical" size={18} color={colors.text_black} />
          </TouchableOpacity>
        </View>

        {expanded ? renderExpandedFields(item) : renderCollapsedFields(item)}

        <TouchableOpacity activeOpacity={0.85} onPress={() => toggleExpand(item)}>
          <TextAtom style={styles.moreText}>{expanded ? 'View Less' : 'View More'}</TextAtom>
        </TouchableOpacity>

        <ActionPopover
          visible={openMenuId === id}
          onClose={() => setOpenMenuId(null)}
          anchorStyle={styles.popoverAnchor}
          items={[
            {
              label: 'Download',
              onPress: () => Toast.show({ type: 'info', text2: 'Download' }),
            },
            {
              label: 'Edit',
              onPress: () =>
                navigation.navigate(screensName.AddBasicPatientDetails, {
                  patientType: activeType,
                  item,
                }),
            },
            {
              label: 'Delete',
              destructive: true,
              onPress: () => {
                Toast.show({ type: 'success', text2: 'Patient deleted' });
                setData(prev => prev.filter(row => row !== item));
              },
            },
          ]}
        />
      </View>
    );
  };

  const renderFilterSheet = () => (
    <Modal
      transparent
      visible={filterVisible}
      animationType="slide"
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.filterBackdrop}>
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.filterTitleRow}>
            <TextAtom style={styles.filterTitle}>Filters</TextAtom>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFilterVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={28} color={colors.text_black} />
            </TouchableOpacity>
          </View>

          {activeType === 'Trainee' && (
            <>
              <SelectBox label="Training" wide />
              <SelectBox label="Batch" wide />
            </>
          )}
          {activeType === 'Employee' && (
            <>
              <SelectBox label="Vendor" wide />
              <SelectBox label="Employee" wide disabled />
            </>
          )}
          <SelectBox label="Doctor" wide />
          <View style={styles.filterGrid}>
            <SelectBox label="Blood Group" />
            <SelectBox label="Gender" />
            <SelectBox label="Treatment Type" />
            <SelectBox label="Visit Count" />
            <SelectBox label="From Date" />
            <SelectBox label="To Date" />
          </View>

          <View style={styles.filterActions}>
            <FormWhiteButton
              title="Clear"
              onPress={() => setFilterVisible(false)}
              containerStyle={styles.filterButtonHalf}
              buttonStyle={styles.filterBottomButton}
            />
            <FormGradientButton
              title="Apply"
              onPress={() => setFilterVisible(false)}
              containerStyle={styles.filterButtonHalf}
              buttonStyle={styles.filterBottomButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {renderHeader()}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListItem}
        keyExtractor={(item, index) => `${item?.id ?? 'patient'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          <>
            <ActivityIndicator
              size={'small'}
              color={colors.primary}
              animating={pagination}
              style={styles.paginationLoader}
            />
            {data.length > 0 && (
              <TouchableOpacity activeOpacity={0.85} style={styles.loadMore}>
                <TextAtom style={styles.loadMoreText}>Load More</TextAtom>
              </TouchableOpacity>
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listPatientDetails(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listPatientDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
      {renderFilterSheet()}
    </SafeAreaView>
  );
};

export default BasicPatientDetails;

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
    flex: 1,
  },
  headerCount: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(5),
  },
  iconOnly: {
    width: vw(30),
    height: vw(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    height: vh(36),
    borderRadius: vw(8),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(10),
  },
  createText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(13),
    color: colors.white,
  },
  segmentRow: {
    height: vh(34),
    borderRadius: vw(8),
    backgroundColor: colors.light_sky_blue,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: vh(10),
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.primary_blue,
    borderRadius: vw(8),
  },
  segmentText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  segmentTextActive: {
    color: colors.white,
  },
  flatListContainer: {
    paddingBottom: vh(30),
  },
  card: {
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(16),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vh(16),
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
  },
  cardSubtitle: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(13),
    color: colors.text_grey,
  },
  menuButton: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E6E9EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginLeft: vw(8),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoBlock: {
    width: '50%',
    marginBottom: vh(10),
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(4),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  dangerText: {
    color: colors.red,
  },
  photoBlock: {
    width: '50%',
    marginBottom: vh(10),
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoThumb: {
    width: vw(24),
    height: vw(24),
    borderRadius: vw(3),
    backgroundColor: '#D8C0A8',
    marginRight: vw(6),
  },
  viewButton: {
    height: vh(25),
    borderRadius: vw(4),
    backgroundColor: colors.primary_dark_blue,
    paddingHorizontal: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  moreText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#D48A00',
  },
  popoverAnchor: {
    top: vh(92),
    right: vw(18),
  },
  filterBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(14, 34, 57, 0.08)',
  },
  filterSheet: {
    borderTopLeftRadius: vw(28),
    borderTopRightRadius: vw(28),
    backgroundColor: colors.white,
    paddingHorizontal: vw(16),
    paddingTop: vh(10),
    paddingBottom: vh(46),
  },
  sheetHandle: {
    width: vw(90),
    height: vh(5),
    borderRadius: vw(4),
    backgroundColor: colors.text_grey,
    alignSelf: 'center',
    marginBottom: vh(26),
  },
  filterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(18),
  },
  filterTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(17),
    color: colors.new_ui_heading,
  },
  closeButton: {
    width: vw(36),
    height: vw(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: vw(14),
  },
  fullFilterField: {
    width: '100%',
    marginBottom: vh(18),
  },
  halfFilterField: {
    width: '48%',
    marginBottom: vh(18),
  },
  filterLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(16),
    color: colors.new_ui_heading,
    marginBottom: vh(10),
  },
  selectBox: {
    height: vh(48),
    borderWidth: 1,
    borderColor: '#C8CDD5',
    borderRadius: vw(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(14),
  },
  selectBoxDisabled: {
    backgroundColor: '#E9EEF6',
    borderColor: '#E9EEF6',
  },
  selectText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  selectTextDisabled: {
    color: '#C4CAD5',
  },
  filterActions: {
    flexDirection: 'row',
    gap: vw(10),
    marginTop: vh(12),
  },
  filterButtonHalf: {
    flex: 1,
  },
  filterBottomButton: {
    height: vh(40),
    borderRadius: vw(8),
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
  loadMore: {
    alignSelf: 'center',
    paddingVertical: vh(16),
  },
  loadMoreText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#D48A00',
  },
});
