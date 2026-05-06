import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import {
  colors,
  fonts,
  vh,
  vw,
  SvgEditPencile,
  screensName,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  navigation: NavigationType;
}

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const MOCK_DATA = [
  { id: 1, name: 'Correspondence Clerk' },
  { id: 2, name: 'Senior Deputy Collector (SDC)' },
  { id: 3, name: 'Designation 1' },
  { id: 4, name: 'Senior Deputy Collector (SDC)' },
  { id: 5, name: 'Panchayat Rojgar Sevak' },
  { id: 6, name: 'Assistant Architect' },
  { id: 7, name: 'Assistant Town Planning Supervisor' },
  { id: 8, name: 'Procurement Manager' },
  { id: 9, name: 'Senior Deputy Collector (SDC)' },
];

const TraineeDesignationMaster = (props: Props) => {
  const { navigation } = props;

  const [data, setData] = useState(MOCK_DATA);
  const [totalCount, setTotalCount] = useState(40);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const onChangeSearch = (text: string) => {
    setSearch(text);
    const filteredData = MOCK_DATA.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setData(filteredData);
  };

  const onClearSearch = () => {
    setSearch('');
    setData(MOCK_DATA);
  };

  const renderTraineeCard = useCallback(
    ({ item }: any) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.title}>
            {item.name ?? '-'}
          </TextAtom>

          <TouchableAtom
            style={{}}
            onPress={() => {
               navigation.navigate(screensName.AddTraineeDesignation, {
                 item,
                 onDone: () => {
                   // Refresh data
                   console.log('Data refreshed');
                 },
               });
            }}
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>
      </View>
    ),
    [],
  );

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: 'Trainee Designation',
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: {
        visible: true,
        onPress: () => {
          console.log('Filter pressed');
        },
      },
      create: {
        visible: true,
        label: 'Create',
        onPress: () => {
          navigation.navigate(screensName.AddTraineeDesignation, {
            onDone: () => {
              // Refresh data
              console.log('Data refreshed');
            },
          });
        },
      },
    }),
    [totalCount],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <AdminListHeader config={headerConfig} />

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTraineeCard}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        ListEmptyComponent={
          <TextAtom style={styles.emptyText}>No data found</TextAtom>
        }
        onEndReached={() => {}}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default TraineeDesignationMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
  },
  flatListContainer: {
    paddingTop: vh(10),
    paddingBottom: vh(20),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_card_title,
    lineHeight: vh(19),
    marginRight: vw(8),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
});
