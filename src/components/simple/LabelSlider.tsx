import { Group, InputLabel, Slider, Stack, Text } from '@mantine/core';

export default function LabelSlider(props: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Stack gap={0}>
      <InputLabel>{props.label}</InputLabel>
      <Group>
        <Slider
          value={props.value}
          onChange={(val) => props.onChange(val)}
          step={props.step || 1}
          min={props.min || 0}
          max={props.max || 10}
          style={{ flexGrow: 1 }}
        />
        <Text fw={700} w={30} ta="end">
          {props.value}
        </Text>
      </Group>
    </Stack>
  );
}
