import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { colors, strings, vh, vw } from '../../../../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useAppSelector } from '../../../../../../hooks';
import { useDispatch } from 'react-redux';
import {
  saveFirstWitnessName,
  saveFirstWitnessDesignation,
  saveFirstWitnessSignature,
  saveSecondWitnessName,
  saveSecondWitnessDesignation,
  saveSecondWitnessSignature,
  savePhoto,
  saveSignature,
  saveAadharCard,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';

interface Props {
  goNext: any;
  goBack: any;
}

const WitnessVerification = (props: Props) => {
  const { goNext, goBack } = props;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const dispatch = useDispatch();
  const {
    firstWitnessName,
    firstWitnessDesignation,
    firstWitnessSignature,
    secondWitnessName,
    secondWitnessDesignation,
    secondWitnessSignature,
    photo,
    signature,
    aadharCard,
  } = useAppSelector(state => state.otherRegistration);

  const [errors, setErrors] = React.useState<any>({});

  const [localForm, setLocalForm] = React.useState({
    firstWitnessName: firstWitnessName,
    firstWitnessDesignation: firstWitnessDesignation,
    firstWitnessSignature: firstWitnessSignature,

    secondWitnessName: secondWitnessName,
    secondWitnessDesignation: secondWitnessDesignation,
    secondWitnessSignature: secondWitnessSignature,

    photo: photo,
    signature: signature,
    aadharCard: aadharCard,
  });

  const setValue = (key: string, value: any) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const generalSchema = Yup.object().shape({
    aadharCard: Yup.object({
      uri: Yup.string().required('Aadhar card is required'),
    }),
    signature: Yup.object({
      uri: Yup.string().required('Signature is required'),
    }),
    photo: Yup.object({
      uri: Yup.string().required('Photo is required'),
    }),
    secondWitnessSignature: Yup.object({
      uri: Yup.string().required('Second witness signature is required'),
    }),

    secondWitnessDesignation: Yup.string().required(
      'Second witness designation is required',
    ),
    secondWitnessName: Yup.string().required('Second witness name is required'),
    firstWitnessSignature: Yup.object({
      uri: Yup.string().required('First witness signature is required'),
    }),

    firstWitnessDesignation: Yup.string().required(
      'First witness designation is required',
    ),
    firstWitnessName: Yup.string().required('First witness name is required'),
  });

  const handleNext = async () => {
    try {
      await generalSchema.validate({
        firstWitnessName: localForm.firstWitnessName,
        firstWitnessDesignation: localForm.firstWitnessDesignation,
        firstWitnessSignature: localForm.firstWitnessSignature,
        secondWitnessName: localForm.secondWitnessName,
        secondWitnessDesignation: localForm.secondWitnessDesignation,
        secondWitnessSignature: localForm.secondWitnessSignature,
        photo: localForm.photo,
        signature: localForm.signature,
        aadharCard: localForm.aadharCard,
      });
      setErrors({});
      dispatch(saveFirstWitnessName(localForm.firstWitnessName));
      dispatch(saveFirstWitnessDesignation(localForm.firstWitnessDesignation));
      dispatch(saveFirstWitnessSignature(localForm.firstWitnessSignature));

      dispatch(saveSecondWitnessName(localForm.secondWitnessName));
      dispatch(
        saveSecondWitnessDesignation(localForm.secondWitnessDesignation),
      );
      dispatch(saveSecondWitnessSignature(localForm.secondWitnessSignature));

      dispatch(savePhoto(localForm.photo));
      dispatch(saveSignature(localForm.signature));
      dispatch(saveAadharCard(localForm.aadharCard));
      goNext();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
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
          label={'First Witness Name'}
          placeholder={'First Witness Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={localForm.firstWitnessName}
          onChangeText={(val: any) => {
            setValue('firstWitnessName', val);
            setErrors({ ...errors, firstWitnessName: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.firstWitnessName}
        />

        <TextInputOrganisms
          label={'First Witness Designation'}
          placeholder={'First Witness Designation'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={localForm.firstWitnessDesignation}
          onChangeText={(val: any) => {
            setValue('firstWitnessDesignation', val);
            setErrors({ ...errors, firstWitnessDesignation: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          isMandatory
          errorMessage={errors.firstWitnessDesignation}
        />

        <ImageUploadOrganism
          label={'First Witness Signature'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('firstWitnessSignature', file);
            setErrors({ ...errors, 'firstWitnessSignature.uri': '' });
          }}
          defaultImage={localForm.firstWitnessSignature?.uri}
          isMandatory
          errorMessage={errors['firstWitnessSignature.uri']}
        />

        <TextInputOrganisms
          label={'Second Witness Name'}
          placeholder={'Second Witness Name'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={localForm.secondWitnessName}
          onChangeText={(val: any) => {
            setValue('secondWitnessName', val);
            setErrors({ ...errors, secondWitnessName: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.secondWitnessName}
        />

        <TextInputOrganisms
          label={'Second Witness Designation'}
          placeholder={'Second Witness Designation'}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={localForm.secondWitnessDesignation}
          onChangeText={(val: any) => {
            setValue('secondWitnessDesignation', val);
            setErrors({ ...errors, secondWitnessDesignation: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          isMandatory
          errorMessage={errors.secondWitnessDesignation}
        />

        <ImageUploadOrganism
          label={'Second Witness Signature'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('secondWitnessSignature', file);
            setErrors({ ...errors, 'secondWitnessSignature.uri': '' });
          }}
          defaultImage={localForm.secondWitnessSignature?.uri}
          isMandatory
          errorMessage={errors['secondWitnessSignature.uri']}
        />

        <ImageUploadOrganism
          label={'Photo'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('photo', file);
            setErrors({ ...errors, 'photo.uri': '' });
          }}
          defaultImage={localForm.photo?.uri}
          isMandatory
          errorMessage={errors['photo.uri']}
        />

        <ImageUploadOrganism
          label={'Signature'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('signature', file);
            setErrors({ ...errors, 'signature.uri': '' });
          }}
          defaultImage={localForm.signature?.uri}
          isMandatory
          errorMessage={errors['signature.uri']}
        />

        <ImageUploadOrganism
          label={'Aadhar Card'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('aadharCard', file);
            setErrors({ ...errors, 'aadharCard.uri': '' });
          }}
          defaultImage={localForm.aadharCard?.uri}
          isMandatory
          errorMessage={errors['aadharCard.uri']}
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

export default WitnessVerification;

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
