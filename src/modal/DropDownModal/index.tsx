import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Keyboard,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fonts,
  images,
  strings,
  SvgCross,
  vh,
  vw,
} from '../../constants';
import { isNullUndefined } from '../../utils/CommonFunction';
import TextInputOrganisms from '../../components/organisms/TextInputOrganisms';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  data: any[];
  name: string;
  typeName: string;
  typeId: string;
  selectedData: any;
  setSelectedData: Function;
  multiSelect?: boolean;
}

const DropDownModal = ({
  isVisible,
  onClose,
  data,
  name,
  typeName,
  typeId,
  selectedData,
  setSelectedData,
  multiSelect = false,
}: Props) => {
  const [dummyData, setDummyData] = useState(data);

  const SearchData = (val: string) => {
    if (!data || data.length === 0) return;

    const txtLC = val.toLowerCase();

    const filterData = data.filter((obj: any) => {
      const searchName = `${obj[typeName]}`.toLowerCase();
      return searchName.includes(txtLC);
    });

    if (val.length === 0) {
      setDummyData(data);
    } else {
      setDummyData(filterData);
    }
  };

  const FindSelected = useCallback(
    (item: any) => {
      const index = selectedData?.findIndex(
        (val: any) => val[typeId] === item[typeId],
      );
      return index >= 0;
    },
    [selectedData],
  );

  const isRenderRight = () => (
    <TouchableOpacity>
      <Image source={images.search} />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => {
    const isSelected = multiSelect
      ? FindSelected(item)
      : item[typeId] === selectedData?.[typeId];

    return (
      <TouchableOpacity
        style={styles.dataViewStyle}
        onPress={() => {
          if (!isSelected) {
            setSelectedData(item);
          }
          onClose();
        }}
      >
        <Text style={styles.itemTitle}>{item[typeName]}</Text>
        {isSelected && <Image source={images.tick} style={styles.tickImg} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={styles.modal}
      propagateSwipe
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.headerStyle}>
          <Text style={styles.textStyle}>
            {strings.select} {name}
          </Text>

          <TouchableOpacity onPress={onClose}>
            <SvgCross />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.itemSeprator} /> */}

        {/* Search */}
        <TextInputOrganisms
          errorMessage=""
          placeholder={strings.search + ' ' + name}
          onChangeText={(val: string) => SearchData(val.trim())}
          isrenderRight={isRenderRight}
          onSubmitEditing={() => Keyboard.dismiss()}
          style={styles.textInput}
          returnKeyType="done"
        />

        {/* Empty */}
        {dummyData?.length === 0 && (
          <Text style={styles.noDataFound}>{strings.noDataFound}</Text>
        )}

        {/* List */}
        <FlatList
          data={dummyData}
          keyExtractor={(item, index) => item[typeId] + index}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.lineStyle} />}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default DropDownModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  container: {
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderTopLeftRadius: vw(16),
    borderTopRightRadius: vw(16),
    paddingHorizontal: vw(20),
    paddingBottom: vh(20),
  },

  handle: {
    alignSelf: 'center',
    width: vw(40),
    height: vh(5),
    borderRadius: vw(10),
    backgroundColor: colors.borderColor,
    marginTop: vh(10),
    marginBottom: vh(10),
  },

  textStyle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: 16, // even number (your guideline)
  },

  dataViewStyle: {
    width: '100%',
    minHeight: vh(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh(10),
  },

  lineStyle: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderColor,
  },

  itemTitle: {
    width: '85%',
    fontFamily: fonts.Roboto_Regular,
    fontSize: 14,
    color: colors.black,
  },

  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },

  crossStyle: {
    width: vw(22),
    height: vw(22),
    tintColor: colors.borderColor,
  },

  itemSeprator: {
    height: 1,
    backgroundColor: colors.borderColor,
    marginTop: vh(12),
  },

  noDataFound: {
    alignSelf: 'center',
    marginTop: vh(20),
    fontFamily: fonts.Roboto_Medium,
    fontSize: 16,
    color: colors.black,
  },

  textInput: {
    marginTop: vh(15),
  },

  tickImg: {
    tintColor: colors.primary,
  },
});
