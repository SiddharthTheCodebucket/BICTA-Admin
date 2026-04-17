import React from 'react';
import TraineeFeaturePlaceholder from '../TraineeFeaturePlaceholder';

const TraineeAttendance = ({ navigation }: any) => {
  return (
    <TraineeFeaturePlaceholder
      navigation={navigation}
      title="Trainee Attendance"
      description="This is now a separate LMS screen, so the drawer state will stay isolated from Trainee Registration."
    />
  );
};

export default TraineeAttendance;
