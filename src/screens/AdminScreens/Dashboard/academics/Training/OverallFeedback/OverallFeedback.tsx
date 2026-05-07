import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw, SvgStar } from '../../../../../../constants';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import SubTab from '../../../../../../components/molecules/SubTab';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';

interface Props {
  navigation: any;
}

const feedbackData = [
  {
    id: 'fb_01',
    training_name: 'Training Name here',
    details: {
      batch_name: '1',
      suggestions: 'Good',
    },
    ratings: [
      { label: 'Course Content Rating', value: 5, type: 'star' },
      { label: 'Faculty Rating', value: 5, type: 'star' },
      { label: 'Mess Rating', value: 1, type: 'star' },
    ],
  },
];

const tabs = [
  { label: 'Batch Details', value: 'batch_details' },
  { label: 'Course Report', value: 'course_report' },
  { label: 'Training Wise overall feedback', value: 'overall_feedback' },
];

const OverallFeedback = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('overall_feedback');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: 'Training Wise overall feedback',
      count: 40,
      showCount: true,
      search: {
        visible: true,
        onPress: () => {},
      },
      filter: {
        visible: true,
        onPress: () => setIsFilterOpen(true),
      },
    }),
    [],
  );

  const renderStars = (value: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <SvgStar
            key={star}
            width={vw(12)}
            height={vw(12)}
            fill={
              star <= value ? colors.primary_blue : colors.new_ui_card_border
            }
          />
        ))}
      </View>
    );
  };

  const renderFeedbackCard = ({ item }: any) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackInfo}>
        <TextAtom numberOfLines={1} style={styles.trainingTitle}>
          {item.training_name}
        </TextAtom>
        <View style={styles.detailsRow}>
          <TextAtom style={styles.detailLabel}>Batch: </TextAtom>
          <TextAtom style={styles.detailValue}>
            {item.details.batch_name}
          </TextAtom>
          <TextAtom style={styles.detailLabel}> Suggestions: </TextAtom>
          <TextAtom style={styles.detailValue}>
            {item.details.suggestions}
          </TextAtom>
        </View>
        <View style={styles.ratingsContainer}>
          {item.ratings.map((rating: any, index: number) => (
            <View key={index} style={styles.ratingItem}>
              <TextAtom style={styles.ratingLabel}>{rating.label}</TextAtom>
              {renderStars(rating.value)}
            </View>
          ))}
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
          data={feedbackData}
          keyExtractor={item => item.id}
          renderItem={renderFeedbackCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <AdminBottomModal
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filters"
      >
        <View style={styles.filterContent}>
          <FormDropdownFieldWithTitle
            title="Select Training*"
            placeholder="Select"
            data={[]}
            onChange={() => {}}
          />
          <FormDropdownFieldWithTitle
            title="Select Batch*"
            placeholder="Select"
            data={[]}
            onChange={() => {}}
          />
          <View style={styles.footerButtons}>
            <TouchableAtom
              style={[styles.footerButton, styles.secondaryButton]}
              onPress={() => setIsFilterOpen(false)}
            >
              <TextAtom style={styles.secondaryButtonText}>Clear</TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={[styles.footerButton, styles.primaryButton]}
              onPress={() => setIsFilterOpen(false)}
            >
              <TextAtom style={styles.primaryButtonText}>Apply</TextAtom>
            </TouchableAtom>
          </View>
        </View>
      </AdminBottomModal>
    </SafeAreaView>
  );
};

export default OverallFeedback;

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
  feedbackCard: {
    minHeight: vh(100),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(13),
  },
  feedbackInfo: {
    flex: 1,
  },
  trainingTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: colors.new_ui_heading,
    marginBottom: vh(8),
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vh(10),
  },
  detailLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
  },
  detailValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.new_ui_heading,
    marginRight: vw(10),
  },
  ratingsContainer: {
    marginTop: vh(5),
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(6),
  },
  ratingLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: vh(10),
  },
  filterContent: {
    paddingBottom: vh(20),
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(20),
  },
  footerButton: {
    flex: 1,
    height: vh(50),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: vw(5),
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary_blue,
  },
  primaryButton: {
    backgroundColor: colors.primary_blue,
  },
  secondaryButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.primary_blue,
  },
  primaryButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.white,
  },
});
