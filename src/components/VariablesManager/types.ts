import { Variable, VariableType } from '@shared/variables';

export interface VariableCardProps {
  variable: Variable;
  type: VariableType;
  onEdit: (type: VariableType, variable: Variable) => void;
  onDelete: (type: VariableType, id: number) => void;
}

export interface VariableListProps {
  type: VariableType;
  variables: Variable[];
  onAdd: (type: VariableType) => void;
  onEdit: (type: VariableType, variable: Variable) => void;
  onDelete: (type: VariableType, id: number) => void;
}

export interface VariableModalManagerProps {
  editingVariable: Variable | null;
  editingType: VariableType | null;
  colorModalOpened: boolean;
  shapeModalOpened: boolean;
  dimensionModalOpened: boolean;
  nameModalOpened: boolean;
  onModalClose: () => void;
  onSave: (type: VariableType, variable: Variable) => void;
}
