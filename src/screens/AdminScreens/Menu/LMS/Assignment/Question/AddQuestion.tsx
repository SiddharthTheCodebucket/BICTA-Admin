import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, vh, vw } from '../../../../../../constants';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';

interface Props {
  navigation: any;
  route?: any;
}

const AddQuestion = ({ navigation, route }: Props) => {
  const [form, setForm] = useState({
    subjectId: '',
    topicId: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Submit Form:', form);
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <AdminListHeader
        config={{
          title: 'Add Question',
          create: {
            visible: false,
          },
          search: {
            visible: false,
          },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formWrapper}>
          <FormDropdownFieldWithTitle
            title="Subject"
            isMandatory
            data={[]} // To be populated from API
            value={form.subjectId}
            onChange={item => handleInputChange('subjectId', item.id)}
            placeholder="Select Subject"
          />

          <FormDropdownFieldWithTitle
            title="Topic"
            isMandatory
            data={[]} // To be populated based on Subject
            value={form.topicId}
            onChange={item => handleInputChange('topicId', item.id)}
            placeholder="Select Topic"
          />

          <FormTextInputWithTitle
            title="Question"
            isMandatory
            placeholder="Enter question here..."
            value={form.question}
            onChangeText={text => handleInputChange('question', text)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <FormTextInputWithTitle
            title="Option 1"
            isMandatory
            placeholder="Enter option 1"
            value={form.option1}
            onChangeText={text => handleInputChange('option1', text)}
          />

          <FormTextInputWithTitle
            title="Option 2"
            isMandatory
            placeholder="Enter option 2"
            value={form.option2}
            onChangeText={text => handleInputChange('option2', text)}
          />

          <FormTextInputWithTitle
            title="Option 3"
            isMandatory
            placeholder="Enter option 3"
            value={form.option3}
            onChangeText={text => handleInputChange('option3', text)}
          />

          <FormTextInputWithTitle
            title="Option 4"
            isMandatory
            placeholder="Enter option 4"
            value={form.option4}
            onChangeText={text => handleInputChange('option4', text)}
          />

          <FormDropdownFieldWithTitle
            title="Correct Option"
            isMandatory
            data={[
              { id: '1', name: 'Option 1' },
              { id: '2', name: 'Option 2' },
              { id: '3', name: 'Option 3' },
              { id: '4', name: 'Option 4' },
            ]}
            value={form.correctOption}
            onChange={item => handleInputChange('correctOption', item.id)}
            placeholder="Select Correct Option"
          />

          <View style={styles.buttonContainer}>
            <FormGradientButton title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddQuestion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
  },
  formWrapper: {
    marginTop: vh(20),
  },
  multilineInput: {
    height: vh(100),
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: vh(20),
    marginBottom: vh(20),
  },
});
