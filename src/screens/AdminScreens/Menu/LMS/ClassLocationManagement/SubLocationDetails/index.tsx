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
  LayoutAnimation,
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
import {
  useBedDetailsRoomMutation,
  useDeleteBedDetailsRoomMutation,
  useUpdateBedDetailsRoomMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import {
  useDeleteFacultyDetailsMutation,
  useListClassLocationDetailsMutation,
  useListClassSubLocationDetailsMutation,
  useListFacultyDetailsMutation,
  useUpdateClassLocationDetailsMutation,
  useUpdateClassSubLocationDetailsMutation,
  useUpdateFacultyDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
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

const SubLocationDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFacultyDetailsApi] = useListClassSubLocationDetailsMutation();
  const [updateFacultyDetailsApi] = useUpdateClassSubLocationDetailsMutation();
  const [deletebedDetailsRoomApi] = useDeleteFacultyDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [facultyTypeList, setFacultyTypeList] = useState<any>([]);
  const [departmentList, setDepartmentList] = useState<any>([]);
  const [organisationList, setOrganisationList] = useState<any>([]);
  const [selectedFacultyType, setSelectedFacultyType] = useState<any>({});
  const [selectedDepartment, setSelectedDepartment] = useState<any>({});
  const [selectedOrganisation, setSelectedOrganisation] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Sub Location Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyDetails(1, true, '');
        getFacultyType();
        getDepartment();
        getOrganization();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }

    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listFacultyDetails = (
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
        attributes: ['created_at'],
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

    listFacultyDetailsApi(params)
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
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listFacultyDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listFacultyDetails(1, true, '');
  };

  const BedCard = ({ item, index, navigation }: any) => {
    const [statusValue, setStatusValue] = useState(item.status ?? 'Active');
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const onSelectStatus = (newStatus: string) => {
      setShowStatusMenu(false);

      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: 'Status Change Confirmation',
        message: 'Are you sure you want to change this item?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          updateStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id_for_change_sub_location_status: id,
      };
      updateFacultyDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data?.message.message,
          });
          setInitialCall(false);
          listFacultyDetails(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Something went wrong',
          });
        });
    };

    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this item?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteBedHostelRoom(item.facultyId);
        },
        cancelFunction: () => {},
      });
    };

    const deleteBedHostelRoom = (id: any) => {
      setInitialCall(true);
      const params = {
        faculty_id: id,
      };
      deletebedDetailsRoomApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          listFacultyDetails(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || 'Something went wrong',
          });
        });
    };

    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.LocationSubDetailDetails, {
            data: item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>

          <View style={{ flexDirection: 'row', gap: vw(15) }}>
            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                // navigation.navigate(screensName.AddFacultyDetails, {
                //   item: item,
                // });
              }}
            >
              <ImageAtom
                source={images.edit_pencil}
                style={{
                  tintColor: colors.green,
                  width: vw(15),
                  height: vw(15),
                }}
              />
            </TouchableAtom> */}

            {/* <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.red_2,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => handleDelete()}
            >
              <ImageAtom
                source={images.delete}
                style={{ width: vw(15), height: vw(15) }}
              />
            </TouchableAtom> */}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Location Name</TextAtom>
          <TextAtom style={styles.value}>
            {item.selectLocationName ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Sub Location Name</TextAtom>
          <TextAtom style={styles.value}>
            {item.subLocationName ?? '-'}
          </TextAtom>
        </View>
        {showStatusMenu && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(false)}
            style={styles.overlay}
          />
        )}

        <View style={{ marginTop: vh(0), zIndex: 999 }}>
          <TextAtom style={styles.label}>Status</TextAtom>

          <TouchableAtom
            onPress={() => setShowStatusMenu(!showStatusMenu)}
            style={[
              styles.statusBox,
              statusValue === 'Active' ? styles.activeBox : styles.inActiveBox,
            ]}
          >
            <TextAtom
              style={[
                styles.statusText,
                statusValue === 'Active'
                  ? styles.activeText
                  : styles.inActiveText,
              ]}
            >
              {statusValue}
            </TextAtom>
            <ImageAtom source={images.downArrow} />
          </TouchableAtom>

          {showStatusMenu && (
            <View style={styles.dropMenu}>
              <TouchableAtom
                style={styles.dropItem}
                onPress={() => onSelectStatus('Active')}
              >
                <TextAtom style={{ color: colors.black }}>Active</TextAtom>
              </TouchableAtom>

              <TouchableAtom
                style={styles.dropItem}
                onPress={() => onSelectStatus('Inactive')}
              >
                <TextAtom style={{ color: colors.black }}>In-Active</TextAtom>
              </TouchableAtom>
            </View>
          )}
        </View>
      </TouchableAtom>
    );
  };

  const renderListBedDetails = ({ item, index }: any) => {
    return <BedCard item={item} index={index} navigation={navigation} />;
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Faculty Type'}
        placeholder={'Faculty Type'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Faculty Type',
            Data: facultyTypeList,
            selectedData: selectedFacultyType,
            setSelectedData: (data: any) => {
              setSelectedFacultyType(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedFacultyType?.name}
      />

      <DropDownOrganism
        label={'Department'}
        placeholder={'Department'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Department',
            Data: departmentList,
            selectedData: selectedDepartment,
            setSelectedData: (data: any) => {
              setSelectedDepartment(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedDepartment?.name}
      />

      <DropDownOrganism
        label={'Organisation'}
        placeholder={'Organisation'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Organisation',
            Data: organisationList,
            selectedData: selectedOrganisation,
            setSelectedData: (data: any) => {
              setSelectedOrganisation(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedOrganisation?.name}
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

  const clearFilter = () => {
    setSelectedFacultyType({});
    setSelectedDepartment({});
    setSelectedOrganisation({});
    listFacultyDetails(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFacultyType?.id) {
      filters.push(['facultyType', '=', selectedFacultyType.id]);
    }

    if (selectedDepartment?.id) {
      filters.push(['department', '=', selectedDepartment.id]);
    }

    if (selectedOrganisation?.id) {
      filters.push(['facultyOrganisation', '=', selectedOrganisation.id]);
    }

    listFacultyDetails(1, true, search, filters);
  };

  const getFacultyType = () => {
    setInitialCall(true);
    const params = {
      listType: 'faculty_category',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFacultyTypeList(res.data);
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

  const getDepartment = () => {
    setInitialCall(true);
    const params = {
      listType: 'filter_by_faculty_department',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setDepartmentList(res.data);
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

  const getOrganization = () => {
    setInitialCall(true);
    const params = {
      listType: 'filter_by_faculty_organisation',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setOrganisationList(res.data);
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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {/* <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
        </TextAtom>
      </TouchableAtom>
      {showFilter && <FilterForm />} */}
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
        renderItem={renderListBedDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
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
              listFacultyDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
      {/* <FloatingButton
        onButtonPress={() => {
          // navigation.navigate(screensName.AddFacultyDetails);
        }}
      /> */}
    </SafeAreaView>
  );
};

export default SubLocationDetails;

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
  thumbnail: {
    width: 70,
    height: 70,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    marginTop: 6,
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
    backgroundColor: '#ddffdd',
    borderColor: '#22aa22',
  },

  inActiveBox: {
    backgroundColor: '#ffdddd',
    borderColor: '#cc2222',
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: '#008800' },
  inActiveText: { color: '#bb0000' },

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
    backgroundColor: 'transparent',
    zIndex: 998,
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
});
