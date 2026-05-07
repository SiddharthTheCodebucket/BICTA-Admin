import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FormDropdownFieldWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormSwitchWithTitle,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../components/templates';
import TextAtom from '../../../../../components/atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../../../../constants';

export type CommsSupportTabKey =
  | 'category'
  | 'subCategory'
  | 'issueType'
  | 'questionFields';

type CardItem = {
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

const statusOptions = [
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
];

const dropdownOptions = [
  { id: 1, name: 'Category Name' },
  { id: 2, name: 'Testing' },
];

const mockItems: Record<CommsSupportTabKey, CardItem[]> = {
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
  subCategory: 'Sub category',
  issueType: 'Issue Type',
  questionFields: 'Question Fields',
};

const addTitles: Record<CommsSupportTabKey, string> = {
  category: 'Add Category',
  subCategory: 'Add Sub Category',
  issueType: 'Add Issue Type',
  questionFields: 'Add Question Field',
};

const Field = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.field}>
    <TextAtom style={styles.fieldLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fieldValue}>
      {value || '-'}
    </TextAtom>
  </View>
);

const StatusPair = ({ status }: { status: string }) => (
  <View style={styles.statusRow}>
    <View
      style={[
        styles.statusChip,
        status === 'Active' ? styles.statusChipDark : styles.statusChipLight,
      ]}
    >
      <TextAtom
        style={[
          styles.statusText,
          status === 'Active' ? styles.statusTextLight : styles.statusTextDark,
        ]}
      >
        Active
      </TextAtom>
    </View>
    <View
      style={[
        styles.statusChip,
        status === 'Inactive' ? styles.statusChipDark : styles.statusChipLight,
      ]}
    >
      <TextAtom
        style={[
          styles.statusText,
          status === 'Inactive'
            ? styles.statusTextLight
            : styles.statusTextDark,
        ]}
      >
        Inactive
      </TextAtom>
    </View>
  </View>
);

const HeaderAction = ({
  icon,
  onPress,
  danger,
}: {
  icon: string;
  onPress?: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.cardIconButton}
  >
    <Icon
      name={icon}
      size={vw(16)}
      color={danger ? colors.red : colors.primary_dark_blue}
    />
  </TouchableOpacity>
);

const CommsSupportCard = ({
  type,
  item,
  onEdit,
}: {
  type: CommsSupportTabKey;
  item: CardItem;
  onEdit?: () => void;
}) => {
  const renderBody = () => {
    if (type === 'category') {
      return (
        <>
          <Field label="Description" value={item.description} />
          <View style={styles.twoCol}>
            <Field label="Created Date" value={item.createdDate} />
            <View style={styles.field}>
              <TextAtom style={styles.fieldLabel}>Status</TextAtom>
              <StatusPair status={item.status} />
            </View>
          </View>
        </>
      );
    }

    if (type === 'subCategory') {
      return (
        <>
          <Field label="Sub Category Name" value={item.subCategory} />
          <Field label="Description" value={item.description} />
          <View style={styles.twoCol}>
            <Field label="Created Date" value={item.createdDate} />
            <View style={styles.field}>
              <TextAtom style={styles.fieldLabel}>Status</TextAtom>
              <StatusPair status={item.status} />
            </View>
          </View>
        </>
      );
    }

    if (type === 'issueType') {
      return (
        <>
          <Field label="Description" value={item.description} />
          <View style={styles.twoCol}>
            <Field label="Support Category" value={item.category} />
            <Field label="Priority" value={item.priority} />
          </View>
          <View style={styles.twoCol}>
            <Field label="Assign to" value={item.assignTo} />
            <View style={styles.field}>
              <TextAtom style={styles.fieldLabel}>Status</TextAtom>
              <StatusPair status={item.status} />
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.twoCol}>
          <Field label="Question Type" value={item.questionType} />
          <Field label="Required" value={item.required} />
        </View>
        <View style={styles.twoCol}>
          <Field label="Issue Type" value={item.issueType} />
          <View style={styles.field}>
            <TextAtom style={styles.fieldLabel}>Status</TextAtom>
            <StatusPair status={item.status} />
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextAtom style={styles.cardTitle}>{item.title}</TextAtom>
        <View style={styles.cardActions}>
          <HeaderAction icon="trash-can-outline" danger />
          <HeaderAction icon="pencil-outline" onPress={onEdit} />
        </View>
      </View>
      {renderBody()}
    </View>
  );
};

export const CommsSupportListTab = ({
  type,
  onCreate,
  onEdit,
}: {
  type: CommsSupportTabKey;
  onCreate?: () => void;
  onEdit?: () => void;
}) => {
  const data = mockItems[type];

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <TextAtom style={styles.listTitle}>
          {tabTitles[type]} <TextAtom style={styles.countText}>(40)</TextAtom>
        </TextAtom>
        <View style={styles.headerActions}>
          <TouchableOpacity activeOpacity={0.85} style={styles.iconOnlyButton}>
            <Icon name="magnify" size={vw(24)} color={colors.primary_dark_blue} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.iconOnlyButton}>
            <Icon
              name="filter-variant"
              size={vw(22)}
              color={colors.primary_dark_blue}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCreate}
            style={styles.createButton}
          >
            <TextAtom style={styles.createText}>+ Create</TextAtom>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <CommsSupportCard type={type} item={item} onEdit={onEdit} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export const CommsSupportForm = ({
  type,
  onCancel,
}: {
  type: CommsSupportTabKey;
  onCancel: () => void;
}) => {
  const [status, setStatus] = React.useState('Inactive');
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  const [selectedIssueType, setSelectedIssueType] = React.useState<any>(null);
  const [selectedPriority, setSelectedPriority] = React.useState<any>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState<any>(null);

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
      : 'Question here';

  return (
    <SafeAreaView edges={['bottom']} style={styles.formScreen}>
      <View style={styles.formSubHeader}>
        <TouchableOpacity activeOpacity={0.85} onPress={onCancel}>
          <Icon name="chevron-left" size={vw(28)} color={colors.text_black} />
        </TouchableOpacity>
        <TextAtom style={styles.formSubHeaderTitle}>{addTitles[type]}</TextAtom>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <FormTextInputWithTitle
            title="BIPARD Location"
            isMandatory
            value="Gaya, bihar"
            editable={false}
            containerStyle={styles.formField}
            inputStyle={styles.disabledInputText}
          />

          {showCategory && (
            <FormDropdownFieldWithTitle
              title="Select Category"
              isMandatory
              data={dropdownOptions}
              value={selectedCategory?.id}
              onChange={setSelectedCategory}
              placeholder="Select"
              containerStyle={styles.formField}
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
              containerStyle={styles.formField}
            />
          )}

          <FormTextInputWithTitle
            title={nameTitle}
            isMandatory
            placeholder="Enter"
            containerStyle={styles.formField}
          />

          <FormTextInputWithTitle
            title="Description"
            isMandatory
            placeholder="Enter"
            multiline
            numberOfLines={5}
            containerStyle={styles.formField}
            inputStyle={styles.descriptionInput}
          />

          {showQuestionExtras && (
            <>
              <FormDropdownFieldWithTitle
                title="Question Type"
                isMandatory
                data={[
                  { id: 'Objective', name: 'Objective' },
                  { id: 'Subjective', name: 'Subjective' },
                ]}
                value={selectedPriority?.id}
                onChange={setSelectedPriority}
                placeholder="Select"
                containerStyle={styles.formField}
              />
              <FormDropdownFieldWithTitle
                title="Required"
                isMandatory
                data={[
                  { id: 'Yes', name: 'Yes' },
                  { id: 'No', name: 'No' },
                ]}
                value={selectedAssignee?.id}
                onChange={setSelectedAssignee}
                placeholder="Select"
                containerStyle={styles.formField}
              />
            </>
          )}

          {showIssueExtras && (
            <>
              <FormDropdownFieldWithTitle
                title="Select Issue Priority"
                isMandatory
                data={[
                  { id: 'High', name: 'High' },
                  { id: 'Medium', name: 'Medium' },
                  { id: 'Low', name: 'Low' },
                ]}
                value={selectedPriority?.id}
                onChange={setSelectedPriority}
                placeholder="Select"
                containerStyle={styles.formField}
              />
              <FormDropdownFieldWithTitle
                title="Select Default Assign Tickets to"
                isMandatory
                data={dropdownOptions}
                value={selectedAssignee?.id}
                onChange={setSelectedAssignee}
                placeholder="Select"
                containerStyle={styles.formField}
              />
              <FormDropdownFieldWithTitle
                title="Select Assign Tickets to"
                data={dropdownOptions}
                value={selectedIssueType?.id}
                onChange={setSelectedIssueType}
                placeholder="Select"
                containerStyle={styles.formField}
              />
              <FormTextInputWithTitle
                title="Due Date Within"
                isMandatory
                placeholder="12-12-1990"
                containerStyle={styles.formField}
              />
            </>
          )}

          <FormSwitchWithTitle
            title="Status"
            data={statusOptions}
            selectedValue={status}
            onSelect={(item: any) => setStatus(item.id)}
            containerStyle={styles.formField}
          />

          {showIssueExtras && (
            <FormFileUploadWithTitle
              title="Upload File"
              accept={['*/*']}
              containerStyle={styles.formField}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FormWhiteButton
          title="Cancel"
          onPress={onCancel}
          containerStyle={styles.footerButton}
        />
        <FormGradientButton
          title="Add"
          onPress={onCancel}
          containerStyle={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  listHeader: {
    paddingHorizontal: vw(16),
    paddingTop: vh(8),
    paddingBottom: vh(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
  },
  countText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  iconOnlyButton: {
    width: vw(22),
    height: vw(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    height: vh(36),
    paddingHorizontal: vw(12),
    borderRadius: vw(8),
    backgroundColor: colors.primary_dark_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: vw(16),
    paddingBottom: vh(28),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    padding: vw(15),
    marginBottom: vh(12),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vh(8),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    paddingRight: vw(10),
  },
  cardActions: {
    flexDirection: 'row',
    gap: vw(10),
  },
  cardIconButton: {
    width: vw(31),
    height: vw(31),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoCol: {
    flexDirection: 'row',
    gap: vw(16),
  },
  field: {
    flex: 1,
    marginTop: vh(7),
  },
  fieldLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    marginBottom: vh(4),
  },
  fieldValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    minHeight: vh(22),
    paddingHorizontal: vw(5),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vw(4),
  },
  statusChipLight: {
    backgroundColor: colors.light_sky_blue,
  },
  statusChipDark: {
    backgroundColor: colors.primary_blue,
  },
  statusText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(11),
  },
  statusTextDark: {
    color: colors.text_black,
  },
  statusTextLight: {
    color: colors.white,
  },
  formScreen: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  formSubHeader: {
    height: vh(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(14),
    backgroundColor: colors.new_ui_screen_bg,
  },
  formSubHeaderTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    marginLeft: vw(2),
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(20),
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: vw(16),
    padding: vw(8),
  },
  formField: {
    marginBottom: vh(10),
  },
  disabledInputText: {
    color: '#6B7280',
  },
  descriptionInput: {
    minHeight: vh(80),
    textAlignVertical: 'top',
    paddingTop: vh(4),
  },
  footer: {
    flexDirection: 'row',
    gap: vw(10),
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(14),
    backgroundColor: colors.new_ui_screen_bg,
  },
  footerButton: {
    flex: 1,
  },
});
