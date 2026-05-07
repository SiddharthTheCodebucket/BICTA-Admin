import React, { useState } from 'react';
import { CommsSupportForm, CommsSupportListTab } from './CommsSupportShared';

interface Props {
  onCreate?: () => void;
  onEdit?: () => void;
}

const SubCategoryTab = ({ onCreate, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <CommsSupportForm
        type="subCategory"
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <CommsSupportListTab
      type="subCategory"
      onCreate={onCreate || (() => setShowForm(true))}
      onEdit={onEdit || (() => setShowForm(true))}
    />
  );
};

export default SubCategoryTab;
