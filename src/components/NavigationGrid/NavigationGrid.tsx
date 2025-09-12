import { ActionIcon, AspectRatio, Card, Group, Image, SimpleGrid, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import classes from './NavigationGrid.module.css';

export interface NavigationCard {
  title: string;
  subtitle?: string;
  link: string;
  onDelete?: () => void;
}

export default function NavigationGrid(props: { cards: NavigationCard[]; columns?: number }) {
  return (
    <SimpleGrid cols={props.columns ?? 2} spacing={{ base: 0, sm: 'md' }}>
      {props.cards.map((item) => (
        <Card key={item.title} p="md" radius="md" className={classes.card} pos="relative">
          {item.onDelete && (
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.onDelete!();
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          )}

          <Card.Section component={Link} to={item.link} style={{ textDecoration: 'none' }}>
            <AspectRatio ratio={1920 / 1080}>
              <Image src="https://placehold.co/600x400?text=Placeholder" radius="md" />
            </AspectRatio>
          </Card.Section>

          <Card.Section
            component={Link}
            to={item.link}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Group p="md" gap="xs" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text className={classes.title} style={{ color: 'inherit' }}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {item.subtitle}
                </Text>
              )}
            </Group>
          </Card.Section>
        </Card>
      ))}
    </SimpleGrid>
  );
}
