import { AspectRatio, Card, Image, SimpleGrid, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import classes from './NavigationGrid.module.css';

export interface NavigationCard {
  title: string;
  link: string;
}

export default function NavigationGrid(props: { cards: NavigationCard[] }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 0, sm: 'md' }}>
      {props.cards.map((item) => (
        <Card
          key={item.title}
          p="md"
          radius="md"
          component={Link}
          to={item.link}
          className={classes.card}
        >
          <AspectRatio ratio={1920 / 1080}>
            <Image src="https://placehold.co/600x400?text=Placeholder" radius="md" />
          </AspectRatio>
          <Text className={classes.title}>{item.title}</Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}
