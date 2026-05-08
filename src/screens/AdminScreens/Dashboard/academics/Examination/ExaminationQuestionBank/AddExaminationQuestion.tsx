import React, { useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  colors,
  fonts,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import {
  FormDropdownFieldWithTitle,
  FormFieldWrapper,
  FormGradientButton,
  FormStepper,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const questionTypes = [
  { id: 'mcq', name: 'Multi choice questions' },
  { id: 'subjective', name: 'Subjective' },
];

const locationOptions = [
  { id: 'gaya', name: 'Gaya' },
  { id: 'patna', name: 'Patna' },
];

const subjectOptions = [
  { id: 'iot', name: 'I GOT certificate' },
  { id: 'dbms', name: 'DBMS' },
];

const topicOptions = [
  { id: 'ml', name: 'Machine Learning' },
  { id: 'database', name: 'Database' },
];

const optionChoices = [
  { id: 'option_1', name: 'Option 1' },
  { id: 'option_2', name: 'Option 2' },
  { id: 'option_3', name: 'Option 3' },
  { id: 'option_4', name: 'Option 4' },
];

const AddExaminationQuestion = ({ navigation, route }: Props) => {
  const editItem = route?.params?.item;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    bipardLocation: 'gaya',
    subject: editItem?.selectSubjectId ?? '',
    topic: editItem?.selectTopicId ?? '',
    questionType: 'mcq',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    marks: '',
  });

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examinationIndex.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    Toast.show({
      type: 'success',
      text2: editItem ? 'Question updated' : 'Question saved',
    });
    navigation.goBack();
  };

  const renderBackTitle = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.goBack()}
      style={styles.backTitleRow}
    >
      <Icon name="chevron-left" size={28} color={colors.text_black} />
      <TextAtom style={styles.backTitle}>Add</TextAtom>
    </TouchableOpacity>
  );

  const renderSubjectStep = () => (
    <>
      <FormStepper
        steps={['Subject', 'Questions']}
        currentStep={1}
        containerStyle={styles.stepper}
      />

      <FormFieldWrapper>
        <FormDropdownFieldWithTitle
          title="Bipard Location"
          isMandatory
          data={locationOptions}
          value={form.bipardLocation}
          disabled
          onChange={item => updateField('bipardLocation', item.id)}
          dropdownStyle={styles.disabledDropdown}
        />
        <FormDropdownFieldWithTitle
          title="Subject"
          isMandatory
          data={subjectOptions}
          value={form.subject}
          onChange={item => updateField('subject', item.id)}
          placeholder="Select"
        />
        <FormDropdownFieldWithTitle
          title="Topic"
          isMandatory
          data={topicOptions}
          value={form.topic}
          onChange={item => updateField('topic', item.id)}
          placeholder="Select"
        />
      </FormFieldWrapper>
    </>
  );

  const renderQuestionStep = () => (
    <>
      <FormStepper
        steps={['Subject', 'Questions']}
        currentStep={2}
        containerStyle={styles.stepper}
      />

      <FormFieldWrapper>
        <TextAtom style={styles.questionHeading}>Question 1.</TextAtom>
        <FormDropdownFieldWithTitle
          title="Question type"
          isMandatory
          data={questionTypes}
          value={form.questionType}
          onChange={item => updateField('questionType', item.id)}
          placeholder="Select"
          dropdownStyle={styles.filledDropdown}
        />
        <FormTextInputWithTitle
          title="Question"
          isMandatory
          placeholder="Enter"
          value={form.question}
          onChangeText={text => updateField('question', text)}
        />

        <View style={styles.optionGrid}>
          <FormDropdownFieldWithTitle
            title="Option 1"
            isMandatory
            data={optionChoices}
            value={form.option1}
            onChange={item => updateField('option1', item.id)}
            placeholder="Select"
            containerStyle={styles.optionField}
          />
          <FormDropdownFieldWithTitle
            title="Option 2"
            isMandatory
            data={optionChoices}
            value={form.option2}
            onChange={item => updateField('option2', item.id)}
            placeholder="Select"
            containerStyle={styles.optionField}
          />
          <FormDropdownFieldWithTitle
            title="Option 3"
            isMandatory
            data={optionChoices}
            value={form.option3}
            onChange={item => updateField('option3', item.id)}
            placeholder="Select"
            containerStyle={styles.optionField}
          />
          <FormDropdownFieldWithTitle
            title="Option 4"
            isMandatory
            data={optionChoices}
            value={form.option4}
            onChange={item => updateField('option4', item.id)}
            placeholder="Select"
            containerStyle={styles.optionField}
          />
        </View>

        <FormDropdownFieldWithTitle
          title="Correct Answer"
          isMandatory
          data={optionChoices}
          value={form.correctAnswer}
          onChange={item => updateField('correctAnswer', item.id)}
          placeholder="Select"
        />
        <FormTextInputWithTitle
          title="Marks"
          isMandatory
          keyboardType="numeric"
          placeholder="Enter"
          value={form.marks}
          onChangeText={text => updateField('marks', text)}
        />
      </FormFieldWrapper>

      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.floatingAdd}
        onPress={() =>
          Toast.show({ type: 'info', text2: 'Question row added' })
        }
      >
        <Icon name="plus" size={34} color={colors.white} />
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderBackTitle()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 ? renderSubjectStep() : renderQuestionStep()}
        </ScrollView>

        <View style={styles.bottomBar}>
          {step === 1 ? (
            <FormGradientButton
              title="Next"
              onPress={() => setStep(2)}
              buttonStyle={styles.bottomButton}
            />
          ) : (
            <View style={styles.actionRow}>
              <FormWhiteButton
                title="Back"
                onPress={() => setStep(1)}
                containerStyle={styles.halfButton}
                buttonStyle={styles.bottomButton}
              />
              <FormGradientButton
                title="Submit"
                onPress={handleSubmit}
                containerStyle={styles.halfButton}
                buttonStyle={styles.bottomButton}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddExaminationQuestion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  flex1: {
    flex: 1,
  },
  backTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(14),
    paddingTop: vh(8),
    paddingBottom: vh(6),
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  scrollContent: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(96),
  },
  stepper: {
    width: vw(220),
    alignSelf: 'center',
    marginTop: vh(18),
    marginBottom: vh(28),
  },
  disabledDropdown: {
    backgroundColor: '#E9EEF6',
  },
  filledDropdown: {
    backgroundColor: '#E9EEF6',
  },
  questionHeading: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.primary_blue,
    marginBottom: vh(10),
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: vw(10),
  },
  optionField: {
    width: '48.5%',
  },
  floatingAdd: {
    position: 'absolute',
    right: vw(18),
    bottom: vh(104),
    width: vw(60),
    height: vw(60),
    borderRadius: vw(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary_blue,
    elevation: 6,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomBar: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
  },
  bottomButton: {
    height: vh(40),
    borderRadius: vw(8),
  },
  actionRow: {
    flexDirection: 'row',
    gap: vw(10),
  },
  halfButton: {
    flex: 1,
  },
});
