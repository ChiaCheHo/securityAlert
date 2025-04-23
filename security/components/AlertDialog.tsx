import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import IconSiren from '@/assets/icons/SirenXL.svg?react';
import IconX from '@/assets/icons/X.svg?react';
import Alert from '@/components/Alert';
import { IconButton } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { useSocketEvent } from '@/hooks/useSocket';

import { pinStatusIconMap } from '../constants';

interface AlertEventType {
  deviceType: string;
  deviceName: string;
  floorName: string;
  description: string;
}

/**
 * 全域安全警報Dialog 放在外層layout 串接socket
 */
export default function AlertDialog() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [alertList, setAlertList] = useState<AlertEventType[]>([]);

  useSocketEvent<AlertEventType>('send_security_alert', (event) => {
    const { data } = event;
    if (import.meta.env.VITE_CLOSE_ALERT !== 'true') {
      setIsOpen(true);
      setAlertList((pre) => pre.concat(data));
    }
  });

  return (
    <Dialog open={isOpen}>
      <DialogTitle sx={{ width: '42.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          size="small"
          aria-label="close"
          onClick={() => {
            setIsOpen(false);
            setAlertList([]);
          }}
        >
          <IconX />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            pb: 3,
            zIndex: 1,
          }}
        >
          {t('safety_alert_page_title')}
        </Typography>
        <Stack spacing={2} alignItems={'center'} pb={3}>
          <IconSiren />
          {alertList.map((alert, index) => (
            <Alert key={index} severity={'error'} icon={pinStatusIconMap[alert.deviceType]}>
              <Typography variant="h6">
                {alert.deviceName}
                {t(alert.description)}
              </Typography>
            </Alert>
          ))}
          {/* <Alert severity={'error'} icon={<IconSos />}>
            <Typography variant="h6">2 F - 男廁緊急求救觸發</Typography>
          </Alert> */}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
