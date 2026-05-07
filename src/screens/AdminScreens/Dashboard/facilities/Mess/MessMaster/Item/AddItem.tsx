import { Keyboard, StyleSheet, View } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, images, vh, vw } from '../../../../../../../constants';
import { useAppSelector } from '../../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../../components/atoms/ImageAtom';
import {
  FormDropdownFieldWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../../components/templates';
import { globalStyles } from '../../../../../../../utils/globalStyles';
import { isNullUndefined } from '../../../../../../../utils/CommonFunction';
import {
  useMessManagementAddItemMutation,
  useMessManagementUpdateItemMutation,
} from '../../../../../../../injectEndpoints/messManagementEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddItem = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const fromFacilities = props.route.params?.fromFacilities;
  const input1_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useMessManagementAddItemMutation();
  const [updateApi] = useMessManagementUpdateItemMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Item' : 'Update Item',
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

  const getInitialLocation = () => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna' };
    return {};
  };

  const [form, setForm] = useState<any>({
    bipardLocation: getInitialLocation(),
    brandList: [],
    selectedBrand: {},
    typeList: [],
    selectedType: {},
    itemName: '',
    measurementList: [],
    selectedMeasurement: {},
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

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,

      itemName: item.itemName || '',

      selectedBrand: {
        id: item.itemBrandId,
        name: item.itemBrandName,
      },

      selectedType: {
        id: item.itemTypeId,
        name: item.itemTypeName,
      },

      selectedMeasurement: {
        id: item.measurementUnitId,
        name: item.measurementUnitName,
      },
    }));

    getBrandList(selectedLocation.id);
    getTypeList(selectedLocation.id);
    getMeasurementList(selectedLocation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    if (item || tenantId === 3 || !form.bipardLocation?.id) return;
    getBrandList(form.bipardLocation.id);
    getTypeList(form.bipardLocation.id);
    getMeasurementList(form.bipardLocation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.bipardLocation?.id, item, tenantId]);

  const schema = Yup.object().shape({
    selectedMeasurement: Yup.object({
      id: Yup.string().required('Measurement is required'),
    }),
    itemName: Yup.string().required('Item name is required'),
    selectedType: Yup.object({
      id: Yup.string().required('Type is required'),
    }),
    selectedBrand: Yup.object({
      id: Yup.string().required('Brand is required'),
    }),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateDetails();
      } else {
        addDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params = {
      bipardCentre: [form.bipardLocation?.name],
      id: null,
      itemBrand: form.selectedBrand.id,
      itemType: form.selectedType.id,
      itemName: form.itemName,
      measurementUnitId: form.selectedMeasurement.id,
      status: 'Active',
    };
    addApi(params)
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

  const updateDetails = () => {
    setLoader(true);

    let params: any = {
      bipardCentre: [form.bipardLocation?.name],
      id: item.id,
      itemBrand: form.selectedBrand.id,
      itemType: form.selectedType.id,
      itemName: form.itemName,
      measurementUnitId: form.selectedMeasurement.id,
    };

    updateApi(params)
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

  const getBrandList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_brand_for_mess_item',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setValue('brandList', resData);
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

  const getTypeList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_type_for_mess_item',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setValue('typeList', resData);
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

  const getMeasurementList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_measurement_unit_for_mess_item',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setValue('measurementList', resData);
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

  if (fromFacilities) {
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
                  selectedBrand: {},
                  selectedType: {},
                  selectedMeasurement: {},
                }));
                getBrandList(data.id);
                getTypeList(data.id);
                getMeasurementList(data.id);
                setErrors({ ...errors, 'bipardLocation.name': '' });
              }}
              isMandatory
              errorMessage={errors['bipardLocation.name']}
              disabled={tenantId !== 3}
            />
            <FormDropdownFieldWithTitle
              title="Select Brand"
              placeholder="Select"
              data={form.brandList}
              value={form.selectedBrand?.id}
              onChange={(data: any) => {
                setForm((prev: any) => ({ ...prev, selectedBrand: data }));
                setErrors({ ...errors, 'selectedBrand.id': '' });
              }}
              isMandatory
              errorMessage={errors['selectedBrand.id']}
            />
            <FormDropdownFieldWithTitle
              title="Select Type"
              placeholder="Select"
              data={form.typeList}
              value={form.selectedType?.id}
              onChange={(data: any) => {
                setForm((prev: any) => ({ ...prev, selectedType: data }));
                setErrors({ ...errors, 'selectedType.id': '' });
              }}
              isMandatory
              errorMessage={errors['selectedType.id']}
            />
            <FormTextInputWithTitle
              title="Item Name"
              placeholder="Enter"
              onSubmitEditing={() => Keyboard.dismiss()}
              value={form.itemName}
              autoCapitalize="none"
              returnKeyType="done"
              onChangeText={(val: string) => {
                setValue('itemName', val);
                setErrors({ ...errors, itemName: '' });
              }}
              isMandatory
              errorMessage={errors.itemName}
            />
            <FormDropdownFieldWithTitle
              title="Select Measurement"
              placeholder="Select"
              data={form.measurementList}
              value={form.selectedMeasurement?.id}
              onChange={(data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedMeasurement: data,
                }));
                setErrors({ ...errors, 'selectedMeasurement.id': '' });
              }}
              isMandatory
              errorMessage={errors['selectedMeasurement.id']}
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
            title={item ? 'Update' : 'Add'}
            onPress={onSubmit}
            loading={loader}
            containerStyle={styles.footerButton}
            buttonStyle={styles.gradientButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
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
                }));
                getBrandList(data.id);
                getTypeList(data.id);
                getMeasurementList(data.id);
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
          label={'Brand'}
          placeholder={'Brand'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Brand',
              Data: form.brandList,
              selectedData: form.selectedBrand,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedBrand: data,
                }));
                setErrors({ ...errors, 'selectedBrand.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedBrand?.name}
          isMandatory
          errorMessage={errors['selectedBrand.id']}
        />

        <DropDownOrganism
          label={'Type'}
          placeholder={'Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Type',
              Data: form.typeList,
              selectedData: form.selectedType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedType: data,
                }));
                setErrors({ ...errors, 'selectedType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedType?.name}
          isMandatory
          errorMessage={errors['selectedType.id']}
        />

        <TextInputOrganisms
          label={'Item Name'}
          placeholder={'Item Name'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.itemName}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('itemName', val);
            setErrors({ ...errors, itemName: '' });
          }}
          isMandatory
          errorMessage={errors.itemName}
        />

        <DropDownOrganism
          label={'Measurement'}
          placeholder={'Measurement'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Measurement',
              Data: form.measurementList,
              selectedData: form.selectedMeasurement,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedMeasurement: data,
                }));
                setErrors({ ...errors, 'selectedMeasurement.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedMeasurement?.name}
          isMandatory
          errorMessage={errors['selectedMeasurement.id']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddItem;

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
  facilitiesContainer: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scroll: {
    flex: 1,
  },
  facilitiesContentScroll: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(24),
  },
  localHeader: {
    height: vh(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(16),
    gap: vw(8),
  },
  localBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.text_black,
  },
  localHeaderTitle: {
    color: colors.text_black,
    fontSize: vw(16),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(15),
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(7),
    borderColor: colors.primary_dark_blue,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(7),
  },
});
