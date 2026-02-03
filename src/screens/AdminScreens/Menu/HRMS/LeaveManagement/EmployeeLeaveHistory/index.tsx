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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useHrmsListEmployeeMutation } from '../../../../../../injectEndpoints/hrmsEndpoints';

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

interface TrainingCardProps {
  item: any;
  index: number;
  isSelected: boolean;
  onSelect: (item: any) => void;
  onEdit: (item: any) => void;
  navigation: NavigationType;
}

const TrainingCard = React.memo(
  ({
    item,
    index,
    onSelect,
    isSelected,
    onEdit,
    navigation,
  }: TrainingCardProps) => {
    return (
      <TouchableAtom
        activeOpacity={0.8}
        onPress={() => onSelect(item)}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
          <View style={styles.actionRow}>
            <TouchableAtom
              style={styles.editBtn}
              onPress={() => {
                navigation.navigate(screensName.LeaveHistoryDetails, {
                  employeeId: item.employeeId,
                });
              }}
            >
              <ImageAtom source={images.eyeOpen} style={styles.editIcon} />
            </TouchableAtom>
            <TouchableAtom style={styles.editBtn} onPress={() => onEdit(item)}>
              <ImageAtom source={images.nextFilled} style={styles.editIcon} />
            </TouchableAtom>
          </View>
        </View>

        <TextAtom style={styles.label}>Employee Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {`${item.name}${item.employeeId}`}
        </TextAtom>

        <TextAtom style={styles.label}>Vendor Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.vendorName ?? '-'}
        </TextAtom>
      </TouchableAtom>
    );
  },
);

const FloorItemSeparator = () => <View style={styles.itemSeparator} />;

const EmployeeLeaveHistory = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listApi] = useHrmsListEmployeeMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Employee Leave Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTrainingCategoryDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingCategoryDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const listTrainingCategoryDetails = async (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: centreFilter ?? [],
    };

    listApi(params)
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

        const tCount = res?.data?.totalCount ?? 0;
        setTotalCount(tCount);

        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < tCount);
        setPage(pageNumber);
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
      listTrainingCategoryDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingCategoryDetails(1, true, '');
  };

  const toggleSelect = (item: any) => {
    setSelectedItems((prev: any) => {
      const exists = prev.some((p: any) => p.id === item.id);

      return exists
        ? prev.filter((p: any) => p.id !== item.id)
        : [...prev, item];
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === totalCount) {
      setSelectedItems([]);
      listTrainingCategoryDetails(1, true, search);
    } else {
      setInitialCall(true);
      listApi({
        search,
        sort: {
          attributes: ['createdDate'],
          sorts: ['desc'],
        },
        filters: [],
        pageNo: 1,
        itemsPerPage: totalCount,
        bipardCentre: getCentreFilter() ?? [],
      })
        .unwrap()
        .then((res: any) => {
          const fullData = res.data?.data ?? [];
          setData(fullData);
          setSelectedItems(fullData);
          setNextPageAvailable(false);
          setInitialCall(false);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Something went wrong',
          });
        });
    }
  };

  const handleCreditLeave = () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Select At least one employee',
      });
    } else {
      const selectedEmployeeIds = selectedItems.map((item: any) => item.id);
      navigation.navigate(screensName.CreditLeaveBalance, {
        selectedEmployeeIds,
        onDone: () => {
          setSelectedItems([]);
          listTrainingCategoryDetails(1, true, search);
        },
      });
    }
  };

  const onEditPress = (item: any) => {
    navigation.navigate(screensName.AvailLeave, {
      item,
      onDone: () => listTrainingCategoryDetails(1, true, search),
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
          marginTop: vh(10),
        }}
      >
        <TouchableAtom style={styles.filterButton} onPress={handleCreditLeave}>
          <TextAtom style={styles.filterText}>{'Credit Leave'}</TextAtom>
        </TouchableAtom>
        <TouchableAtom style={styles.filterButton} onPress={handleSelectAll}>
          <TextAtom style={styles.filterText}>
            {selectedItems?.length === totalCount
              ? 'Unselect All'
              : 'Select All'}
          </TextAtom>
        </TouchableAtom>

        <TouchableAtom style={styles.filterButton} onPress={() => {}}>
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={'Centers'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Center',
              Data: [
                { id: 'All Centers', name: 'All Centers' },
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
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
        renderItem={({ item, index }) => (
          <TrainingCard
            item={item}
            index={index}
            isSelected={selectedItems.some((x: any) => x.id === item.id)}
            onSelect={toggleSelect}
            onEdit={onEditPress}
            navigation={navigation}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          pagination && nextPageAvailable ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: vh(15) }}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTrainingCategoryDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          if (nextPageAvailable && !pagination) {
            setPagination(true);
            listTrainingCategoryDetails(page + 1, false, search);
          }
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={FloorItemSeparator}
      />
    </SafeAreaView>
  );
};

export default EmployeeLeaveHistory;

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

  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#F3F8FF',
  },

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
    marginBottom: vh(5),
    marginRight: vw(10),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
    backgroundColor: colors.white,
  },

  filterText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  editBtn: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
  },

  editIcon: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },

  itemSeparator: {
    height: vh(10),
  },
  actionRow: {
    flexDirection: 'row',
    gap: vw(15),
  },
});
