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
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import SubTab from '../../../../../../components/molecules/SubTab';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import {
  useDeleteHostelDetailsMutation,
  useHostelDetailsMutation,
  useUpdateHostelDetailsMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';

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

const HostelItemSeparator = () => <View style={styles.itemSeparator} />;

const StatusBadge = ({ label, value, activeValue }: any) => {
  const isActive = value === activeValue;
  return (
    <View style={styles.statusBadgeContainer}>
      <TextAtom style={styles.statusBadgeLabel}>{label}: </TextAtom>
      <View
        style={[
          styles.statusBadge,
          isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
        ]}
      >
        <TextAtom
          style={[
            styles.statusBadgeText,
            isActive
              ? styles.statusBadgeTextActive
              : styles.statusBadgeTextInactive,
          ]}
        >
          {value}
        </TextAtom>
      </View>
    </View>
  );
};

const DetailGridItem = ({ label, value, fullWidth = false }: any) => (
  <View style={[styles.gridItem, fullWidth && { width: '100%' }]}>
    <TextAtom style={styles.gridLabel}>{label}</TextAtom>
    <TextAtom style={styles.gridValue}>{value ?? '-'}</TextAtom>
  </View>
);

const HostelDetailsList = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [hostelDetailsApi] = useHostelDetailsMutation();
  const [updateHostelDetailsApi] = useUpdateHostelDetailsMutation();
  const [deleteHostelDetailsApi] = useDeleteHostelDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('hostel');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelDetails.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleAccordion = (id: string) => {
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
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        hostelDetailsList(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    hostelDetailsList(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const hostelDetailsList = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    hostelDetailsApi(params)
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
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      hostelDetailsList(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    hostelDetailsList(1, true, '');
  };

  const HostelCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const isExpanded = expandedItems.has(item.id);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.statusChangeConfirmation,
        message: strings.hostelManagement.statusChangeMessage,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateHostelStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateHostelStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        idForChangeStatus: id,
      };
      updateHostelDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          hostelDetailsList(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.deleteConfirmation,
        message: strings.hostelManagement.deleteItemConfirmation,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteHostelStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteHostelStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id: id,
      };
      deleteHostelDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          hostelDetailsList(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={[
            styles.accordionHeader,
            isExpanded && styles.accordionHeaderActive,
          ]}
          onPress={() => toggleAccordion(item.id)}
        >
          <View style={styles.headerLeft}>
            <TextAtom
              style={[
                styles.headerTitle,
                isExpanded && styles.headerTitleActive,
              ]}
            >
              {item.hostelName ?? '-'}
            </TextAtom>
          </View>
          <TouchableOpacity
            style={{ marginRight: vw(4) }}
            onPress={() => handleDelete()}
          >
            <SvgDelete />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: vw(4) }}
            onPress={() => {
              navigation.navigate(screensName.AddHostelDetails, {
                item: item,
                onDone: () => hostelDetailsList(1, true, search),
              });
            }}
          >
            <SvgEditPencile />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.gridContainer}>
              <DetailGridItem
                label={strings.hostelManagement.hostelDetails.trainingCentre}
                value={item.trainingCentre}
              />
              <DetailGridItem
                label={strings.hostelManagement.hostelDetails.noOfFloors}
                value={item.noOfFloors}
              />
              <DetailGridItem
                label={strings.hostelManagement.hostelDetails.hostelAddress}
                value={item.hostelAddress}
                fullWidth
              />
              <DetailGridItem
                label={strings.hostelManagement.hostelDetails.contactPerson}
                value={item.contactPerson}
              />
              <DetailGridItem
                label={strings.hostelManagement.hostelDetails.contactNo}
                value={item.contactNo}
              />
            </View>

            <View style={styles.statusWrapper}>
              <StatusBadge
                label={strings.hostelManagement.status}
                value={statusValue}
                activeValue={strings.hostelManagement.active}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderListHostelDetails = ({ item, index }: any) => {
    return <HostelCard item={item} index={index} navigation={navigation} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <AdminPageHeader title="Hostel Management" navigation={navigation} />
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader
          config={{
            title: 'Hostel Details',
            count: data.length,
            showCount: true,
            search: {
              visible: true,
              onPress: () => {
                // Handle search focus or modal
              },
            },
            create: {
              visible: true,
              label: 'Create',
              onPress: () => {
                navigation.navigate(screensName.AddHostelDetails, {
                  onDone: () => hostelDetailsList(1, true, search),
                });
              },
            },
          }}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListHostelDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.noDataFound}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.loadingContainer}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              hostelDetailsList(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? hostelDetailsList(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={HostelItemSeparator}
      />
    </SafeAreaView>
  );
};

export default HostelDetailsList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  accordionContainer: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginBottom: vh(10),
    borderRadius: vw(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: vw(15),
  },
  accordionHeaderActive: {},
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.text_black,
  },
  headerTitleActive: {
    color: colors.primary,
  },
  chevron: {
    width: vw(16),
    height: vw(16),
    tintColor: colors.grey,
  },
  chevronActive: {
    transform: [{ rotate: '180deg' }],
    tintColor: colors.primary,
  },
  accordionContent: {
    padding: vw(15),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: vw(10),
    marginBottom: vh(15),
  },
  editButton: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteButton: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: {
    width: vw(15),
    height: vw(15),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: vh(15),
  },
  gridItem: {
    width: '48%',
    marginBottom: vh(10),
  },
  gridLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.grey,
  },
  gridValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.text_black,
    marginTop: vw(2),
  },
  statusWrapper: {
    marginTop: vh(10),
    alignItems: 'flex-end',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.grey,
  },
  statusBadge: {
    paddingHorizontal: vw(8),
    paddingVertical: vh(4),
    borderRadius: vw(12),
    marginLeft: vw(5),
  },
  statusBadgeActive: {
    backgroundColor: colors.lightGreenBg,
  },
  statusBadgeInactive: {
    backgroundColor: colors.lightRedBg,
  },
  statusBadgeText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Medium,
  },
  statusBadgeTextActive: {
    color: colors.darkGreen,
  },
  statusBadgeTextInactive: {
    color: colors.darkRed,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  loadingContainer: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: 0,
  },
});
