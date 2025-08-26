import { Button, Group, Stack, Title } from '@mantine/core';
import { TemplateType } from '../lib/templateTypes';
import Link from 'next/link';

const templates: TemplateType[] = ['1x1', '2x2', '1x2', 'L', 'T'];


const TemplateList = () => {
    return (
        <Stack>
            <Title order={2}>Templates</Title>
            <Stack>
                {templates.map(template => (
                    <Button key={template} component={Link} href={`/template/${template}`}>
                        {template}
                    </Button>
                ))}
            </Stack>
            <Group>
                <Button component={Link} href="/templates">Back to Tiles</Button>
            </Group>
        </Stack>
    );
};

export default TemplateList;
