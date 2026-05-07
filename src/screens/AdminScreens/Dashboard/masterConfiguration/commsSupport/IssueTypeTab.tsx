import React from 'react';
import { screensName } from '../../../../../constants';
import { CommsSupportListScreen } from './CommsSupportShared';

interface Props {
  navigation: any;
}

const IssueTypeTab = ({ navigation }: Props) => (
  <CommsSupportListScreen
    type="issueType"
    navigation={navigation}
    addRouteName={screensName.AddCommsIssueType}
  />
);

export default IssueTypeTab;
