import * as React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { colors, fonts, images, strings, vh, vw } from '../../constants';
import { isNullUndefined } from '../../utils/CommonFunction';
import { useAndroidBackButton } from '../../hooks/behaviour';
import TextInputOrganisms from '../../components/organisms/TextInputOrganisms';

/**
 * Custom Imports
 */
interface Props {
  navigation: any;
  name: any;
  route: any;
  setSelectedData: Function;
  typeName: string;
  typeId: string;
}

const DropDownModal = (props: Props) => {
  const data = props.route.params?.Data;
  const { navigation } = props;
  const [index, setIndex] = React.useState(1);
  // ref
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  // variables
  const snapPoints = React.useMemo(() => ['50%', '95%'], []);

  // callbacks
  const handleSheetChanges = React.useCallback(() => {}, []);

  // callbacks
  const handleSnap = React.useCallback(
    (startIndex: number, endIndex: number) => {
      if (startIndex === 1 && endIndex === -1) {
        navigation.goBack();
      }
      if (startIndex === 0 && endIndex === -1) {
        navigation.goBack();
      }
    },
    [navigation],
  );

  const [dummyData, setdummyData] = React.useState(data);

  const { name, typeName, typeId, selectedData, setSelectedData, multiSelect } =
    props.route.params;

  const SearchData = (val: string) => {
    let Data = data;
    if (Data?.length !== 0 && !isNullUndefined(data)) {
      let filterData = Data.filter((obj: any) => {
        let searchName = `${obj[typeName]}`;
        let nameLC = searchName.toLowerCase();
        let txtLC = val.toLowerCase();
        if (nameLC.includes(txtLC)) {
          return obj[typeName];
        }
      });
      if (val?.length !== 0) {
        setdummyData([...data]);
      }

      setdummyData([...filterData]);
    }
  };
  const FindSelected = React.useCallback((item: any) => {
    let find = false;
    let findedIndex = selectedData?.findIndex(
      (val: any) => val[typeId] === item[typeId],
    );

    if (findedIndex >= 0) {
      find = true;
    }

    return find;
  }, []);
  const isRenderRight = () => {
    return (
      <TouchableOpacity>
        <Image source={images.search} />
      </TouchableOpacity>
    );
  };

  useAndroidBackButton(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const itemSeperator = () => {
    return <View style={styles.lineStyle} />;
  };
  const handleComponent = () => {
    return <View style={styles.handleComponent} />;
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          props.navigation.pop();
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={index}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleComponent={() => handleComponent()}
        onAnimate={handleSnap}
        enablePanDownToClose={true}
      >
        <View style={styles.boxStyle}>
          <View style={styles.headerStyle}>
            <Text style={styles.textStyle}>
              {strings.select} {name}
            </Text>
            <TouchableOpacity
              style={styles.crossView}
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image
                source={images.cross}
                style={styles.crossStyle}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.itemSeprator} />
          <TextInputOrganisms
            errorMessage=""
            placeholder={strings.search + ' ' + name}
            onChangeText={(val: any) => {
              SearchData(val.trim());
            }}
            isrenderRight={() => isRenderRight()}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            onFocus={() => {
              setIndex(1);
            }}
            style={styles.textInput}
            returnKeyType={'done'}
          />
          {dummyData?.length === 0 && (
            <Text style={styles.noDataFound}>{strings.noDataFound}</Text>
          )}
          <BottomSheetFlatList
            showsVerticalScrollIndicator={false}
            data={dummyData}
            bounces={false}
            keyExtractor={(item: any, indexK: any) => item[typeId] + indexK}
            renderItem={({ item }: any) => {
              let isSelected = multiSelect
                ? FindSelected(item)
                : item[typeId] === selectedData[typeId];
              return (
                <TouchableOpacity
                  style={styles.dataViewStyle}
                  onPress={() => {
                    !isSelected && setSelectedData(item);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.itemTitle}>{item[typeName]}</Text>
                  {isSelected && (
                    <Image source={images.tick} style={styles.tickImg} />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => itemSeperator()}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black_20,
  },
  boxStyle: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: vw(20),
  },
  textStyle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(18),
  },
  dataViewStyle: {
    width: '100%',
    minHeight: vh(30),
    marginTop: vh(15),
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: vw(3),
  },
  lineStyle: {
    width: '100%',
    backgroundColor: colors.borderColor,
    height: vh(1),
    borderRadius: vw(10),
  },
  itemTitle: {
    width: vw(300),
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.black,
  },
  headerStyle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crossStyle: {
    width: vw(24),
    height: vw(24),
    tintColor: colors.borderColor,
    resizeMode: 'contain',
  },
  crossView: {
    width: vw(30),
    height: vw(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSeprator: {
    width: vw(328),
    height: 0.5,
    backgroundColor: colors.borderColor,
    alignSelf: 'center',
    marginTop: vh(16),
  },
  noDataFound: {
    alignSelf: 'center',
    marginTop: vw(20.7),
    marginBottom: vh(10),
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(18),
    color: colors.black,
  },
  textInput: {
    marginTop: vh(15),
  },
  handleComponent: {
    marginTop: vh(30),
  },
  tickImg: {
    tintColor: colors.primary,
  },
});
export default DropDownModal;
