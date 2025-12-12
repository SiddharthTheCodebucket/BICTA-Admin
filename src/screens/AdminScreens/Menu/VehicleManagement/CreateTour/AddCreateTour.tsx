import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { isNullUndefined } from '../../../../../utils/CommonFunction';
import {
  useAddTripDetailsMutation,
  useCommonDropdownListMutation,
  useUpdateAssignVehicleMutation,
  useUpdateTripDetailsMutation,
} from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import TextAtom from '../../../../../components/atoms/TextAtom';
import { useAppSelector } from '../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddCreateTour = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [addTripDetailsApi] = useAddTripDetailsMutation();
  const [updateTripDetailsApi] = useUpdateTripDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item) ? 'Edit Create Tour' : 'Add Create Tour',
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
    tourType: {},
    startPointList: [],
    startPoint: {},
    endPointList: [],
    endPoint: {},
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
      } else if (tenantId === 2) {
        setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
        getListAllTraining('Patna');
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

    const prefillTourData = async () => {
      try {
        const trainingRes: any = await commonDropdownListApi({
          listType: 'list-all-training',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%'],
        }).unwrap();

        const trainingList = trainingRes?.data || [];

        const selectedTraining =
          trainingList.find((t: any) => t.id == item.trainingId) || {};

        const vehicleRes: any = await commonDropdownListApi({
          listType: 'select_assigned_vehicle',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%', item.trainingId],
        }).unwrap();

        const vehicleList = vehicleRes?.data || [];

        const selectedVehicle =
          vehicleList.find(
            (v: any) => v.assignedVehicleId == item.assignedVehicleId,
          ) || {};

        const startPointRes: any = await commonDropdownListApi({
          listType: 'select_trip_start_point',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%', item.routeType],
        }).unwrap();

        const startPointList = startPointRes?.data || [];

        const selectedStartPoint =
          startPointList.find((sp: any) => sp.id == item.startPointId) || {};

        const endPointRes: any = await commonDropdownListApi({
          listType: 'select_trip_end_point',
          bipardCentre: [selectedLocation.name],
          replacements: ['%%', item.routeType],
        }).unwrap();

        const endPointList = endPointRes?.data || [];

        const selectedEndPoint =
          endPointList.find((ep: any) => ep.id == item.endPointId) || {};

        setForm((prev: any) => ({
          ...prev,

          bipardLocation: selectedLocation,

          trainingNameList: trainingList,
          trainingName: selectedTraining,

          vehicleRegistrationNumberList: vehicleList,
          vehicleRegistrationNumber: selectedVehicle,

          tourType: { id: item.routeType, name: item.routeType },

          startPointList: startPointList,
          startPoint: selectedStartPoint,

          endPointList: endPointList,
          endPoint: selectedEndPoint,
        }));

        setLoader(false);
      } catch (err) {
        setLoader(false);
      }
    };

    prefillTourData();
  }, [item]);

  const schema = Yup.object().shape({
    endPoint: Yup.object({
      endPoint: Yup.string().required('End point is required'),
    }),
    startPoint: Yup.object({
      name: Yup.string().required('Start point is required'),
    }),
    tourType: Yup.object({
      name: Yup.string().required('Tour type is required'),
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
        addTourDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addTourDetails = () => {
    setLoader(true);
    let params = {
      bipardCentre: isNullUndefined(form.bipardLocation)
        ? []
        : [form.bipardLocation?.name],
      trainingId: form.trainingName.id,
      assignedVehicleId: form.vehicleRegistrationNumber.assignedVehicleId,
      routeType: form.tourType.id,
      startPoint: form.startPoint.id,
      endPoint: form.endPoint.id,
    };

    addTripDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.CreateTour,
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
      bipardCentre: isNullUndefined(form.bipardLocation)
        ? []
        : [form.bipardLocation?.name],
      trainingId: form.trainingName.id,
      assignedVehicleId: form.vehicleRegistrationNumber.assignedVehicleId,
      routeType: form.tourType.id,
      startPoint: form.startPoint.id,
      endPoint: form.endPoint.id,
    };
    updateTripDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.CreateTour,
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

  const getVehicleList = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'select_assigned_vehicle',
      bipardCentre: [form.bipardLocation?.name],
      replacements: ['%%', id],
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

  const getTripStartPoint = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'select_trip_start_point',
      bipardCentre: [form.bipardLocation?.name],
      replacements: ['%%', id],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('startPointList', res.data);
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

  const getTripEndPoint = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'select_trip_end_point',
      bipardCentre: [form.bipardLocation?.name],
      replacements: ['%%', id],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('endPointList', res.data);
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
        <TextAtom
          style={{
            fontFamily: fonts.Roboto_Bold,
            fontSize: vw(16),
            color: colors.black,
            width: vw(328),
            alignSelf: 'center',
            marginBottom: vh(10),
          }}
        >
          Vehicle Details
        </TextAtom>
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
                }));
                getListAllTraining(data.name);

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
                  vehicleRegistrationNumber: {},
                }));
                getVehicleList(data.id);
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

        <TextAtom
          style={{
            fontFamily: fonts.Roboto_Bold,
            fontSize: vw(16),
            color: colors.black,
            width: vw(328),
            alignSelf: 'center',
            marginBottom: vh(10),
          }}
        >
          Create Tour
        </TextAtom>
        <DropDownOrganism
          label={'Tour Type'}
          placeholder={'Tour Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Tour Type',
              Data: [
                { id: 'Local', name: 'Local' },
                { id: 'Out-Station', name: 'Out-Station' },
              ],
              selectedData: form.tourType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  tourType: data,
                  startPoint: {},
                  endPoint: {},
                }));
                getTripStartPoint(data.id);
                getTripEndPoint(data.id);
                setErrors({ ...errors, 'tourType.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.tourType?.name}
          isMandatory
          errorMessage={errors['tourType.name']}
        />
        <DropDownOrganism
          label={'Start Point'}
          placeholder={'Start Point'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Start Point',
              Data: form.startPointList,
              selectedData: form.startPoint,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  startPoint: data,
                }));

                setErrors({ ...errors, 'startPoint.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.startPoint?.name}
          isMandatory
          errorMessage={errors['startPoint.name']}
        />
        <DropDownOrganism
          label={'End Point'}
          placeholder={'End Point'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'End Point',
              Data: form.endPointList,
              selectedData: form.endPoint,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  endPoint: data,
                }));

                setErrors({ ...errors, 'endPoint.endPoint': '' });
              },
              typeName: 'endPoint',
              typeId: 'id',
            });
          }}
          inputText={form.endPoint?.endPoint}
          isMandatory
          errorMessage={errors['endPoint.endPoint']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddCreateTour;

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
