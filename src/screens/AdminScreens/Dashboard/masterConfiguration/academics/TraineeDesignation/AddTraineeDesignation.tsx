import {
  Keyboard,
  StyleSheet,
  TextInput,
  View,
  ImageBackground,
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
import TextAtom from '../../../../../../components/atoms/TextAtom';
import AdminTextInputField from '../../../../../../components/molecules/AdminTextInputField';
import { globalStyles } from '../../../../../../utils/globalStyles';
import { FormDropdownFieldWithTitle } from '../../../../../../components/templates';

interface TraineeDesignationItem {
  id: number;
  name: string;
  tenantId: number;
}

interface TraineeDesignationFormRouteParams {
  item?: TraineeDesignationItem;
  onDone?: () => void;
}

interface Props {
  route: { params?: TraineeDesignationFormRouteParams };
  navigation: NavigationType;
}

type FormErrors = Partial<
  Record<'bipardLocation' | 'bipardLocation.name' | 'designationName', string>
>;

interface FormState {
  bipardLocation: { id: string; name: string } | null;
  designationName: string;
}

const locationOptions = [
  { id: 'Gaya', name: 'Gaya, bihar' },
  { id: 'Patna', name: 'Patna, bihar' },
];

const AddTraineeDesignation = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const isEdit = !!item;
  const input1_ref = useRef<TextInput>(null);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isEdit ? 'Edit Trainee Designation' : 'Add Trainee Designation',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: '#002147',
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);

  const getInitialLocation = (): { id: string; name: string } | null => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya, bihar' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna, bihar' };
    return null;
  };

  const [form, setForm] = useState<FormState>({
    bipardLocation: getInitialLocation(),
    designationName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!item) return;

    const locationMap: Record<number, { id: string; name: string }> = {
      1: { id: 'Gaya', name: 'Gaya, bihar' },
      2: { id: 'Patna', name: 'Patna, bihar' },
    };

    const selectedLocation = locationMap[item.tenantId] ?? null;

    setForm({
      bipardLocation: selectedLocation,
      designationName: item.name || '',
    });
  }, [item]);

  const schema = Yup.object().shape({
    designationName: Yup.string().required('Designation name is required'),
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
      // API call would go here
      Toast.show({
        type: 'success',
        text2: isEdit
          ? 'Designation updated successfully'
          : 'Designation added successfully',
      });
      navigation.goBack();
      props.route.params?.onDone?.();
    } catch (err: unknown) {
      if (!(err instanceof Yup.ValidationError)) return;

      const nextErrors: FormErrors = {};
      if (err.inner?.length) {
        err.inner.forEach(validationErr => {
          const path = validationErr.path as keyof FormErrors | undefined;
          if (path && !nextErrors[path])
            nextErrors[path] = validationErr.message;
        });
      } else if (err.path) {
        const path = err.path as keyof FormErrors;
        nextErrors[path] = err.message;
      }

      setErrors(nextErrors);
    }
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
        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            isMandatory
            data={locationOptions}
            value={form.bipardLocation?.id}
            placeholder="Select"
            labelField="name"
            valueField="id"
            disabled={tenantId !== 3}
            onChange={item => {
              const selectedItem = item as { id: string; name: string };
              setForm(prev => ({
                ...prev,
                bipardLocation: selectedItem,
              }));
              setErrors(prev => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={
              errors['bipardLocation.name'] || errors.bipardLocation
            }
          />

          <AdminTextInputField
            ref={input1_ref}
            label="Designation Name"
            required
            value={form.designationName}
            placeholder="Enter"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={(val: string) => {
              setValue('designationName', val);
              setErrors(prev => ({ ...prev, designationName: '' }));
            }}
            error={errors.designationName}
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
            style={[styles.submitButton, { backgroundColor: '#2D529E' }]}
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

export default AddTraineeDesignation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(120),
    backgroundColor: '#F8F8F8',
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    lineHeight: 24,
    color: colors.text_black,
    marginBottom: vh(10),
    textAlign: 'center',
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
