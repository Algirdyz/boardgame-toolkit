import { createFileRoute } from '@tanstack/react-router';
import { VariablesManager } from '@/components/VariablesManager/VariablesManager';

export const Route = createFileRoute('/variables/$variableType')({
  component: RouteComponent,
  validateSearch: () => ({}),
});

function RouteComponent() {
  return <VariablesManager />;
}
