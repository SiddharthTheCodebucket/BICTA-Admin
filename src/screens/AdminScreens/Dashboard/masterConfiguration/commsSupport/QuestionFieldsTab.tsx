import React, { useState } from 'react';
import { CommsSupportForm, CommsSupportListTab } from './CommsSupportShared';

interface Props {
  onCreate?: () => void;
  onEdit?: () => void;
}

const QuestionFieldsTab = ({ onCreate, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <CommsSupportForm
        type="questionFields"
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <CommsSupportListTab
      type="questionFields"
      onCreate={onCreate || (() => setShowForm(true))}
      onEdit={onEdit || (() => setShowForm(true))}
    />
  );
};

export default QuestionFieldsTab;
