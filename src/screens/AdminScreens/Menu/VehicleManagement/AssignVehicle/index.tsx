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
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';

import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import FloatingButton from '../../../../../components/organisms/FloatingButton';
import {
  useAssignNewDriverMutation,
  useCommonDropdownListMutation,
  useDeleteAssignVehicleMutation,
  useListAssignedUploadMutation,
  useRemovedAssignedUploadMutation,
} from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import moment from 'moment';
import { useAppSelector } from '../../../../../hooks';

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

const AssignVehicle = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const isScreenFocused = useIsFocused();
  const [listAssignVehicleDetailsApi] = useListAssignedUploadMutation();
  const [removeAssignDetailsApi] = useRemovedAssignedUploadMutation();
  const [deleteAssignDetailsApi] = useDeleteAssignVehicleMutation();
  const [commonListApi] = useCommonDropdownListMutation();
  const [assignNewDriverApi] = useAssignNewDriverMutation();

  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>({});
  const [isComingFromDropdown, setIsComingFromDropdown] = useState(false);
  const [driverList, setDriverList] = useState([]);
  const [selectedAssignItem, setSelectedAssignItem] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Assign Vehicle Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (!isScreenFocused) return;

      if (isComingFromDropdown) {
        setIsComingFromDropdown(false);
        return;
      }

      if (showAssignModal) return;

      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listVehicleDetails(1, true, '');
      }
    }, [
      firstTimeLoad,
      isScreenFocused,
      centerSerach,
      search,
      isComingFromDropdown,
      showAssignModal,
    ]),
  );
  useEffect(() => {
    if (!centerSerach?.name) return;
    listVehicleDetails(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }

    return [centerSerach.name];
  };

  const listVehicleDetails = (
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
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listAssignVehicleDetailsApi(params)
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
      listVehicleDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listVehicleDetails(1, true, '');
  };

  const AssignCard = ({ item, index, navigation }: any) => {
    const removeAssignStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id: id,
      };
      removeAssignDetailsApi(params)
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
          deleteVehicleStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const deleteVehicleStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        id: id,
      };
      deleteAssignDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          listVehicleDetails(1, true, search);
          setFirstTimeLoad(true);
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
          navigation.navigate(screensName.DriverMovementHistory, {
            item: item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>

          <View style={{ flexDirection: 'row', gap: vw(15) }}>
            <TouchableAtom
              style={{
                borderWidth: vw(1),
                borderColor: colors.green,
                borderRadius: vw(6),
                padding: vw(3),
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                navigation.navigate(screensName.AddAssignVehicle, {
                  item: item,
                  onDone: () => listVehicleDetails(1, true, search),
                });
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
            </TouchableAtom>

            <TouchableAtom
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
            </TouchableAtom>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Training Name</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Vehicle Name</TextAtom>
            <TextAtom style={styles.value}>{item.vehicleName ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Registration No</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.vehicleRegistrationNo ?? '-'}
            </TextAtom>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Driver Name</TextAtom>
          <TextAtom style={styles.value}>{item.driverName ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Driver Email</TextAtom>
          <TextAtom style={styles.value}>{item.driverEmail ?? '-'}</TextAtom>
        </View>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>From Date</TextAtom>
            <TextAtom style={styles.value}>
              {item.fromDate ? moment(item.fromDate).format('DD-MM-YYYY') : '-'}
            </TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>To Date</TextAtom>
            <TextAtom style={styles.value}>
              {item.toDate ? moment(item.toDate).format('DD-MM-YYYY') : '-'}
            </TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween, { marginTop: vh(8) }]}>
          <TextAtom style={styles.labelRight}>Release/Assign Driver</TextAtom>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.green,
              borderRadius: vw(6),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
              width: vw(50),
              height: vh(30),
            }}
            onPress={() => {
              if (item.isRemoved === 'No') {
                navigation.navigate(screensName.AlertOrganism, {
                  title: 'Release Confirmation',
                  message:
                    'Are you sure you want to release this vehicle assignment?',
                  okText: 'Confirm',
                  double: true,
                  cancelText: strings.cancel,
                  okFunction: () => removeAssignStatus(item.id),
                  cancelFunction: () => {},
                });
              } else {
                setSelectedAssignItem(item);
                setShowAssignModal(true);
                getDriverList();
              }
            }}
          >
            <ImageAtom
              source={
                item.isRemoved === 'No' ? images.release : images.arrowDownLeft
              }
              style={{
                tintColor: colors.green,
                width: vw(22),
                height: vw(22),
              }}
            />
          </TouchableAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderListVehicleDetails = ({ item, index }: any) => {
    return <AssignCard item={item} index={index} navigation={navigation} />;
  };

  const assignDriver = (driverId: any) => {
    setInitialCall(true);
    const params = {
      id: selectedAssignItem.id,
      driverId: driverId,
      drivingLicence: '',
    };
    assignNewDriverApi(params)
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
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const getDriverList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_driver',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setDriverList(res.data);
        setInitialCall(false);
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
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
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
        renderItem={renderListVehicleDetails}
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
              listVehicleDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listVehicleDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddAssignVehicle, {
            onDone: () => listVehicleDetails(1, true, search),
          });
        }}
      />
      {showAssignModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <View
            style={{
              width: '90%',
              backgroundColor: colors.white,
              borderRadius: 10,
              padding: 20,
              position: 'relative',
            }}
          >
            <TouchableAtom
              style={{ position: 'absolute', top: 10, right: 10, padding: 5 }}
              onPress={() => setShowAssignModal(false)}
            >
              <TextAtom style={{ fontSize: vw(22), color: colors.red_2 }}>
                ×
              </TextAtom>
            </TouchableAtom>

            <TextAtom
              style={{
                fontSize: vw(16),
                fontFamily: fonts.Roboto_Bold,
                marginBottom: vh(15),
                color: colors.primary,
                textAlign: 'center',
              }}
            >
              Assign Driver
            </TextAtom>

            {/* Dropdown */}
            <DropDownOrganism
              label=""
              placeholder="Select Driver"
              onPress={() => {
                setIsComingFromDropdown(true);
                navigation.navigate('DropDownModal', {
                  name: 'Drivers',
                  Data: driverList,
                  selectedData: selectedDriver,
                  setSelectedData: (data: any) => setSelectedDriver(data),
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={selectedDriver?.name}
              contentContainerStyle={{ width: '100%' }}
              containerStyle={{ width: '100%' }}
              downArrowStyle={{ marginLeft: vh(-50) }}
            />

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 25,
              }}
            >
              <TouchableAtom
                style={{
                  paddingVertical: vh(8),
                  paddingHorizontal: vw(20),
                  backgroundColor: colors.green,
                  borderRadius: vw(6),
                }}
                onPress={() => {
                  if (!selectedDriver) {
                    Toast.show({
                      type: 'error',
                      text2: 'Select driver',
                    });
                    return;
                  }

                  setShowAssignModal(false);

                  assignDriver(selectedDriver.id);
                }}
              >
                <TextAtom
                  style={{
                    color: colors.white,
                    fontFamily: fonts.Roboto_Medium,
                  }}
                >
                  Assign
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AssignVehicle;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
    paddingBottom: vh(50),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
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
});
