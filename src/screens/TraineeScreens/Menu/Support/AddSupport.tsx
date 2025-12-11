import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../components/organisms/DropDownOrganism';
import ImageUploadOrganism from '../../../../components/organisms/ImageUploadOrganism';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../injectEndpointsTrainee/profileEndpoints';
import { useAppSelector } from '../../../../hooks';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import { useSupportAddComplainMutation } from '../../../../injectEndpointsTrainee/supportEndpoints';

interface Props {
  navigation: NavigationType;
}

const AddSupport = (props: Props) => {
  const { navigation } = props;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [supportAddComplainApi] = useSupportAddComplainMutation();
  const { crediantialData } = useAppSelector(state => state.Auth);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Add Complain');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    phoneNumber: crediantialData?.traineePersonalDetails?.mobileNo,
    emailId: crediantialData?.user[0]?.login,
    subject: '',
    categoryList: [],
    category: {},
    subCategoryList: [],
    subCategory: {},
    issueTypeList: [],
    issueType: {},
    questionData: [],
    answers: [],
    description: '',
    file: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  const schema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    issueType: Yup.object({
      name: Yup.string().required('Issue type is required'),
    }),
    subCategory: Yup.object({
      name: Yup.string().required('Sub category is required'),
    }),
    category: Yup.object({
      name: Yup.string().required('Category is required'),
    }),
    subject: Yup.string().required('Subject is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addComplain();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const getCategoryList = () => {
    setLoader(true);
    const params = {
      listType: 'support_category_for_raise_complain',
      replacements: ['%%', crediantialData.user[0]?.tenantId],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('categoryList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getSubCategoryList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'support_sub_category_for_raise_complain',
      replacements: [id, '%%', crediantialData.user[0]?.tenantId],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('subCategoryList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  const getIssuesTypeList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'support_issue_type_for_raise_complain',
      replacements: [id, '%%', crediantialData.user[0]?.tenantId],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('issueTypeList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getViewQuestions = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'support_view_question_for_raise_complain',
      replacements: [id, '%%', crediantialData.user[0]?.tenantId],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('questionData', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const addComplain = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('isLogin', 'Yes');
    formData.append('name', crediantialData.user[0]?.name);
    formData.append('email', crediantialData.user[0]?.login);
    formData.append('phone', crediantialData.traineePersonalDetails?.mobileNo);
    formData.append('subject', form.subject);
    formData.append('categoryId', form.category.id);
    formData.append('subCategoryId', form.subCategory.id);
    formData.append('issueTypeId', form.issueType.id);
    formData.append('answers', JSON.stringify(form.answers));
    formData.append('description', form.description);
    if (form.file) {
      formData.append('file', {
        uri: form.file.uri,
        name: form.file.fileName,
        type: form.file.type,
      });
    }
    supportAddComplainApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.Support,
              },
            ],
          }),
        );
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TextInputOrganisms
          label={'Phone Number'}
          placeholder={'Phone Number'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.phoneNumber}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={'Email Id'}
          placeholder={'Email Id'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.emailId}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={'Subject'}
          placeholder={'Subject'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.subject}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('subject', val);
            setErrors({ ...errors, subject: '' });
          }}
          isMandatory
          errorMessage={errors.subject}
        />
        <DropDownOrganism
          label={'Category'}
          placeholder={'Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Category',
              Data: form.categoryList,
              selectedData: form.category,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  category: data,
                  subCategory: {},
                  issueType: {},
                  answers: [],
                }));

                getSubCategoryList(data.id);
                getIssuesTypeList(data.id);
                getViewQuestions(data.id);

                setErrors({ ...errors, 'category.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.category?.name}
          isMandatory
          errorMessage={errors['category.name']}
        />
        <DropDownOrganism
          label={'Sub Category'}
          placeholder={'Sub Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Sub Category',
              Data: form.subCategoryList,
              selectedData: form.subCategory,
              setSelectedData: (data: any) => {
                setValue('subCategory', data);
                setErrors({ ...errors, 'subCategory.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.subCategory?.name}
          isMandatory
          errorMessage={errors['subCategory.name']}
        />
        <DropDownOrganism
          label={'Issue Type'}
          placeholder={'Issue Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'issueType',
              Data: form.issueTypeList,
              selectedData: form.issueType,
              setSelectedData: (data: any) => {
                setValue('issueType', data);
                setErrors({ ...errors, 'issueType.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.issueType?.name}
          isMandatory
          errorMessage={errors['issueType.name']}
        />

        {form.questionData?.[0]?.questions?.map((q: any, index: number) => {
          return (
            <ViewAtom key={q.questionId} style={{ marginBottom: 20 }}>
              <TextAtom
                numberOfLines={0}
                style={{
                  fontSize: vw(14),
                  fontFamily: fonts.Roboto_Medium,
                  marginBottom: vh(10),
                  color: colors.black,
                }}
              >
                {`Question ${index + 1} - ${q.questionName.replace(
                  /<[^>]+>/g,
                  '',
                )}`}
              </TextAtom>

              <ViewAtom style={{ flexDirection: 'row', alignItems: 'center' }}>
                {q.options.map((opt: string, optIndex: number) => {
                  const optionId = q.optionIds[optIndex];

                  return (
                    <TouchableAtom
                      key={optionId}
                      onPress={() => {
                        const newAnswers = [...form.answers];

                        const existingIndex = newAnswers.findIndex(
                          a => a.questionId === q.questionId,
                        );

                        if (existingIndex !== -1) {
                          newAnswers[existingIndex].optionId = optionId;
                        } else {
                          newAnswers.push({
                            questionId: q.questionId,
                            optionId: optionId,
                          });
                        }

                        setValue('answers', newAnswers);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: vw(25),
                      }}
                    >
                      <ViewAtom
                        style={{
                          height: vh(22),
                          width: vh(22),
                          borderRadius: vw(11),
                          borderWidth: vw(2),
                          borderColor: colors.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: vw(8),
                        }}
                      >
                        {form.answers.find(
                          (a: any) => a.questionId === q.questionId,
                        )?.optionId === optionId && (
                          <ViewAtom
                            style={{
                              height: vh(12),
                              width: vw(12),
                              backgroundColor: colors.primary,
                              borderRadius: vw(6),
                            }}
                          />
                        )}
                      </ViewAtom>

                      <TextAtom
                        style={{
                          fontSize: vw(14),
                          fontFamily: fonts.Roboto_Regular,
                          color: colors.grey,
                        }}
                      >
                        {opt}
                      </TextAtom>
                    </TouchableAtom>
                  );
                })}
              </ViewAtom>
            </ViewAtom>
          );
        })}

        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.description}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('description', val);
            setErrors({ ...errors, description: '' });
          }}
          isMandatory
          errorMessage={errors.description}
        />
        <ImageUploadOrganism
          label="Choose File"
          buttonText="Choose File"
          onSelectImage={(file: any) => {
            setValue('file', file);
            setErrors({
              ...errors,
              'file.uri': '',
            });
          }}
          defaultImage={form?.file?.uri}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText="Submit Ticket" />
    </SafeAreaView>
  );
};

export default AddSupport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
});
