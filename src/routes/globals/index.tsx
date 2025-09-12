import { createFileRoute } from '@tanstack/react-router';
import { GlobalVariablesManager } from '../../components/GlobalVariablesManager/GlobalVariablesManager';

export const Route = createFileRoute('/globals/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <GlobalVariablesManager />;
}
