import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';

const issuanceData = [
  {
    id: 1,
    bookName: 'Book Name',
    issuedTo: 'Trainee Name',
    issueDate: 'Issue Date',
    returnDate: 'Return Date',
  },
  {
    id: 2,
    bookName: 'Book Name',
    issuedTo: 'Trainee Name',
    issueDate: 'Issue Date',
    returnDate: 'Return Date',
  },
];

const separator = () => <View style={styles.separator} />;

const BookIssuance = () => {
  const headerConfig: AdminListHeaderConfig = {
    title: 'Book Issuance',
    count: issuanceData.length,
    search: {
      visible: true,
      onPress: () => {},
    },
    filter: {
      visible: true,
      onPress: () => {},
    },
    create: {
      visible: true,
      onPress: () => {},
    },
  };

  const renderActions = () => (
    <View style={styles.actionRow}>
      <TouchableAtom style={styles.actionButton} onPress={() => {}}>
        <SvgDelete />
      </TouchableAtom>
      <TouchableAtom style={styles.actionButton} onPress={() => {}}>
        <SvgEditPencile />
      </TouchableAtom>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={1} style={styles.title}>
          {item.bookName}
        </TextAtom>
        {renderActions()}
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <TextAtom style={styles.label}>Issued To</TextAtom>
          <TextAtom numberOfLines={1} style={styles.value}>
            {item.issuedTo}
          </TextAtom>
        </View>
        <View style={styles.infoCol}>
          <TextAtom style={styles.label}>Issue Date</TextAtom>
          <TextAtom numberOfLines={1} style={styles.value}>
            {item.issueDate}
          </TextAtom>
        </View>
        <View style={styles.infoCol}>
          <TextAtom style={styles.label}>Return Date</TextAtom>
          <TextAtom numberOfLines={1} style={styles.value}>
            {item.returnDate}
          </TextAtom>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.content}>
        <AdminListHeader config={headerConfig} />
        <FlatList
          showsVerticalScrollIndicator={false}
          data={issuanceData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={separator}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookIssuance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: vw(16),
    paddingTop: vh(10),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  card: {
    minHeight: vh(118),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: vh(18),
  },
  infoCol: {
    flex: 1,
    paddingRight: vw(10),
  },
  label: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    marginBottom: vh(4),
  },
  value: {
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
