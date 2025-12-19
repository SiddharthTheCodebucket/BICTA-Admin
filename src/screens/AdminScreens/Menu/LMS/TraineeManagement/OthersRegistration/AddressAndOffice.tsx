import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { createRef, useState } from 'react';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { colors, vh, vw } from '../../../../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useAppSelector } from '../../../../../../hooks';
import { useDispatch } from 'react-redux';
import {
  saveOfficeAddress,
  savePostingBlockList,
  savePostingPanchyatList,
  saveResidentialAddress,
  saveSelectedPostingBlock,
  saveSelectedPostingDistrict,
  saveSelectedPostingPanchyat,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

interface Props {
  route: any;
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

const AddressAndOffice = (props: Props) => {
  const { navigation, goNext, goBack } = props;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonListApi] = useCommonDropdownListMutation();
  const dispatch = useDispatch();
  const {
    residentialAddress,
    officeAddress,
    postingDistrictList,
    selectedPostingDistrict,
    postingBlockList,
    selectedPostingBlock,
    postingPanchyatList,
    selectedPostingPanchyat,
  } = useAppSelector(state => state.otherRegistration);

  const [errors, setErrors] = React.useState<any>({});
  const [loader, setLoader] = useState(false);

  const [localForm, setLocalForm] = useState({
    residentialAddress: residentialAddress,
    officeAddress: officeAddress,
    postingDistrictList: postingDistrictList,
    selectedPostingDistrict: selectedPostingDistrict,
    postingBlockList: postingBlockList,
    selectedPostingBlock: selectedPostingBlock,
    postingPanchyatList: postingPanchyatList,
    selectedPostingPanchyat: selectedPostingPanchyat,
  });

  const generalSchema = Yup.object().shape({
    selectedPostingPanchyat: Yup.object({
      eName: Yup.string().required('Posting panchyat is required'),
    }),

    selectedPostingBlock: Yup.object({
      eName: Yup.string().required('Posting block is required'),
    }),

    selectedPostingDistrict: Yup.object({
      eName: Yup.string().required('Posting district is required'),
    }),

    officeAddress: Yup.string().required('Office address is required'),

    residentialAddress: Yup.string().required('Residental address is required'),
  });

  const handleNext = async () => {
    try {
      await generalSchema.validate({
        residentialAddress: localForm.residentialAddress,
        officeAddress: localForm.officeAddress,
        selectedPostingDistrict: localForm.selectedPostingDistrict,
        selectedPostingBlock: localForm.selectedPostingBlock,
        selectedPostingPanchyat: localForm.selectedPostingPanchyat,
      });
      dispatch(saveOfficeAddress(localForm.officeAddress));
      dispatch(savePostingBlockList(localForm.postingBlockList));
      dispatch(savePostingPanchyatList(localForm.postingPanchyatList));
      dispatch(saveResidentialAddress(localForm.residentialAddress));
      dispatch(saveSelectedPostingBlock(localForm.selectedPostingBlock));
      dispatch(saveSelectedPostingDistrict(localForm.selectedPostingDistrict));
      dispatch(saveSelectedPostingPanchyat(localForm.selectedPostingPanchyat));

      setErrors({});
      goNext();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const setValue = (key: any, value: any) => {
    setLocalForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const getAllBlock = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'bihar_all_blocks',
      replacements: [id, '%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('postingBlockList', res.data || []);
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
  const getAllPanchyat = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'bihar_all_panchayat',
      replacements: [id, '%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('postingPanchyatList', res.data || []);
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
        <TextInputOrganisms
          label={'Residental Address'}
          placeholder={'Residental Address'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={localForm.residentialAddress}
          onChangeText={(val: any) => {
            setValue('residentialAddress', val);
            setErrors({ ...errors, residentialAddress: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.residentialAddress}
        />

        <TextInputOrganisms
          label={'Office Address'}
          placeholder={'Office Address'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={localForm.officeAddress}
          onChangeText={(val: any) => {
            setValue('officeAddress', val);
            setErrors({ ...errors, officeAddress: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          isMandatory
          errorMessage={errors.officeAddress}
        />

        <DropDownOrganism
          label={'Posting District'}
          placeholder={'Posting District'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Posting District List',
              Data: localForm.postingDistrictList,
              selectedData: localForm.selectedPostingDistrict,
              setSelectedData: (data: any) => {
                setValue('selectedPostingDistrict', data);
                getAllBlock(data.id);
                setValue('selectedPostingBlock', {});
                setValue('selectedPostingPanchyat', {});
                setErrors({ ...errors, 'selectedPostingDistrict.eName': '' });
              },
              typeName: 'eName',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={localForm.selectedPostingDistrict?.eName}
          errorMessage={errors['selectedPostingDistrict.eName']}
        />
        <DropDownOrganism
          label={'Posting Block'}
          placeholder={'Posting Block'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Posting Block List',
              Data: localForm.postingBlockList,
              selectedData: localForm.selectedPostingBlock,
              setSelectedData: (data: any) => {
                setValue('selectedPostingBlock', data);
                getAllPanchyat(data.id);
                setValue('selectedPostingPanchyat', {});
                setErrors({ ...errors, 'selectedPostingBlock.eName': '' });
              },
              typeName: 'eName',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={localForm.selectedPostingBlock?.eName}
          errorMessage={errors['selectedPostingBlock.eName']}
        />
        <DropDownOrganism
          label={'Posting Panchyat'}
          placeholder={'Posting Panchyat'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Posting Panchyat List',
              Data: localForm.postingPanchyatList,
              selectedData: localForm.selectedPostingPanchyat,
              setSelectedData: (data: any) => {
                setValue('selectedPostingPanchyat', data);
                setErrors({ ...errors, 'selectedPostingPanchyat.eName': '' });
              },
              typeName: 'eName',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={localForm.selectedPostingPanchyat?.eName}
          errorMessage={errors['selectedPostingPanchyat.eName']}
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
          onPress={handleNext}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default AddressAndOffice;

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
