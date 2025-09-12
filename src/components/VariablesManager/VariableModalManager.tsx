import { VariableColor, VariableDimension, VariableName, VariableShape } from '@shared/variables';
import { ColorVariableModal } from './modals/ColorVariableModal';
import { DimensionVariableModal } from './modals/DimensionVariableModal';
import { NameVariableModal } from './modals/NameVariableModal';
import { ShapeVariableModal } from './modals/ShapeVariableModal';
import { VariableModalManagerProps } from './types';

export function VariableModalManager({
  editingVariable,
  editingType,
  colorModalOpened,
  shapeModalOpened,
  dimensionModalOpened,
  nameModalOpened,
  onModalClose,
  onSave,
}: VariableModalManagerProps) {
  return (
    <>
      <ColorVariableModal
        opened={colorModalOpened}
        onClose={onModalClose}
        variable={editingType === 'colors' ? (editingVariable as VariableColor) : null}
        onSave={(variable) => onSave('colors', variable)}
      />

      <ShapeVariableModal
        opened={shapeModalOpened}
        onClose={onModalClose}
        variable={editingType === 'shapes' ? (editingVariable as VariableShape) : null}
        onSave={(variable) => onSave('shapes', variable)}
      />

      <DimensionVariableModal
        opened={dimensionModalOpened}
        onClose={onModalClose}
        variable={editingType === 'dimensions' ? (editingVariable as VariableDimension) : null}
        onSave={(variable) => onSave('dimensions', variable)}
      />

      <NameVariableModal
        opened={nameModalOpened}
        onClose={onModalClose}
        variable={editingType === 'names' ? (editingVariable as VariableName) : null}
        onSave={(variable) => onSave('names', variable)}
      />
    </>
  );
}
