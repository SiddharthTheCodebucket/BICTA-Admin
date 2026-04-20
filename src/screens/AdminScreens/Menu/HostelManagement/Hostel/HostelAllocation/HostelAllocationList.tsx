import React, {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import {
  colors,
  fonts,
  screensName,
  strings,
  SvgDelete,
  SvgDownload,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import SubTab from '../../../../../../components/molecules/SubTab';
import ImageFieldPreview from '../../../../../../components/molecules/ImageFieldPreview';
import {
  useHostelAllocationDeleteMutation,
  useHostelAllocationDetailsMutation,
  useHostelAllocationMutation,
  useHostelReleaseMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';

interface Props {
  navigation: NavigationType;
}

type AllocationTab = 'trainee' | 'guest';

const ITEMS_PER_PAGE = 10;

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const AllocationItemSeparator = () => <View style={styles.itemSeparator} />;

const InfoField = ({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: any;
  align?: 'left' | 'right';
}) => (
  <View style={styles.infoCol}>
    <TextAtom style={globalStyles.infoLabel}>{label}</TextAtom>
    <TextAtom
      style={[
        globalStyles.infoValue,
        align === 'right' ? styles.infoValueRight : undefined,
      ]}
      numberOfLines={3}
    >
      {value || '-'}
    </TextAtom>
  </View>
);

const FullWidthField = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.fullWidthField}>
    <TextAtom style={globalStyles.infoLabel}>{label}</TextAtom>
    <TextAtom style={globalStyles.infoValue}>{value || '-'}</TextAtom>
  </View>
);

const formatDate = (value: any) =>
  value ? moment(value).format('DD/MM/YY') : '-';

const formatTrainingProgramme = (item: any) => {
  if (!item?.nameOfTrainingProgramme) return '-';

  return item.nameOfTrainingProgrammeId
    ? `${item.nameOfTrainingProgramme} (${item.nameOfTrainingProgrammeId})`
    : item.nameOfTrainingProgramme;
};

const getPersonName = (item: any, activeTab: AllocationTab, index: number) => {
  const fallback = activeTab === 'guest' ? 'Guest' : 'Trainee';
  return (
    item?.name ||
    item?.traineeName ||
    item?.guestName ||
    `${fallback} ${index + 1}`
  );
};

const getDateRange = (item: any, activeTab: AllocationTab) => {
  const start =
    activeTab === 'guest' ? item?.guestCheckInDate : item?.courseStartDate;
  const end =
    activeTab === 'guest' ? item?.guestCheckOutDate : item?.courseEndDate;

  if (!start && !end) return '-';

  return `${formatDate(start)} - ${formatDate(end)}`;
};

const getNoOfDays = (item: any, activeTab: AllocationTab) => {
  if (item?.noOfDays) return item.noOfDays;

  const start =
    activeTab === 'guest' ? item?.guestCheckInDate : item?.courseStartDate;
  const end =
    activeTab === 'guest' ? item?.guestCheckOutDate : item?.courseEndDate;

  if (!start || !end) return '-';

  const diff = moment(end).diff(moment(start), 'days') + 1;
  return diff > 0 ? String(diff).padStart(2, '0') : '-';
};

const getAadhaarImage = (item: any) =>
  item?.aadhaarCard ||
  item?.aadharCard ||
  item?.aadhaarImage ||
  item?.aadharImage ||
  item?.aadhaarPhoto ||
  item?.aadharPhoto ||
  '';

const HostelAllocationList = (props: Props) => {
  const { navigation } = props;
  const input1_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const center = useGetCentre();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [hostelAllocationDetailsApi] = useHostelAllocationDetailsMutation();
  const [hostelAllocationDeleteApi] = useHostelAllocationDeleteMutation();
  const [hostelReleaseApi] = useHostelReleaseMutation();
  const [hostelAllocationApi] = useHostelAllocationMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<any>({});
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationId, setAllocationId] = useState<any>('');
  const [isComingFromDropdown, setIsComingFromDropdown] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeMenuItem, setActiveMenuItem] = useState<any>(null);

  const [trainingDetailList, setTrainingDetailList] = useState<any[]>([]);
  const [trainindDetail, setTrainindDetail] = useState<any>({});
  const [genderList] = useState<any[]>([
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' },
  ]);
  const [gender, setGender] = useState<any>({});
  const [allocationStatusList] = useState<any[]>([
    { id: 'Pending for allocation', name: 'Pending' },
    { id: 'Allocated', name: 'Allocated' },
  ]);
  const [allocationStatus, setAllocationStatus] = useState<any>({});
  const [hostelList, setHostelList] = useState<any[]>([]);
  const [hostel, setHostel] = useState<any>({});
  const [search, setSearch] = useState('');
  const [centerSerach, setCenterSerach] = useState<any>({});
  const [activeTab, setActiveTab] = useState<AllocationTab>('trainee');
  const [appliedFilters, setAppliedFilters] = useState<any[]>([]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocation.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const allocationTabs = useMemo(
    () => [
      { label: 'Trainee', value: 'trainee' },
      { label: 'Guest', value: 'guest' },
    ],
    [],
  );

  const toggleAccordion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (isComingFromDropdown) {
        setIsComingFromDropdown(false);
        return;
      }

      if (showReleaseModal || showAllocationModal) return;

      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        hostelAllocationDetails(1, true, '', []);
        getTrainingDetails();
        getHostelDetails();
      }
    }, [
      firstTimeLoad,
      centerSerach,
      search,
      isComingFromDropdown,
      showReleaseModal,
      showAllocationModal,
    ]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    hostelAllocationDetails(1, true, search, appliedFilters);
  }, [centerSerach]);

  useEffect(() => {
    setExpandedItems(new Set());
    hostelAllocationDetails(1, true, search, appliedFilters);
  }, [activeTab]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const hostelAllocationDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = appliedFilters,
    isExport = false,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      bipardCentre: [],
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      userType: activeTab === 'guest' ? 'GUEST' : 'TRAINEE',
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    if (isExport) {
      params.exportFlag = true;
    }

    hostelAllocationDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        const nextTotalCount = res?.data?.totalCount ?? 0;

        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        setTotalCount(nextTotalCount);

        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < nextTotalCount);

        if (!isNullUndefined(res.data?.exportUrl)) {
          downloadAndOpenFile(res.data.exportUrl);
        }
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

  const handleSearch = useCallback(
    debounce((text: string) => {
      hostelAllocationDetails(1, true, text, appliedFilters);
    }, 500),
    [activeTab, appliedFilters, centerSerach],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    hostelAllocationDetails(1, true, '', appliedFilters);
  };

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: strings.hostelManagement.hostelAllocation.allocationDetails,
      count: totalCount,
      showCount: true,
      search: {
        visible: true,
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowSearch(prev => !prev);
        },
      },
      filter: {
        visible: true,
        onPress: () => setShowFilterPanel(true),
      },
    }),
    [totalCount],
  );

  const handleDelete = (id: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.hostelManagement.hostelAllocation.deleteConfirmation,
      message: strings.hostelManagement.hostelAllocation.deleteMessage,
      okText: strings.hostelManagement.hostelAllocation.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        deleteHostelAllocationStatus(id);
      },
      cancelFunction: () => {},
    });
  };

  const deleteHostelAllocationStatus = (id: any) => {
    setInitialCall(true);

    hostelAllocationDeleteApi({ id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        hostelAllocationDetails(1, true, search, appliedFilters);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const clearFilter = () => {
    setTrainindDetail({});
    setGender({});
    setHostel({});
    setAllocationStatus({});
    setAppliedFilters([]);
    setShowFilterPanel(false);
    hostelAllocationDetails(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (trainindDetail?.id) {
      filters.push(['nameOfTrainingProgrammeId', '=', trainindDetail.id]);
    }

    if (allocationStatus?.id) {
      filters.push(['status', '=', allocationStatus.id]);
    }

    if (gender?.id) {
      filters.push(['gender', '=', gender.id]);
    }

    if (hostel?.id) {
      filters.push(['hostelNameId', '=', hostel.id]);
    }

    if (!isExport) {
      setAppliedFilters(filters);
      setShowFilterPanel(false);
    }

    hostelAllocationDetails(1, true, search, filters, isExport);
  };

  const getTrainingDetails = () => {
    setInitialCall(true);
    const params = {
      bipardCentre: center,
      listType: 'filter_training_name_for_hostel_allocation_details',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingDetailList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getHostelDetails = () => {
    setInitialCall(true);
    const params = {
      bipardCentre: center,
      listType: 'filter_hostel_name_for_bed_details',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setHostelList(res.data);
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

  const hostelAllocation = (id: any) => {
    setInitialCall(true);

    hostelAllocationApi({ traineeId: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setInitialCall(false);
        setAllocationId('');
        setShowAllocationModal(false);
        hostelAllocationDetails(1, true, search, appliedFilters);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const hostelrelease = (id: any) => {
    setInitialCall(true);

    hostelReleaseApi({ trainingId: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setInitialCall(false);
        setSelectedHostel({});
        setShowReleaseModal(false);
        hostelAllocationDetails(1, true, search, appliedFilters);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const navigateToEdit = (item: any) => {
    if (activeTab === 'guest') {
      navigation.navigate(screensName.EditGuestHostelallocation, {
        item,
        onDone: () => hostelAllocationDetails(1, true, search, appliedFilters),
      });
      return;
    }

    navigation.navigate(screensName.EditTraineeHostelAllocation, {
      item,
      isAllocated: item?.status !== 'Pending for allocation',
      onDone: () => hostelAllocationDetails(1, true, search, appliedFilters),
    });
  };

  const renderDocumentPreviews = (item: any) => {
    if (activeTab !== 'trainee') return null;

    return (
      <View style={styles.documentSection}>
        <TextAtom style={styles.documentTitle}>Documents</TextAtom>
        <View style={styles.documentGrid}>
          <ImageFieldPreview
            label="Photo"
            imageUri={item?.photo}
            containerStyle={styles.previewItem}
          />
          <ImageFieldPreview
            label="Signature"
            imageUri={item?.sign}
            containerStyle={styles.previewItem}
          />
          <ImageFieldPreview
            label="Aadhaar Card"
            imageUri={getAadhaarImage(item)}
            containerStyle={styles.previewItem}
          />
        </View>
      </View>
    );
  };

  const renderExpandedContent = (item: any) => {
    if (activeTab === 'guest') {
      return (
        <View style={styles.accordionContent}>
          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.name}
            value={item?.name}
          />

          <View style={globalStyles.infoRow}>
            <InfoField
              label={strings.hostelManagement.hostelAllocation.hostel}
              value={item?.hostelName}
            />
            <InfoField
              label={strings.hostelManagement.hostelAllocation.room}
              value={item?.roomNo}
              align="right"
            />
          </View>

          <View style={globalStyles.infoRow}>
            <InfoField
              label={strings.hostelManagement.hostelAllocation.bed}
              value={item?.bedName}
            />
            <InfoField
              label={strings.hostelManagement.hostelAllocation.gender}
              value={item?.guestGender || item?.gender}
              align="right"
            />
          </View>

          <View style={globalStyles.infoRow}>
            <InfoField
              label="Start & End Date"
              value={getDateRange(item, activeTab)}
            />
            <InfoField
              label={strings.hostelManagement.hostelAllocation.noOfDays}
              value={getNoOfDays(item, activeTab)}
              align="right"
            />
          </View>

          <View style={globalStyles.infoRow}>
            <InfoField
              label={strings.hostelManagement.hostelAllocation.mobileNumber}
              value={item?.mobileNo}
            />
            <InfoField
              label={strings.hostelManagement.hostelAllocation.email}
              value={item?.officeEmail}
              align="right"
            />
          </View>

          <View style={globalStyles.infoRow}>
            <InfoField
              label={strings.hostelManagement.hostelAllocation.key}
              value={item?.keyProvided}
            />
            <InfoField
              label={strings.hostelManagement.hostelAllocation.yogaMat}
              value={item?.yogaMatProvided}
              align="right"
            />
          </View>

          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.purpose}
            value={item?.purpose}
          />
        </View>
      );
    }

    return (
      <View style={styles.accordionContent}>
        <FullWidthField
          label={strings.hostelManagement.hostelAllocation.trainingProgramme}
          value={formatTrainingProgramme(item)}
        />

        <View style={globalStyles.infoRow}>
          <InfoField
            label={strings.hostelManagement.hostelAllocation.hostel}
            value={item?.hostelName}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.room}
            value={item?.roomNo}
            align="right"
          />
        </View>

        <View style={globalStyles.infoRow}>
          <InfoField
            label={strings.hostelManagement.hostelAllocation.bed}
            value={item?.bedName}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.gender}
            value={item?.gender}
            align="right"
          />
        </View>

        <View style={globalStyles.infoRow}>
          <InfoField
            label="Start & End Date"
            value={getDateRange(item, activeTab)}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.noOfDays}
            value={getNoOfDays(item, activeTab)}
            align="right"
          />
        </View>

        <View style={globalStyles.infoRow}>
          <InfoField
            label={strings.hostelManagement.hostelAllocation.mobileNumber}
            value={item?.mobileNo}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.email}
            value={item?.officeEmail}
            align="right"
          />
        </View>

        <View style={globalStyles.infoRow}>
          <InfoField
            label={strings.hostelManagement.hostelAllocation.aadhaarNumber}
            value={item?.aadhaarNo}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.panNumber}
            value={item?.panNo}
            align="right"
          />
        </View>

        <View style={globalStyles.infoRow}>
          <InfoField
            label={strings.hostelManagement.hostelAllocation.department}
            value={item?.department}
          />
          <InfoField
            label={strings.hostelManagement.hostelAllocation.key}
            value={item?.keyProvided}
            align="right"
          />
        </View>

        <FullWidthField
          label={strings.hostelManagement.hostelAllocation.yogaMat}
          value={item?.yogaMatProvided}
        />

        {renderDocumentPreviews(item)}
      </View>
    );
  };

  const AllocationCard = ({ item, index }: any) => {
    const itemId = String(item?.id ?? index);
    const isExpanded = expandedItems.has(itemId);
    const personName = getPersonName(item, activeTab, index);

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.accordionHeader}
          onPress={() => toggleAccordion(itemId)}
        >
          <View style={styles.headerLeft}>
            <TextAtom
              style={[
                styles.headerTitle,
                isExpanded && styles.headerTitleActive,
              ]}
              numberOfLines={1}
            >
              {personName}
            </TextAtom>
            <View style={styles.headerMetaRow}>
              <TextAtom style={styles.headerMetaText}>#{index + 1}</TextAtom>
              {!!item?.status && (
                <View
                  style={[
                    styles.statusChip,
                    item?.status === 'Allocated'
                      ? styles.statusChipAllocated
                      : styles.statusChipPending,
                  ]}
                >
                  <TextAtom
                    style={[
                      styles.statusChipText,
                      item?.status === 'Allocated'
                        ? styles.statusChipTextAllocated
                        : styles.statusChipTextPending,
                    ]}
                  >
                    {item.status}
                  </TextAtom>
                </View>
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableAtom
              style={styles.actionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <SvgDelete width={vw(18)} height={vw(18)} />
            </TouchableAtom>

            <TouchableAtom
              style={styles.actionBtn}
              onPress={() => navigateToEdit(item)}
            >
              <SvgEditPencile width={vw(18)} height={vw(18)} />
            </TouchableAtom>
          </View>
        </TouchableOpacity>

        {isExpanded && renderExpandedContent(item)}

        <TouchableAtom
          style={styles.footerToggle}
          onPress={() => toggleAccordion(itemId)}
        >
          <TextAtom style={styles.footerToggleText}>
            {isExpanded ? 'View Less' : 'View More'}
          </TextAtom>
          <TextAtom style={styles.footerToggleIcon}>
            {isExpanded ? '^' : 'v'}
          </TextAtom>
        </TouchableAtom>
      </View>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => (
    <AllocationCard item={item} index={index} />
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.pageContent}>
        <AdminPageHeader title="Hostel Management" navigation={navigation} />

        <View style={styles.listHeaderWrap}>
          <AdminListHeader config={headerConfig} />
        </View>

        {showSearch && (
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={styles.searchBox}
          />
        )}

        <SubTab
          tabs={allocationTabs}
          activeTab={activeTab}
          onTabChange={value => setActiveTab(value as AllocationTab)}
          style={styles.allocationTabs}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        extraData={{ data, expandedItems, activeTab }}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) =>
          item?.id ? String(item.id) : index.toString()
        }
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size="small"
            color={colors.primary}
            animating={pagination}
            style={styles.listLoader}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              hostelAllocationDetails(1, false, search, appliedFilters);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? hostelAllocationDetails(page + 1, false, search, appliedFilters)
            : setPagination(false);
        }}
        onEndReachedThreshold={0.2}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={AllocationItemSeparator}
      />

      <AdminBottomModal
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        title="Filters"
      >
        {crediantialData?.user?.[0]?.tenantId === 3 && (
          <DropDownOrganism
            label="Center"
            placeholder="Center"
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Center',
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
                setSelectedData: setCenterSerach,
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={centerSerach?.name}
          />
        )}

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.trainingDetail}
          placeholder={strings.hostelManagement.hostelAllocation.trainingDetail}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.trainingDetail,
              Data: trainingDetailList,
              selectedData: trainindDetail,
              setSelectedData: (selectedData: any) => {
                setTrainindDetail(selectedData);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={trainindDetail?.name}
        />

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.allocationStatus}
          placeholder={
            strings.hostelManagement.hostelAllocation.allocationStatus
          }
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.allocationStatus,
              Data: allocationStatusList,
              selectedData: allocationStatus,
              setSelectedData: (selectedData: any) => {
                setAllocationStatus(selectedData);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={allocationStatus?.name}
        />

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.gender}
          placeholder={strings.hostelManagement.hostelAllocation.gender}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.gender,
              Data: genderList,
              selectedData: gender,
              setSelectedData: (selectedData: any) => {
                setGender(selectedData);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={gender?.name}
        />

        <DropDownOrganism
          label={strings.hostelManagement.hostelAllocation.hostel}
          placeholder={strings.hostelManagement.hostelAllocation.hostel}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.hostelAllocation.hostel,
              Data: hostelList,
              selectedData: hostel,
              setSelectedData: (selectedData: any) => {
                setHostel(selectedData);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={hostel?.name}
        />

        <ViewAtom style={styles.filterActionRow}>
          <TouchableAtom style={styles.clearFilterBtn} onPress={clearFilter}>
            <TextAtom style={styles.clearFilterText}>Clear</TextAtom>
          </TouchableAtom>
          <TouchableAtom
            style={styles.applyFilterBtn}
            onPress={() => applyFilter()}
          >
            <TextAtom style={styles.applyFilterText}>Apply</TextAtom>
          </TouchableAtom>
        </ViewAtom>
      </AdminBottomModal>

      <Modal
        visible={!isNullUndefined(activeMenuItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveMenuItem(null)}
      >
        <Pressable
          style={styles.actionModalOverlay}
          onPress={() => setActiveMenuItem(null)}
        >
          <View style={styles.actionMenuCard}>
            <TouchableAtom
              style={styles.actionMenuItem}
              onPress={() => {
                setActiveMenuItem(null);
                hostelAllocationDetails(1, true, search, appliedFilters, true);
              }}
            >
              <SvgDownload width={vw(16)} height={vw(16)} />
              <TextAtom style={styles.actionMenuText}>Download</TextAtom>
            </TouchableAtom>

            <TouchableAtom
              style={styles.actionMenuItem}
              onPress={() => {
                setActiveMenuItem(null);
                if (activeTab === 'guest') {
                  navigation.navigate(screensName.EditGuestHostelallocation, {
                    onDone: () =>
                      hostelAllocationDetails(1, true, search, appliedFilters),
                  });
                } else {
                  setShowAllocationModal(true);
                }
              }}
            >
              <TextAtom style={styles.actionMenuEmoji}>+</TextAtom>
              <TextAtom style={styles.actionMenuText}>Request</TextAtom>
            </TouchableAtom>

            <TouchableAtom
              style={styles.actionMenuItem}
              onPress={() => {
                setActiveMenuItem(null);
                setShowReleaseModal(true);
              }}
            >
              <TextAtom style={styles.actionMenuEmoji}>R</TextAtom>
              <TextAtom style={styles.actionMenuText}>Release</TextAtom>
            </TouchableAtom>
          </View>
        </Pressable>
      </Modal>

      {showReleaseModal && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableAtom
              style={styles.closeIconWrap}
              onPress={() => {
                setShowReleaseModal(false);
                setSelectedHostel({});
              }}
            >
              <TextAtom style={styles.closeIcon}>x</TextAtom>
            </TouchableAtom>

            <TextAtom style={styles.modalTitle}>
              Hostel Release Request
            </TextAtom>

            <DropDownOrganism
              label=""
              placeholder="Select Training"
              onPress={() => {
                setIsComingFromDropdown(true);
                navigation.navigate('DropDownModal', {
                  name: 'Training List',
                  Data: trainingDetailList,
                  selectedData: selectedHostel,
                  setSelectedData: (selectedData: any) =>
                    setSelectedHostel(selectedData),
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={selectedHostel?.name}
              contentContainerStyle={styles.fullWidth}
              containerStyle={styles.fullWidth}
            />

            <View style={styles.modalButtonRow}>
              <TouchableAtom
                style={styles.submitBtn}
                onPress={() => {
                  if (!selectedHostel?.id) {
                    Toast.show({
                      type: 'error',
                      text2: 'Select Training',
                    });
                    return;
                  }

                  navigation.navigate(screensName.AlertOrganism, {
                    title: 'Hostel Release Confirmation',
                    message: 'Are you sure you want to release the hostel?',
                    okText: 'Confirm',
                    double: true,
                    cancelText: strings.cancel,
                    okFunction: () => {
                      hostelrelease(selectedHostel.id);
                    },
                    cancelFunction: () => {},
                  });
                }}
              >
                <TextAtom style={styles.submitBtnText}>Submit</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      )}

      {showAllocationModal && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableAtom
              style={styles.closeIconWrap}
              onPress={() => {
                setShowAllocationModal(false);
                setAllocationId('');
              }}
            >
              <TextAtom style={styles.closeIcon}>x</TextAtom>
            </TouchableAtom>

            <TextAtom style={styles.modalTitle}>
              Hostel Allocation Request
            </TextAtom>

            <TextInputOrganisms
              placeholder="Trainee Id"
              ref={input1_ref}
              onSubmitEditing={() => Keyboard.dismiss()}
              value={allocationId}
              autoCapitalize="none"
              returnKeyType="done"
              onChangeText={(val: string) => {
                setAllocationId(val);
              }}
              keyboardType="numeric"
              style={styles.modalInput}
              labelStyle={styles.modalInput}
            />

            <View style={styles.modalButtonRow}>
              <TouchableAtom
                style={styles.submitBtn}
                onPress={() => {
                  if (!allocationId) {
                    Toast.show({
                      type: 'error',
                      text2: 'Enter Trainee Id',
                    });
                    return;
                  }

                  hostelAllocation(allocationId);
                }}
              >
                <TextAtom style={styles.submitBtnText}>Submit</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HostelAllocationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  pageContent: {
    paddingHorizontal: vw(16),
  },
  navigationTabs: {
    marginHorizontal: 0,
    marginTop: vh(2),
  },
  listHeaderWrap: {
    marginTop: vh(8),
  },
  searchBox: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: vh(10),
    marginBottom: 0,
  },
  allocationTabs: {
    marginHorizontal: 0,
    marginTop: vh(12),
    marginBottom: vh(6),
    alignSelf: 'flex-start',
  },
  flatListContainer: {
    paddingTop: vh(6),
    paddingBottom: vh(16),
  },
  listLoader: {
    marginTop: vh(12),
  },
  itemSeparator: {
    height: vh(12),
  },
  accordionContainer: {
    backgroundColor: colors.white,
    marginHorizontal: vw(16),
    borderRadius: vw(14),
    borderWidth: 1,
    borderColor: '#E9EDF3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(14),
    paddingTop: vh(14),
    paddingBottom: vh(12),
  },
  headerLeft: {
    flex: 1,
    paddingRight: vw(10),
  },
  headerTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_card_title,
  },
  headerTitleActive: {
    color: colors.primary_blue,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(6),
    gap: vw(8),
  },
  headerMetaText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
  },
  statusChip: {
    paddingHorizontal: vw(8),
    paddingVertical: vh(2),
    borderRadius: vw(20),
  },
  statusChipAllocated: {
    backgroundColor: '#E7F8EE',
  },
  statusChipPending: {
    backgroundColor: '#FFF3DB',
  },
  statusChipText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(11),
  },
  statusChipTextAllocated: {
    color: '#14804A',
  },
  statusChipTextPending: {
    color: '#B7791F',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(6),
  },
  actionBtn: {
    width: vw(32),
    height: vw(32),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E5EAF1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFF',
  },
  menuIcon: {
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(16),
    color: colors.new_ui_card_title,
    lineHeight: vw(16),
  },
  accordionContent: {
    paddingHorizontal: vw(14),
    paddingBottom: vh(8),
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  fullWidthField: {
    marginTop: vh(14),
  },
  infoCol: {
    flex: 1,
  },
  infoValueRight: {
    textAlign: 'right',
  },
  documentSection: {
    marginTop: vh(8),
    paddingTop: vh(12),
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  documentTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: colors.new_ui_card_title,
    marginBottom: vh(10),
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  previewItem: {
    width: '48%',
  },
  footerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vw(6),
    paddingVertical: vh(12),
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  footerToggleText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(13),
    color: '#CD9F3E',
  },
  footerToggleIcon: {
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(13),
    color: '#CD9F3E',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  filterActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(12),
    gap: vw(10),
  },
  clearFilterBtn: {
    flex: 1,
    height: vh(42),
    borderRadius: vw(10),
    borderWidth: 1,
    borderColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.primary_blue,
  },
  applyFilterBtn: {
    flex: 1,
    height: vh(42),
    borderRadius: vw(10),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.white,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    paddingHorizontal: vw(16),
    paddingBottom: vh(24),
  },
  actionMenuCard: {
    backgroundColor: colors.white,
    borderRadius: vw(14),
    paddingVertical: vh(8),
    borderWidth: 1,
    borderColor: '#E9EDF3',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(12),
    paddingHorizontal: vw(16),
    paddingVertical: vh(14),
  },
  actionMenuText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_card_title,
  },
  actionMenuEmoji: {
    width: vw(16),
    textAlign: 'center',
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(15),
    color: colors.new_ui_card_title,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalCard: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    position: 'relative',
  },
  closeIconWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeIcon: {
    fontSize: vw(22),
    color: colors.red_2,
  },
  modalTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Inter_SemiBold,
    marginBottom: vh(15),
    color: colors.primary_blue,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
  },
  submitBtn: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: colors.green,
    borderRadius: vw(8),
  },
  submitBtnText: {
    color: colors.white,
    fontFamily: fonts.Inter_Medium,
  },
  modalInput: {
    width: vw(280),
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
