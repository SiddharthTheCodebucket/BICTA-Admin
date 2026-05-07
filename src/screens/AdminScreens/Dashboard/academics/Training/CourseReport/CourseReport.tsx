import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  vh,
  vw,
  SvgDelete,
  SvgDownload,
} from '../../../../../../constants';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import SubTab from '../../../../../../components/molecules/SubTab';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';

interface Props {
  navigation: any;
}

const reportData = [
  {
    id: 'report_01',
    title: 'Training Name here',
    subtitle: 'Created By',
    author: 'BIPARD Gaya',
  },
  {
    id: 'report_02',
    title: 'Training Name here',
    subtitle: 'Created By',
    author: 'BIPARD Gaya',
  },
  {
    id: 'report_03',
    title: 'Training Name here',
    subtitle: 'Created By',
    author: 'BIPARD Gaya',
  },
];

const tabs = [
  { label: 'Batch Details', value: 'batch_details' },
  { label: 'Course Report', value: 'course_report' },
  { label: 'Training Wise overall feedback', value: 'feedback' },
];

const CourseReport = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('course_report');

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: 'Course Report',
      count: 40,
      showCount: true,
      search: {
        visible: true,
        onPress: () => {},
      },
      filter: {
        visible: true,
        onPress: () => {},
      },
    }),
    [],
  );

  const renderActions = (item: any) => (
    <View style={styles.actionRow}>
      <TouchableAtom
        style={[styles.actionButton]}
        onPress={() => {
          console.log('Delete report:', item.id);
        }}
      >
        <SvgDelete />
      </TouchableAtom>
      <TouchableAtom
        style={[styles.actionButton]}
        onPress={() => {
          console.log('Download PDF:', item.id);
        }}
      >
        <SvgDownload />
      </TouchableAtom>
    </View>
  );

  const renderReportCard = ({ item }: any) => (
    <View style={styles.reportCard}>
      <View style={styles.reportInfo}>
        <TextAtom numberOfLines={1} style={styles.reportTitle}>
          {item.title}
        </TextAtom>
        <View style={styles.authorRow}>
          <TextAtom style={styles.reportSubtitle}>{item.subtitle}</TextAtom>
          <TextAtom style={styles.authorText}>{item.author}</TextAtom>
        </View>
      </View>
      {renderActions(item)}
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.content}>
        <AdminListHeader config={headerConfig} />
        <FlatList
          showsVerticalScrollIndicator={false}
          data={reportData}
          keyExtractor={item => item.id}
          renderItem={renderReportCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default CourseReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: vw(16),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  reportCard: {
    minHeight: vh(66),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(13),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportInfo: {
    flex: 1,
    paddingRight: vw(12),
  },
  reportTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: colors.new_ui_heading,
    marginBottom: vh(4),
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportSubtitle: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    marginRight: vw(4),
  },
  authorText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.new_ui_heading,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(8),
  },
  separator: {
    height: vh(10),
  },
});
