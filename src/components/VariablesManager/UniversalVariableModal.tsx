import { useState } from 'react';
import { Variable, VariableType } from '@shared/variables';
import { Modal, Text } from '@mantine/core';
import { variableTypeRegistry } from './variableTypeRegistry';

interface UniversalVariableModalProps {
  /** Whether the modal is open */
  opened: boolean;

  /** Callback when the modal is closed */
  onClose: () => void;

  /** The type of variable being edited */
  variableType: VariableType | null;

  /** The variable being edited, or null for new variables */
  variable: Variable | null;

  /** Callback when a variable is saved */
  onSave: (type: VariableType, variable: Variable) => void;
}

export function UniversalVariableModal({
  opened,
  onClose,
  variableType,
  variable,
  onSave,
}: UniversalVariableModalProps) {
  const [loading, setLoading] = useState(false);

  if (!variableType) {
    return null;
  }

  const config = variableTypeRegistry.getConfig(variableType);
  const EditComponent = config.editComponent;
  const handleSave = async (savedVariable: Variable) => {
    try {
      setLoading(true);
      onSave(variableType, savedVariable);
    } catch (error) {
      console.error('Failed to save variable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    onClose();
  };

  const modalTitle = variable ? `Edit ${config.name}` : `Add ${config.name}`;

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={600}>{modalTitle}</Text>} size="lg">
      <EditComponent
        variable={variable}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />
    </Modal>
  );
}
