import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Keyboard, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

import {
  adminFontSizes,
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  FormDropdownFieldWithTitle,
  FormGradientButton,
} from '../../../../../../components/templates';
import FormFieldWrapper from '../../../../../../components/templates/FormFieldWrapper';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useListKnowledgeManagementMutation,
  useListKnowledgeManagementSubTopicMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import TextAtom from '../../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
  route: any;
}

const initialForm = {
  subject: {},
  topic: '',
  description: '',
  bipardLocation: {},
  visibility: {},
  whatWillYouLearn: '',
  furtherReading: '',
  readingTime: '',
  materialsIncluded: '',
  courseTag: '',
  difficultyLevel: {},
};

const AddSubjectTopic = (props: Props) => {
  const { navigation, route } = props;
  const item = route.params?.item;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listSubjectsApi] = useListKnowledgeManagementMutation();
  const [addSubjectTopicApi] = useListKnowledgeManagementSubTopicMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [bipardLocationList, setBipardLocationList] = useState<any[]>([]);
  const [visibilityList, setVisibilityList] = useState<any[]>([]);
  const [difficultyList, setDifficultyList] = useState<any[]>([]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      item ? 'Edit Subject Topic' : 'Add Subject Topic',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, item]);

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

  React.useEffect(() => {
    getSubjects();
    getBipardCenter();
    getVisibilityList();
    getDifficultyList();

    if (item) {
      setForm({
        subject: { id: item.subjectId, name: item.subject } || {},
        topic: item.topic || '',
        description: item.description || '',
        bipardLocation:
          { id: item.bipardCentre, name: item.bipardCentre } || {},
        visibility: { id: item.visibility, name: item.visibility } || {},
        whatWillYouLearn: item.whatWillYouLearn || '',
        furtherReading: item.furtherReading || '',
        readingTime: item.readingTime || '',
        materialsIncluded: item.materialsIncluded || '',
        courseTag: item.courseTag || '',
        difficultyLevel:
          { id: item.difficultyLevel, name: item.difficultyLevel } || {},
      });
    }
  }, [item]);

  const getSubjects = () => {
    const params = {
      search: '',
      sort: { attributes: ['id'], sorts: ['desc'] },
      filters: [],
      pageNo: 1,
      itemsPerPage: 100,
      bipardCentre: [],
    };

    listSubjectsApi(params)
      .unwrap()
      .then((res: any) => {
        setSubjectList(res.data?.data ?? []);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const getBipardCenter = () => {
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setBipardLocationList(res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const getVisibilityList = () => {
    const params = {
      listType: 'select_visibility',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setVisibilityList(res.data);
      })
      .catch(() => {});
  };

  const getDifficultyList = () => {
    const params = {
      listType: 'select_difficulty_level',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setDifficultyList(res.data);
      })
      .catch(() => {});
  };

  const schema = Yup.object().shape({
    subject: Yup.object({
      id: Yup.string().required('Subject is required'),
    }),
    topic: Yup.string().required('Topic is required'),
    bipardLocation: Yup.object({
      id: Yup.string().required('BIPARD Centre is required'),
    }),
    visibility: Yup.object({
      id: Yup.string().required('Visibility is required'),
    }),
  });

  const applyValidationErrors = (validationError: any) => {
    const nextErrors: any = {};

    if (validationError?.inner?.length) {
      validationError.inner.forEach((err: any) => {
        if (err?.path && !nextErrors[err.path]) {
          nextErrors[err.path] = err.message;
        }
      });
    } else if (validationError?.path) {
      nextErrors[validationError.path] = validationError.message;
    }

    setErrors(nextErrors);
  };

  const buildPayload = () => {
    return {
      id: item?.id || null,
      subjectId: form.subject?.id,
      subjectName: form.subject?.name,
      topic: form.topic,
      description: form.description,
      bipardCentre: form.bipardLocation?.name,
      visibility: form.visibility?.id,
      whatWillYouLearn: form.whatWillYouLearn,
      furtherReading: form.furtherReading,
      readingTime: form.readingTime,
      materialsIncluded: form.materialsIncluded,
      courseTag: form.courseTag,
      difficultyLevel: form.difficultyLevel?.id,
    };
  };

  const onSubmit = async () => {
    try {
      setLoader(true);
      await schema.validate(form, { abortEarly: false });
      setErrors({});

      const params = buildPayload();

      addSubjectTopicApi(params)
        .unwrap()
        .then((res: any) => {
          setLoader(false);
          Toast.show({
            type: 'success',
            text2: res.data?.message || 'Subject Topic saved successfully',
          });
          navigation.goBack();
          route.params?.onDone?.();
        })
        .catch((err: any) => {
          setLoader(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    } catch (err: any) {
      setLoader(false);
      applyValidationErrors(err);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={vh(120)}
      >
        <View style={styles.formContainer}>
          <FormFieldWrapper>
            <FormDropdownFieldWithTitle
              title="BIPARD Location"
              isMandatory
              data={bipardLocationList}
              value={form.bipardLocation?.id}
              onChange={(data: any) => {
                setValue('bipardLocation', data);
                clearError('bipardLocation.id');
              }}
              labelField="name"
              valueField="id"
              placeholder="Select"
              errorMessage={errors['bipardLocation.id']}
            />

            <FormDropdownFieldWithTitle
              title="Select Subject"
              isMandatory
              data={subjectList}
              value={form.subject?.id}
              onChange={(data: any) => {
                setValue('subject', data);
                clearError('subject.id');
              }}
              labelField="name"
              valueField="id"
              placeholder="Select"
              errorMessage={errors['subject.id']}
            />

            <FormTextInputWithTitle
              title="Topic"
              isMandatory
              placeholder="Enter"
              value={form.topic}
              onChangeText={(val: string) => {
                setValue('topic', val);
                clearError('topic');
              }}
              errorMessage={errors.topic}
            />

            <FormTextInputWithTitle
              title="Description"
              isMandatory
              placeholder="Enter"
              value={form.description}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputStyle={styles.textAreaInput}
              onChangeText={(val: string) => {
                setValue('description', val);
                clearError('description');
              }}
              errorMessage={errors.description}
            />

            <FormDropdownFieldWithTitle
              title="Select Visibility"
              isMandatory
              data={visibilityList}
              value={form.visibility?.id}
              onChange={(data: any) => {
                setValue('visibility', data);
                clearError('visibility.id');
              }}
              labelField="name"
              valueField="id"
              placeholder="Select"
              errorMessage={errors['visibility.id']}
            />

            <FormTextInputWithTitle
              title="What will you learn"
              placeholder="Enter"
              value={form.whatWillYouLearn}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputStyle={styles.textAreaInput}
              onChangeText={(val: string) => {
                setValue('whatWillYouLearn', val);
                clearError('whatWillYouLearn');
              }}
              errorMessage={errors.whatWillYouLearn}
            />

            <FormTextInputWithTitle
              title="Further Reading"
              placeholder="Enter"
              value={form.furtherReading}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputStyle={styles.textAreaInput}
              onChangeText={(val: string) => {
                setValue('furtherReading', val);
                clearError('furtherReading');
              }}
              errorMessage={errors.furtherReading}
            />

            <FormTextInputWithTitle
              title="Reading Time"
              placeholder="Enter"
              value={form.readingTime}
              onChangeText={(val: string) => {
                setValue('readingTime', val);
                clearError('readingTime');
              }}
              errorMessage={errors.readingTime}
            />

            <FormTextInputWithTitle
              title="Materials Included"
              placeholder="Enter"
              value={form.materialsIncluded}
              onChangeText={(val: string) => {
                setValue('materialsIncluded', val);
                clearError('materialsIncluded');
              }}
              errorMessage={errors.materialsIncluded}
            />

            <FormTextInputWithTitle
              title="Course Tag"
              placeholder="Enter"
              value={form.courseTag}
              onChangeText={(val: string) => {
                setValue('courseTag', val);
                clearError('courseTag');
              }}
              errorMessage={errors.courseTag}
            />

            <FormDropdownFieldWithTitle
              title="Difficulty Level"
              data={difficultyList}
              value={form.difficultyLevel?.id}
              onChange={(data: any) => {
                setValue('difficultyLevel', data);
                clearError('difficultyLevel.id');
              }}
              labelField="name"
              valueField="id"
              placeholder="Select"
              errorMessage={errors['difficultyLevel.id']}
            />
          </FormFieldWrapper>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <TextAtom style={styles.cancelButtonText}>Back</TextAtom>
            </TouchableOpacity>

            <View style={styles.saveButtonWrapper}>
              <FormGradientButton
                title={item ? 'Save' : 'Add'}
                onPress={onSubmit}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddSubjectTopic;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  formContainer: {
    padding: vw(14),
  },
  textAreaInput: {
    height: vh(100),
    textAlignVertical: 'top',
    paddingTop: vw(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: vh(20),
    gap: vw(10),
  },
  cancelButton: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    borderWidth: 1,
    borderColor: colors.grey_1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  saveButtonWrapper: {
    flex: 1,
  },
});
