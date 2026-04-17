import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  FormFileUploadWithTitle,
  FormFieldWrapper,
} from '../../../../../../components/templates';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ErrorMolecule from '../../../../../../components/molecules/ErrorMolecule';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';

interface Props {
  form: any;
  errors: any;
  setValue: (key: string, value: any) => void;
  setErrors: (errors: any) => void;
  isBulk: boolean;
  isManual: boolean;
  isNo: boolean;
  onPickExcelFile: () => void;
}

const AddTraineeRegistration_2 = ({
  form,
  errors,
  setValue,
  setErrors,
  isBulk,
  isManual,
  isNo,
  onPickExcelFile,
}: Props) => {
  const showUploadingState =
    isManual &&
    isNo &&
    !!(form.photo?.uri || form.signature?.uri) &&
    !(form.photo?.uri && form.signature?.uri);

  return (
    <FormFieldWrapper>
      {isManual && isNo ? (
        <>
          <FormFileUploadWithTitle
            title="Upload Photo"
            isMandatory
            showNote
            noteText="NOTE: Please upload a clear passport size photo..."
            fileName={form.photo?.fileName || form.photo?.name}
            placeholderText="Upload yor file here"
            buttonText="Browse Files"
            accept={['image/jpeg', 'image/jpg', 'image/png']}
            onFileSelected={(file: any) => {
              const normalizedFile = file
                ? { ...file, fileName: file.name || 'photo.jpg' }
                : {};
              setValue('photo', normalizedFile);
              setErrors({ ...errors, 'photo.uri': '' });
            }}
            onFileRemove={() => {
              setValue('photo', {});
              setErrors({ ...errors, 'photo.uri': '' });
            }}
            errorMessage={errors['photo.uri']}
          />

          <FormFileUploadWithTitle
            title="Upload Signature"
            isMandatory
            fileName={form.signature?.fileName || form.signature?.name}
            placeholderText="Upload yor file here"
            buttonText="Browse Files"
            accept={['image/jpeg', 'image/jpg', 'image/png']}
            onFileSelected={(file: any) => {
              const normalizedFile = file
                ? { ...file, fileName: file.name || 'signature.jpg' }
                : {};
              setValue('signature', normalizedFile);
              setErrors({ ...errors, 'signature.uri': '' });
            }}
            onFileRemove={() => {
              setValue('signature', {});
              setErrors({ ...errors, 'signature.uri': '' });
            }}
            errorMessage={errors['signature.uri']}
          />

          {showUploadingState ? (
            <View style={styles.progressCard}>
              <TextAtom style={styles.progressTitle}>Uploading...</TextAtom>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <TextAtom style={styles.progressSubTitle}>
                30 seconds remaining
              </TextAtom>
            </View>
          ) : null}
        </>
      ) : null}

      {isManual && !isNo ? (
        <View style={styles.infoCard}>
          <TextAtom style={styles.infoTitle}>Uploads</TextAtom>
          <TextAtom style={styles.infoText}>
            No uploads are required for already registered trainees.
          </TextAtom>
        </View>
      ) : null}

      {isBulk && (
        <>
          <TextAtom style={styles.labelStyle}>Upload File</TextAtom>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              {
                borderColor: errors['excelFile.uri'] ? colors.red : colors.grey_1,
              },
            ]}
            activeOpacity={0.8}
            onPress={onPickExcelFile}
          >
            <TextAtom numberOfLines={0} style={styles.uploadText}>
              {isNullUndefined(form.excelFile)
                ? strings.choose_file
                : form.excelFile.fileName}
            </TextAtom>
            <TextAtom style={styles.instructionText}>Add Excel</TextAtom>
          </TouchableOpacity>
          <TextAtom style={styles.sampleBtnText}>Download Sample</TextAtom>
          <ErrorMolecule errorMessage={errors['excelFile.uri']} />
        </>
      )}
    </FormFieldWrapper>
  );
};

export default AddTraineeRegistration_2;

const styles = StyleSheet.create({
  uploadBtn: {
    borderWidth: 1,
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(320),
    alignSelf: 'center',
    backgroundColor: colors.backgroundColor,
    marginBottom: vh(10),
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey_1,
    fontSize: vw(12),
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(4),
  },
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
    marginBottom: vh(8),
  },
  sampleBtnText: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    width: vw(120),
    borderRadius: vw(4),
    textAlign: 'center',
    paddingVertical: vh(4),
    marginLeft: vh(8),
    marginBottom: vh(8),
  },
  progressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: vw(8),
    padding: vw(12),
    marginBottom: vh(10),
  },
  progressTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(10),
  },
  progressTrack: {
    height: vh(8),
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: vh(8),
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressSubTitle: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: vw(8),
    padding: vw(14),
    marginBottom: vh(10),
  },
  infoTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(4),
  },
  infoText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.grey,
    lineHeight: vh(18),
  },
});
