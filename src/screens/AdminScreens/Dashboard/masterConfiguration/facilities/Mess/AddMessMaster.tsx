import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import {
  colors,
  fonts,
  images,
  strings,
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
  FormSwitchWithTitle,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import {
  mobileRegex,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import {
  useMessManagementAddMessMutation,
  useMessManagementUpdateMessMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const locationOptions = [
  { id: 'Gaya', name: 'Gaya' },
  { id: 'Patna', name: 'Patna' },
];

const statusOptions = [
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
];

const initialLocation = (tenantId?: number) => {
  if (tenantId === 1) return locationOptions[0];
  if (tenantId === 2) return locationOptions[1];
  return null;
};

const AddMessMaster = ({ navigation, route }: Props) => {
  const item = route.params?.item;
  const isEdit = !!item;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [addApi] = useMessManagementAddMessMutation();
  const [updateApi] = useMessManagementUpdateMessMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState({
    bipardLocation: initialLocation(tenantId) as any,
    messName: '',
    capacity: '',
    inchargeName: '',
    inchargeContactNo: '',
    status: 'Inactive',
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
    setForm({
      bipardLocation: initialLocation(item?.tenantId) ?? initialLocation(tenantId),
      messName: item?.messName ?? item?.name ?? '',
      capacity: item?.capacity ? String(item.capacity) : '',
      inchargeName: item?.inchargeName ?? item?.inChargeName ?? '',
      inchargeContactNo:
        item?.inchargeMobileNo ?? item?.inchargeContactNo
          ? String(item?.inchargeMobileNo ?? item?.inchargeContactNo)
          : '',
      status: item?.status ?? 'Inactive',
    });
  }, [item, tenantId]);

  const schema = Yup.object().shape({
    bipardLocation: Yup.object({
      name: Yup.string().required('BIPARD location is required'),
    })
      .nullable()
      .required('BIPARD location is required'),
    messName: Yup.string().trim().required('Mess name is required'),
    capacity: Yup.string().trim().required('Capacity is required'),
    inchargeName: Yup.string().trim().required('Incharge name is required'),
    inchargeContactNo: Yup.string()
      .trim()
      .matches(mobileRegex, {
        message: 'Enter a valid mobile number',
        excludeEmptyString: true,
      })
      .notRequired(),
  });

  const validate = () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
      return true;
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
      return false;
    }
  };

  const handleSuccess = (res: any) => {
    route.params?.onDone?.();
    navigation.goBack();
    Toast.show({
      type: 'success',
      text2: res?.data?.message || (isEdit ? 'Mess updated' : 'Mess added'),
    });
    setLoader(false);
  };

  const handleError = (err: any) => {
    setLoader(false);
    Toast.show({
      type: 'error',
      text2: err?.data?.message || strings.something_went_wrong,
    });
  };

  const onSubmit = () => {
    if (!validate()) return;

    setLoader(true);
    const params = {
      id: isEdit ? item?.id : null,
      bipardCentre: [form.bipardLocation?.name],
      messName: form.messName.trim(),
      capacity: form.capacity,
      inchargeName: form.inchargeName.trim(),
      inchargeContactNo: form.inchargeContactNo,
      status: form.status,
    };

    const request = isEdit ? updateApi(params) : addApi(params);
    request.unwrap().then(handleSuccess).catch(handleError);
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
            {isEdit ? 'Edit Mess' : 'Add Mess'}
          </TextAtom>
        </TouchableAtom>

        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            isMandatory
            data={locationOptions}
            value={form.bipardLocation?.id}
            placeholder="Select"
            disabled={tenantId !== 3}
            onChange={selected => {
              setForm(prev => ({ ...prev, bipardLocation: selected }));
              setErrors((prev: any) => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={errors['bipardLocation.name'] || errors.bipardLocation}
          />
          <FormTextInputWithTitle
            title="Mess Name"
            isMandatory
            placeholder="Enter Name"
            value={form.messName}
            onChangeText={messName => {
              setForm(prev => ({ ...prev, messName }));
              setErrors((prev: any) => ({ ...prev, messName: '' }));
            }}
            errorMessage={errors.messName}
          />
          <FormTextInputWithTitle
            title="Capacity"
            isMandatory
            placeholder="Enter"
            keyboardType="numeric"
            value={form.capacity}
            onChangeText={capacity => {
              setForm(prev => ({ ...prev, capacity: normalizeNumber(capacity) }));
              setErrors((prev: any) => ({ ...prev, capacity: '' }));
            }}
            errorMessage={errors.capacity}
          />
          <FormTextInputWithTitle
            title="Incharge Name"
            isMandatory
            placeholder="Enter"
            value={form.inchargeName}
            onChangeText={inchargeName => {
              setForm(prev => ({ ...prev, inchargeName }));
              setErrors((prev: any) => ({ ...prev, inchargeName: '' }));
            }}
            errorMessage={errors.inchargeName}
          />
          <FormTextInputWithTitle
            title="Incharge Contact No."
            placeholder="+91  |  912345 00001"
            keyboardType="number-pad"
            maxLength={10}
            value={form.inchargeContactNo}
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={inchargeContactNo => {
              setForm(prev => ({
                ...prev,
                inchargeContactNo: normalizeNumber(inchargeContactNo),
              }));
              setErrors((prev: any) => ({ ...prev, inchargeContactNo: '' }));
            }}
            errorMessage={errors.inchargeContactNo}
          />
          <FormSwitchWithTitle
            title="Status"
            data={statusOptions}
            selectedValue={form.status}
            onSelect={selected => {
              setForm(prev => ({ ...prev, status: selected.id }));
            }}
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

export default AddMessMaster;

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
