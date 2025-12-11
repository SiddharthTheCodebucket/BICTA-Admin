import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  images,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { useAppSelector } from '../../../../../hooks';
import ImageAtom from '../../../../../components/atoms/ImageAtom';

interface Props {
  navigation: NavigationType;
}

const DocumentDetails = ({ navigation }: Props) => {
  const { profileData } = useAppSelector(state => state.Profile);

  const [visible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.document_details);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const docs = [
    { label: strings.signature, value: profileData?.sign },
    { label: strings.photo, value: profileData?.photo },
    { label: strings.aadhar_card, value: profileData?.aadhaarCard },
  ];

  const openPreview = (img: string) => {
    setCurrentImage(img || '');
    setVisible(true);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {docs.map((item, index) => (
          <View key={index.toString() + 'ABCER'} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>

            <TouchableOpacity onPress={() => openPreview(item.value)}>
              <ImageAtom source={images.eyeOpen} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          {currentImage ? (
            <Image
              source={{ uri: currentImage }}
              style={styles.previewImg}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.noDocText}>
              {strings.no_documnet_available}
            </Text>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default DocumentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vh(12),
    borderBottomWidth: vw(0.5),
    borderColor: colors.chinese_silver,
    width: vw(330),
  },
  label: {
    fontSize: vw(15),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
  modalBg: {
    flex: 1,
    backgroundColor: colors.black80per,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImg: {
    width: '85%',
    height: '70%',
  },
  noDocText: {
    color: colors.white,
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
  },
});
