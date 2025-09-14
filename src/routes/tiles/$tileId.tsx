import { ComponentStaticSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { TileDefinition } from '@shared/tiles';
import { Center, Select, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponents } from '@/api/componentApi';
import { getTemplate } from '@/api/templateApi';
import { getTile, saveTile } from '@/api/tileApi';
import { getVariables } from '@/api/variablesApi';
import { EditorPageTemplate, TileCanvas } from '@/components';

export const Route = createFileRoute('/tiles/$tileId')({
  component: TileEditor,
});

function TileEditor() {
  const { tileId } = Route.useParams();
  const queryClient = useQueryClient();

  // Fetch tile data
  const tileQuery = useQuery({
    queryKey: ['tiles', parseInt(tileId, 10)],
    queryFn: () => getTile(parseInt(tileId, 10)),
  });

  // Fetch template data when tile is loaded
  const templateQuery = useQuery({
    queryKey: ['templates', tileQuery.data?.templateId],
    queryFn: () => getTemplate(tileQuery.data!.templateId),
    enabled: !!tileQuery.data?.templateId,
  });

  // Fetch all components for rendering
  const componentsQuery = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  // Fetch variables for rendering
  const variablesQuery = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveTile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles'] });
    },
  });

  const handleSave = async () => {
    if (tileQuery.data) {
      await saveMutation.mutateAsync(tileQuery.data);
    }
  };

  const isLoading =
    tileQuery.isLoading ||
    templateQuery.isLoading ||
    componentsQuery.isLoading ||
    variablesQuery.isLoading;

  if (tileQuery.error || templateQuery.error) {
    return (
      <Center h="100vh">
        <div>Error loading tile data</div>
      </Center>
    );
  }

  const tile = tileQuery.data!;
  const template = templateQuery.data!;
  const components = componentsQuery.data || [];
  const variables = variablesQuery.data!;

  return (
    <EditorPageTemplate
      title={`Editing: ${tile.name}`}
      loading={isLoading}
      canvasElement={(width, height) => (
        <TileCanvas
          tile={tile}
          template={template}
          components={components}
          variables={variables}
          width={width}
          height={height}
        />
      )}
      onSave={handleSave}
      isSaving={saveMutation.isPending}
      showEditLock={false}
      sections={[
        {
          title: 'Template Info',
          content: (
            <Stack gap="sm">
              <Text size="sm">
                <strong>Template:</strong> {template.name}
              </Text>
              <Text size="xs" c="dimmed">
                This tile is based on the "{template.name}" template. You can customize component
                choices below.
              </Text>
            </Stack>
          ),
        },
        {
          title: 'Component Choices',
          content: (
            <TileComponentChoices
              tile={tile}
              template={template}
              components={components}
              onChoiceChange={(instanceId, choiceIndex) => {
                // Update the tile data
                const updatedTile = {
                  ...tile,
                  componentChoices: {
                    ...tile.componentChoices,
                    [instanceId]: choiceIndex,
                  },
                };
                // Update the query data locally
                queryClient.setQueryData(['tiles', parseInt(tileId, 10)], updatedTile);
              }}
            />
          ),
        },
      ]}
    />
  );
}

interface TileComponentChoicesProps {
  tile: TileDefinition;
  template: TemplateDefinition;
  components: ComponentStaticSpecs[];
  onChoiceChange: (instanceId: string, choiceIndex: number) => void;
}

function TileComponentChoices({
  tile,
  template,
  components,
  onChoiceChange,
}: TileComponentChoicesProps) {
  return (
    <Stack gap="md">
      {Object.entries(template.components).map(([instanceId, templateComponent]) => {
        const component = components.find((c) => c.id === templateComponent.componentId);
        const currentChoiceIndex = tile.componentChoices[instanceId] || 0;

        if (!component) {
          return (
            <div key={instanceId}>
              <Text c="red">Unknown component (ID: {templateComponent.componentId})</Text>
            </div>
          );
        }

        const choiceOptions = component.choices.map((choice, index) => ({
          value: index.toString(),
          label: `Choice ${index + 1}${choice.name ? ` - ${choice.name}` : ''}`,
        }));

        return (
          <div key={instanceId}>
            <Text size="sm" fw={500} mb="xs">
              {component.name}
            </Text>
            <Select
              data={choiceOptions}
              value={currentChoiceIndex.toString()}
              onChange={(value) => {
                if (value !== null) {
                  onChoiceChange(instanceId, parseInt(value, 10));
                }
              }}
              placeholder="Select a choice..."
            />
          </div>
        );
      })}
    </Stack>
  );
}
