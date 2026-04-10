import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { pick } from '@react-native-documents/picker';

import TextAtom from '../atoms/TextAtom';
import { colors, fonts, SvgUpload, vh, vw } from '../../constants';

type FileData = {
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

type Props = {
  title: string;
  isMandatory?: boolean;
  noteText?: string;
  showNote?: boolean;
  fileName?: string;
  errorMessage?: string; // add this
  onFileSelected?: (file: FileData | null) => void;
  onFileRemove?: () => void;
  accept?: string[];
  maxSizeMB?: number;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  noteStyle?: TextStyle;
  uploadBoxStyle?: ViewStyle;
  buttonText?: string;
  placeholderText?: string;
};

const FormFileUploadWithTitle = ({
  title,
  isMandatory = false,
  noteText,
  showNote = false,
  fileName,
  errorMessage,
  onFileSelected,
  onFileRemove,
  accept = ['application/pdf'],
  maxSizeMB = 5,
  containerStyle,
  titleStyle,
  noteStyle,
  uploadBoxStyle,
  buttonText = 'Browse Files',
  placeholderText = 'Upload your file here',
}: Props) => {
  const [localFileName, setLocalFileName] = useState<string>('');

  const selectedName = fileName || localFileName;

  const handlePickFile = async () => {
    try {
      const result = await pick({
        type: accept,
        allowMultiSelection: false,
      });

      const file = result?.[0];
      if (!file) return;

      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert(
          'File too large',
          `File must be less than ${maxSizeMB} MB.`,
        );
        return;
      }

      const selectedFile: FileData = {
        uri: file.uri,
        name: file.name ?? 'Selected File',
        type: file.type ?? null,
        size: file.size ?? null,
      };

      setLocalFileName(selectedFile.name);
      onFileSelected?.(selectedFile);
    } catch (error: any) {
      if (error?.code === 'DOCUMENT_PICKER_CANCELED') return;
      Alert.alert('Error', 'Unable to pick file.');
    }
  };

  const handleRemove = () => {
    setLocalFileName('');
    onFileSelected?.(null);
    onFileRemove?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextAtom style={[styles.title, titleStyle]}>
        {title}
        {isMandatory ? <TextAtom style={styles.star}>*</TextAtom> : null}
      </TextAtom>

      {showNote && !!noteText ? (
        <View style={styles.noteBox}>
          <TextAtom numberOfLines={0} style={[styles.noteText, noteStyle]}>
            {noteText}
          </TextAtom>
        </View>
      ) : null}

      <View
        style={[
          styles.uploadBox,
          uploadBoxStyle,
          errorMessage ? styles.errorBorder : null,
        ]}
      >
        <View style={styles.iconWrap}>
          <SvgUpload />
        </View>

        <TextAtom style={styles.placeholderText}>
          {selectedName || placeholderText}
        </TextAtom>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handlePickFile}
        >
          <TextAtom style={styles.buttonText}>
            {selectedName ? 'Change File' : buttonText}
          </TextAtom>
        </TouchableOpacity>

        {!!selectedName ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleRemove}>
            <TextAtom style={styles.removeText}>Remove</TextAtom>
          </TouchableOpacity>
        ) : null}
      </View>

      {!!errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}
    </View>
  );
};

export default FormFileUploadWithTitle;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: vw(8),
    marginBottom: vh(10),
    borderRadius: vw(8),
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
    color: colors.black,
    marginBottom: vh(6),
  },
  star: {
    color: colors.red,
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
  },
  noteBox: {
    backgroundColor: '#FDECEC',
    borderRadius: vw(8),
    paddingHorizontal: vw(12),
    paddingVertical: vh(10),
    marginBottom: vh(10),
    width: '100%',
    alignSelf: 'stretch',
  },
  noteText: {
    width: '100%',
    flexShrink: 1,
    flexWrap: 'wrap',
    fontSize: 12,
    fontFamily: fonts.Inter_Regular,
    color: colors.red,
    lineHeight: 18,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B8C0CC',
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh(22),
    paddingHorizontal: vw(16),
    backgroundColor: colors.white,
    minHeight: vh(160),
  },
  errorBorder: {
    borderColor: colors.red,
  },
  iconWrap: {
    marginBottom: vh(10),
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: fonts.Inter_Regular,
    color: '#2B2F38',
    marginBottom: vh(12),
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    borderColor: '#2B2F38',
    borderRadius: vw(8),
    paddingHorizontal: vw(16),
    paddingVertical: vh(8),
    backgroundColor: colors.white,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.Inter_Medium,
    color: '#2B2F38',
  },
  removeText: {
    marginTop: vh(10),
    fontSize: 12,
    fontFamily: fonts.Inter_Medium,
    color: colors.red,
  },
  errorText: {
    marginTop: vh(4),
    fontSize: 12,
    fontFamily: fonts.Inter_Regular,
    color: colors.red,
  },
});
