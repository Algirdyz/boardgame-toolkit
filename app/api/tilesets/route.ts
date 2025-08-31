import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { TileSet } from '@/components/lib/types';

const dataFilePath = path.join(process.cwd(), 'data', 'tilesets.json');

async function readData(): Promise<Record<string, TileSet>> {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // Return empty object if file doesn't exist
        }
        throw error;
    }
}

async function writeData(data: Record<string, TileSet>): Promise<void> {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'TileSet ID is required' }, { status: 400 });
    }

    try {
        const allTileSets = await readData();
        const tileSet = allTileSets[id];

        if (tileSet) {
            return NextResponse.json(tileSet);
        } else {
            return NextResponse.json({ message: 'TileSet not found' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: 'Failed to read data', error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const tileSet: TileSet = await request.json();
        if (!tileSet.id) {
            return NextResponse.json({ message: 'TileSet ID is required' }, { status: 400 });
        }

        const allTileSets = await readData();
        allTileSets[tileSet.id] = tileSet;
        await writeData(allTileSets);

        return NextResponse.json({ message: 'TileSet saved successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to save data', error: error.message }, { status: 500 });
    }
}
