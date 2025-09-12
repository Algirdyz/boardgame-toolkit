import { createFileRoute } from '@tanstack/react-router';
import { VariablesManager } from '@/components/VariablesManager/VariablesManager';

export const Route = createFileRoute('/variables/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <VariablesManager />;
}
