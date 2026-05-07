import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  FormDropdownFieldWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormSwitchWithTitle,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../components/templates';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../components/organisms/AdminListHeader';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import {
  colors,
  fonts,
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../constants';
import { globalStyles } from '../../../../../utils/globalStyles';

export type CommsSupportTabKey =
  | 'category'
  | 'subCategory'
  | 'issueType'
  | 'questionFields';

export type CommsSupportItem = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  issueType?: string;
  priority?: string;
  assignTo?: string;
  createdDate?: string;
  questionType?: string;
  required?: string;
  status: 'Active' | 'Inactive';
};

type ListScreenProps = {
  type: CommsSupportTabKey;
  navigation: any;
  addRouteName: string;
};

type FormScreenProps = {
  type: CommsSupportTabKey;
  route: any;
  navigation: NavigationType;
};

const statusOptions = [
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
];

const dropdownOptions = [
  { id: 1, name: 'Category Name' },
  { id: 2, name: 'Testing' },
];

const questionTypeOptions = [
  { id: 'Objective', name: 'Objective' },
  { id: 'Subjective', name: 'Subjective' },
];

const requiredOptions = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
];

const priorityOptions = [
  { id: 'High', name: 'High' },
  { id: 'Medium', name: 'Medium' },
  { id: 'Low', name: 'Low' },
];

const mockItems: Record<CommsSupportTabKey, CommsSupportItem[]> = {
  category: [
    {
      id: 1,
      title: 'Category Name',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      createdDate: '19/01/2026',
      status: 'Inactive',
    },
    {
      id: 2,
      title: 'Category Name',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      createdDate: '19/01/2026',
      status: 'Inactive',
    },
  ],
  subCategory: [
    {
      id: 1,
      title: 'Category Name',
      subCategory: 'Name',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      createdDate: '19/01/2026',
      status: 'Inactive',
    },
    {
      id: 2,
      title: 'Category Name',
      subCategory: 'Name',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      createdDate: '19/01/2026',
      status: 'Inactive',
    },
  ],
  issueType: [
    {
      id: 1,
      title: 'Issue Name Here',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      category: 'Name',
      priority: 'Medium',
      assignTo: 'Surya',
      status: 'Inactive',
    },
    {
      id: 2,
      title: 'Category Name',
      subCategory: 'Name',
      description:
        'Bihar Institute of Public Administration & Rural Development, Kushdihra',
      createdDate: '19/01/2026',
      status: 'Inactive',
    },
  ],
  questionFields: [
    {
      id: 1,
      title: 'Question here',
      questionType: 'Objective',
      required: 'No',
      issueType: 'Testing',
      status: 'Inactive',
    },
    {
      id: 2,
      title: 'Question here',
      questionType: 'Objective',
      required: 'No',
      issueType: 'Testing',
      status: 'Inactive',
    },
  ],
};

const tabTitles: Record<CommsSupportTabKey, string> = {
  category: 'Category',
  subCategory: 'Sub Category',
  issueType: 'Issue Type',
  questionFields: 'Question Fields',
};

const addTitles: Record<CommsSupportTabKey, string> = {
  category: 'Category',
  subCategory: 'Sub Category',
  issueType: 'Issue Type',
  questionFields: 'Question Field',
};

const ListItemSeparator = () => <View style={styles.separator} />;

const field = (value?: string) => value || '-';

const getSearchText = (item: CommsSupportItem) =>
  [
    item.title,
    item.description,
    item.category,
    item.subCategory,
    item.issueType,
    item.priority,
    item.assignTo,
    item.createdDate,
    item.questionType,
    item.required,
    item.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const Field = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoItem}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={2} style={styles.infoValue}>
      {field(value)}
    </TextAtom>
  </View>
);

const StatusPair = ({ status }: { status: string }) => (
  <View style={styles.statusRow}>
    {statusOptions.map(option => {
      const active = option.id === status;
      return (
        <View
          key={option.id}
          style={[styles.statusChip, active && styles.statusChipActive]}
        >
          <TextAtom
            style={[styles.statusText, active && styles.statusTextActive]}
          >
            {option.label}
          </TextAtom>
        </View>
      );
    })}
  </View>
);

const renderInfoRows = (type: CommsSupportTabKey, item: CommsSupportItem) => {
  if (type === 'category') {
    return (
      <>
        <Field label="Description" value={item.description} />
        <Field label="Created Date" value={item.createdDate} />
      </>
    );
  }

  if (type === 'subCategory') {
    return (
      <>
        <Field label="Sub Category Name" value={item.subCategory} />
        <Field label="Description" value={item.description} />
        <Field label="Created Date" value={item.createdDate} />
      </>
    );
  }

  if (type === 'issueType') {
    return (
      <>
        <Field label="Description" value={item.description} />
        <Field label="Support Category" value={item.category} />
        <Field label="Priority" value={item.priority} />
        <Field label="Assign to" value={item.assignTo} />
      </>
    );
  }

  return (
    <>
      <Field label="Question Type" value={item.questionType} />
      <Field label="Required" value={item.required} />
      <Field label="Issue Type" value={item.issueType} />
    </>
  );
};

const CommsSupportCard = ({
  type,
  item,
  onEdit,
}: {
  type: CommsSupportTabKey;
  item: CommsSupportItem;
  onEdit: () => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <TextAtom numberOfLines={1} style={styles.cardTitle}>
        {item.title}
      </TextAtom>
      <TouchableAtom style={styles.actionButton} onPress={() => {}}>
        <SvgDelete />
      </TouchableAtom>
      <TouchableAtom style={styles.actionButton} onPress={onEdit}>
        <SvgEditPencile />
      </TouchableAtom>
    </View>
    <View style={styles.infoGrid}>
      {renderInfoRows(type, item)}
      <View style={styles.infoItem}>
        <TextAtom style={styles.infoLabel}>Status</TextAtom>
        <StatusPair status={item.status} />
      </View>
    </View>
  </View>
);

export const CommsSupportListScreen = ({
  type,
  navigation,
  addRouteName,
}: ListScreenProps) => {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const data = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return mockItems[type];
    return mockItems[type].filter(item => getSearchText(item).includes(keyword));
  }, [search, type]);

  const navigateToForm = useCallback((item?: CommsSupportItem) => {
    navigation.navigate(addRouteName, { item });
  }, [addRouteName, navigation]);

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: tabTitles[type],
      count: mockItems[type].length,
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
        onPress: () => navigateToForm(),
      },
    }),
    [navigateToForm, type],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
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
        renderItem={({ item }) => (
          <CommsSupportCard
            type={type}
            item={item}
            onEdit={() => navigateToForm(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export const CommsSupportFormScreen = ({
  type,
  route,
  navigation,
}: FormScreenProps) => {
  const item = route?.params?.item as CommsSupportItem | undefined;
  const isEdit = !!item;
  const [status, setStatus] = useState(item?.status ?? 'Inactive');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<any>(null);
  const [selectedPriority, setSelectedPriority] = useState<any>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<any>(null);
  const [selectedRequired, setSelectedRequired] = useState<any>(null);

  const showCategory = type !== 'category';
  const showIssueExtras = type === 'issueType';
  const showQuestionExtras = type === 'questionFields';

  const nameTitle =
    type === 'category'
      ? 'Category Name'
      : type === 'subCategory'
      ? 'Sub Category Name'
      : type === 'issueType'
      ? 'Issue Type'
      : 'Question';

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      `${isEdit ? 'Edit' : 'Add'} ${addTitles[type]}`,
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
  }, [isEdit, navigation, type]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.formContainer}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <View style={globalStyles.adminFormCard}>
          <FormTextInputWithTitle
            title="BIPARD Location"
            isMandatory
            value="Gaya, bihar"
            editable={false}
            inputStyle={styles.disabledInput}
          />

          {showCategory && (
            <FormDropdownFieldWithTitle
              title="Select Category"
              isMandatory
              data={dropdownOptions}
              value={selectedCategory?.id}
              onChange={setSelectedCategory}
              placeholder="Select"
            />
          )}

          {showQuestionExtras && (
            <FormDropdownFieldWithTitle
              title="Select Issue Type"
              isMandatory
              data={dropdownOptions}
              value={selectedIssueType?.id}
              onChange={setSelectedIssueType}
              placeholder="Select"
            />
          )}

          <FormTextInputWithTitle
            title={nameTitle}
            isMandatory
            placeholder="Enter"
            defaultValue={item?.title}
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <FormTextInputWithTitle
            title="Description"
            isMandatory
            placeholder="Enter"
            defaultValue={item?.description}
            multiline
            numberOfLines={5}
            inputStyle={styles.descriptionInput}
          />

          {showQuestionExtras && (
            <>
              <FormDropdownFieldWithTitle
                title="Question Type"
                isMandatory
                data={questionTypeOptions}
                value={selectedQuestionType?.id}
                onChange={setSelectedQuestionType}
                placeholder="Select"
              />
              <FormDropdownFieldWithTitle
                title="Required"
                isMandatory
                data={requiredOptions}
                value={selectedRequired?.id}
                onChange={setSelectedRequired}
                placeholder="Select"
              />
            </>
          )}

          {showIssueExtras && (
            <>
              <FormDropdownFieldWithTitle
                title="Select Issue Priority"
                isMandatory
                data={priorityOptions}
                value={selectedPriority?.id}
                onChange={setSelectedPriority}
                placeholder="Select"
              />
              <FormDropdownFieldWithTitle
                title="Select Default Assign Tickets to"
                isMandatory
                data={dropdownOptions}
                value={selectedAssignee?.id}
                onChange={setSelectedAssignee}
                placeholder="Select"
              />
              <FormDropdownFieldWithTitle
                title="Select Assign Tickets to"
                data={dropdownOptions}
                value={selectedIssueType?.id}
                onChange={setSelectedIssueType}
                placeholder="Select"
              />
              <FormTextInputWithTitle
                title="Due Date Within"
                isMandatory
                placeholder="12-12-1990"
              />
            </>
          )}

          <FormSwitchWithTitle
            title="Status"
            data={statusOptions}
            selectedValue={status}
            onSelect={(selected: any) => setStatus(selected.id)}
          />

          {showIssueExtras && (
            <FormFileUploadWithTitle title="Upload File" accept={['*/*']} />
          )}
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footerRow}>
        <FormWhiteButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.whiteButton}
        />
        <FormGradientButton
          title={isEdit ? 'Update' : 'Add'}
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.gradientButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  card: {
    borderRadius: vw(8),
    paddingHorizontal: vw(16),
    paddingVertical: vh(16),
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(16),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
    paddingRight: vw(10),
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: vh(10),
    paddingRight: vw(8),
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    minHeight: vh(22),
    borderRadius: vw(4),
    paddingHorizontal: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light_sky_blue,
  },
  statusChipActive: {
    backgroundColor: colors.primary_blue,
  },
  statusText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(11),
    color: colors.text_black,
  },
  statusTextActive: {
    color: colors.white,
  },
  separator: {
    height: vh(10),
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scroll: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(120),
  },
  disabledInput: {
    color: '#6D7480',
  },
  descriptionInput: {
    minHeight: vh(80),
    textAlignVertical: 'top',
    paddingTop: vh(4),
  },
  footerRow: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: '48.5%',
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(6),
    borderColor: colors.new_ui_heading,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(6),
  },
});
