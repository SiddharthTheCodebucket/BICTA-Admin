import { FlatList, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';
import { colors, fonts, vh, vw } from '../../constants';
import TouchableAtom from '../atoms/TouchableAtom';
import TextAtom from '../atoms/TextAtom';
import ViewAtom from '../atoms/ViewAtom';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';
import ErrorMolecule from '../molecules/ErrorMolecule';
import RadioButtonAtom from '../atoms/RadioButtonAtom';

interface Props {
  label: string;
  isMandatory: boolean;
  data: Array<any>;
  onSelect: Function;
  selectedType: any;
  typeName: string;
  typeId: string;
  contentContainerStyle?: ViewStyle;
  dataContainer?: any;
  errorMessage?: string;
  errorMessageView?: ViewStyle;
  labelStyle?: any;
}

const RadioSelectableOrganism = (props: Props) => {
  const { data, selectedType } = props;
  return (
    <ViewAtom style={[styles.container, props.contentContainerStyle]}>
      <LabelWithMandatoryMolecules
        label={props.label}
        isMandatory={props.isMandatory}
        labelStyle={props.labelStyle}
      />
    
        showsVerticalScrollIndicator={false}
        data={data}
        numColumns={2}
        extraData={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.flatlistContainer, props.dataContainer]}
        renderItem={({ item }: any) => {
          let isSelected = item[props.typeId] === selectedType?.[props.typeId];
          return (
            <TouchableAtom
              style={styles.radiotickArrStyle}
              activeOpacity={0.8}
              onPress={() => {
                props.onSelect(item);
              }}
            >
              <RadioButtonAtom
                isSelected={isSelected}
                onSelect={() => {
                  props.onSelect(item);
                }}
              />
              <TextAtom numberOfLines={1} style={styles.taskTypeStyle}>
                {item[props.typeName]}
              </TextAtom>
            </TouchableAtom>
          );
        }}
      />
      <ErrorMolecule
        errorMessage={props.errorMessage}
        errorMessageView={props.errorMessageView}
      />
    </ViewAtom>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(10),
  },
  flatlistContainer: {
    paddingHorizontal: vw(20),
  },
  taskTypeStyle: {
    color: colors.black,
    marginLeft: vw(5),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(3),
  },
  radiotickArrStyle: {
    width: vw(165),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(5),
  },
});

export default RadioSelectableOrganism;
