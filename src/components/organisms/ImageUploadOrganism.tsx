import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ViewAtom from '../atoms/ViewAtom';
import TextAtom from '../atoms/TextAtom';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';
import ErrorMolecule from '../molecules/ErrorMolecule';
import { colors, vw, vh, fonts } from '../../constants';
import { isNullUndefined } from '../../utils/CommonFunction';

const ImageUploadOrganism = ({
  label,
  isMandatory,
  errorMessage,
  contentContainerStyle,
  onSelectImage,
  defaultImage,
  maxSizeMB = 3,
  instruction = `Add JPG/PNG/WEBP (max ${3} MB)`,
  note,
}: any) => {
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    if (defaultImage) {
      setImageUri(defaultImage);
    }
  }, [defaultImage]);

  const handleImagePick = async () => {
    try {
      const result: any = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result?.assets?.length > 0) {
        const file = result.assets[0];

        const fileSizeMB = file.fileSize / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          Alert.alert(
            'File Too Large',
            `File size must be less than ${maxSizeMB} MB`,
          );
          return;
        }

        setImageUri(file.uri);
        onSelectImage?.(file);
      }
    } catch (e) {}
  };

  const btnText = imageUri ? 'Change Image' : 'Upload Image';

  return (
    <ViewAtom style={[styles.container, contentContainerStyle]}>
      <LabelWithMandatoryMolecules label={label} isMandatory={isMandatory} />

      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: isNullUndefined(errorMessage)
              ? colors.grey_1
              : colors.red,
          },
        ]}
        onPress={handleImagePick}
      >
        <TextAtom style={styles.btnText}>{btnText}</TextAtom>
      </TouchableOpacity>

      {instruction && (
        <TextAtom style={styles.instruction}>
          {instruction.replace('3', maxSizeMB)}
        </TextAtom>
      )}
      {note && <TextAtom style={styles.note}>{note}</TextAtom>}

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="cover"
        />
      ) : null}

      <ErrorMolecule errorMessage={errorMessage} />
    </ViewAtom>
  );
};

export default ImageUploadOrganism;

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(12),
  },
  button: {
    flexDirection: 'row',
    borderRadius: vw(4),
    width: vw(328),
    height: vh(48),
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: vw(1),
    alignItems: 'center',
    marginTop: vh(8),
    backgroundColor: colors.backgroundColor,
  },
  btnText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
  instruction: {
    marginTop: vh(6),
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    textAlign: 'left',
    paddingHorizontal: vw(15),
  },
  preview: {
    width: vw(328),
    height: vh(160),
    marginTop: vh(10),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    alignSelf: 'center',
  },
  note: {
    marginTop: vh(5),
    fontSize: vw(11),
    fontFamily: fonts.Roboto_Regular,
    color: colors.red,
    textAlign: 'left',
    paddingHorizontal: vw(15),
  },
});
