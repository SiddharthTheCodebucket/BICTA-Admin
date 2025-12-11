import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { colors, fonts, strings, vh, vw } from '../../../constants';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../components/organisms/ImageUploadOrganism';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import { useAppSelector } from '../../../hooks';
import { saveRegistrationState } from '../../../featuresTrainee/Registration/registrationSlice';
import TextAtom from '../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

const Uploads = (props: Props) => {
  const { goBack, goNext } = props;
  const dispatch = useDispatch();

  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { uploadedPhoto, uploadedSignature, isAlreadyRegistered } =
    useAppSelector(state => state.Registration);

  const [localPhoto, setLocalPhoto] = useState<any>(uploadedPhoto);
  const [localSignature, setLocalSignature] = useState<any>(uploadedSignature);

  const schema = Yup.object().shape({
    uploadedSignature: Yup.object({
      uri: Yup.string().required(strings.sign_required),
    }),
    uploadedPhoto: Yup.object({
      uri: Yup.string().required(strings.photo_required),
    }),
  });

  const handleNext = () => {
    if (isAlreadyRegistered.id === 'Yes') {
      goNext();
      return;
    }

    const form = {
      uploadedPhoto: localPhoto,
      uploadedSignature: localSignature,
    };

    try {
      schema.validateSync(form, { abortEarly: true });
      setErrors({});

      dispatch(
        saveRegistrationState({
          uploadedPhoto: localPhoto,
          uploadedSignature: localSignature,
        }),
      );

      goNext();
    } catch (err: any) {
      setErrors((prev: any) => ({
        ...prev,
        [err.path]: err.message,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FullscreenLoading isVisible={loader} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageUploadOrganism
          label={strings.upload_photo}
          isMandatory
          buttonText="Choose File"
          disabled={isAlreadyRegistered.id === 'Yes'}
          onSelectImage={(file: any) => {
            if (isAlreadyRegistered.id === 'Yes') return;
            setLocalPhoto(file);
            setErrors((prev: any) => ({ ...prev, 'uploadedPhoto.uri': '' }));
          }}
          defaultImage={localPhoto?.uri}
          errorMessage={errors['uploadedPhoto.uri']}
          instruction=""
          note="NOTE: Please upload a clear passport size photo. This photo will be used in ID card."
        />

        <ImageUploadOrganism
          label={strings.upload_signature}
          isMandatory
          buttonText="Choose File"
          disabled={isAlreadyRegistered.id === 'Yes'}
          onSelectImage={(file: any) => {
            if (isAlreadyRegistered.id === 'Yes') return;
            setLocalSignature(file);
            setErrors((prev: any) => ({
              ...prev,
              'uploadedSignature.uri': '',
            }));
          }}
          defaultImage={localSignature?.uri}
          errorMessage={errors['uploadedSignature.uri']}
          instruction=""
          note="NOTE: Please upload a clear photo of signature. This photo will be used in your ID card."
        />

        {isAlreadyRegistered.id === 'Yes' && (
          <ViewAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: vw(10),
              paddingVertical: vh(5),
              borderRadius: vw(8),
              marginTop: vh(40),
            }}
          >
            <TextAtom
              numberOfLines={0}
              style={{
                color: colors.red,
                fontFamily: fonts.Roboto_Regular,
                fontSize: vw(11),
                textAlign: 'center',
              }}
            >
              NOTE:
            </TextAtom>
            <TextAtom
              numberOfLines={0}
              style={{
                color: colors.black,
                fontFamily: fonts.Roboto_Regular,
                fontSize: vw(11),
                marginBottom: vh(10),
                textAlign: 'center',
              }}
            >
              You do not need to upload your photo and signature again as it
              will be automatically from the system.
            </TextAtom>
          </ViewAtom>
        )}
      </ScrollView>

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

export default Uploads;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
});
