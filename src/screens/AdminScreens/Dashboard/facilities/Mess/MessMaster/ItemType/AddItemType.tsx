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
  useMessManagementAddItemTypeMutation,
  useMessManagementUpdateItemTypeMutation,
} from '../../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddItemType = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const fromFacilities = props.route.params?.fromFacilities;
  const input1_ref: any = createRef();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  const [addApi] = useMessManagementAddItemTypeMutation();
  const [updateApi] = useMessManagementUpdateItemTypeMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Item Type' : 'Update Item Type',
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
                setForm((prev: any) => ({ ...prev, bipardLocation: data }));
                setErrors({ ...errors, 'bipardLocation.name': '' });
              }}
              isMandatory
              errorMessage={errors['bipardLocation.name']}
              disabled={tenantId !== 3}
            />
            <FormTextInputWithTitle
              title="Type Name"
              placeholder="Enter"
              onSubmitEditing={() => Keyboard.dismiss()}
              value={form.typeName}
              autoCapitalize="none"
              returnKeyType="done"
              onChangeText={(val: string) => {
                setValue('typeName', val);
                setErrors({ ...errors, typeName: '' });
              }}
              isMandatory
              errorMessage={errors.typeName}
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
