import React from 'react';
import TraineeFeaturePlaceholder from '../TraineeFeaturePlaceholder';

const GateAccess = ({ navigation }: any) => {
  return (
    <TraineeFeaturePlaceholder
      navigation={navigation}
      title="Gate Access"
      description="This is now a separate LMS screen, so the drawer state will stay isolated from the other trainee menu items."
    />
  );
};

export default GateAccess;
