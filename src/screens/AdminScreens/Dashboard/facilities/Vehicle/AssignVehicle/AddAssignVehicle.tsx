import { StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import {
  useAddAssignVehicleMutation,
  useCommonDropdownListMutation,
  useCommonFileUploadMutation,
  useUpdateAssignVehicleMutation,
} from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import { useAppSelector } from '../../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddAssignVehicle = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [commonFileUploadApi] = useCommonFileUploadMutation();
  const [addAssignVehicalApi] = useAddAssignVehicleMutation();
  const [updateAssignVehicalsApi] = useUpdateAssignVehicleMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Assign Vehicle' : 'Edit Assign Vehicle',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    bipardLocation: {},
    trainingNameList: [],
    trainingName: {},
    vehicleRegistrationNumberList: [],
    vehicleRegistrationNumber: {},
    status: {},
    assignDriverList: [],
    assignDriver: {},
    dlFile: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!item) {
      if (tenantId === 1) {
        setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
        getListAllTraining('Gaya');
        getDriverList('Gaya');
        getVehicleList('Gaya');
      } else if (tenantId === 2) {
        setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
        getListAllTraining('Patna');
        getDriverList('Patna');
        getVehicleList('Patna');
      }
      return;
    }

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] || {};

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,
    }));

    setLoader(true);

    const loadPrefillData = async () => {
      try {
        const trainRes: any = await commonDropdownListApi({
          listType: 'list-all-training',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%'],
        }).unwrap();

        const trainingList = trainRes?.data || [];

        const driverRes: any = await commonDropdownListApi({
          listType: 'select_driver',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%'],
        }).unwrap();

        const driverList = driverRes?.data || [];

        const vehicleRes: any = await commonDropdownListApi({
          listType: 'select_vehicle',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%'],
        }).unwrap();

        const vehicleList = vehicleRes?.data || [];

        const selectedTraining =
          trainingList.find((t: any) => t.id == item.trainingId) || {};

        const selectedDriver =
          driverList.find(
            (d: any) =>
              d.id == item.driverNameId ||
              d.id == item.driverId ||
              d.id == item.adminUserId,
          ) || {};

        const selectedVehicle =
          vehicleList.find((v: any) => v.id == item.vehicleId) || {};

        setForm((prev: any) => ({
          ...prev,

          trainingNameList: trainingList,
          trainingName: selectedTraining,

          assignDriverList: driverList,
          assignDriver: selectedDriver,

          vehicleRegistrationNumberList: vehicleList,
          vehicleRegistrationNumber: selectedVehicle,

          status: {
            id: item.status,
            value: item.status,
          },

          dlFile: item.drivingLicence
            ? {
                url: item.drivingLicence,
                name: item.drivingLicence.split('/').pop(),
                originalFilename: item.drivingLicence.split('/').pop(),
              }
            : {},
        }));

        setLoader(false);
      } catch (err) {
        setLoader(false);
      }
    };

    loadPrefillData();
  }, [item]);

  const schema = Yup.object().shape({
    assignDriver: Yup.object({
      name: Yup.string().required('Assign driver is required'),
    }),
    status: Yup.object({
      id: Yup.string().required('Status is required'),
    }),

    vehicleRegistrationNumber: Yup.object({
      vehicleRegistrationNo: Yup.string().required(
        'Vehicle registration number is required',
      ),
    }),
    trainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),
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
      trainingId: form.trainingName.id,
      vehicleId: form.vehicleRegistrationNumber.id,
      driverId: form.assignDriver.id,
      status: form.status.id,
      drivingLicence: isNullUndefined(form.dlFile) ? '' : form.dlFile.url,
      trainingDuration: `${
        form.trainingName?.startDate
          ? moment(form.trainingName.startDate).format('DD/MM/YYYY')
          : null
      } to ${
        form.trainingName?.endDate
          ? moment(form.trainingName.endDate).format('DD/MM/YYYY')
          : null
      }`,
      vehicleName: form.vehicleRegistrationNumber.vehicleName,
      vehicleColor: form.vehicleRegistrationNumber.vehicleColor,
      vehicleOwnerName: form.vehicleRegistrationNumber.vehicleOwnerName,
      vehicleOwnerContactNumber:
        form.vehicleRegistrationNumber.vehicleOwnerContactNumber,
      driverContactNumber: form.assignDriver.contactNumber,
      isDrivingLinceceProvided: form.assignDriver.isDrivingLinceceProvided,
    };

    addAssignVehicalApi(params)
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
      trainingId: form.trainingName.id,
      vehicleId: form.vehicleRegistrationNumber.id,
      driverId: form.assignDriver.id,
      status: form.status.id,
      drivingLicence: isNullUndefined(form.dlFile) ? '' : form.dlFile.url,
      trainingDuration: `${
        form.trainingName?.startDate
          ? moment(form.trainingName.startDate).format('DD/MM/YYYY')
          : null
      } to ${
        form.trainingName?.endDate
          ? moment(form.trainingName.endDate).format('DD/MM/YYYY')
          : null
      }`,
      vehicleName: form.vehicleRegistrationNumber.vehicleName,
      vehicleColor: form.vehicleRegistrationNumber.vehicleColor,
      vehicleOwnerName: form.vehicleRegistrationNumber.vehicleOwnerName,
      vehicleOwnerContactNumber:
        form.vehicleRegistrationNumber.vehicleOwnerContactNumber,
      driverContactNumber: form.assignDriver.contactNumber,
      isDrivingLinceceProvided: form.assignDriver.isDrivingLinceceProvided,
    };
    updateAssignVehicalsApi(params)
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

  const fileUpload = (fileData: any) => {
    setLoader(true);
    const formData = new FormData();
    formData.append('document', {
      uri: fileData.uri,
      name: fileData.fileName,
      type: fileData.type,
    } as any);

    commonFileUploadApi(formData)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        setValue('dlFile', res.data);
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

  const getListAllTraining = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingNameList', res.data);
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
  const getDriverList = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'select_driver',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('assignDriverList', res.data);
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
  const getVehicleList = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'select_vehicle',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('vehicleRegistrationNumberList', res.data);
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
                  trainingName: {},
                  vehicleRegistrationNumber: {},
                  assignDriver: {},
                }));
                getListAllTraining(data.name);
                getDriverList(data.name);
                getVehicleList(data.name);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Training Name'}
          placeholder={'Training Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Name',
              Data: form.trainingNameList,
              selectedData: form.trainingName,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  trainingName: data,
                }));

                setErrors({ ...errors, 'trainingName.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.trainingName?.name}
          isMandatory
          errorMessage={errors['trainingName.name']}
        />
        {!isNullUndefined(form.trainingName) && (
          <TextInputOrganisms
            label={'Training Duration'}
            placeholder={'Training Duration'}
            ref={input1_ref}
            value={`${
              form.trainingName?.startDate
                ? moment(form.trainingName.startDate).format('DD-MM-YYYY')
                : '-'
            } to ${
              form.trainingName?.endDate
                ? moment(form.trainingName.endDate).format('DD-MM-YYYY')
                : '-'
            }`}
            onChangeText={() => {}}
            disabled
            editable={false}
          />
        )}

        <DropDownOrganism
          label={'Vehicle Registration Number'}
          placeholder={'Vehicle Registration Number'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Vehicle Registration Number',
              Data: form.vehicleRegistrationNumberList,
              selectedData: form.vehicleRegistrationNumber,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  vehicleRegistrationNumber: data,
                }));

                setErrors({
                  ...errors,
                  'vehicleRegistrationNumber.vehicleRegistrationNo': '',
                });
              },
              typeName: 'vehicleRegistrationNo',
              typeId: 'id',
            });
          }}
          inputText={form.vehicleRegistrationNumber?.vehicleRegistrationNo}
          isMandatory
          errorMessage={
            errors['vehicleRegistrationNumber.vehicleRegistrationNo']
          }
        />
        {!isNullUndefined(form.vehicleRegistrationNumber) && (
          <>
            <TextInputOrganisms
              label={'Vehicle Name'}
              placeholder={'Vehicle Name'}
              ref={input2_ref}
              value={form.vehicleRegistrationNumber?.vehicleName}
              onChangeText={(val: string) => {}}
              disabled
              editable={false}
            />
            <TextInputOrganisms
              label={'Color'}
              placeholder={'Color'}
              ref={input3_ref}
              value={form.vehicleRegistrationNumber?.vehicleColor}
              onChangeText={(val: string) => {}}
              disabled
              editable={false}
            />
            <TextInputOrganisms
              label={'Vehicle Owner Name'}
              placeholder={'Vehicle Owner Name'}
              ref={input2_ref}
              value={form.vehicleRegistrationNumber?.vehicleOwnerName}
              onChangeText={(val: string) => {}}
              disabled
              editable={false}
            />
            <TextInputOrganisms
              label={'Vehicle Owner Contact Number'}
              placeholder={'Vehicle Owner Contact Number'}
              ref={input2_ref}
              value={form.vehicleRegistrationNumber?.vehicleOwnerContactNumber}
              onChangeText={(val: string) => {}}
              disabled
              editable={false}
            />
          </>
        )}

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

        <DropDownOrganism
          label={'Assign Driver'}
          placeholder={'Assign Driver'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Assign Driver',
              Data: form.assignDriverList,
              selectedData: form.assignDriver,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  assignDriver: data,
                }));

                setErrors({ ...errors, 'assignDriver.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.assignDriver?.name}
          isMandatory
          errorMessage={errors['assignDriver.name']}
        />
        {!isNullUndefined(form.assignDriver) && (
          <TextInputOrganisms
            label={'Driver Contact Number'}
            placeholder={'Driver Contact Number'}
            ref={input2_ref}
            value={form.assignDriver?.contactNumber}
            onChangeText={(val: string) => {}}
            disabled
            editable={false}
          />
        )}
        {form.assignDriver?.isDrivingLinceceProvided === 'No' && (
          <ImageUploadOrganism
            label={'DL File'}
            buttonText={strings.choose_file}
            onSelectImage={(file: any) => {
              fileUpload(file);
            }}
            defaultImage={form.dlFile?.url}
          />
        )}
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddAssignVehicle;

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
