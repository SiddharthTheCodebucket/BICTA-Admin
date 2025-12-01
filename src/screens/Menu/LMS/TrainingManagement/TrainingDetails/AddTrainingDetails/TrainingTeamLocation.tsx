import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, screensName, vh, vw } from '../../../../../../constants';
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
  useAddTrainingCategoryMutation,
  useUpdateTrainingCategoryMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

interface Props {
  route: any;
  navigation: NavigationType;
  goBack: any;
  goNext: any;
}

const TrainingTeamLocation = (props: Props) => {
  const { navigation, goBack, goNext } = props;
  const item = props.route?.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    courseCoordinatorList: [],
    courseCoordinator: {},
    youngProfessionalList: [],
    youngProfessional: {},
    courseLocationList: [],
    courseLocation: {},
    courseSubLocationList: [],
    courseSubLocation: {},
    courseLetter: {},
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
      categoryName: item.categoryName || '',
      desc: item.description || '',
    });
  }, [item]);

  const schema = Yup.object().shape({
    desc: Yup.string().required('Description is required'),
    categoryName: Yup.string().required('Category name is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      // if (item) {
      //   updateTrainingCategoryDetails();
      // } else {
      //   addTrainingCategoryDetails();
      // }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
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
        />
        <TextInputOrganisms
          label={'Category Name'}
          placeholder={'Category Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.categoryName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('categoryName', val);
            setErrors({ ...errors, categoryName: '' });
          }}
          isMandatory
          errorMessage={errors.categoryName}
        />
        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.desc}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('desc', val);
            setErrors({ ...errors, desc: '' });
          }}
          isMandatory
          errorMessage={errors.desc}
        />
      </KeyboardAwareScrollView>
      <ViewAtom style={styles.footer}>
        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Back"
          onPress={goBack}
        />

        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Next"
          onPress={goNext}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default TrainingTeamLocation;

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
  footer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
});
