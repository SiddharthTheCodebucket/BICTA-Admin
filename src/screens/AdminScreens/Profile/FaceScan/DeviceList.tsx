import React, { useLayoutEffect, useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  images,
  screensName,
  vh,
  vw,
} from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import { useAppSelector } from '../../../../hooks';
import { useListDeviceMutation } from '../../../../injectEndpoints/faceEndpoints';
import { useFocusEffect } from '@react-navigation/native';
import { useGetCentre } from '../../../../hooks/useGetCentre';
import { matchPermission } from '../../../../utils/PermissionChecker/index';

interface Props {
  navigation: NavigationType;
}

const DeviceList = ({ navigation }: Props) => {
  const { crediantialData } = useAppSelector((state: any) => state.Auth);
  const globalPermissions = crediantialData?.globalPermissions || [];
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const hasUpdatePermission = matchPermission(
    globalPermissions?.[0]?.permissions || [],
    { name: 'UPDATE DEVICE' },
  );

  const bipardCentre = useGetCentre();
  const [listDeviceApi, { isLoading }] = useListDeviceMutation();
  const [devices, setDevices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Registered Devices');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const fetchDevices = useCallback(
    async (pageNo = 1, refresh = false) => {
      const params: any = {
        search: '',
        sort: { attributes: ['id'], sorts: ['desc'] },
        filters: [],
        pageNo: pageNo,
        itemsPerPage: 10,
      };

      // Filter by tenantId if not 3 (Superadmin)
      if (tenantId !== 3) {
        params.filters.push(['tenantId', '=', tenantId]);
      }

      // Add bipardCentre if available
      if (bipardCentre) {
        params.bipardCentre = bipardCentre;
      }

      try {
        const res = await listDeviceApi(params).unwrap();
        if (res?.data?.data) {
          if (refresh || pageNo === 1) {
            setDevices(res.data.data);
          } else {
            setDevices(prev => [...prev, ...res.data.data]);
          }
          setTotalCount(res.data.totalCount || 0);
        }
      } catch (err) {
        console.log('List Device Error:', err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [listDeviceApi, tenantId, bipardCentre],
  );

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchDevices(1, true);
    }, [fetchDevices]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchDevices(1, true);
  };

  const loadMore = () => {
    if (!isLoading && devices.length < totalCount) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDevices(nextPage);
    }
  };

  const openMap = (lat: string, lng: string) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    const label = 'Device Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.deviceCard}>
      <TouchableOpacity
        style={styles.infoArea}
        onPress={() => openMap(item.latitude, item.longitude)}
      >
        <Text style={styles.locationName}>{item.locationName}</Text>
        <Text style={styles.coordinates}>
          Lat: {item.latitude}, Long: {item.longitude}
        </Text>
      </TouchableOpacity>

      {hasUpdatePermission && (
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={() =>
            navigation.navigate(screensName.DeviceRegistration, {
              deviceData: item,
            })
          }
        >
          <Image
            source={images.edit_pencil}
            style={styles.editIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={isLoading && page === 1 && !isRefreshing} />
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading && page === 1 ? 'Loading...' : 'No devices found'}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default DeviceList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  listContent: {
    padding: vw(16),
  },
  deviceCard: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    padding: vw(16),
    marginBottom: vh(12),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoArea: {
    flex: 1,
  },
  locationName: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
    marginBottom: vh(4),
  },
  coordinates: {
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
  },
  deviceId: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Medium,
    color: colors.lightGrey,
    marginTop: vh(4),
  },
  editIconButton: {
    padding: vw(8),
  },
  editIcon: {
    width: vw(20),
    height: vw(20),
    tintColor: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    fontSize: vw(16),
    color: colors.grey,
  },
});
