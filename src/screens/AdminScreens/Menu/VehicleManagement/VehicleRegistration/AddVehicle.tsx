import {
  Image,
  Keyboard,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { pick, types } from '@react-native-documents/picker';
import {
  colors,
  fonts,
  images,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../../../components/atoms/TextAtom';
import RadioSelectableOrganism from '../../../../../components/organisms/RadioSelectableOrganism';
import {
  FormDropdownFieldWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormSwitchForCard,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../components/templates';
import { globalStyles } from '../../../../../utils/globalStyles';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import {
  isNullUndefined,
  mobileRegex,
  normalizeLettersAndNumbers,
  normalizeNumber,
} from '../../../../../utils/CommonFunction';
import {
  useAddVehicleDetailsMutation,
  useCommonDropdownListMutation,
  useCommonFileUploadMutation,
  useUpdateVehicleDetailsMutation,
} from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useAppSelector } from '../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddVehicle = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const fromFacilities = props.route.params?.fromFacilities;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [commonFileUploadApi] = useCommonFileUploadMutation();
  const [addVehicleDetailsApi] = useAddVehicleDetailsMutation();
  const [updateVehicleDetailsApi] = useUpdateVehicleDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? 'Add Vehicle Management'
        : 'Edit Vehicle Management',
      undefined,
      undefined,
      undefined,
      fromFacilities
        ? {
            backgroundColor: colors.primary_dark_blue,
            titleColor: colors.white,
            backIconColor: colors.white,
          }
        : undefined,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [fromFacilities, item, navigation]);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    bipardLocation:
      tenantId === 1
        ? { id: 'Gaya', name: 'Gaya' }
        : tenantId === 2
        ? { id: 'Patna', name: 'Patna' }
        : fromFacilities
        ? { id: 'Gaya', name: 'Gaya' }
        : {},
    vehicleName: '',
    vehicleRegistrationNumber: '',
    vehicleColorList: [],
    vehicleColor: {},
    vehicleOwnerName: '',
    vehicleOwnerContactNumber: '',
    status: { id: 'Active', value: 'Active' },
    rcFile: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!item) {
      if (tenantId === 1) {
        setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
        getColor('Gaya');
      } else if (tenantId === 2) {
        setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
        getColor('Patna');
      } else if (fromFacilities) {
        setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
        getColor('Gaya');
      }
      return;
    }
    if (item) {
      const locationMap: any = {
        1: { id: 'Gaya', name: 'Gaya' },
        2: { id: 'Patna', name: 'Patna' },
      };

      const selectedLocation = locationMap[item.tenantId] || {};
      setForm({
        bipardLocation: selectedLocation,
        vehicleName: item.vehicleName || '',
        vehicleRegistrationNumber: item.registrationNo || '',
        vehicleColorList: [],
        vehicleColor: { id: item.vehicleColorId, name: item.vehicleColor },
        vehicleOwnerName: item.ownerName || '',
        vehicleOwnerContactNumber: item.ownerContactNo || '',
        status: {
          id: item.status === 'Active' ? 'Active' : 'Inactive',
          value: item.status,
        },
        rcFile: item.rcFile
          ? {
              url: item.rcFile,
              name: item.rcFile.split('/').pop(),
              originalFilename: item.rcFile.split('/').pop(),
            }
          : {},
      });

      if (item.vehicleColor) {
        getColor(item.bipardCentre?.[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromFacilities, item, tenantId]);

  const schema = Yup.object().shape({
    status: Yup.object({
      id: Yup.string().required('Status is required'),
    }),
    vehicleOwnerContactNumber: Yup.string()
      .required('Vehicle owner contact number is required')
      .max(10, strings.enter_valid_mobile)
      .min(10, strings.enter_valid_mobile)
      .matches(mobileRegex, strings.enter_valid_mobile),
    vehicleOwnerName: Yup.string().required('Vehicle owner name is required'),
    vehicleColor: Yup.object({
      name: Yup.string().required('Vehicle color is required'),
    }),
    vehicleRegistrationNumber: Yup.string().required(
      'Vehicle registration number is required',
    ),
    vehicleName: Yup.string().required('Vehicle name is required'),

    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateVehicleDetails();
      } else {
        addVehicleDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addVehicleDetails = () => {
    setLoader(true);
    let params = {
      id: '',
      bipardCentre: [form.bipardLocation?.name],
      name: form.vehicleName,
      registrationNo: form.vehicleRegistrationNumber,
      ownerName: form.vehicleOwnerName,
      ownerContactNo: form.vehicleOwnerContactNumber,
      rcFile: form.rcFile?.originalFilename,
      status: form.status.value,
      vehicleColor: form.vehicleColor?.id,
    };
    addVehicleDetailsApi(params)
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
  const updateVehicleDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      name: form.vehicleName,
      registrationNo: form.vehicleRegistrationNumber,
      ownerName: form.vehicleOwnerName,
      ownerContactNo: form.vehicleOwnerContactNumber,
      rcFile: form.rcFile?.originalFilename ?? null,
      status: form.status.value,
      vehicleColor: form.vehicleColor?.id,
    };
    updateVehicleDetailsApi(params)
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

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      if (result?.[0]) {
        const file = result[0];

        const MAX_SIZE = 3 * 1024 * 1024;
        if (file.size && file.size > MAX_SIZE) {
          Toast.show({
            type: 'error',
            text2: strings.file_size_exceeded,
          });
          return;
        }

        const fileData = {
          uri: file.uri,
          fileName: file.name,
          type: file.type || 'application/pdf',
          size: file.size || 0,
        };

        fileUpload(fileData);
        Toast.show({
          type: 'success',
          text2: `${file.name} ${strings.file_selected}`,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') return;
      Toast.show({
        type: 'error',
        text2: strings.file_pick_failed,
      });
    }
  };

  const fileUpload = (data: any) => {
    setLoader(true);
    const formData = new FormData();
    formData.append('document', {
      uri: data.uri,
      name: data.fileName || 'response.pdf',
      type: data.type || 'application/pdf',
    } as any);

    commonFileUploadApi(formData)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        setValue('rcFile', res.data);
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

  const getColor = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'select_color',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('vehicleColorList', res.data);
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
    <SafeAreaView edges={['bottom']} style={styles.facilitiesContainer}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.facilitiesContentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            placeholder="Select"
            data={[
              { id: 'Gaya', name: 'Gaya' },
              { id: 'Patna', name: 'Patna' },
            ]}
            value={form.bipardLocation?.id}
            onChange={(data: any) => {
              setForm((prev: any) => ({
                ...prev,
                bipardLocation: data,
                vehicleColor: {},
              }));
              getColor(data.name);
              setErrors({ ...errors, 'bipardLocation.name': '' });
            }}
            isMandatory
            errorMessage={errors['bipardLocation.name']}
            disabled={tenantId !== 3}
          />
          <FormTextInputWithTitle
            title="Vehicle Name"
            placeholder="Enter"
            value={form.vehicleName}
            onSubmitEditing={() => input2_ref.current?.focus()}
            returnKeyType="next"
            onChangeText={(val: string) => {
              setValue('vehicleName', val);
              setErrors({ ...errors, vehicleName: '' });
            }}
            isMandatory
            errorMessage={errors.vehicleName}
          />
          <FormTextInputWithTitle
            title="Vehicle Registration Number"
            placeholder="Enter"
            value={form.vehicleRegistrationNumber}
            onSubmitEditing={() => input3_ref.current?.focus()}
            returnKeyType="next"
            autoCapitalize="characters"
            onChangeText={(val: string) => {
              const formattedInput = normalizeLettersAndNumbers(
                val?.toUpperCase(),
              );
              setValue('vehicleRegistrationNumber', formattedInput);
              setErrors({ ...errors, vehicleRegistrationNumber: '' });
            }}
            isMandatory
            errorMessage={errors.vehicleRegistrationNumber}
          />
          <FormDropdownFieldWithTitle
            title="Vehicle Color"
            placeholder="Select"
            data={form.vehicleColorList}
            value={form.vehicleColor?.id}
            onChange={(data: any) => {
              setForm((prev: any) => ({
                ...prev,
                vehicleColor: data,
              }));
              setErrors({ ...errors, 'vehicleColor.name': '' });
            }}
            isMandatory
            errorMessage={errors['vehicleColor.name']}
          />
          <FormTextInputWithTitle
            title="Vehicle Owner Name"
            placeholder="Enter"
            value={form.vehicleOwnerName}
            onSubmitEditing={() => input4_ref.current?.focus()}
            returnKeyType="next"
            onChangeText={(val: string) => {
              setValue('vehicleOwnerName', val);
              setErrors({ ...errors, vehicleOwnerName: '' });
            }}
            isMandatory
            errorMessage={errors.vehicleOwnerName}
          />
          <FormTextInputWithTitle
            title="Vehicle Owner Mobile No."
            placeholder="Enter"
            value={form.vehicleOwnerContactNumber}
            onSubmitEditing={() => Keyboard.dismiss()}
            returnKeyType="done"
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(val: string) => {
              const formatted = normalizeNumber(val);
              setValue('vehicleOwnerContactNumber', formatted);
              setErrors({ ...errors, vehicleOwnerContactNumber: '' });
            }}
            isMandatory
            errorMessage={errors.vehicleOwnerContactNumber}
          />
          <View style={styles.facilitiesFieldCard}>
            <FormSwitchForCard
              title="Status"
              data={[
                { id: 'Active', label: 'Active' },
                { id: 'Inactive', label: 'Inactive' },
              ]}
              selectedValue={form.status?.id}
              onSelect={(data: any) => {
                setValue('status', {
                  id: data.id,
                  value: data.label,
                });
                setErrors({ ...errors, 'status.id': '' });
              }}
              errorMessage={errors['status.id']}
            />
          </View>
          <FormFileUploadWithTitle
            title="Upload RC"
            isMandatory
            fileName={
              form.rcFile?.originalFilename ||
              form.rcFile?.name ||
              form.rcFile?.fileName
            }
            onFileSelected={(file: any) => {
              if (!file) {
                setValue('rcFile', {});
                return;
              }
              fileUpload({
                uri: file.uri,
                fileName: file.name,
                type: file.type || 'application/pdf',
                size: file.size || 0,
              });
            }}
            onFileRemove={() => setValue('rcFile', {})}
            errorMessage={errors['rcFile.originalFilename']}
          />
        </View>

        <View style={styles.footerRow}>
          {item ? (
            <FormWhiteButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              containerStyle={[styles.footerButton, { marginRight: 4 }]}
            />
          ) : null}
          <FormGradientButton
            title={item ? 'Update' : 'Add'}
            onPress={onSubmit}
            loading={loader}
            containerStyle={[styles.footerButton, { marginLeft: 4 }]}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddVehicle;

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
  uploadBtn: {
    borderWidth: 1,
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(320),
    alignSelf: 'center',
    backgroundColor: colors.backgroundColor,
    marginBottom: vh(10),
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey_1,
    fontSize: vw(14),
  },
  instructionText: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(4),
  },
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
    marginBottom: vh(8),
  },
  facilitiesContainer: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  localHeader: {
    minHeight: vh(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(16),
    gap: vw(8),
  },
  localBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.text_black,
    resizeMode: 'contain',
  },
  localTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  scroll: {
    flex: 1,
  },
  facilitiesContentScroll: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(24),
  },
  facilitiesFieldCard: {
    backgroundColor: '#F9FAFB',
    padding: vw(8),
    marginBottom: vh(10),
    borderRadius: vw(8),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingTop: vh(16),
    paddingBottom: vh(16),
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
});
