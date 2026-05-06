import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  FormFileUploadWithTitle,
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import {
  useAddMedicineMutation,
  useUpdateMedicineMutation,
} from '../../../../../../injectEndpoints/phcEndpoints';
import { useCommonFileUploadMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

type FileData = {
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

const locationOptions = [
  { id: 'Gaya', name: 'Gaya' },
  { id: 'Patna', name: 'Patna' },
];

const entryTypeOptions = [{ id: 'Bulk Upload', name: 'Bulk Upload' }];

const AddPharmacyMaster = ({ navigation, route }: Props) => {
  const item = route.params?.item;
  const isEdit = !!item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [addApi] = useAddMedicineMutation();
  const [updateApi] = useUpdateMedicineMutation();
  const [commonFileUploadApi] = useCommonFileUploadMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<{
    bipardLocation: any;
    medicineEntryType: any;
    uploadSample: FileData | null;
    uploadedDocument: any;
  }>({
    bipardLocation:
      tenantId === 1
        ? locationOptions[0]
        : tenantId === 2
        ? locationOptions[1]
        : null,
    medicineEntryType: entryTypeOptions[0],
    uploadSample: null,
    uploadedDocument: null,
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
      ...prev,
      bipardLocation:
        item?.tenantId === 1
          ? locationOptions[0]
          : item?.tenantId === 2
          ? locationOptions[1]
          : prev.bipardLocation,
      medicineEntryType: entryTypeOptions[0],
      uploadedDocument: item?.uploadSample ?? item?.document ?? null,
    }));
  }, [item]);

  const schema = Yup.object().shape({
    bipardLocation: Yup.object({
      name: Yup.string().required('BIPARD location is required'),
    })
      .nullable()
      .required('BIPARD location is required'),
    medicineEntryType: Yup.object({
      id: Yup.string().required('Medicine entry type is required'),
    }),
    uploadSample: isEdit
      ? Yup.mixed().nullable()
      : Yup.mixed().required('Upload sample is required'),
  });

  const handleSuccess = (res: any) => {
    route.params?.onDone?.();
    navigation.goBack();
    Toast.show({
      type: 'success',
      text2: res?.data?.message || (isEdit ? 'Pharmacy updated' : 'Pharmacy added'),
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

  const uploadDocument = async () => {
    if (!form.uploadSample) return form.uploadedDocument;

    const formData = new FormData();
    formData.append('document', {
      uri: form.uploadSample.uri,
      name: form.uploadSample.name,
      type:
        form.uploadSample.type ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    } as any);

    const res = await commonFileUploadApi(formData).unwrap();
    return res?.data;
  };

  const onSubmit = async () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
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
      return;
    }

    setLoader(true);
    try {
      const uploadedDocument = await uploadDocument();
      const params: any = {
        bipardCentre: [form.bipardLocation?.name],
        id: isEdit ? item?.id ?? item?.medicineId : null,
        medicineEntryType: form.medicineEntryType?.id,
        uploadSample: uploadedDocument,
        document: uploadedDocument,
        status: 'Active',
      };

      if (isEdit) {
        updateApi(params).unwrap().then(handleSuccess).catch(handleError);
      } else {
        addApi(params).unwrap().then(handleSuccess).catch(handleError);
      }
    } catch (err) {
      handleError(err);
    }
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
            {isEdit ? 'Edit Pharmacy' : 'Add Pharmacy'}
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
                bipardLocation: selected,
              }));
              setErrors((prev: any) => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={errors['bipardLocation.name'] || errors.bipardLocation}
          />
          <FormDropdownFieldWithTitle
            title="Medicine Entry Type"
            isMandatory
            data={entryTypeOptions}
            value={form.medicineEntryType?.id}
            labelField="name"
            valueField="id"
            placeholder="Select"
            onChange={selected => {
              setForm(prev => ({
                ...prev,
                medicineEntryType: selected,
              }));
              setErrors((prev: any) => ({
                ...prev,
                medicineEntryType: '',
                'medicineEntryType.id': '',
              }));
            }}
            errorMessage={errors['medicineEntryType.id'] || errors.medicineEntryType}
          />
          <FormFileUploadWithTitle
            title="Upload Sample"
            isMandatory={!isEdit}
            fileName={form.uploadSample?.name}
            accept={[
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'text/csv',
            ]}
            onFileSelected={file => {
              setForm(prev => ({
                ...prev,
                uploadSample: file,
              }));
              setErrors((prev: any) => ({ ...prev, uploadSample: '' }));
            }}
            onFileRemove={() => {
              setForm(prev => ({
                ...prev,
                uploadSample: null,
              }));
            }}
            errorMessage={errors.uploadSample}
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

export default AddPharmacyMaster;

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
