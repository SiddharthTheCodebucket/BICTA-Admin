import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import {
  colors,
  fonts,
  images,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  FormDropdownFieldWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import {
  useAddMedicineTypeMutation,
  useUpdateMedicineTypeMutation,
} from '../../../../../../injectEndpoints/phcEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const locationOptions = [
  { id: 'Gaya', name: 'Gaya' },
  { id: 'Patna', name: 'Patna' },
];

const getMedicineTypeName = (item: any) =>
  item?.medicineTypeName ?? item?.name ?? item?.typeName ?? item?.medicineType ?? '';

const AddMedicineType = ({ navigation, route }: Props) => {
  const item = route.params?.item;
  const isEdit = !!item;
  const inputRef = useRef<TextInput>(null);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [addApi] = useAddMedicineTypeMutation();
  const [updateApi] = useUpdateMedicineTypeMutation();
  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState({
    bipardLocation:
      tenantId === 1
        ? locationOptions[0]
        : tenantId === 2
        ? locationOptions[1]
        : null,
    medicineTypeName: '',
  });
  const [errors, setErrors] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Facilities',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    if (!item) return;

    setForm(prev => ({
      bipardLocation:
        item?.tenantId === 1
          ? locationOptions[0]
          : item?.tenantId === 2
          ? locationOptions[1]
          : prev.bipardLocation,
      medicineTypeName: getMedicineTypeName(item),
    }));
  }, [item]);

  const schema = Yup.object().shape({
    bipardLocation: Yup.object({
      name: Yup.string().required('BIPARD location is required'),
    })
      .nullable()
      .required('BIPARD location is required'),
    medicineTypeName: Yup.string().trim().required('Medicine type name is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
      isEdit ? updateDetails() : addDetails();
    } catch (err: any) {
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !nextErrors[validationErr.path]) {
            nextErrors[validationErr.path] = validationErr.message;
          }
        });
      } else if (err?.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
    }
  };

  const handleSuccess = (res: any) => {
    route.params?.onDone?.();
    navigation.goBack();
    Toast.show({
      type: 'success',
      text2: res?.data?.message || (isEdit ? 'Medicine type updated' : 'Medicine type added'),
    });
    setLoader(false);
  };

  const handleError = (err: any) => {
    setLoader(false);
    Toast.show({
      type: 'error',
      text2: err?.data?.message || 'Something went wrong',
    });
  };

  const addDetails = () => {
    setLoader(true);
    addApi({
      bipardCentre: [form.bipardLocation?.name],
      id: null,
      medicineTypeName: form.medicineTypeName.trim(),
      status: 'Active',
    })
      .unwrap()
      .then(handleSuccess)
      .catch(handleError);
  };

  const updateDetails = () => {
    setLoader(true);
    updateApi({
      bipardCentre: [form.bipardLocation?.name],
      id: item?.id ?? item?.medicineTypeId,
      medicineTypeName: form.medicineTypeName.trim(),
    })
      .unwrap()
      .then(handleSuccess)
      .catch(handleError);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TouchableAtom
          style={styles.titleRow}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <ImageAtom source={images.arrow_back} style={styles.backIcon} />
          <TextAtom style={styles.pageTitle}>
            {isEdit ? 'Edit Medicine' : 'Add Medicine'}
          </TextAtom>
        </TouchableAtom>

        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            isMandatory
            data={locationOptions}
            value={form.bipardLocation?.id}
            labelField="name"
            valueField="id"
            placeholder="Select"
            disabled={tenantId !== 3}
            onChange={selected => {
              setForm(prev => ({
                ...prev,
                bipardLocation: selected as any,
              }));
              setErrors((prev: any) => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={errors['bipardLocation.name'] || errors.bipardLocation}
          />
          <FormTextInputWithTitle
            ref={inputRef}
            title="Medicine Type Name"
            isMandatory
            placeholder="Enter"
            value={form.medicineTypeName}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={medicineTypeName => {
              setForm(prev => ({ ...prev, medicineTypeName }));
              setErrors((prev: any) => ({ ...prev, medicineTypeName: '' }));
            }}
            errorMessage={errors.medicineTypeName}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footerRow}>
        <FormWhiteButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.whiteButton}
        />
        <FormGradientButton
          title={isEdit ? 'Update' : 'Add'}
          onPress={onSubmit}
          loading={loader}
          containerStyle={styles.footerButton}
          buttonStyle={styles.gradientButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddMedicineType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scroll: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(120),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(12),
  },
  backIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  footerRow: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: '48.5%',
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(6),
    borderColor: colors.new_ui_heading,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(6),
  },
});
