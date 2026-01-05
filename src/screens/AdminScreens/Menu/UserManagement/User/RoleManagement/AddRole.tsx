import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

import {
  useAddAdminRoleMutation,
  useUpdateAdminRoleMutation,
} from '../../../../../../injectEndpoints/userTypeEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  role: '',
};

const AddRole = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const input1_ref: any = createRef();

  const [addAdminApi] = useAddAdminRoleMutation();
  const [updateAdminApi] = useUpdateAdminRoleMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, item ? 'Edit Role' : 'Add Role');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    if (item) {
      setForm({
        role: item.roleName ?? '',
      });
    }
  }, [item]);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    role: Yup.string().required('Role is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateRole();
      } else {
        addRole();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addRole = () => {
    setLoader(true);

    const params: any = {
      id: null,
      role_name: form.role,
    };

    addAdminApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res?.data?.message,
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

  const updateRole = () => {
    setLoader(true);

    const params: any = {
      id: item.id,
      role_name: form.role,
    };

    updateAdminApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res?.data?.message,
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
        extraScrollHeight={vh(120)}
      >
        <TextInputOrganisms
          label={'Role'}
          placeholder={'Role'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.role}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('role', val);
            setErrors({ ...errors, role: '' });
          }}
          isMandatory
          errorMessage={errors.role}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Edit' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddRole;

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
