import React, { useLayoutEffect, useState } from 'react';
import { Image, Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, images, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  FormDropdownFieldWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';

interface Props {
  route: any;
  navigation: NavigationType;
}

type LibraryMode = 'section' | 'book';

const locations = [{ id: 'Gaya, bihar', name: 'Gaya, bihar' }];
const measurements = [
  { id: 'Shelf', name: 'Shelf' },
  { id: 'Rack', name: 'Rack' },
  { id: 'Almirah', name: 'Almirah' },
];

const AddLibraryMaster = ({ navigation, route }: Props) => {
  const mode: LibraryMode = route?.params?.mode ?? 'section';
  const item = route?.params?.item;
  const isBook = mode === 'book';

  const [sectionRows, setSectionRows] = useState(
    isBook ? [{ section: '', subSection: '' }] : [{ subSection: '' }],
  );

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isBook
        ? item
          ? 'Edit Book Master'
          : 'Add Book Master'
        : item
        ? 'Edit Section Master'
        : 'Add Section Master',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const updateRow = (index: number, key: string, value: string) => {
    setSectionRows(prev =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const addRow = () => {
    setSectionRows(prev => [
      ...prev,
      isBook ? { section: '', subSection: '' } : { subSection: '' },
    ]);
  };

  const renderAddMore = (compact = false) => (
    <TouchableAtom
      style={[styles.addMoreButton, compact && styles.addMoreButtonSolid]}
      onPress={addRow}
    >
      <TextAtom
        style={[styles.addMoreText, compact && styles.addMoreTextSolid]}
      >
        + Add More
      </TextAtom>
    </TouchableAtom>
  );

  const renderBookForm = () => (
    <>
      <View style={globalStyles.adminFormCard}>
        <TextAtom style={styles.centerSectionTitle}>Category Details</TextAtom>
        <FormTextInputWithTitle
          title="BIPARD Location"
          value="Gaya, bihar"
          editable={false}
          isMandatory
          inputStyle={styles.disabledInput}
        />
        <FormTextInputWithTitle
          title="Book Category Name"
          placeholder="Enter"
          defaultValue={item?.categoryName}
          onSubmitEditing={() => Keyboard.dismiss()}
          isMandatory
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <TextAtom style={styles.sectionTitle}>Section Details</TextAtom>
        {renderAddMore()}
      </View>

      <View style={globalStyles.adminFormCard}>
        {sectionRows.map((row: any, index) => (
          <View key={`book-row-${index}`}>
            <FormTextInputWithTitle
              title="Section"
              placeholder="Enter"
              value={row.section}
              onChangeText={text => updateRow(index, 'section', text)}
              isMandatory
            />
            <FormTextInputWithTitle
              title="Sub Section"
              placeholder="Enter"
              value={row.subSection}
              onChangeText={text => updateRow(index, 'subSection', text)}
              isMandatory
            />
          </View>
        ))}
      </View>
    </>
  );

  const renderSectionForm = () => (
    <>
      <View style={globalStyles.adminFormCard}>
        <FormDropdownFieldWithTitle
          title="BIPARD Location"
          data={locations}
          value={locations[0].id}
          onChange={() => {}}
          disabled
          isMandatory
        />
        <FormTextInputWithTitle
          title="Section Name"
          placeholder="Enter"
          defaultValue={item?.sectionName}
          onSubmitEditing={() => Keyboard.dismiss()}
          isMandatory
        />
        <FormDropdownFieldWithTitle
          title="Select Measurement"
          data={measurements}
          placeholder="Select"
          onChange={() => {}}
          isMandatory
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <TextAtom style={styles.sectionTitle}>Sub Section Name</TextAtom>
        {renderAddMore(true)}
      </View>

      <View style={globalStyles.adminFormCard}>
        {sectionRows.map((row: any, index) => (
          <FormTextInputWithTitle
            key={`section-row-${index}`}
            title="Sub Section"
            placeholder="Enter"
            value={row.subSection}
            onChangeText={text => updateRow(index, 'subSection', text)}
            isMandatory
          />
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        {isBook ? renderBookForm() : renderSectionForm()}
      </KeyboardAwareScrollView>
      <View style={styles.footerRow}>
        <FormWhiteButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.whiteButton}
        />
        <FormGradientButton
          title={item ? 'Update' : 'Add'}
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.gradientButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddLibraryMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  localHeader: {
    minHeight: vh(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(16),
    gap: vw(8),
  },
  localBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.text_black,
    resizeMode: 'contain',
  },
  localTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  scroll: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(24),
  },
  centerSectionTitle: {
    textAlign: 'center',
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.primary,
    marginBottom: vh(6),
  },
  sectionHeaderRow: {
    minHeight: vh(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(8),
  },
  sectionTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.primary,
  },
  addMoreButton: {
    minHeight: vh(26),
    borderRadius: vw(5),
    borderWidth: 1,
    borderColor: colors.primary_blue,
    paddingHorizontal: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  addMoreButtonSolid: {
    backgroundColor: colors.primary_blue,
    borderColor: colors.primary_blue,
  },
  addMoreText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.primary_blue,
  },
  addMoreTextSolid: {
    color: colors.white,
  },
  disabledInput: {
    color: '#6D7480',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(15),
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(7),
    borderColor: colors.primary_dark_blue,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(7),
  },
});
