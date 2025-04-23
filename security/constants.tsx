import IconCo from '@/assets/icons/co.svg?react';
import IconDoor from '@/assets/icons/Door.svg?react';
import IconElevator from '@/assets/icons/Elevator.svg?react';
import IconSos from '@/assets/icons/sos.svg?react';

export const pinStatusColorMap: Record<string, 'success' | 'error'> = {
  abnormal: 'error',
  normal: 'success',
};

export const pinStatusIconMap: Record<string, React.ReactNode> = {
  emergency_call: <IconSos />,
  co_sensor: <IconCo />,
  elevator_pit: <IconElevator />,
  door: <IconDoor />,
};
