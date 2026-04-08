import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, images, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';

import {
  useAddTrainingCategoryMutation,
  useUpdateTrainingCategoryMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddTrainingCategory = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const isEdit = !!item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [addrainingCategoryApi] = useAddTrainingCategoryMutation();
  const [updateTrainingCategoryApi] = useUpdateTrainingCategoryMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Training Management',
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
  }, []);

  const [loader, setLoader] = useState(false);

  // Auto-select location based on tenantId
  const getInitialLocation = () => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna' };
    return {}; // tenantId === 3 (superadmin) - no auto-selection
  };

  const [form, setForm] = useState<any>({
    bipardLocation: getInitialLocation(),
    categoryName: '',
    desc: '',
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] || {};

    setForm({
      bipardLocation: selectedLocation,
      categoryName: item.categoryName || '',
      desc: item.description || '',
    });
  }, [item]);

  const schema = Yup.object().shape({
    desc: Yup.string().required('Description is required'),
    categoryName: Yup.string().required('Category name is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
      if (item) {
        updateTrainingCategoryDetails();
      } else {
        addTrainingCategoryDetails();
      }
    } catch (err: any) {
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !nextErrors[validationErr.path]) {
            nextErrors[validationErr.path] = validationErr.message;
          }
        });
      } else if (err.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
    }
  };

  const addTrainingCategoryDetails = () => {
    setLoader(true);
    let params = {
      categoryName: form.categoryName,
      description: form.desc,
      bipardCentre: [form.bipardLocation?.name],
      categoryId: null,
      originalState: null,
    };
    addrainingCategoryApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
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

  const updateTrainingCategoryDetails = () => {
    setLoader(true);

    let params: any = {
      bipardCentre: [form.bipardLocation?.name],
      description: form.desc,
      categoryId: item.categoryId,
    };

    if (form.categoryName !== item.categoryName) {
      params.categoryName = form.categoryName;
    }

    updateTrainingCategoryApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
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
        <TouchableAtom
          style={styles.titleRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ImageAtom source={images.arrow_back} style={styles.inlineBackIcon} />
          <TextAtom style={styles.pageTitle}>
            {isEdit ? 'Edit Category' : 'Create Category'}
          </TextAtom>
        </TouchableAtom>

        <View style={styles.formCard}>
          <View
            style={{
              backgroundColor: colors.backgroundColor,
              padding: vw(8),

              borderRadius: vw(8),
            }}
          >
            <View style={styles.fieldBlock}>
              <TextAtom style={styles.labelText}>
                Select Bipard Location
                <TextAtom style={styles.requiredMark}>*</TextAtom>
              </TextAtom>
              <TouchableAtom
                style={styles.inputContainer}
                onPress={() => {
                  if (tenantId !== 3) return;

                  navigation.navigate('DropDownModal', {
                    name: 'Bipard Location',
                    Data: [
                      { id: 'Gaya', name: 'Gaya' },
                      { id: 'Patna', name: 'Patna' },
                    ],
                    selectedData: form.bipardLocation,
                    setSelectedData: (data: any) => {
                      setForm((prev: any) => ({
                        ...prev,
                        bipardLocation: data,
                      }));
                      setErrors((prev: any) => ({
                        ...prev,
                        bipardLocation: '',
                        'bipardLocation.name': '',
                      }));
                    },
                    typeName: 'name',
                    typeId: 'id',
                  });
                }}
                activeOpacity={tenantId === 3 ? 0.8 : 1}
              >
                <TextAtom
                  style={[
                    styles.inputText,
                    !form.bipardLocation?.name && styles.placeholderText,
                  ]}
                >
                  {form.bipardLocation?.name || 'Select'}
                </TextAtom>
                <ImageAtom source={images.downArrow} style={styles.dropIcon} />
              </TouchableAtom>
              {!!(errors['bipardLocation.name'] || errors.bipardLocation) && (
                <TextAtom style={styles.errorText}>
                  {errors['bipardLocation.name'] || errors.bipardLocation}
                </TextAtom>
              )}
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.backgroundColor,
              padding: vw(8),

              borderRadius: vw(8),
              marginTop: vh(10),
            }}
          >
            <View style={styles.fieldBlock}>
              <TextAtom style={styles.labelText}>
                Category Name
                <TextAtom style={styles.requiredMark}>*</TextAtom>
              </TextAtom>
              <TextInput
                ref={input1_ref}
                style={styles.input}
                value={form.categoryName}
                placeholder="Enter"
                placeholderTextColor={colors.new_ui_count}
                returnKeyType="next"
                onSubmitEditing={() => input2_ref.current?.focus()}
                onChangeText={(val: string) => {
                  setValue('categoryName', val);
                  setErrors((prev: any) => ({ ...prev, categoryName: '' }));
                }}
              />
              {!!errors.categoryName && (
                <TextAtom style={styles.errorText}>
                  {errors.categoryName}
                </TextAtom>
              )}
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.backgroundColor,
              padding: vw(8),

              borderRadius: vw(8),
              marginTop: vh(10),
            }}
          >
            <View style={styles.fieldBlock}>
              <TextAtom style={styles.labelText}>
                Description
                <TextAtom style={styles.requiredMark}>*</TextAtom>
              </TextAtom>
              <TextInput
                ref={input2_ref}
                style={[styles.input, styles.descriptionInput]}
                value={form.desc}
                placeholder="Enter"
                placeholderTextColor={colors.new_ui_count}
                multiline
                textAlignVertical="top"
                onSubmitEditing={() => Keyboard.dismiss()}
                onChangeText={(val: string) => {
                  setValue('desc', val);
                  setErrors((prev: any) => ({ ...prev, desc: '' }));
                }}
              />
              {!!errors.desc && (
                <TextAtom style={styles.errorText}>{errors.desc}</TextAtom>
              )}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footerRow}>
        <TouchableAtom
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <TextAtom style={styles.cancelText}>Cancel</TextAtom>
        </TouchableAtom>

        <TouchableAtom style={styles.submitTouchable} onPress={onSubmit}>
          <ImageBackground
            source={images.buttonGrad_50}
            style={styles.submitButton}
            imageStyle={styles.submitButtonImage}
            resizeMode="stretch"
          >
            <TextAtom style={styles.submitText}>
              {isEdit ? 'Update' : 'Add'}
            </TextAtom>
          </ImageBackground>
        </TouchableAtom>
      </View>
    </SafeAreaView>
  );
};

export default AddTrainingCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(120),
    backgroundColor: colors.new_ui_screen_bg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  inlineBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    lineHeight: 24,
    color: colors.text_black,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: vw(16),
    borderWidth: 1,
    borderColor: '#EFEFF2',
    padding: vw(10),
  },
  fieldBlock: {
    marginBottom: vh(12),
  },
  labelText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#6D7480',
    marginBottom: vh(6),
  },
  requiredMark: {
    color: '#D11A2A',
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
  },
  inputContainer: {
    height: vh(42),
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(16),
    color: '#2E3440',
  },
  dropIcon: {
    width: vw(16),
    height: vw(16),
    tintColor: '#414955',
  },
  placeholderText: {
    color: colors.new_ui_count,
  },
  input: {
    height: vh(42),
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(16),
    color: '#2E3440',
  },
  descriptionInput: {
    height: vh(100),
    paddingTop: vh(10),
  },
  errorText: {
    marginTop: vh(5),
    color: colors.red_2,
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
  },
  footerRow: {
    position: 'absolute',
    left: vw(10),
    right: vw(10),
    bottom: vh(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '48.5%',
    height: vh(44),
    borderWidth: 1,
    borderColor: '#8D929A',
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: '#2F3742',
  },
  submitTouchable: {
    width: '48.5%',
    borderRadius: vw(8),
    overflow: 'hidden',
  },
  submitButton: {
    height: vh(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonImage: {
    borderRadius: vw(8),
  },
  submitText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.white,
  },
});
