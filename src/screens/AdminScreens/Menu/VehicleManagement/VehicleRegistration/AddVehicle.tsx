import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { pick, types } from '@react-native-documents/picker';
import {
  colors,
  fonts,
  screensName,
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

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddVehicle = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [commonFileUploadApi] = useCommonFileUploadMutation();
  const [addVehicleDetailsApi] = useAddVehicleDetailsMutation();
  const [updateVehicleDetailsApi] = useUpdateVehicleDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item)
        ? 'Edit Vehicle Management'
        : 'Add Vehicle Management',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    bipardLocation: {},
    vehicleName: '',
    vehicleRegistrationNumber: '',
    vehicleColorList: [],
    vehicleColor: {},
    vehicleOwnerName: '',
    vehicleOwnerContactNumber: '',
    status: {},
    rcFile: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
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
  }, [item]);

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
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.VehicleRegistration,
              },
            ],
          }),
        );
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
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.VehicleRegistration,
              },
            ],
          }),
        );
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

      if (result && result[0]) {
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
          label={'Bipard Location'}
          placeholder={'Bipard Location'}
          onPress={() => {
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
                  vehicleColor: {},
                }));
                getColor(data.name);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
        />
        <TextInputOrganisms
          label={'Vehicle Name'}
          placeholder={'Vehicle Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.vehicleName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('vehicleName', val);
            setErrors({ ...errors, vehicleName: '' });
          }}
          isMandatory
          errorMessage={errors.vehicleName}
        />
        <TextInputOrganisms
          label={'Vehicle Registration Number'}
          placeholder={'Vehicle Registration Number'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.vehicleRegistrationNumber}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeLettersAndNumbers(val?.toUpperCase());
            setValue('vehicleRegistrationNumber', formattedInput);
            setErrors({ ...errors, vehicleRegistrationNumber: '' });
          }}
          isMandatory
          errorMessage={errors.vehicleRegistrationNumber}
        />
        <DropDownOrganism
          label={'Vehicle Color'}
          placeholder={'Vehicle Color'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Vehicle Color',
              Data: form.vehicleColorList,
              selectedData: form.vehicleColor,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  vehicleColor: data,
                }));

                setErrors({ ...errors, 'vehicleColor.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.vehicleColor?.name}
          isMandatory
          errorMessage={errors['vehicleColor.name']}
        />

        <TextAtom style={styles.labelStyle} numberOfLines={2}>
          RC File
        </TextAtom>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            {
              borderColor: errors['uploadFile.uri']
                ? colors.red
                : colors.grey_1,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleFileUpload}
        >
          <TextAtom style={styles.uploadText}>{strings.choose_file}</TextAtom>
          <TextAtom style={styles.instructionText}>{strings.add_pdf}</TextAtom>
        </TouchableOpacity>

        {form.rcFile?.url && (
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              { borderColor: colors.primary, marginTop: -vh(5) },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              Linking.openURL(form.rcFile.url);
            }}
          >
            <TextAtom
              style={[
                styles.uploadText,
                { color: colors.primary, fontSize: vw(15) },
              ]}
            >
              View Uploaded File
            </TextAtom>
          </TouchableOpacity>
        )}

        <TextInputOrganisms
          label={'Vehicle Owner Name'}
          placeholder={'Vehicle Owner Name'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.vehicleOwnerName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('vehicleOwnerName', val);
            setErrors({ ...errors, vehicleOwnerName: '' });
          }}
          isMandatory
          errorMessage={errors.vehicleOwnerName}
        />
        <TextInputOrganisms
          label={'Vehicle Owner Contact Number'}
          placeholder={'Vehicle Owner Contact Number'}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.vehicleOwnerContactNumber}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            let formatted = normalizeNumber(val);
            setValue('vehicleOwnerContactNumber', formatted);
            setErrors({ ...errors, vehicleOwnerContactNumber: '' });
          }}
          isMandatory
          errorMessage={errors.vehicleOwnerContactNumber}
          maxLength={10}
          keyboardType="numeric"
        />
        <RadioSelectableOrganism
          data={[
            { id: 'Active', value: 'Active' },
            { id: 'Inactive', value: 'Inactive' },
          ]}
          onSelect={(item: any) => {
            setValue('status', item);
            setErrors({ ...errors, 'status.id': '' });
          }}
          label={'Status'}
          selectedType={form.status}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['status.id']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
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
});
