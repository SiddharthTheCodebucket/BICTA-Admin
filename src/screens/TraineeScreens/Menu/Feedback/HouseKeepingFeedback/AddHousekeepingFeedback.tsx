import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Yup from 'yup';
import { colors, vh } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import RatingSelector, {
  defaultRatings,
} from '../../../../../components/organisms/RatingSelector';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import { useCommonDropdownListMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import { useAddFeedbackResponseMutation } from '../../../../../injectEndpointsTrainee/feedbackEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddHousekeepingFeedback = (props: Props) => {
  const { navigation } = props;
  const input1_ref: any = createRef();
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Add Housekeeping Feedback');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [addFeedbackResponseApi] = useAddFeedbackResponseMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    feedbackCategoryList: [],
    feedbackCategory: {},
    feedbackSubCategoryList: [],
    feedbackSubCategory: {},
    feedbackTopicList: [],
    feedbackTopic: {},
    rating: {},
    remarks: '',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    getCategoryList();
  }, []);

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    remarks: Yup.string().required('Remarks is required'),
    rating: Yup.object({
      id: Yup.string().required('Rating is required'),
    }),
    feedbackTopic: Yup.object({
      name: Yup.string().required('Feedback Topic is required'),
    }),
    feedbackSubCategory: Yup.object({
      name: Yup.string().required('Feedback Sub Category is required'),
    }),
    feedbackCategory: Yup.object({
      name: Yup.string().required('Feedback Category is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addFeedbackResponse();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const fourRatings = defaultRatings.slice(0, 4);

  const getCategoryList = () => {
    setLoader(true);
    const params = {
      listType: 'feedback_category',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        const categoryList = res.data || [];
        setValue('feedbackCategoryList', categoryList);
        setLoader(false);

        const housekeepingCategory = categoryList.find(
          (item: any) => item.id === 2,
        );

        if (housekeepingCategory) {
          setForm((prev: any) => ({
            ...prev,
            feedbackCategory: housekeepingCategory,
            feedbackSubCategory: {},
            feedbackTopic: {},
          }));

          getSubCategoryList(housekeepingCategory.id);
        }
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

  const getSubCategoryList = (id: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [],
      listType: 'feedback_sub_category',
      replacements: ['%%', id],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('feedbackSubCategoryList', res.data);
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

  const getTopicList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'feedback_topic',
      bipardCentre: [],
      replacements: ['%%', id],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('feedbackTopicList', res.data);
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

  const addFeedbackResponse = () => {
    setLoader(true);
    const params = {
      id: null,
      categoryId: form.feedbackCategory?.id,
      subCategoryId: form.feedbackSubCategory?.id,
      topicId: form.feedbackTopic?.id,
      response: form.rating.label,
      remark: form.remarks,
    };
    addFeedbackResponseApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        navigation.goBack();
        props.route.params?.onDone?.();
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
        <DropDownOrganism
          label={'Feedback Category'}
          placeholder={'Feedback Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Feedback Category',
              Data: form.feedbackCategoryList,
              selectedData: form.feedbackCategory,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  feedbackCategory: data,
                  feedbackTopic: {},
                }));
                getTopicList(data.id);
                setErrors({ ...errors, 'feedbackCategory.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.feedbackCategory?.name}
          isMandatory
          errorMessage={errors['feedbackCategory.name']}
          isDisabled
        />

        <DropDownOrganism
          label={'Feedback Sub Category'}
          placeholder={'Feedback Sub Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Feedback Sub Category',
              Data: form.feedbackSubCategoryList,
              selectedData: form.feedbackSubCategory,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  feedbackSubCategory: data,
                  feedbackTopic: {},
                }));
                getTopicList(data.id);
                setErrors({ ...errors, 'feedbackSubCategory.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.feedbackSubCategory?.name}
          isMandatory
          errorMessage={errors['feedbackSubCategory.name']}
        />
        <DropDownOrganism
          label={'Feedback Topic'}
          placeholder={'Feedback Topic'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Feedback Topic',
              Data: form.feedbackTopicList,
              selectedData: form.feedbackTopic,
              setSelectedData: (data: any) => {
                setValue('feedbackTopic', data);
                setErrors({ ...errors, 'feedbackTopic.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.feedbackTopic?.name}
          isMandatory
          errorMessage={errors['feedbackTopic.name']}
        />

        <RatingSelector
          label={'Rating'}
          value={form.rating}
          onSelect={(val: any) => {
            setValue('rating', val);
            setErrors({ ...errors, 'rating.id': '' });
          }}
          error={errors['rating.id']}
          options={fourRatings}
        />
        <TextInputOrganisms
          label={'Remarks'}
          placeholder={'Remarks'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.remarks}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('remarks', val);
            setErrors({ ...errors, remarks: '' });
          }}
          isMandatory
          errorMessage={errors.remarks}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText="Add" />
    </SafeAreaView>
  );
};

export default AddHousekeepingFeedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  contentScroll: {
    paddingTop: vh(20),
    paddingBottom: vh(10),
  },
});
