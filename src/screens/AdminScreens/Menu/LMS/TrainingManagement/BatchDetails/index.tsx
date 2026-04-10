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

import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

const BatchDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listapi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});
  const [showSearch, setShowSearch] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'Current Training' | 'Complete Training'
  >('Current Training');

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Training Management',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listBatchDetais();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listBatchDetais();
  }, [centerSerach]);

  useEffect(() => {
    applyTabFilter(data);
  }, [activeTab]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const applyTabFilter = (fullList: any[]) => {
    if (activeTab === 'Current Training') {
      setFilteredData(fullList.filter(item => item.isCourseActive === 'Yes'));
    } else {
      setFilteredData(fullList.filter(item => item.isCourseActive === 'No'));
    }
  };

  const listBatchDetais = () => {
    setInitialCall(true);

    const centreFilter = getCentreFilter();

    const searchValue = search?.trim() ? `%${search.trim()}%` : `%%`;

    const params: any = {
      listType: 'batch_details_training_name_list',
      replacements: [searchValue],
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listapi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        setData(newData);
        applyTabFilter(newData); // ⭐ Apply tab filter on fresh list
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
      listBatchDetais();
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listBatchDetais();
  };

  const renderCard = ({ item }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.BatchDetailsList, { item: item });
      }}
    >
      <TextAtom numberOfLines={0} style={styles.label}>
        {item.name}
      </TextAtom>
      <TextAtom style={styles.value}>{item.totalBatch} Batches</TextAtom>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>Batch Details</TextAtom>
          <TextAtom style={styles.headerCount}>({filteredData.length})</TextAtom>
        </View>
        <View style={styles.actionsRow}>
          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => setShowSearch(prev => !prev)}
          >
            <ImageAtom source={images.search} style={styles.actionIcon} />
          </TouchableAtom>
          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => {
              if (crediantialData.user[0].tenantId !== 3) return;
              navigation.navigate('DropDownModal', {
                name: 'Center',
                Data: [
                  { id: 'All Centers', name: 'All Centers' },
                  { id: 'Gaya', name: 'Gaya' },
                  { id: 'Patna', name: 'Patna' },
                ],
                selectedData: centerSerach,
                setSelectedData: setCenterSerach,
                typeName: 'name',
                typeId: 'id',
              });
            }}
          >
            <View style={styles.filterGlyph}>
              <View style={[styles.filterLine, { width: vw(12) }]} />
              <View style={[styles.filterLine, { width: vw(9) }]} />
              <View style={[styles.filterLine, { width: vw(6) }]} />
            </View>
          </TouchableAtom>
        </View>
      </View>

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={{ marginTop: vh(10) }}
        />
      )}

      <View style={styles.tabRow}>
        {['Current Training', 'Complete Training'].map(tab => (
          <TouchableAtom
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <TextAtom
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </TextAtom>
          </TouchableAtom>
        ))}
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredData} // ⭐ Updated here
        renderItem={renderCard}
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
            style={{ marginTop: vh(10) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listBatchDetais();
            }}
          />
        }
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default BatchDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  headerRow: {
    marginTop: vh(10),
    paddingHorizontal: vw(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(8),
  },
  actionIcon: {
    width: vw(17),
    height: vw(17),
    tintColor: colors.new_ui_icon,
  },
  filterGlyph: {
    alignItems: 'flex-end',
  },
  filterLine: {
    height: vh(2),
    backgroundColor: colors.new_ui_icon,
    marginVertical: vh(1),
    borderRadius: vw(2),
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: vw(10),
    marginTop: vh(8),
  },
  tabButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: '#EAEAEA',
    borderRadius: vw(6),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  activeTabText: {
    color: colors.white,
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
});
