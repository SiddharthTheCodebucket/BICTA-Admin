import React from 'react';
import { screensName } from '../../../../../constants';
import { CommsSupportListScreen } from './CommsSupportShared';

interface Props {
  navigation: any;
}

const SubCategoryTab = ({ navigation }: Props) => (
  <CommsSupportListScreen
    type="subCategory"
    navigation={navigation}
    addRouteName={screensName.AddCommsSubCategory}
  />
);

export default SubCategoryTab;
