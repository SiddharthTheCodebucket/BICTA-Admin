import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { createRef, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { colors, screensName, strings, vh } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import RatingSelector from '../../../../components/organisms/RatingSelector';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';
import { useAddOverallFeedbackResponseMutation } from '../../../../injectEndpointsTrainee/feedbackEndpoints';

interface Props {
  navigation: NavigationType;
}

const OverallFeedback = (props: Props) => {
  const { navigation } = props;
  const input1_ref: any = createRef();

  const [addOverallFeedbackResponseApi] =
    useAddOverallFeedbackResponseMutation();
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Overall Feedback');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    courseContentRating: {},
    facultyRating: {},
    messRating: {},
    suggestion: '',
  });

  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    suggestion: Yup.string().required('Suggestion is required'),
    messRating: Yup.object({
      id: Yup.string().required('Mess rating is required'),
    }),
    facultyRating: Yup.object({
      id: Yup.string().required('Faculty rating is required'),
    }),
    courseContentRating: Yup.object({
      id: Yup.string().required('Course content rating is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      navigation.navigate('AlertOrganism', {
        message:
          'Are you sure you want to submit? Once submitted, feedback cannot be updated.',
        okText: strings.ok,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          addOverallFeedbackResponse();
        },
        cancelFunction: () => {},
      });
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addOverallFeedbackResponse = () => {
    setLoader(true);
    const params = {
      courseContentRating: form.courseContentRating.id,
      facultyRating: form.facultyRating.id,
      messRating: form.messRating.id,
      suggestions: 'test',
    };
    addOverallFeedbackResponseApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.Feedback,
              },
            ],
          }),
        );
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
        <RatingSelector
          label={'Course Content Rating'}
          value={form.courseContentRating}
          onSelect={(val: any) => {
            setValue('courseContentRating', val);
            setErrors({ ...errors, 'courseContentRating.id': '' });
          }}
          error={errors['courseContentRating.id']}
        />
        <RatingSelector
          label={'Faculty Rating'}
          value={form.facultyRating}
          onSelect={(val: any) => {
            setValue('facultyRating', val);
            setErrors({ ...errors, 'facultyRating.id': '' });
          }}
          error={errors['facultyRating.id']}
        />
        <RatingSelector
          label={'Mess Rating'}
          value={form.messRating}
          onSelect={(val: any) => {
            setValue('messRating', val);
            setErrors({ ...errors, 'messRating.id': '' });
          }}
          error={errors['messRating.id']}
        />
        <TextInputOrganisms
          label={'Suggestion'}
          placeholder={'Suggestion'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.remarks}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('suggestion', val);
            setErrors({ ...errors, suggestion: '' });
          }}
          isMandatory
          errorMessage={errors.suggestion}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText="Add" />
    </SafeAreaView>
  );
};

export default OverallFeedback;

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
