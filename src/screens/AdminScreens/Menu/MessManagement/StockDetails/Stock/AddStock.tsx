import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import {
  useMessManagementAddStockDetailsMutation,
  useMessManagementUpdateStockDetailsMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddStock = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useMessManagementAddStockDetailsMutation();
  const [updateApi] = useMessManagementUpdateStockDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Stcok' : 'Update Stock',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);

  const getInitialLocation = () => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna' };
    return {};
  };

  const [form, setForm] = useState<any>({
    bipardLocation: getInitialLocation(),
    messList: [],
    selectedMess: {},
    brandList: [],
    selectedBrand: {},
    typeList: [],
    selectedType: {},
    itemList: [],
    selectedItem: {},
    quantity: '',
    mrp: '',
    mfgDate: '',
    expDate: '',
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

    const selectedLocation = locationMap[item.tenantId];

    setForm((prev: any) => ({
      ...prev,

      bipardLocation: selectedLocation,

      selectedMess: {
        id: item.messId,
        name: item.messName,
      },

      quantity: String(item.quantity),
      mrp: String(item.mrp),

      mfgDate: moment(item.manufacturingDate, 'YYYY-MM-DD').format(
        'DD-MM-YYYY',
      ),
      expDate: moment(item.expiryDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    }));

    prefillDropdowns(selectedLocation.id);
  }, [item]);

  const prefillDropdowns = async (locationId: any) => {
    try {
      setLoader(true);

      getMessList(locationId);

      const brandRes = await commonDropdownApi({
        listType: 'select_item_brand_for_mess_stock_details',
        bipardCentre: [locationId],
        replacements: ['%%'],
      }).unwrap();

      setValue('brandList', brandRes.data);

      setValue('selectedBrand', {
        id: item.itemBrandId,
        name: item.itemBrandName,
      });

      const typeRes = await commonDropdownApi({
        listType: 'select_item_type_for_mess_stock_details',
        bipardCentre: [locationId],
        replacements: ['%%', item.itemBrandId],
      }).unwrap();

      setValue('typeList', typeRes.data);

      setValue('selectedType', {
        id: item.itemTypeId,
        name: item.itemTypeName,
      });

      const itemRes = await commonDropdownApi({
        listType: 'select_item_name_for_mess_stock_details',
        bipardCentre: [locationId],
        replacements: ['%%', item.itemBrandId, item.itemTypeId],
      }).unwrap();

      setValue('itemList', itemRes.data);

      setValue('selectedItem', {
        id: item.itemId,
        name: item.itemName,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text2: 'Failed to prefill stock details',
      });
    } finally {
      setLoader(false);
    }
  };

  const schema = Yup.object().shape({
    expDate: Yup.string().required('Expiry Date is required'),
    mfgDate: Yup.string().required('Manufacture Date is required'),
    mrp: Yup.string().required('MRP is required'),
    quantity: Yup.string().required('Quantity is required'),
    selectedItem: Yup.object({
      id: Yup.string().required('Item is required'),
    }),
    selectedType: Yup.object({
      id: Yup.string().required('Item Type is required'),
    }),
    selectedBrand: Yup.object({
      id: Yup.string().required('Brand is required'),
    }),
    selectedMess: Yup.object({
      id: Yup.string().required('Mess is required'),
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
      id: null,
      mess: form.selectedMess.id,
      itemBrand: form.selectedBrand.id,
      itemType: form.selectedType.id,
      item: form.selectedItem.id,
      quantity: form.quantity,
      mrp: form.mrp,
      manufacturingDate: moment(form.mfgDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      expiryDate: moment(form.expDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      status: 'Active',
      bipardCentre: [form.bipardLocation?.name],
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
    let params = {
      id: item.id,
      mess: form.selectedMess.id,
      itemBrand: form.selectedBrand.id,
      itemType: form.selectedType.id,
      item: form.selectedItem.id,
      quantity: form.quantity,
      mrp: form.mrp,
      manufacturingDate: moment(form.mfgDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      expiryDate: moment(form.expDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      bipardCentre: [form.bipardLocation?.name],
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

  const getMessList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_mess_for_mess_stock_details',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setValue('messList', resData);
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

  const getBrandList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_brand_for_mess_stock_details',
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
      listType: 'select_item_type_for_mess_stock_details',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', id],
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

  const getItemList = (brandId: any, id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_name_for_mess_stock_details',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', brandId, id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setValue('itemList', resData);
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
                }));
                getMessList(data.id);
                getBrandList(data.id);
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
          label={'Mess'}
          placeholder={'Mess'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Mess',
              Data: form.messList,
              selectedData: form.selectedMess,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedMess: data,
                }));
                setErrors({ ...errors, 'selectedMess.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedMess?.name}
          isMandatory
          errorMessage={errors['selectedMess.id']}
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
                  selectedType: {},
                  selectedItem: {},
                }));
                getTypeList(data.id);
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
          label={'Item Type'}
          placeholder={'Item Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Item Type',
              Data: form.typeList,
              selectedData: form.selectedType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedType: data,
                  selectedItem: {},
                }));
                getItemList(form.selectedBrand.id, data.id);
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
        <DropDownOrganism
          label={'Item'}
          placeholder={'Item'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Item',
              Data: form.itemList,
              selectedData: form.selectedItem,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedItem: data,
                }));
                setErrors({ ...errors, 'selectedItem.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedItem?.name}
          isMandatory
          errorMessage={errors['selectedItem.id']}
        />
        <TextInputOrganisms
          label={'Quantity'}
          placeholder={'Quantity'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref?.current?.focus()}
          value={form.quantity}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('quantity', normalizeNumber(val));
            setErrors({ ...errors, quantity: '' });
          }}
          isMandatory
          errorMessage={errors.quantity}
          maxLength={10}
          keyboardType="numeric"
        />{' '}
        <TextInputOrganisms
          label={'MRP'}
          placeholder={'MRP'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.mrp}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('mrp', normalizeNumber(val));
            setErrors({ ...errors, mrp: '' });
          }}
          isMandatory
          errorMessage={errors.mrp}
          maxLength={10}
          keyboardType="numeric"
        />
        <DateInputOrganism
          label={'Manufacture Date'}
          placeholder={'Manufacture Date'}
          value={form.mfgDate}
          onChangeText={(val: any) => {
            setValue('mfgDate', val);
            setErrors({ ...errors, mfgDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.mfgDate}
        />
        <DateInputOrganism
          label={'Expiry Date'}
          placeholder={'Expiry Date'}
          value={form.expDate}
          onChangeText={(val: any) => {
            setValue('expDate', val);
            setErrors({ ...errors, expDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          minDate={
            form.mfgDate
              ? moment(form.mfgDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
          isMandatory
          errorMessage={errors.expDate}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddStock;

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
});
