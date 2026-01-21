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
  LayoutAnimation,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import images from '../../../../../../constants/images';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

import { useAppSelector } from '../../../../../../hooks';
import {
  useHrmsAssignApprovalAuthorityMutation,
  useHrmsAssignReportingOfficerMutation,
  useHrmsGenerateEmployeeIdCardMutation,
  useHrmsListEmployeeMutation,
} from '../../../../../../injectEndpoints/hrmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import AssignmentModal from './AssignmentModal';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

interface Props {
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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
  isSelected: boolean;
  onToggleSelect: (item: any) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
  item,
  index,
  navigation,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <View style={[styles.card, isSelected && styles.selectedCard]}>
      <View style={styles.rowBetween}>
        <TouchableAtom
          style={{ flex: 1 }}
          onPress={() => {
            navigation.navigate(screensName.EmployeeDetailDetails, {
              data: item,
            });
          }}
        >
          <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
            <TextAtom style={[styles.label, { flex: 1 }]}>
              Sr. No: {index + 1}
            </TextAtom>
            <TouchableAtom
              style={styles.checkboxContainer}
              onPress={() => onToggleSelect(item)}
            >
              <Image
                source={isSelected ? images.checkbox : images.uncheckbox}
                style={styles.checkboxImage}
              />
            </TouchableAtom>
          </View>

          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Employee Name</TextAtom>
            <TextAtom numberOfLines={0} style={styles.value}>
              {item.name ?? '-'}
            </TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Vendor Name</TextAtom>
            <TextAtom numberOfLines={0} style={styles.value}>
              {item.vendorName ?? '-'}
            </TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Designation</TextAtom>
            <TextAtom numberOfLines={0} style={styles.value}>
              {item.designation ?? '-'}
            </TextAtom>
          </View>
        </TouchableAtom>
      </View>
    </View>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  vendorList: any[];
  selectedVendor: any;
  setSelectedVendor: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  vendorList,
  selectedVendor,
  setSelectedVendor,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Vendor'}
      placeholder={'Vendor'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Vendor',
          Data: vendorList,
          selectedData: selectedVendor,
          setSelectedData: (data: any) => {
            setSelectedVendor(data);
            hitFilterApi({ vendor: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedVendor?.name}
    />

    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.hostelManagement.bedAvailability.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.hostelManagement.bedAvailability.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={{ color: colors.primary }}
      />
    </ViewAtom>
  </View>
);

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const EmployeeDetails = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listVendorApi] = useHrmsListEmployeeMutation();
  const [assignReportingOfficerApi] = useHrmsAssignReportingOfficerMutation();
  const [assignApprovalAuthorityApi] = useHrmsAssignApprovalAuthorityMutation();
  const [generateEmployeeIdCardApi] = useHrmsGenerateEmployeeIdCardMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);

  const [vendorList, setVendorList] = useState<any>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>({});
  const [totalCount, setTotalCount] = useState(0);

  // Selection states
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  // Modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'RO' | 'AA' | null>(
    null,
  );
  const [roList, setRoList] = useState<any[]>([]);
  const [aaList, setAaList] = useState<any[]>([]);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Vendor Employee Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        listVendorDetails(1, true, '');
        setFirstTimeLoad(false);
        getVendorList();
        getROList();
        getAAList();
      }
    }, [centerSerach, search, firstTimeLoad]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listVendorDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listVendorDetails = (
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
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listVendorApi(params)
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
        setTotalCount(totalCount);
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

  const fetchAllEmployees = () => {
    setSelectAllLoading(true);
    const centreFilter = getCentreFilter();
    const filters = buildFilters();
    const params: any = {
      search: search,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filters,
      pageNo: 1,
      itemsPerPage: totalCount || 10000,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listVendorApi(params)
      .unwrap()
      .then((res: any) => {
        const allData = res.data?.data ?? [];
        setSelectedEmployees(allData);
        setSelectAll(true);
        setSelectAllLoading(false);
        Toast.show({
          type: 'success',
          text2: `Selected ${allData.length} employee(s)`,
        });
      })
      .catch((err: any) => {
        setSelectAllLoading(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Failed to fetch all employees',
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listVendorDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listVendorDetails(1, true, '');
  };

  const renderListVendorDetails = useCallback(
    ({ item, index }: any) => {
      const isSelected = selectedEmployees.some(emp => emp.id === item.id);
      return (
        <VendorCard
          item={item}
          index={index}
          navigation={navigation}
          isSelected={isSelected}
          onToggleSelect={handleToggleSelect}
        />
      );
    },
    [navigation, selectedEmployees],
  );

  const handleToggleSelect = (item: any) => {
    setSelectedEmployees(prev => {
      const isAlreadySelected = prev.some(emp => emp.id === item.id);
      if (isAlreadySelected) {
        return prev.filter(emp => emp.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
      setSelectAll(false);
    } else {
      fetchAllEmployees();
    }
  };

  const handleAssignRO = () => {
    if (selectedEmployees.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select at least one employee',
      });
      return;
    }
    setAssignmentType('RO');
    setShowAssignmentModal(true);
  };

  const handleAssignAA = () => {
    if (selectedEmployees.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select at least one employee',
      });
      return;
    }
    setAssignmentType('AA');
    setShowAssignmentModal(true);
  };

  const handleIdCardDownload = () => {
    if (!selectedVendor?.id) {
      Toast.show({
        type: 'error',
        text2: 'Please select vendor from filter first',
      });
      return;
    }
    if (selectedEmployees.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select at least one employee',
      });
      return;
    }
    if (selectedEmployees.length > 10) {
      Toast.show({
        type: 'error',
        text2: 'You can download maximum 10 ID cards at a time',
      });
      return;
    }

    setInitialCall(true);

    const employeeIds = selectedEmployees.map(emp => emp.id);
    const params = {
      vendorId: selectedVendor.id,
      employeeIds: employeeIds,
    };

    generateEmployeeIdCardApi(params)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'success',
          text2: res?.message || 'ID Card generated successfully',
        });

        if (res?.idCardPdfUrl) {
          downloadAndOpenFile(res.idCardPdfUrl);
        }

        setSelectedEmployees([]);
        setSelectAll(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Failed to generate ID card',
        });
      });
  };

  const handleAssignmentSubmit = (selectedItem: any) => {
    if (!selectedItem?.id) {
      Toast.show({
        type: 'error',
        text2: 'Please select an option',
      });
      return;
    }

    setInitialCall(true);

    // Extract employee IDs from selected employees
    const employeeIds = selectedEmployees.map(emp => emp.id);

    if (assignmentType === 'RO') {
      // Assign Reporting Officer
      const params = {
        employeeIds: employeeIds,
        reportingOfficer: selectedItem.id,
      };

      assignReportingOfficerApi(params)
        .unwrap()
        .then((res: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'success',
            text2: res?.message || 'R.O assigned successfully',
          });
          setShowAssignmentModal(false);
          setSelectedEmployees([]);
          setSelectAll(false);
          // Refresh the list
          listVendorDetails(1, true, search, buildFilters());
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Failed to assign R.O',
          });
        });
    } else if (assignmentType === 'AA') {
      // Assign Approval Authority
      const params = {
        employeeIds: employeeIds,
        approvalAuthority: selectedItem.id,
      };

      assignApprovalAuthorityApi(params)
        .unwrap()
        .then((res: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'success',
            text2: res?.message || 'A.A assigned successfully',
          });
          setShowAssignmentModal(false);
          setSelectedEmployees([]);
          setSelectAll(false);
          // Refresh the list
          listVendorDetails(1, true, search, buildFilters());
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Failed to assign A.A',
          });
        });
    }
  };

  const clearFilter = () => {
    setSelectedVendor({});
    listVendorDetails(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedVendor?.id) {
      filters.push(['vendorId', '=', selectedVendor.id]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    listVendorDetails(1, true, search, filters);
    setShowFilter(false);
  };

  const getVendorList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_vendor',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setVendorList(resData);
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

  const getROList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_reporting_officer',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setRoList(resData);
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

  const getAAList = () => {
    setInitialCall(true);
    const params = {
      listType: 'get_leave_approval_authority',
      bipardCentre: getCentreFilter(),
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setAaList(resData);
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

  const hitFilterApi = ({ vendor = selectedVendor }: any = {}) => {
    const filters: any[] = [];

    if (vendor?.id) {
      filters.push(['vendorId', '=', [vendor.id]]);
    }

    listVendorDetails(1, true, search, filters);
  };

  useEffect(() => {
    // Check if all employees are selected based on total count, not just current page
    if (
      selectedEmployees.length > 0 &&
      selectedEmployees.length >= totalCount
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedEmployees, totalCount]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <AssignmentModal
        visible={showAssignmentModal}
        type={assignmentType}
        onClose={() => setShowAssignmentModal(false)}
        onSubmit={handleAssignmentSubmit}
        navigation={navigation}
        dropdownData={assignmentType === 'RO' ? roList : aaList}
      />

      <View style={styles.actionButtonsContainer}>
        <TouchableAtom
          style={[
            styles.selectAllButton,
            selectAllLoading && styles.disabledButton,
          ]}
          onPress={handleSelectAll}
          disabled={selectAllLoading}
        >
          {selectAllLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <TextAtom style={styles.actionButtonText}>
              {selectAll ? 'Deselect All' : 'Select All'}
            </TextAtom>
          )}
        </TouchableAtom>

        <TouchableAtom style={styles.actionButton} onPress={handleAssignRO}>
          <TextAtom style={styles.actionButtonText}>Assign R.O</TextAtom>
        </TouchableAtom>

        <TouchableAtom style={styles.actionButton} onPress={handleAssignAA}>
          <TextAtom style={styles.actionButtonText}>Assign A.A</TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={styles.actionButton}
          onPress={handleIdCardDownload}
        >
          <TextAtom style={styles.actionButtonText}>ID Card</TextAtom>
        </TouchableAtom>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
        }}
      >
        <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
          <TextAtom style={styles.filterText}>
            {showFilter
              ? strings.hostelManagement.bedAvailability.hideFilter
              : strings.hostelManagement.bedAvailability.showFilter}
          </TextAtom>
        </TouchableAtom>
      </View>
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.dashboardIndex.centers}
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
              setSelectedData: (data: any) => {
                setCenterSerach(data);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={centerSerach?.name}
          containerStyle={{ marginBottom: vh(-10) }}
        />
      )}
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListVendorDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
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
              listVendorDetails(1, false, '');
            }}
          />
        }
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              vendorList={vendorList}
              selectedVendor={selectedVendor}
              setSelectedVendor={setSelectedVendor}
              hitFilterApi={hitFilterApi}
            />
          ) : null
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listVendorDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default EmployeeDetails;

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
  generateBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  applyBtn: {
    width: vw(150),
    height: vh(35),
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  summaryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: vw(330),
    alignSelf: 'center',
  },

  summaryCard: {
    width: '32.5%',
    backgroundColor: colors.white,
    paddingVertical: vh(2.5),
    paddingHorizontal: vw(2),
    borderRadius: vw(6),
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.grey,
  },
  summaryValue: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(12),
    color: colors.black,
    marginTop: vh(1.5),
    textAlign: 'left',
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkboxContainer: {
    // padding: vw(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxImage: {
    width: vw(24),
    height: vw(24),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: vw(15),
    paddingVertical: vh(10),
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginTop: vh(10),
    borderRadius: vw(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  selectAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: vw(10),
    paddingVertical: vh(6),
    borderRadius: vw(4),
    minWidth: vw(70),
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: vw(8),
    paddingVertical: vh(6),
    borderRadius: vw(4),
    minWidth: vw(60),
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(11),
  },
  disabledButton: {
    opacity: 0.6,
  },
});
