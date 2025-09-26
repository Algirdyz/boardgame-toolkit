import { Variable, VariableType } from '@shared/variables';

export interface VariableTypeConfig {
  /** Unique identifier for the variable type */
  id: VariableType;

  /** Display name for the variable type */
  name: string;

  /** Display name in plural form */
  pluralName: string;

  /** Icon component for the tab and UI elements */
  icon: React.ComponentType<{ size?: number }>;

  /** Component for rendering the edit form within the modal */
  editComponent: React.ComponentType<VariableEditComponentProps>;

  /** Component for rendering individual variable cards in the list */
  listItemComponent: React.ComponentType<VariableListItemProps>;

  /** Function to create a new default variable of this type */
  createDefault: () => Variable;

  /** Function to validate a variable of this type */
  validate?: (variable: Variable) => Record<string, string> | null;

  /** Optional description for the variable type */
  description?: string;
}

export interface VariableEditComponentProps {
  /** The variable being edited, or null for new variables */
  variable: Variable | null;

  /** Callback when the variable is saved */
  onSave: (variable: Variable) => void;

  /** Callback when the edit is cancelled */
  onCancel: () => void;

  /** Whether the form is in a loading state */
  loading?: boolean;
}

export interface VariableListItemProps {
  /** The variable to display */
  variable: Variable;

  /** The variable type */
  type: VariableType;

  /** Callback when edit is requested */
  onEdit: (type: VariableType, variable: Variable) => void;

  /** Callback when delete is requested */
  onDelete: (type: VariableType, id: number) => void;
}

export interface VariableTypeRegistry {
  /** Get configuration for a specific variable type */
  getConfig: (type: VariableType) => VariableTypeConfig;

  /** Get all available variable type configurations */
  getAllConfigs: () => VariableTypeConfig[];

  /** Get all valid variable type IDs */
  getValidTypes: () => VariableType[];

  /** Check if a variable type is valid */
  isValidType: (type: string) => type is VariableType;
}
