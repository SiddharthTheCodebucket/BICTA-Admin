import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import ViewAtom from '../atoms/ViewAtom';
import { vh } from '../../constants';
import TextInputMolecule from '../molecules/TextInputMolecule';
import ErrorMolecule from '../molecules/ErrorMolecule';
import LabelWithMandatoryMolecules from '../molecules/LabelWithMandatoryMolecules';

const TextInputOrganisms = (
  {
    label,
    isMandatory,
    labelStyle,
    contentContainerStyle,
    errorMessage,
    errorMessageView,
    ...textInputProps
  }: any,
  ref: any,
) => (
  <ViewAtom style={[styles.container, contentContainerStyle]}>
    <LabelWithMandatoryMolecules
      label={label}
      isMandatory={isMandatory}
      labelStyle={labelStyle}
    />
    <TextInputMolecule
      {...textInputProps}
      ref={ref}
      errorMessage={errorMessage}
    />
    <ErrorMolecule
      errorMessage={errorMessage}
      errorMessageView={errorMessageView}
    />
  </ViewAtom>
);

export default forwardRef(TextInputOrganisms);

const styles = StyleSheet.create({
  container: {
    marginBottom: vh(10),
  },
});
