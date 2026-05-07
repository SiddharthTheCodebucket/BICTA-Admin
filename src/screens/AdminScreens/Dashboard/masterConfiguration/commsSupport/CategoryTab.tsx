import React, { useState } from 'react';
import { CommsSupportForm, CommsSupportListTab } from './CommsSupportShared';

interface Props {
  onCreate?: () => void;
  onEdit?: () => void;
}

const CategoryTab = ({ onCreate, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <CommsSupportForm type="category" onCancel={() => setShowForm(false)} />
    );
  }

  return (
    <CommsSupportListTab
      type="category"
      onCreate={onCreate || (() => setShowForm(true))}
      onEdit={onEdit || (() => setShowForm(true))}
    />
  );
};

export default CategoryTab;
