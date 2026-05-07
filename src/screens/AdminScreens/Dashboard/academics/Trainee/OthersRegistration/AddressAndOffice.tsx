/* eslint-disable eslint-comments/no-unused-disable, no-unreachable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';

import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { colors, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  saveOfficeAddress,
  savePostingBlockList,
  savePostingPanchyatList,
  saveResidentialAddress,
  saveSelectedPostingBlock,
  saveSelectedPostingDistrict,
  saveSelectedPostingPanchyat,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';

import {
  FormDropdownFieldWithTitle,
  FormTextInputWithTitle,
  FormGradientButton,
  FormWhiteButton,
  FormFieldWrapper,
} from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

type DropdownItem = {
  [key: string]: any;
};

type LocalFormType = {
  residentialAddress: string;
  officeAddress: string;
  postingDistrictList: DropdownItem[];
  selectedPostingDistrict: DropdownItem;
  postingBlockList: DropdownItem[];
  selectedPostingBlock: DropdownItem;
  postingPanchyatList: DropdownItem[];
  selectedPostingPanchyat: DropdownItem;
};

const AddressAndOffice = (props: Props) => {
  const { goNext, goBack } = props;

  const input1_ref = useRef<any>(null);
  const input2_ref = useRef<any>(null);

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

  const [errors, setErrors] = useState<any>({});
  const [loader, setLoader] = useState(false);

  const [localForm, setLocalForm] = useState<LocalFormType>({
    residentialAddress: residentialAddress || '',
    officeAddress: officeAddress || '',
    postingDistrictList: Array.isArray(postingDistrictList)
      ? postingDistrictList
      : [],
    selectedPostingDistrict: selectedPostingDistrict || {},
    postingBlockList: Array.isArray(postingBlockList) ? postingBlockList : [],
    selectedPostingBlock: selectedPostingBlock || {},
    postingPanchyatList: Array.isArray(postingPanchyatList)
      ? postingPanchyatList
      : [],
    selectedPostingPanchyat: selectedPostingPanchyat || {},
  });

  const setValue = (key: keyof LocalFormType, value: any) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

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
    goNext();
    return;
    try {
      await generalSchema.validate(localForm, { abortEarly: false });

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
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((e: any) => {
          if (!nextErrors[e.path]) nextErrors[e.path] = e.message;
        });
      } else if (err?.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
    }
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
        setValue('postingBlockList', Array.isArray(res.data) ? res.data : []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
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
        setValue(
          'postingPanchyatList',
          Array.isArray(res.data) ? res.data : [],
        );
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
          autoHide: true,
        });
      });
  };

  const districtList = Array.isArray(localForm.postingDistrictList)
    ? localForm.postingDistrictList
    : [];
  const blockList = Array.isArray(localForm.postingBlockList)
    ? localForm.postingBlockList
    : [];
  const panchyatList = Array.isArray(localForm.postingPanchyatList)
    ? localForm.postingPanchyatList
    : [];

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <FormFieldWrapper>
          <FormTextInputWithTitle
            ref={input1_ref}
            title="Residential Address"
            placeholder="Residential Address"
            isMandatory
            value={localForm.residentialAddress}
            onChangeText={(val: any) => {
              setValue('residentialAddress', val);
              clearError('residentialAddress');
            }}
            onSubmitEditing={() => input2_ref.current?.focus?.()}
            returnKeyType="next"
            autoCapitalize="none"
            errorMessage={errors.residentialAddress}
          />

          <FormTextInputWithTitle
            ref={input2_ref}
            title="Office Address"
            placeholder="Office Address"
            isMandatory
            value={localForm.officeAddress}
            onChangeText={(val: any) => {
              setValue('officeAddress', val);
              clearError('officeAddress');
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            returnKeyType="done"
            autoCapitalize="none"
            errorMessage={errors.officeAddress}
          />

          <FormDropdownFieldWithTitle
            title="Posting District"
            isMandatory
            data={districtList}
            value={localForm.selectedPostingDistrict}
            onChange={(item: any) => {
              setValue('selectedPostingDistrict', item);
              getAllBlock(item?.id);
              setValue('selectedPostingBlock', {});
              setValue('selectedPostingPanchyat', {});
              clearError('selectedPostingDistrict');
              clearError('selectedPostingDistrict.eName');
            }}
            labelField="eName"
            valueField="id"
            placeholder="Posting District"
            searchPlaceholder="Search Posting District"
            errorMessage={errors['selectedPostingDistrict.eName']}
          />

          <FormDropdownFieldWithTitle
            title="Posting Block"
            isMandatory
            data={blockList}
            value={localForm.selectedPostingBlock}
            onChange={(item: any) => {
              setValue('selectedPostingBlock', item);
              getAllPanchyat(item?.id);
              setValue('selectedPostingPanchyat', {});
              clearError('selectedPostingBlock');
              clearError('selectedPostingBlock.eName');
            }}
            labelField="eName"
            valueField="id"
            placeholder="Posting Block"
            searchPlaceholder="Search Posting Block"
            errorMessage={errors['selectedPostingBlock.eName']}
          />

          <FormDropdownFieldWithTitle
            title="Posting Panchyat"
            isMandatory
            data={panchyatList}
            value={localForm.selectedPostingPanchyat}
            onChange={(item: any) => {
              setValue('selectedPostingPanchyat', item);
              clearError('selectedPostingPanchyat');
              clearError('selectedPostingPanchyat.eName');
            }}
            labelField="eName"
            valueField="id"
            placeholder="Posting Panchyat"
            searchPlaceholder="Search Posting Panchyat"
            errorMessage={errors['selectedPostingPanchyat.eName']}
          />
        </FormFieldWrapper>

        <View style={styles.footer}>
          <FormWhiteButton
            title="Back"
            onPress={goBack}
            containerStyle={{ ...styles.buttonContainer, marginRight: vw(4) }}
          />
          <FormGradientButton
            title="Next"
            onPress={handleNext}
            containerStyle={{ ...styles.buttonContainer, marginLeft: vw(4) }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddressAndOffice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
    width: '100%',
  },
  contentScroll: {
    paddingHorizontal: vw(16),
    paddingBottom: vh(16),
    width: '100%',
  },
  footer: {
    marginTop: vh(24),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingBottom: vh(20),
  },
  buttonContainer: {
    flex: 1,
  },
});
