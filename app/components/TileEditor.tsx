import { TextInput, Select, ColorInput, NumberInput, Button, Stack } from '@mantine/core';
import { Tile } from '../lib/types';

interface TileEditorProps {
    tile: Tile;
    onUpdateTile: (field: keyof Tile, value: any) => void;
    onBack: () => void;
}

const TileEditor = ({ tile, onUpdateTile, onBack }: TileEditorProps) => {
    return (
        <Stack>
            <Button onClick={onBack} style={{ alignSelf: 'flex-start' }}>Back to List</Button>
            <TextInput
                label="Tile Name"
                placeholder="Enter tile name"
                value={tile.name}
                onChange={(e) => onUpdateTile('name', e.currentTarget.value)}
            />
            <Select
                label="Tile Shape"
                placeholder="Pick value"
                data={['1x1', '2x2', 'L', 'T']}
                value={tile.shape}
                onChange={(value) => onUpdateTile('shape', value)}
            />
            <ColorInput
                label="Faction Color"
                placeholder="Pick color"
                value={tile.factionColor}
                onChange={(value) => onUpdateTile('factionColor', value)}
            />
            <TextInput
                label="Art URL"
                placeholder="Enter image URL"
                value={tile.artUrl || ''}
                onChange={(e) => onUpdateTile('artUrl', e.currentTarget.value)}
            />
            <NumberInput
                label="Gold Cost"
                placeholder="Enter gold cost"
                min={0}
                value={tile.cost.gold || 0}
                onChange={(value) => onUpdateTile('cost', { ...tile.cost, gold: Number(value) })}
            />
        </Stack>
    );
};

export default TileEditor;
