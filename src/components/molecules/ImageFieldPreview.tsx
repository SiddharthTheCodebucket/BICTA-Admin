import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Pressable,
  ImageStyle,
  ViewStyle,
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
  actionLabel?: string;
  onPress?: () => void;
  thumbnailStyle?: ImageStyle;
  thumbnailBoxStyle?: ViewStyle;
  actionButtonStyle?: ViewStyle;
  containerStyle?: ViewStyle;
}

const ImageFieldPreview: React.FC<ImageFieldPreviewProps> = ({
  label,
  imageUri,
  placeholderImage,
  isMandatory = false,
  errorMessage,
  actionLabel = 'View',
  onPress,
  thumbnailStyle,
  thumbnailBoxStyle,
  actionButtonStyle,
  containerStyle,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const hasImage = !!imageUri && imageUri.length > 0;

  const handlePress =
    onPress || (hasImage ? () => setPreviewVisible(true) : undefined);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <TextAtom style={styles.label}>{label}</TextAtom>
        {isMandatory && <TextAtom style={styles.mandatory}>*</TextAtom>}
      </View>

      <View style={styles.row}>
        <View style={[styles.thumbnailBox, thumbnailBoxStyle]}>
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              style={[styles.thumbnail, thumbnailStyle]}
            />
          ) : placeholderImage ? (
            <Image
              source={placeholderImage}
              style={[styles.thumbnail, thumbnailStyle]}
            />
          ) : (
            <View style={styles.placeholder}>
              <TextAtom style={styles.placeholderText}>No Image</TextAtom>
            </View>
          )}
        </View>

        {handlePress ? (
          <TouchableAtom
            style={[styles.viewButton, actionButtonStyle]}
            onPress={handlePress}
          >
            <TextAtom style={styles.viewButtonText}>{actionLabel}</TextAtom>
          </TouchableAtom>
        ) : null}
      </View>

      {errorMessage ? (
        <TextAtom style={styles.errorText}>{errorMessage}</TextAtom>
      ) : null}

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

            {hasImage ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ImageFieldPreview;

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(14),
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
    fontFamily: fonts.Inter_Medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: vw(32),
    height: vw(48),
    borderRadius: vw(4),
    overflow: 'hidden',
    backgroundColor: colors.lightGray2,
    borderWidth: 1,
    borderColor: '#D7DCE3',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(10),
    color: colors.grey,
  },
  viewButton: {
    marginLeft: vw(10),
    height: vh(30),
    minWidth: vw(60),
    paddingHorizontal: vw(14),
    borderRadius: vw(4),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  errorText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
