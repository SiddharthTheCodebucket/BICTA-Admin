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
import FormSwitchForCard from '../../../../../../components/templates/FormSwitchForCard';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';
import {
  useDeleteHostelFloorMutation,
  useHostelFloorDetailsMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';

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

interface FloorCardProps {
  item: any;
  index: number;
  navigation: NavigationType;
  onDelete: (id: any) => void;
  onRefresh: () => void;
}

// const FloorCard = ({
//   item,
//   index,
//   navigation,
//   onDelete,
//   onRefresh,
// }: FloorCardProps) => {
//   const handleDelete = () => {
//     navigation.navigate(screensName.AlertOrganism, {
//       title: strings.hostelManagement.deleteConfirmation,
//       message: strings.hostelManagement.deleteItemConfirmation,
//       okText: strings.hostelManagement.confirm,
//       double: true,
//       cancelText: strings.cancel,
//       okFunction: () => onDelete(item.id),
//       cancelFunction: () => {},
//     });
//   };

//   return (
//     <View style={styles.card}>
//       <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
//         <TextAtom style={[styles.label, styles.flex1]}>
//           {strings.hostelManagement.srNo} {index + 1}
//         </TextAtom>

//         <View style={styles.actionRow}>
//           <TouchableAtom
//             style={styles.editButton}
//             onPress={() =>
//               navigation.navigate(screensName.AddFloorDetails, {
//                 item,
//                 onDone: onRefresh,
//               })
//             }
//           >
//             <ImageAtom source={images.edit_pencil} style={styles.editIcon} />
//           </TouchableAtom>

//           <TouchableAtom style={styles.deleteButton} onPress={handleDelete}>
//             <ImageAtom source={images.delete} style={styles.iconSmall} />
//           </TouchableAtom>
//         </View>
//       </View>

//       <View style={styles.rowBetween}>
//         <View style={styles.flex1}>
//           <TextAtom style={styles.label}>
//             {strings.hostelManagement.floorDetails.hostelName}
//           </TextAtom>
//           <TextAtom style={styles.value}>
//             {item.selectHostelName ?? '-'}
//           </TextAtom>
//         </View>

//         <View style={styles.flex1End}>
//           <TextAtom style={styles.labelRight}>
//             {strings.hostelManagement.floorDetails.floorType}
//           </TextAtom>
//           <TextAtom style={styles.valueRight}>{item.floorType ?? '-'}</TextAtom>
//         </View>
//       </View>

//       <View style={styles.rowBetween}>
//         <View style={styles.flex1}>
//           <TextAtom style={styles.label}>
//             {strings.hostelManagement.floorDetails.floorName}
//           </TextAtom>
//           <TextAtom style={styles.value}>{item.nameOfFloors ?? '-'}</TextAtom>
//         </View>

//         <View style={styles.flex1End}>
//           <TextAtom style={styles.labelRight}>
//             {strings.hostelManagement.floorDetails.noOfRooms}
//           </TextAtom>
//           <TextAtom style={styles.valueRight}>{item.noOfRooms ?? '-'}</TextAtom>
//         </View>
//       </View>
//     </View>
//   );
// };

interface FilterFormProps {
  navigation: NavigationType;
  hostelData: any[];
  selectedHostelData: any;
  setSelectedHostelData: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

// const FilterForm = ({
//   navigation,
//   hostelData,
//   selectedHostelData,
//   setSelectedHostelData,
//   applyFilter,
//   clearFilter,
// }: FilterFormProps) => (
//   <View style={styles.filterContainer}>
//     <DropDownOrganism
//       label={strings.hostelManagement.floorDetails.filterOptions}
//       placeholder={strings.hostelManagement.floorDetails.filterOptions}
//       onPress={() =>
//         navigation.navigate('DropDownModal', {
//           name: strings.hostelManagement.floorDetails.filterOptions,
//           Data: hostelData,
//           selectedData: selectedHostelData,
//           setSelectedData: setSelectedHostelData,
//           typeName: 'name',
//           typeId: 'id',
//         })
//       }
//       inputText={selectedHostelData?.name}
//       isMandatory
//       errorMessage=""
//     />

//     <ViewAtom style={styles.buttonRow}>
//       <ButtonOrganism
//         onPress={applyFilter}
//         bttnText={strings.hostelManagement.floorDetails.applyFilter}
//         containerStyle={styles.applyBtn}
//       />
//       <ButtonOrganism
//         onPress={clearFilter}
//         bttnText={strings.hostelManagement.floorDetails.clearFilter}
//         containerStyle={styles.clearBtn}
//         bttnTextStyle={{ color: colors.primary }}
//       />
//     </ViewAtom>
//   </View>
// );

const FloorItemSeparator = () => <View style={styles.itemSeparator} />;

const InfoField = ({ label, value, fullWidth = false }: any) => (
  <View style={[globalStyles.infoCol, !fullWidth && { flex: 1 }]}>
    <TextAtom style={globalStyles.infoLabel}>{label}</TextAtom>
    <TextAtom style={globalStyles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const FloorDetailsList = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const center = useGetCentre();
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [hostelFloorDetailsApi] = useHostelFloorDetailsMutation();
  const [deleteHostelFloorsApi] = useDeleteHostelFloorMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('floor');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [hostelData, setHostelData] = useState<any>([]);
  const [selectedHostelData, setSelectedHostelData] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.floorDetails.title,
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
        hostelFloorDetails(1, true, '');
        getBipardCenter();
        setFirstTimeLoad(false);
      }
    }, [centerSerach, search, firstTimeLoad]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    hostelFloorDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const hostelFloorDetails = (
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
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    hostelFloorDetailsApi(params)
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
      hostelFloorDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    hostelFloorDetails(1, true, '');
  };

  const deleteFloorDetails = (id: any) => {
    setInitialCall(true);
    const params = {
      id: id,
    };
    deleteHostelFloorsApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setFirstTimeLoad(true);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const clearFilter = () => {
    setSelectedHostelData({});
    hostelFloorDetails(1, true, search, []);
  };

  const applyFilter = () => {
    if (!selectedHostelData?.id) {
      Toast.show({
        type: 'error',
        text2: strings.hostelManagement.floorDetails.selectHostelMessage,
      });
      return;
    }

    const filters = [['selectHostelNameId', '=', selectedHostelData.id]];

    hostelFloorDetails(1, true, search, filters);
  };

  const getBipardCenter = () => {
    setInitialCall(true);
    const params = {
      listType: 'filter_hostel_name_for_floor_details',
      bipardCentre: center,
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setHostelData(res.data);
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

  const FloorCard = ({ item, index, navigation }: any) => {
    const isExpanded = expandedItems.has(item.id);

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.deleteConfirmation,
        message: strings.hostelManagement.deleteItemConfirmation,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => deleteFloorDetails(item.id),
        cancelFunction: () => {},
      });
    };

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={[styles.accordionHeader]}
          onPress={() => toggleAccordion(item.id)}
        >
          <View style={styles.headerLeft}>
            <TextAtom
              style={[
                styles.headerTitle,
                isExpanded && styles.headerTitleActive,
              ]}
            >
              {item.nameOfFloors ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete()}
            >
              <SvgDelete />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                navigation.navigate(screensName.AddFloorDetails, {
                  item,
                  onDone: () => hostelFloorDetails(1, true, search),
                });
              }}
            >
              <SvgEditPencile />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionContent}>
            <View style={globalStyles.infoRow}>
              <InfoField
                label={strings.hostelManagement.floorDetails.hostelName}
                value={item.selectHostelName}
              />
              <InfoField
                label={strings.hostelManagement.floorDetails.floorType}
                value={item.floorType}
              />
            </View>

            <View style={globalStyles.infoRow}>
              <InfoField
                label={strings.hostelManagement.floorDetails.noOfRooms}
                value={item.noOfRooms}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderListFloorDetails = ({ item, index }: any) => (
    <FloorCard item={item} index={index} navigation={navigation} />
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <AdminPageHeader title="Hostel Management" navigation={navigation} />
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader
          config={{
            title: 'Floor Details',
            count: data.length,
            showCount: true,
            search: {
              visible: true,
              onPress: () => {
                // Handle search focus or modal
              },
            },
            filter: {
              visible: true,
              onPress: () => {
                // Handle filter modal
              },
            },
            create: {
              visible: true,
              label: '+ Create',
              onPress: () => {
                navigation.navigate(screensName.AddFloorDetails, {
                  onDone: () => hostelFloorDetails(1, true, search),
                });
              },
            },
          }}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListFloorDetails}
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
              hostelFloorDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          const filters = selectedHostelData?.id
            ? [['selectHostelNameId', '=', selectedHostelData.id]]
            : [];

          nextPageAvailable
            ? hostelFloorDetails(page + 1, false, search, filters)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={FloorItemSeparator}
      />
    </SafeAreaView>
  );
};

export default FloorDetailsList;

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
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: '#111827',
  },
  headerTitleActive: {
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  actionBtn: {
    padding: vw(4),
  },
  accordionContent: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(15),
    backgroundColor: '#FFFFFF',
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
