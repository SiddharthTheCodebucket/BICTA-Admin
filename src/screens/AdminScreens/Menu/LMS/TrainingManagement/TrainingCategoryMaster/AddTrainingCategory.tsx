import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import AdminTextInputField from '../../../../../../components/molecules/AdminTextInputField';
import { globalStyles } from '../../../../../../utils/globalStyles';

import {
  useAddTrainingCategoryMutation,
  useUpdateTrainingCategoryMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

type BipardLocation = { id: string; name: string } | null;

interface TrainingCategoryItem {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  tenantId: number;
}

interface AddTrainingCategoryRouteParams {
  item?: TrainingCategoryItem;
  onDone?: () => void;
}

interface Props {
  route: { params?: AddTrainingCategoryRouteParams };
  navigation: NavigationType;
}

type FormErrors = Partial<
  Record<
    'bipardLocation' | 'bipardLocation.name' | 'categoryName' | 'desc',
    string
  >
>;

interface FormState {
  bipardLocation: BipardLocation;
  categoryName: string;
  desc: string;
}

const AddTrainingCategory = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const isEdit = !!item;
  const input1_ref = useRef<TextInput>(null);
  const input2_ref = useRef<TextInput>(null);

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
  const getInitialLocation = (): BipardLocation => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna' };
    return null; // tenantId === 3 (superadmin) - no auto-selection
  };

  const [form, setForm] = useState<FormState>({
    bipardLocation: getInitialLocation(),
    categoryName: '',
    desc: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    if (!item) return;

    const locationMap: Record<number, BipardLocation> = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] ?? null;

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
    })
      .nullable()
      .required('Bipard location is required'),
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
    } catch (err: unknown) {
      if (!(err instanceof Yup.ValidationError)) return;

      const nextErrors: FormErrors = {};
      if (err.inner?.length) {
        err.inner.forEach(validationErr => {
          const path = validationErr.path as keyof FormErrors | undefined;
          if (path && !nextErrors[path]) nextErrors[path] = validationErr.message;
        });
      } else if (err.path) {
        const path = err.path as keyof FormErrors;
        nextErrors[path] = err.message;
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
    if (!item) {
      setLoader(false);
      return;
    }

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

        <View style={globalStyles.adminFormCard}>
          <View style={[globalStyles.adminFieldCard, { marginTop: 0 }]}>
            <View style={globalStyles.adminFieldBlock}>
              <TextAtom style={globalStyles.adminLabelText}>
                Select Bipard Location
                <TextAtom style={globalStyles.adminRequiredMark}>*</TextAtom>
              </TextAtom>
              <TouchableAtom
                style={globalStyles.adminInputContainer}
                onPress={() => {
                  if (tenantId !== 3) return;

                  navigation.navigate('DropDownModal', {
                    name: 'Bipard Location',
                    Data: [
                      { id: 'Gaya', name: 'Gaya' },
                      { id: 'Patna', name: 'Patna' },
                    ],
                    selectedData: form.bipardLocation,
                    setSelectedData: (data: BipardLocation) => {
                      setForm(prev => ({
                        ...prev,
                        bipardLocation: data,
                      }));
                      setErrors(prev => ({
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
                    globalStyles.adminInputText,
                    !form.bipardLocation?.name && { color: colors.new_ui_count },
                  ]}
                >
                  {form.bipardLocation?.name ?? 'Select'}
                </TextAtom>
                <ImageAtom source={images.downArrow} style={styles.dropIcon} />
              </TouchableAtom>
              {!!(errors['bipardLocation.name'] || errors.bipardLocation) && (
                <TextAtom style={globalStyles.adminErrorText}>
                  {errors['bipardLocation.name'] || errors.bipardLocation}
                </TextAtom>
              )}
            </View>
          </View>

          <AdminTextInputField
            ref={input1_ref}
            label="Category Name"
            required
            value={form.categoryName}
            placeholder="Enter"
            returnKeyType="next"
            onSubmitEditing={() => input2_ref.current?.focus()}
            onChangeText={(val: string) => {
              setValue('categoryName', val);
              setErrors(prev => ({ ...prev, categoryName: '' }));
            }}
            error={errors.categoryName}
          />

          <AdminTextInputField
            ref={input2_ref}
            label="Description"
            required
            value={form.desc}
            placeholder="Enter"
            multiline
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={(val: string) => {
              setValue('desc', val);
              setErrors(prev => ({ ...prev, desc: '' }));
            }}
            error={errors.desc}
          />
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
  dropIcon: {
    width: vw(16),
    height: vw(16),
    tintColor: '#414955',
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
