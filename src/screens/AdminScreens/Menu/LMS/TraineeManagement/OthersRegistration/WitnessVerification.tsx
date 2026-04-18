import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';

import { colors, vh, vw, strings } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  saveAadharCard,
  saveFirstWitnessDesignation,
  saveFirstWitnessName,
  saveFirstWitnessSignature,
  savePhoto,
  saveSecondWitnessDesignation,
  saveSecondWitnessName,
  saveSecondWitnessSignature,
  saveSignature,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';

import {
  FormFieldWrapper,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';

// type FileData = {
//   uri: string;
//   name: string;
//   type?: string | null;
//   size?: number | null;
// };

type FileData = {
  uri?: string;
  name?: string;
  type?: string | null;
  size?: number | null;
  [key: string]: any;
};

interface Props {
  goNext: any;
  goBack: any;
}

type LocalFormType = {
  firstWitnessName: string;
  firstWitnessDesignation: string;
  firstWitnessSignature: FileData | null;

  secondWitnessName: string;
  secondWitnessDesignation: string;
  secondWitnessSignature: FileData | null;

  photo: FileData | null;
  signature: FileData | null;
  aadharCard: FileData | null;
};

const WitnessVerification = (props: Props) => {
  const { goNext, goBack } = props;

  const input1_ref = useRef<any>(null);
  const input2_ref = useRef<any>(null);
  const input3_ref = useRef<any>(null);
  const input4_ref = useRef<any>(null);

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

  const [errors, setErrors] = useState<any>({});

  const [localForm, setLocalForm] = useState<LocalFormType>({
    firstWitnessName: firstWitnessName || '',
    firstWitnessDesignation: firstWitnessDesignation || '',
    firstWitnessSignature: firstWitnessSignature || null,

    secondWitnessName: secondWitnessName || '',
    secondWitnessDesignation: secondWitnessDesignation || '',
    secondWitnessSignature: secondWitnessSignature || null,

    photo: photo || null,
    signature: signature || null,
    aadharCard: aadharCard || null,
  });

  const setValue = (key: keyof LocalFormType, value: any) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
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
    goNext();
    return;
    try {
      await generalSchema.validate(localForm, { abortEarly: false });
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

  return (
    <View style={styles.container}>
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
            title="First Witness Name"
            placeholder="First Witness Name"
            isMandatory
            value={localForm.firstWitnessName}
            onChangeText={(val: any) => {
              setValue('firstWitnessName', val);
              clearError('firstWitnessName');
            }}
            onSubmitEditing={() => input2_ref.current?.focus?.()}
            returnKeyType="next"
            autoCapitalize="none"
            errorMessage={errors.firstWitnessName}
          />

          <FormTextInputWithTitle
            ref={input2_ref}
            title="First Witness Designation"
            placeholder="First Witness Designation"
            isMandatory
            value={localForm.firstWitnessDesignation}
            onChangeText={(val: any) => {
              setValue('firstWitnessDesignation', val);
              clearError('firstWitnessDesignation');
            }}
            onSubmitEditing={() => input3_ref.current?.focus?.()}
            returnKeyType="next"
            autoCapitalize="none"
            errorMessage={errors.firstWitnessDesignation}
          />

          <FormFileUploadWithTitle
            title="First Witness Signature"
            isMandatory
            buttonText={strings.choose_file}
            fileName={localForm.firstWitnessSignature?.name}
            onFileSelected={(file: FileData | null) => {
              setValue('firstWitnessSignature', file);
              clearError('firstWitnessSignature');
              clearError('firstWitnessSignature.uri');
            }}
            onFileRemove={() => {
              setValue('firstWitnessSignature', null);
              clearError('firstWitnessSignature');
              clearError('firstWitnessSignature.uri');
            }}
            errorMessage={errors['firstWitnessSignature.uri']}
          />

          <FormTextInputWithTitle
            ref={input3_ref}
            title="Second Witness Name"
            placeholder="Second Witness Name"
            isMandatory
            value={localForm.secondWitnessName}
            onChangeText={(val: any) => {
              setValue('secondWitnessName', val);
              clearError('secondWitnessName');
            }}
            onSubmitEditing={() => input4_ref.current?.focus?.()}
            returnKeyType="next"
            autoCapitalize="none"
            errorMessage={errors.secondWitnessName}
          />

          <FormTextInputWithTitle
            ref={input4_ref}
            title="Second Witness Designation"
            placeholder="Second Witness Designation"
            isMandatory
            value={localForm.secondWitnessDesignation}
            onChangeText={(val: any) => {
              setValue('secondWitnessDesignation', val);
              clearError('secondWitnessDesignation');
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            returnKeyType="done"
            autoCapitalize="none"
            errorMessage={errors.secondWitnessDesignation}
          />

          <FormFileUploadWithTitle
            title="Second Witness Signature"
            isMandatory
            buttonText={strings.choose_file}
            fileName={localForm.secondWitnessSignature?.name}
            onFileSelected={(file: FileData | null) => {
              setValue('secondWitnessSignature', file);
              clearError('secondWitnessSignature');
              clearError('secondWitnessSignature.uri');
            }}
            onFileRemove={() => {
              setValue('secondWitnessSignature', null);
              clearError('secondWitnessSignature');
              clearError('secondWitnessSignature.uri');
            }}
            errorMessage={errors['secondWitnessSignature.uri']}
          />

          <FormFileUploadWithTitle
            title="Photo"
            isMandatory
            buttonText={strings.choose_file}
            fileName={localForm.photo?.name}
            onFileSelected={(file: FileData | null) => {
              setValue('photo', file);
              clearError('photo');
              clearError('photo.uri');
            }}
            onFileRemove={() => {
              setValue('photo', null);
              clearError('photo');
              clearError('photo.uri');
            }}
            errorMessage={errors['photo.uri']}
          />

          <FormFileUploadWithTitle
            title="Signature"
            isMandatory
            buttonText={strings.choose_file}
            fileName={localForm.signature?.name}
            onFileSelected={(file: FileData | null) => {
              setValue('signature', file);
              clearError('signature');
              clearError('signature.uri');
            }}
            onFileRemove={() => {
              setValue('signature', null);
              clearError('signature');
              clearError('signature.uri');
            }}
            errorMessage={errors['signature.uri']}
          />

          <FormFileUploadWithTitle
            title="Aadhar Card"
            isMandatory
            buttonText={strings.choose_file}
            fileName={localForm.aadharCard?.name}
            onFileSelected={(file: FileData | null) => {
              setValue('aadharCard', file);
              clearError('aadharCard');
              clearError('aadharCard.uri');
            }}
            onFileRemove={() => {
              setValue('aadharCard', null);
              clearError('aadharCard');
              clearError('aadharCard.uri');
            }}
            errorMessage={errors['aadharCard.uri']}
          />
        </FormFieldWrapper>

        <View style={styles.footer}>
          <FormWhiteButton
            title="Back"
            onPress={goBack}
            containerStyle={styles.buttonContainer}
          />

          <FormGradientButton
            title="Next"
            onPress={handleNext}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default WitnessVerification;

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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(12),
    paddingHorizontal: vw(16),
    paddingBottom: vh(20),
  },
  buttonContainer: {
    flex: 1,
  },
});
