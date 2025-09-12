import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/variables/')({
  beforeLoad: () => {
    throw redirect({
      to: '/variables/$variableType',
      params: { variableType: 'colors' },
    });
  },
});
