import React from 'react';
import { screensName } from '../../../../../constants';
import { CommsSupportListScreen } from './CommsSupportShared';

interface Props {
  navigation: any;
}

const CategoryTab = ({ navigation }: Props) => (
  <CommsSupportListScreen
    type="category"
    navigation={navigation}
    addRouteName={screensName.AddCommsCategory}
  />
);

export default CategoryTab;
