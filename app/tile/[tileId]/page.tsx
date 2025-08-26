'use client';

import TileCanvas from '@/app/components/TileCanvas';

const TilePage = ({ params }: { params: { tileId: string } }) => {
    return <TileCanvas tileId={params.tileId} />;
};

export default TilePage;
