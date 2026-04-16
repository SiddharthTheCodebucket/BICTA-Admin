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
  FormFileUploadWithTitle,
  FormGradientButton,
} from '../../../../../../components/templates';
import FormFieldWrapper from '../../../../../../components/templates/FormFieldWrapper';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useListKnowledgeManagementMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';

interface Props {
  navigation: NavigationType;
  route: any;
}

const initialForm = {
  subject: '',
  description: '',
  bipardLocation: {},
};

const AddSubject = (props: Props) => {
  const { navigation, route } = props;
  const item = route.params?.item;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addSubjectApi] = useListKnowledgeManagementMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});
  const [bipardLocationList, setBipardLocationList] = useState<any[]>([]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      item ? 'Edit Subject' : 'Add Subject',
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
  }, [navigation, item]);

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

  React.useEffect(() => {
    getBipardCenter();

    if (item) {
      setForm({
        subject: item.name || '',
        description: item.description || '',
        bipardLocation:
          { id: item.bipardCentre, name: item.bipardCentre } || {},
      });
    }
  }, [item]);

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

  const schema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
    bipardLocation: Yup.object({
      id: Yup.string().required('BIPARD Centre is required'),
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
      name: form.subject,
      description: form.description,
      bipardCentre: form.bipardLocation?.name,
    };
  };

  const onSubmit = async () => {
    try {
      setLoader(true);
      await schema.validate(form, { abortEarly: false });
      setErrors({});

      const params = buildPayload();

      addSubjectApi(params)
        .unwrap()
        .then((res: any) => {
          setLoader(false);
          Toast.show({
            type: 'success',
            text2: res.data?.message || 'Subject saved successfully',
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
              title="BIPARD Location*"
              isMandatory
              data={bipardLocationList}
              value={form.bipardLocation?.id}
              onChange={(data: any) => {
                setValue('bipardLocation', data);
                clearError('bipardLocation.id');
              }}
              labelField="name"
              valueField="id"
              placeholder="Select BIPARD Centre"
              errorMessage={errors['bipardLocation.id']}
            />

            <FormTextInputWithTitle
              title="Subject Name*"
              isMandatory
              placeholder="Enter"
              value={form.subject}
              onChangeText={(val: string) => {
                setValue('subject', val);
                clearError('subject');
              }}
              errorMessage={errors.subject}
            />

            <FormTextInputWithTitle
              title="Description*"
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
          </FormFieldWrapper>

          <View style={{}}>
            <FormFileUploadWithTitle
              title="Upload Thumbnail"
              isMandatory
              onSelectFile={(file: any) => {
                setValue('thumbnail', file.uri);
              }}
              defaultFile={item?.thumbnail}
              instruction="Supported formats: JPG, PNG. Max size: 5MB."
              note=""
            />
          </View>
          {/* <View style={styles.uploadContainer}>
            <TextAtom style={styles.uploadTitle}>U` `*</TextAtom>
            <View style={styles.uploadBox}>
              <ImageUploadOrganism
                label=""
                isMandatory
                onSelectImage={(file: any) => {
                  setValue('thumbnail', file.uri);
                }}
                defaultImage={item?.thumbnail}
                instruction=""
                note=""
                buttonContainer={styles.uploadBtnContainer}
                labelStyle={{ display: 'none' }}
              />
            </View>
          </View> */}

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

export default AddSubject;

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
  uploadContainer: {
    marginTop: vh(16),
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(16),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
  },
  uploadTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
    marginBottom: vh(12),
  },
  uploadBox: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: vw(8),
    padding: vw(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnContainer: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    paddingVertical: vh(6),
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
