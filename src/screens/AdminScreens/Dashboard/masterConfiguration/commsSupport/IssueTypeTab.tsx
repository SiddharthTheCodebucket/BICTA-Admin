import React, { useState } from 'react';
import { CommsSupportForm, CommsSupportListTab } from './CommsSupportShared';

interface Props {
  onCreate?: () => void;
  onEdit?: () => void;
}

const IssueTypeTab = ({ onCreate, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <CommsSupportForm type="issueType" onCancel={() => setShowForm(false)} />
    );
  }

  return (
    <CommsSupportListTab
      type="issueType"
      onCreate={onCreate || (() => setShowForm(true))}
      onEdit={onEdit || (() => setShowForm(true))}
    />
  );
};

export default IssueTypeTab;
