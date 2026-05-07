import React from 'react';
import { screensName } from '../../../../../constants';
import { CommsSupportListScreen } from './CommsSupportShared';

interface Props {
  navigation: any;
}

const QuestionFieldsTab = ({ navigation }: Props) => (
  <CommsSupportListScreen
    type="questionFields"
    navigation={navigation}
    addRouteName={screensName.AddCommsQuestionField}
  />
);

export default QuestionFieldsTab;
