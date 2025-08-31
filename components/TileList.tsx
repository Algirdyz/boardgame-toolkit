import { Button, Stack, Group, List, ThemeIcon, rem } from '@mantine/core';
import { IconCircleDashed } from '@tabler/icons-react';
import { Tile } from '../lib/types';

interface TileListProps {
    tiles: Tile[];
    onSelectTile: (id: string) => void;
    onDeleteTile: (id: string) => void;
    onAddNew: () => void;
    onSave: () => void;
    onEditTemplates: () => void;
}

const TileList = ({ tiles, onSelectTile, onDeleteTile, onAddNew, onSave, onEditTemplates }: TileListProps) => {
    return (
        <Stack>
            <h2>Tiles</h2>
            <List spacing="xs" size="sm" center>
                {tiles.map(tile => (
                    <List.Item
                        key={tile.id}
                        onClick={() => onSelectTile(tile.id)}
                        icon={
                            <ThemeIcon color="blue" size={24} radius="xl">
                                <IconCircleDashed style={{ width: rem(16), height: rem(16) }} />
                            </ThemeIcon>
                        }
                    >
                        <Group justify="space-between">
                            {tile.name}
                            <Button size="compact-xs" color="red" onClick={(e) => { e.stopPropagation(); onDeleteTile(tile.id); }}>Delete</Button>
                        </Group>
                    </List.Item>
                ))}
            </List>
            <Button onClick={onAddNew}>Add New Tile</Button>
            <Button onClick={onEditTemplates}>Edit Templates</Button>
            <Button onClick={onSave} color="blue">Save All</Button>
        </Stack>
    );
};

export default TileList;
