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
  Linking,
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
  vh,
  vw,
} from '../../../../../constants';
import { useAppSelector } from '../../../../../hooks';
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
  useDeleteVehicleDetailsMutation,
  useListVehicleDetailsMutation,
  useUpdateVehicleDetailsMutation,
} from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';

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

const VehicleRegistration = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [listVehicleDetailsApi] = useListVehicleDetailsMutation();
  const [updateVehicleDetailsApi] = useUpdateVehicleDetailsMutation();
  const [deleteVehicleDetailsApi] = useDeleteVehicleDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Vehicle Registration Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listVehicleDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
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

    listVehicleDetailsApi(params)
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

  const VehicleCard = ({ item, index, navigation }: any) => {
    const [statusValue] = useState(item.status ?? 'Active');
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
          updateVehicleStatus(item.id);
        },
        cancelFunction: () => {},
      });
    };

    const updateVehicleStatus = (id: any) => {
      setInitialCall(true);
      const params = {
        idForChangeStatus: id,
      };
      updateVehicleDetailsApi(params)
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
      deleteVehicleDetailsApi(params)
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

    return (
      <View style={styles.card}>
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
                navigation.navigate(screensName.AddVehicle, {
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

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Vehicle Name</TextAtom>
            <TextAtom style={styles.value}>{item.vehicleName ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Registration No</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.registrationNo ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Owner Name</TextAtom>
            <TextAtom style={styles.value}>{item.ownerName ?? '-'}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Owner Contact</TextAtom>
            <TextAtom style={styles.valueRight}>
              {item.ownerContactNo ?? '-'}
            </TextAtom>
          </View>
        </View>

        {/* RC + QR */}
        <View style={[styles.rowBetween, { marginTop: vh(15) }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Vehicle RC</TextAtom>
            {item.rcFile ? (
              <TouchableAtom
                onPress={() => Linking.openURL(item.rcFile)}
                style={{ marginTop: 5 }}
              >
                <ImageAtom
                  source={{ uri: item.rcFile }}
                  style={styles.thumbnail}
                />
              </TouchableAtom>
            ) : (
              <ViewAtom
                style={[
                  styles.thumbnail,
                  { alignItems: 'center', justifyContent: 'center' },
                ]}
              >
                <TextAtom style={styles.value}>No File</TextAtom>
              </ViewAtom>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.label}>Vehicle QR</TextAtom>
            <ImageAtom
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${item.qrCode}`,
              }}
              style={[styles.thumbnail, { alignSelf: 'flex-end' }]}
            />
          </View>
        </View>

        {showStatusMenu && (
          <TouchableOpacity
            onPress={() => setShowStatusMenu(false)}
            style={styles.overlay}
          />
        )}

        <View style={{ marginTop: vh(15), zIndex: 999 }}>
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
                onPress={() => onSelectStatus('In-Active')}
              >
                <TextAtom style={{ color: colors.black }}>In-Active</TextAtom>
              </TouchableAtom>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderListVehicleDetails = ({ item, index }: any) => {
    return <VehicleCard item={item} index={index} navigation={navigation} />;
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
          navigation.navigate(screensName.AddVehicle, {
            onDone: () => listVehicleDetails(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default VehicleRegistration;

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
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
