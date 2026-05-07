import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  screensName,
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import SubTab from '../../../../../../components/molecules/SubTab';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';

interface Props {
  navigation: any;
}

type LibraryTab = 'section' | 'book';

const sectionData = [
  { id: 1, sectionName: 'Section Name', subSectionName: 'Name here' },
  { id: 2, sectionName: 'Section Name', subSectionName: 'Name here' },
  { id: 3, sectionName: 'Section Name', subSectionName: 'Name here' },
  { id: 4, sectionName: 'Section Name', subSectionName: 'Name here' },
  { id: 5, sectionName: 'Section Name', subSectionName: 'Name here' },
];

const bookData = [
  {
    id: 1,
    categoryName: 'Book Category Name',
    sectionName: 'Last Babal',
    subSectionName: 'Rice',
  },
  {
    id: 2,
    categoryName: 'Book Category Name',
    sectionName: 'Last Babal',
    subSectionName: 'Rice',
  },
];

const tabs = [
  { label: 'Section Master', value: 'section' },
  { label: 'Book Master', value: 'book' },
];

const ListItemSeparator = () => <View style={styles.separator} />;

const LibraryMaster = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('section');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSections = useMemo(
    () =>
      sectionData.filter(item =>
        `${item.sectionName} ${item.subSectionName}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredBooks = useMemo(
    () =>
      bookData.filter(item =>
        `${item.categoryName} ${item.sectionName} ${item.subSectionName}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  const data = activeTab === 'section' ? filteredSections : filteredBooks;

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: activeTab === 'section' ? 'Section Master' : 'Book Category Name',
      count: 40,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: {
        visible: true,
        onPress: () => {},
      },
      create: {
        visible: true,
        onPress: () =>
          navigation.navigate(screensName.AddLibraryMaster, {
            mode: activeTab,
          }),
      },
    }),
    [activeTab, navigation],
  );

  const renderActions = (item: any) => (
    <View style={styles.actionRow}>
      <TouchableAtom style={styles.actionButton} onPress={() => {}}>
        <SvgDelete />
      </TouchableAtom>
      <TouchableAtom
        style={styles.actionButton}
        onPress={() =>
          navigation.navigate(screensName.AddLibraryMaster, {
            mode: activeTab,
            item,
          })
        }
      >
        <SvgEditPencile />
      </TouchableAtom>
    </View>
  );

  const renderSectionCard = ({ item }: any) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionInfo}>
        <TextAtom numberOfLines={1} style={styles.sectionTitle}>
          {item.sectionName}
        </TextAtom>
        <TextAtom numberOfLines={1} style={styles.subSectionText}>
          <TextAtom style={styles.subSectionLink}>Sub section</TextAtom>
          {' - '}
          {item.subSectionName}
        </TextAtom>
      </View>
      {renderActions(item)}
    </View>
  );

  const renderBookCard = ({ item }: any) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <TextAtom numberOfLines={1} style={styles.bookTitle}>
          {item.categoryName}
        </TextAtom>
        {renderActions(item)}
      </View>
      <View style={styles.bookInfoRow}>
        <View style={styles.bookInfoCol}>
          <TextAtom style={styles.infoLabel}>Section Name</TextAtom>
          <TextAtom numberOfLines={1} style={styles.infoValue}>
            {item.sectionName}
          </TextAtom>
        </View>
        <View style={styles.bookInfoCol}>
          <TextAtom style={styles.infoLabel}>Sub Section Name</TextAtom>
          <TextAtom numberOfLines={1} style={styles.infoValue}>
            {item.subSectionName}
          </TextAtom>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <SubTab tabs={tabs} activeTab={activeTab} onTabChange={value => {
        setActiveTab(value as LibraryTab);
        setSearch('');
        setShowSearch(false);
      }} />
      <View style={styles.content}>
        <AdminListHeader config={headerConfig} />
        {showSearch && (
          <SearchBoxOrganism
            onChangeText={setSearch}
            searchText={search}
            onPressCross={() => setSearch('')}
            searchBox={styles.searchBox}
          />
        )}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={
            activeTab === 'section' ? renderSectionCard : renderBookCard
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ListItemSeparator}
        />
      </View>
    </SafeAreaView>
  );
};

export default LibraryMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  sectionCard: {
    minHeight: vh(66),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(13),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionInfo: {
    flex: 1,
    paddingRight: vw(12),
  },
  sectionTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
    marginBottom: vh(4),
  },
  subSectionText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
  },
  subSectionLink: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.primary_blue,
  },
  bookCard: {
    minHeight: vh(118),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  bookInfoRow: {
    flexDirection: 'row',
    marginTop: vh(18),
  },
  bookInfoCol: {
    flex: 1,
    paddingRight: vw(10),
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    marginBottom: vh(4),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginLeft: vw(10),
  },
  separator: {
    height: vh(10),
  },
});
