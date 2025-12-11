import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Text,
  Platform,
  View,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  actions,
  RichEditor,
  RichToolbar,
} from 'react-native-pell-rich-editor';
import { pick, types } from '@react-native-documents/picker';
import { colors, fonts, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';

import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import RadioSelectableOrganism from '../../../../../components/organisms/RadioSelectableOrganism';
import { useAppSelector } from '../../../../../hooks';
import { useCommonDropdownListMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import { useUpdateAssignmentResponseMutation } from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';

const EditorWithToolbar = ({
  qId,
  initialValue,
  onChange,
  handleHead,
}: {
  qId: string | number;
  initialValue: string;
  onChange: (v: string) => void;
  handleHead: any;
}) => {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (editorRef && editorRef.current) {
        try {
          if (initialValue) {
            if (typeof editorRef.current.setContentHTML === 'function') {
              editorRef.current.setContentHTML(initialValue);
            }
          }
        } catch (e) {}
        setIsReady(true);
      } else {
        setTimeout(() => setIsReady(true), 100);
      }
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <View>
      <RichEditor
        ref={editorRef}
        placeholder="Write your answer..."
        initialContentHTML={initialValue}
        onChange={onChange}
        style={styles.richEditor}
      />

      {isReady && (
        <RichToolbar
          editor={editorRef}
          actions={[
            actions.undo,
            actions.redo,
            actions.heading1,
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.keyboard,
            actions.setStrikethrough,
            actions.setUnderline,
            actions.removeFormat,
            actions.insertImage,
          ]}
          iconMap={{ [actions.heading1]: handleHead }}
        />
      )}
    </View>
  );
};

interface Props {
  route: any;
  navigation: NavigationType;
}

const AssignmentDetails = (props: Props) => {
  const { navigation } = props;
  const data = props.route.params.data;

  const [loader, setLoader] = React.useState(false);
  const [assignmentQuestionData, setAssignmentQuestionData] =
    React.useState<any>([]);
  const [answers, setAnswers] = React.useState<any>({});
  const [selectedOption, setSelectedOption] = React.useState<any>({});
  const [updatedQuestions, setUpdatedQuestions] = React.useState<
    Record<number, boolean>
  >({});

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [updateAssignmentResponseApi] = useUpdateAssignmentResponseMutation();
  const { crediantialData } = useAppSelector(state => state.Auth);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Submit Assignment');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    getAssignmentQuestionsData();
  }, []);

  const getAssignmentQuestionsData = () => {
    setLoader(true);
    const params = {
      listType: 'list-all-assignment-question-for-answer',
      replacements: [
        Number(crediantialData.user[0].tenantId),
        Number(data.submissionId),
        Number(data.id),
        data.assignmentIdentifier,
      ],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        const questions = res.data || [];
        setAssignmentQuestionData(questions);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Failed to load questions',
        });
      });
  };

  const updateAssignmentResponse = async (q: any) => {
    const qId = q.questionId;
    const ans = answers[qId];
    const selectedType = selectedOption[qId]?.id;

    if (!ans || (!ans.text && !ans.file)) {
      return Toast.show({
        type: 'error',
        text2: 'Please write or upload an answer first!',
      });
    }

    try {
      setLoader(true);
      const formData = new FormData();
      formData.append('responseId', q.responseId || '');
      if (selectedType === 'text') {
        formData.append('response', ans.text || '');
      } else if (selectedType === 'file' && ans.file) {
        formData.append('uploadResponseFile', {
          uri: ans.file.uri,
          name: ans.file.fileName || 'response.pdf',
          type: ans.file.type || 'application/pdf',
        } as any);
      }

      const res: any = await updateAssignmentResponseApi(formData).unwrap();

      Toast.show({
        type: 'success',
        text2: res?.data?.message || 'Answer saved successfully!',
      });

      setAssignmentQuestionData((prev: any) =>
        prev.map((item: any) =>
          item.questionId === qId
            ? {
                ...item,
                responseId: res?.responseId || item.responseId,
                localUpdated: true,
              }
            : item,
        ),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoader(false);
    }
  };

  const handleOptionChange = (id: any, val: string) => {
    setSelectedOption({ ...selectedOption, [id]: val });
    setAnswers({
      ...answers,
      [id]: val === 'text' ? { text: answers[id]?.text || '' } : { file: null },
    });
  };

  const handleTextChange = (id: any, value: string) => {
    setAnswers({
      ...answers,
      [id]: { text: value, file: null },
    });
  };

  const handleFileUpload = async (id: any) => {
    try {
      const result = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        const file = result[0];

        setAnswers((prev: any) => ({
          ...prev,
          [id]: {
            file: {
              uri: file.uri,
              fileName: file.name,
              type: file.type || 'application/pdf',
            },
            text: '',
          },
        }));

        Toast.show({
          type: 'success',
          text2: `${file.name} selected successfully!`,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
      } else {
        Toast.show({
          type: 'error',
          text2: 'Failed to pick file. Please try again.',
        });
      }
    }
  };

  const finalSubmitResponse = async () => {
    try {
      setLoader(true);
      const formData = new FormData();
      formData.append('submissionIdForFinalSubmit', data?.submissionId);
      const res: any = await updateAssignmentResponseApi(formData).unwrap();
      Toast.show({
        type: 'success',
        text2: res?.data?.message || 'Assignment submitted successfully!',
      });
      navigation.navigate(screensName.Assignment);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message || 'Something went wrong while submitting.',
      });
    } finally {
      setLoader(false);
    }
  };

  const finalSubmit = () => {
    navigation.navigate('AlertOrganism', {
      title: 'Confirm Final Submission',
      message: 'Are you sure you want to submit your answers finally?',
      okText: 'YES',
      double: true,
      cancelText: 'NO',
      okFunction: () => {
        const notUpdated = assignmentQuestionData.some(
          (item: any) => !item.localUpdated,
        );

        if (notUpdated) {
          Toast.show({
            type: 'error',
            text2: 'Please save all answers before final submission!',
          });
          return;
        }
        finalSubmitResponse();
      },
    });
  };

  const handleHead = ({ tintColor }: any) => (
    <Text style={{ color: tintColor }}>H1</Text>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {assignmentQuestionData.map((item: any, index: number) => {
          const qId = item.questionId;
          const selectedType = selectedOption[qId]?.id;

          return (
            <ViewAtom key={index} style={styles.card}>
              <TextAtom numberOfLines={3} style={styles.questionTitle}>
                Q{index + 1}. {item.question.replace(/<[^>]+>/g, '')}
              </TextAtom>

              <TextAtom style={styles.chooseText}>
                Choose response type:
              </TextAtom>

              <RadioSelectableOrganism
                data={[
                  { id: 'text', value: 'Text Response' },
                  { id: 'file', value: 'Upload File' },
                ]}
                onSelect={(opt: any) => handleOptionChange(qId, opt)}
                label={'Choose response type:'}
                selectedType={selectedOption[qId]}
                typeName={'value'}
                typeId={'id'}
                isMandatory={false}
                labelStyle={styles.radioLabel}
              />

              {selectedType === 'text' && (
                <ViewAtom style={styles.editorBox}>
                  <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                  >
                    <EditorWithToolbar
                      key={`editor-${qId}`}
                      qId={qId}
                      initialValue={answers[qId]?.text || ''}
                      onChange={desc => handleTextChange(qId, desc)}
                      handleHead={handleHead}
                    />
                  </KeyboardAvoidingView>
                </ViewAtom>
              )}

              {selectedType === 'file' && (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => handleFileUpload(qId)}
                >
                  <TextAtom style={styles.uploadText}>
                    {answers[qId]?.file
                      ? `Uploaded: ${answers[qId]?.file.fileName}`
                      : 'Upload Answer File'}
                  </TextAtom>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.singleSubmitBtn}
                onPress={() => updateAssignmentResponse(item)}
              >
                <TextAtom style={styles.singleSubmitText}>
                  {item?.localUpdated ? 'Update Answer' : 'Save Answer'}
                </TextAtom>
              </TouchableOpacity>
            </ViewAtom>
          );
        })}
      </ScrollView>

      <ButtonOrganism onPress={finalSubmit} bttnText="Final Submit" />
    </SafeAreaView>
  );
};

export default AssignmentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    padding: vw(15),
  },
  card: {
    backgroundColor: colors.white,
    padding: vh(12),
    borderRadius: vw(10),
    elevation: 2,
    marginBottom: vh(15),
  },
  questionTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.primary,
  },
  chooseText: {
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Medium,
    marginVertical: vh(6),
  },
  radioLabel: {
    width: vw(260),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
    marginTop: vh(-10),
  },
  editorBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: vh(145),
  },
  richEditor: {
    minHeight: vh(104),
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: vh(10),
    borderRadius: vw(8),
    alignItems: 'center',
    marginBottom: vh(10),
    width: vw(280),
    alignSelf: 'center',
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(14),
  },
  singleSubmitBtn: {
    backgroundColor: colors.primary,
    padding: vh(10),
    borderRadius: 8,
    marginTop: 10,
  },
  singleSubmitText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: fonts.Roboto_Medium,
  },
});
