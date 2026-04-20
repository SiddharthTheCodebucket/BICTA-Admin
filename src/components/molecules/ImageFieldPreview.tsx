import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Pressable,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import TouchableAtom from '../atoms/TouchableAtom';
import { colors, fonts, vh, vw } from '../../constants';

interface ImageFieldPreviewProps {
  label: string;
  imageUri?: string;
  placeholderImage?: any;
  isMandatory?: boolean;
  errorMessage?: string;
  fileName?: string;
  fileType?: string;
  actionLabel?: string;
  onPress?: () => void;
}

const ImageFieldPreview: React.FC<ImageFieldPreviewProps> = ({
  label,
  imageUri,
  placeholderImage,
  isMandatory = false,
  errorMessage,
  fileName,
  fileType,
  actionLabel = 'View',
  onPress,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const hasImage = imageUri && imageUri.length > 0;
  const displayUri = imageUri || fileName;

  const handlePress = onPress || (hasImage ? () => setPreviewVisible(true) : undefined);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <TextAtom style={styles.label}>{label}</TextAtom>
        {isMandatory && <TextAtom style={styles.mandatory}>*</TextAtom>}
      </View>

      <View style={styles.thumbnailContainer}>
        {hasImage ? (
          <Image source={{ uri: displayUri }} style={styles.thumbnail} />
        ) : placeholderImage ? (
          <Image source={placeholderImage} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <TextAtom style={styles.placeholderText}>No Image</TextAtom>
          </View>
        )}
      </View>

      {(hasImage || fileName) && handlePress && (
        <TouchableAtom
          style={styles.viewButton}
          onPress={handlePress}
        >
          <TextAtom style={styles.viewButtonText}>
            {actionLabel || 'View'}
          </TextAtom>
        </TouchableAtom>
      )}

      {errorMessage && (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      )}

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewVisible(false)}
            >
              <TextAtom style={styles.closeButtonText}>X</TextAtom>
            </TouchableOpacity>
            {hasImage && (
              <Image
                source={{ uri: displayUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ImageFieldPreview;

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(15),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(8),
  },
  label: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#6D7480',
  },
  mandatory: {
    color: colors.red,
    fontSize: vw(14),
    marginLeft: vw(2),
  },
  thumbnailContainer: {
    width: vw(120),
    height: vw(100),
    borderRadius: vw(8),
    overflow: 'hidden',
    backgroundColor: colors.lightGray2,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  viewButton: {
    marginTop: vh(8),
    alignSelf: 'flex-start',
    paddingVertical: vh(4),
    paddingHorizontal: vw(12),
    borderRadius: vw(4),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.primary,
  },
  errorText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(16),
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: vw(12),
    right: vw(12),
    width: vw(32),
    height: vw(32),
    borderRadius: vw(16),
    backgroundColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.white,
    fontFamily: fonts.Inter_Bold,
    fontSize: vw(14),
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
