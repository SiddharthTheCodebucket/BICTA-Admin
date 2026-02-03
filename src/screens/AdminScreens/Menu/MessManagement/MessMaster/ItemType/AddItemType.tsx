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
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import {
  useMessManagementAddItemTypeMutation,
  useMessManagementUpdateItemTypeMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddItemType = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  const [addApi] = useMessManagementAddItemTypeMutation();
  const [updateApi] = useMessManagementUpdateItemTypeMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Item Type' : 'Update Item Type',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);

  // Auto-select location based on tenantId
  const getInitialLocation = () => {
    if (tenantId === 1) return { id: 'Gaya', name: 'Gaya' };
    if (tenantId === 2) return { id: 'Patna', name: 'Patna' };
    return {}; // tenantId === 3 (superadmin) - no auto-selection
  };

  const [form, setForm] = useState<any>({
    bipardLocation: getInitialLocation(),
    typeName: '',
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

    setForm({
      bipardLocation: selectedLocation,
      typeName: item.itemTypeName || '',
    });
  }, [item]);

  const schema = Yup.object().shape({
    typeName: Yup.string().required('Type name is required'),
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
      itemTypeName: form.typeName,
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
      itemTypeName: form.typeName,
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
                  vehicleColor: {},
                }));

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
        <TextInputOrganisms
          label={'Type Name'}
          placeholder={'Type Name'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.typeName}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('typeName', val);
            setErrors({ ...errors, typeName: '' });
          }}
          isMandatory
          errorMessage={errors.typeName}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddItemType;

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
