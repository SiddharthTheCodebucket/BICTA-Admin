import { Keyboard, Linking, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, strings, vh, vw } from '../../../../../../../constants';
import { useAppSelector } from '../../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../../utils/CommonFunction';
import {
  useMessManagementAddStockConsumptionMutation,
  useMessManagementUpdateStockConsumptionMutation,
} from '../../../../../../../injectEndpoints/messManagementEndpoints';
import {
  useCommonDropdownListMutation,
  useCommonFileUploadMutation,
} from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ImageUploadOrganism from '../../../../../../../components/organisms/ImageUploadOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddStockConsumption = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useMessManagementAddStockConsumptionMutation();
  const [updateApi] = useMessManagementUpdateStockConsumptionMutation();
  const [fileUploadApi] = useCommonFileUploadMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? 'Add Stcok Consumption'
        : 'Update Stock Consumption',
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
    personCount: '',
    photo: '',
    video: '',
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
      personCount: String(item.personCount),

      photo: item.photo || '',
      video: item.consumptionVideo || '',
    }));

    prefillDropdowns(selectedLocation.id);
  }, [item]);

  const getMessListAsync = (id: any) => {
    return commonDropdownApi({
      listType: 'select_mess_for_mess_stock_consumption',
      bipardCentre: [id],
      replacements: ['%%'],
    }).unwrap();
  };

  const prefillDropdowns = async (locationId: any) => {
    try {
      setLoader(true);

      const messRes: any = getMessListAsync(locationId);
      setValue('messList', messRes.data || []);

      const brandRes = await commonDropdownApi({
        listType: 'select_item_brand_for_mess_stock_consumption',
        bipardCentre: [locationId],
        replacements: ['%%', item.messId],
      }).unwrap();

      setValue('brandList', brandRes.data);
      setValue('selectedBrand', {
        id: item.itemBrandId,
        name: item.itemBrandName,
      });

      const typeRes = await commonDropdownApi({
        listType: 'select_item_type_for_mess_stock_consumption',
        bipardCentre: [locationId],
        replacements: ['%%', item.messId, item.itemBrandId],
      }).unwrap();

      setValue('typeList', typeRes.data);
      setValue('selectedType', {
        id: item.itemTypeId,
        name: item.itemTypeName,
      });

      const itemRes = await commonDropdownApi({
        listType: 'select_item_name_for_mess_stock_consumption',
        bipardCentre: [locationId],
        replacements: ['%%', item.messId, item.itemBrandId, item.itemTypeId],
      }).unwrap();

      setValue('itemList', itemRes.data);
      setValue('selectedItem', {
        id: item.itemId,
        name: item.itemName,
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text2: 'Failed to prefill stock consumption',
      });
    } finally {
      setLoader(false);
    }
  };

  const schema = Yup.object().shape({
    personCount: Yup.string().required('Person Conut is required'),
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
      personCount: form.personCount,
      photo: form.photo,
      consumptionVideo: form.video,
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
      personCount: form.personCount,
      photo: form.photo,
      consumptionVideo: form.video,
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
      listType: 'select_mess_for_mess_stock_consumption',
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
      listType: 'select_item_brand_for_mess_stock_consumption',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', id],
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

  const getTypeList = (messId: any, id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_type_for_mess_stock_consumption',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', messId, id],
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

  const getItemList = (messId: any, brandId: any, id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_item_name_for_mess_stock_consumption',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', messId, brandId, id],
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

  const uploadPhoto = (photo: any) => {
    setLoader(true);
    let formData = new FormData();
    if (photo?.uri) {
      formData.append('document', {
        uri: photo.uri,
        name: photo.name || 'upload.png',
        type: photo.type || 'image/png',
      } as any);
    }
    fileUploadApi(formData)
      .unwrap()
      .then((res: any) => {
        let resData = res.data.url || '';
        setValue('photo', resData);
        setLoader(false);
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
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

  const uploadVideo = (video: any) => {
    if (!video?.uri) return;

    if (video.fileSize && video.fileSize > 20 * 1024 * 1024) {
      Toast.show({
        type: 'error',
        text2: 'Video size should not exceed 20 MB',
        autoHide: true,
      });
      return;
    }

    setLoader(true);

    let formData = new FormData();
    formData.append('document', {
      uri: video.uri,
      name: video.name || 'upload.mp4',
      type: video.type || 'video/mp4',
    } as any);

    fileUploadApi(formData)
      .unwrap()
      .then((res: any) => {
        const url = res?.data?.url || '';
        setValue('video', url);

        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Video upload failed',
          autoHide: true,
        });
      })
      .finally(() => setLoader(false));
  };

  const openLink = async (url: string) => {
    if (!url) return;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Toast.show({
        type: 'error',
        text2: 'Unable to open link',
      });
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
                  selectedBrand: {},
                  selectedType: {},
                  selectedItem: {},
                }));
                getBrandList(data.id);
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
                getTypeList(form.selectedMess.id, data.id);
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
                getItemList(
                  form.selectedMess.id,
                  form.selectedBrand.id,
                  data.id,
                );
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
        />
        <TextInputOrganisms
          label={'MRP'}
          placeholder={'MRP'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref?.current?.focus()}
          value={form.mrp}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('mrp', normalizeNumber(val));
            setErrors({ ...errors, mrp: '' });
          }}
          isMandatory
          errorMessage={errors.mrp}
          maxLength={10}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={'Person Count'}
          placeholder={'Person Count'}
          ref={input3_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.personCount}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('personCount', normalizeNumber(val));
            setErrors({ ...errors, personCount: '' });
          }}
          isMandatory
          errorMessage={errors.personCount}
          maxLength={10}
          keyboardType="numeric"
        />
        <ImageUploadOrganism
          label={'Upload Photo'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            uploadPhoto(file);
          }}
        />
        {form.photo ? (
          <ButtonOrganism
            bttnText="View Uploaded Photo"
            onPress={() => openLink(form.photo)}
            containerStyle={styles.viewBtn}
            bttnTextStyle={{ fontSize: vw(10) }}
          />
        ) : null}
        <ImageUploadOrganism
          label="Upload Video"
          mediaType="video"
          maxSizeMB={20}
          instruction="Add MP4 video (max 20 MB)"
          onSelectImage={uploadVideo}
        />
        {form.video ? (
          <ButtonOrganism
            bttnText="View Uploaded Video"
            onPress={() => openLink(form.video)}
            containerStyle={styles.viewBtn}
            bttnTextStyle={{ fontSize: vw(10) }}
          />
        ) : null}
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddStockConsumption;

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
  viewBtn: {
    marginTop: vh(6),
    width: vw(200),
    alignSelf: 'center',
    height: vh(30),
  },
});
