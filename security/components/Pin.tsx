import { styled, Typography } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import { KeepScale } from 'react-zoom-pan-pinch';

export function PinWrapper({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        '&:hover': { zIndex: 1 },
        ...sx,
      }}
      {...props}
    >
      <KeepScale style={{ transformOrigin: 'bottom' }}>{children}</KeepScale>
    </Box>
  );
}

export const PinBase = styled(({ type, ...props }: BoxProps & { type: 'success' | 'error' }) => {
  return <Box {...props} />;
})(({ type, theme }) => ({
  position: 'relative',
  color: theme.palette.common.black,
  width: '40px',
  height: '40px',
  padding: 0,
  borderRadius: '50%',
  backgroundColor: theme.palette[type].main,
  boxShadow: theme.shadows[1],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.1s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '96%',
    left: 'calc(50% - 6px)',
    width: '12px',
    height: '8px',
    backgroundColor: theme.palette[type].main,
    clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
  },
  '#pin-text': { display: 'none' },
  '&:hover': {
    cursor: 'pointer',
    width: 'auto',
    padding: '4px 8px',
    flexDirection: 'row',
    borderRadius: '4px',
    backgroundColor: theme.palette[type].light,
    '&::after': {
      backgroundColor: theme.palette[type].light,
    },
    '#pin-label': { display: 'none' },
    '#pin-text': { display: 'block', paddingLeft: '4px' },
  },
}));

interface PinProps {
  type: 'success' | 'error';
  icon?: React.ReactNode;
  label: string;
  text: string;
}
export function Pin({ type, icon, label, text }: PinProps) {
  return (
    <PinBase type={type}>
      <Typography id="pin-label" variant="body2" lineHeight={'0.875rem'}>
        {label}
      </Typography>
      {icon}
      <Typography id="pin-text" variant="body2" lineHeight={'0.875rem'}>
        {text}
      </Typography>
    </PinBase>
  );
}
