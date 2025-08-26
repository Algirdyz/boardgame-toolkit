import { saveTileSet, loadTileSet } from '../lib/io';
import { Tile, TileSet } from '../lib/types';
import { useState, useEffect } from 'react';
import TileList from './TileList';
import TileEditor from './TileEditor';
import TemplateList from '../templates/TemplateList';
import TemplateEditor from '../template/[templateType]/TemplateEditor';
import { TemplateDefinition, TemplateType } from '../lib/templateTypes';
import { getDefaultTemplate } from '../lib/shapes';
import { useRouter } from 'next/navigation';

type View =
    | { type: 'list' }
    | { type: 'edit'; tileId: string }
    | { type: 'templates' }
    | { type: 'template-edit'; template: TemplateDefinition };


const Sidebar = () => {
    const [tileSet, setTileSet] = useState<TileSet | null>(null);
    const [view, setView] = useState<View>({ type: 'list' });
    const router = useRouter();

    useEffect(() => {
        const fetchTileSet = async () => {
            const loadedTileSet = await loadTileSet('default');
            setTileSet(loadedTileSet);
        };
        fetchTileSet();
    }, []);

    useEffect(() => {
        if (view.type === 'edit') {
            router.push(`/tile/${view.tileId}`);
        } else if (view.type === 'template-edit') {
            router.push(`/template/${view.template.type}`);
        } else if (view.type === 'templates') {
            router.push('/templates');
        } else {
            router.push('/');
        }
    }, [view, router]);


    const activeTile = (view.type === 'edit' && tileSet?.tiles.find(t => t.id === view.tileId)) || null;

    const handleSave = async () => {
        if (tileSet) {
            await saveTileSet(tileSet);
        }
    };

    const handleSelectTile = (id: string) => {
        setView({ type: 'edit', tileId: id });
    };

    const handleBackToList = () => {
        setView({ type: 'list' });
    };

    const handleAddNew = () => {
        const newTile: Tile = {
            id: `tile-${Date.now()}`,
            name: 'New Tile',
            shape: '1x1',
            factionColor: 'grey',
            cost: {},
            workerSlots: [],
            edges: [],
        };
        const updatedTiles = [...(tileSet?.tiles || []), newTile];
        setTileSet(prev => ({ ...(prev || { id: 'default', name: 'default', description: '', tiles: [] }), tiles: updatedTiles }));
        setView({ type: 'edit', tileId: newTile.id });
    };

    const handleDelete = (id: string) => {
        const updatedTiles = tileSet?.tiles.filter(t => t.id !== id) || [];
        setTileSet(prev => ({ ...prev!, tiles: updatedTiles }));
        if (view.type === 'edit' && view.tileId === id) {
            setView({ type: 'list' });
        }
    };

    const updateTile = (field: keyof Tile, value: any) => {
        if (!activeTile) return;

        const newTile: Tile = {
            ...activeTile,
            [field]: value,
        };

        const updatedTiles = tileSet?.tiles.map(t => t.id === newTile.id ? newTile : t) || [];
        setTileSet(prev => ({ ...prev!, tiles: updatedTiles }));
    };

    const handleSelectTemplate = (templateType: TemplateType) => {
        const template = getDefaultTemplate(templateType)
        setView({ type: 'template-edit', template });
    };

    const handleBackToTemplates = () => {
        setView({ type: 'templates' });
    };

    const handleBackToTileList = () => {
        setView({ type: 'list' });
    }

    if (view.type === 'list') {
        return (
            <TileList
                tiles={tileSet?.tiles || []}
                onSelectTile={handleSelectTile}
                onDeleteTile={handleDelete}
                onAddNew={handleAddNew}
                onSave={handleSave}
                onEditTemplates={() => setView({ type: 'templates' })}
            />
        );
    }

    if (view.type === 'edit' && activeTile) {
        return (
            <TileEditor
                tile={activeTile}
                onUpdateTile={updateTile}
                onBack={handleBackToList}
            />
        );
    }

    if (view.type === 'templates') {
        return (
            <TemplateList
                onSelectTemplate={handleSelectTemplate}
                onBack={handleBackToTileList}
            />
        );
    }

    if (view.type === 'template-edit') {
        return (
            <TemplateEditor
                template={view.template}
                onBack={handleBackToTemplates}
            />
        );
    }

    return null;
};

export default Sidebar;
