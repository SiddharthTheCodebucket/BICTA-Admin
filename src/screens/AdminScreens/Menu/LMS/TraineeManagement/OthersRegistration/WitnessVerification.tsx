import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { createRef } from 'react';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
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
  route: any;
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

const WitnessVerification = (props: Props) => {
  const { navigation, goNext, goBack } = props;
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
        firstWitnessName,
        firstWitnessDesignation,
        firstWitnessSignature,
        secondWitnessName,
        secondWitnessDesignation,
        secondWitnessSignature,
        photo,
        signature,
        aadharCard,
      });
      setErrors({});
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
          value={firstWitnessName}
          onChangeText={(val: any) => {
            dispatch(saveFirstWitnessName(val));
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
          value={firstWitnessDesignation}
          onChangeText={(val: any) => {
            dispatch(saveFirstWitnessDesignation(val));
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
            dispatch(saveFirstWitnessSignature(file));
            setErrors({ ...errors, 'firstWitnessSignature.uri': '' });
          }}
          defaultImage={firstWitnessSignature?.uri}
          isMandatory
          errorMessage={errors['firstWitnessSignature.uri']}
        />

        <TextInputOrganisms
          label={'Second Witness Name'}
          placeholder={'Second Witness Name'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={secondWitnessName}
          onChangeText={(val: any) => {
            dispatch(saveSecondWitnessName(val));
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
          value={secondWitnessDesignation}
          onChangeText={(val: any) => {
            dispatch(saveSecondWitnessDesignation(val));
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
            dispatch(saveSecondWitnessSignature(file));
            setErrors({ ...errors, 'secondWitnessSignature.uri': '' });
          }}
          defaultImage={secondWitnessSignature?.uri}
          isMandatory
          errorMessage={errors['secondWitnessSignature.uri']}
        />

        <ImageUploadOrganism
          label={'Photo'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            dispatch(savePhoto(file));
            setErrors({ ...errors, 'photo.uri': '' });
          }}
          defaultImage={photo?.uri}
          isMandatory
          errorMessage={errors['photo.uri']}
        />

        <ImageUploadOrganism
          label={'Signature'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            dispatch(saveSignature(file));
            setErrors({ ...errors, 'signature.uri': '' });
          }}
          defaultImage={signature?.uri}
          isMandatory
          errorMessage={errors['signature.uri']}
        />

        <ImageUploadOrganism
          label={'Aadhar Card'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            dispatch(saveAadharCard(file));
            setErrors({ ...errors, 'aadharCard.uri': '' });
          }}
          defaultImage={aadharCard?.uri}
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
