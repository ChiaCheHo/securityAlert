import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import Dot from '@/components/Dot';
import { useLoading } from '@/components/functional/GlobalLoading/hooks';
import MessageView from '@/components/functional/MessageView';
import { Paper } from '@/components/Paper';
import { Tab, Tabs } from '@/components/Tabs';
import { useSocketEvent } from '@/hooks/useSocket';

import { Pin, PinWrapper } from './components/Pin';
import { pinStatusColorMap, pinStatusIconMap } from './constants';
import { type FloorData, useGetFloor, useGetFloorList } from './hooks/queries';

const findFloorId = (floorList?: FloorData[], name?: string) => {
  if (!name || !floorList) return undefined;
  const floor = floorList.find((floor) => floor.name === name);
  return floor?.id;
};

interface ImgInfoType {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}
const getPinPosition = (imgInfo: ImgInfoType, x: number, y: number) => {
  const ratio = imgInfo.width / imgInfo.naturalWidth;
  const ml = ((x * ratio) / imgInfo.width) * 100 - 50;
  const mt = ((y * ratio - imgInfo.height / 2) / imgInfo.width) * 100;
  return { ml, mt };
};

export default function SecurityOverviewPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsLoading } = useLoading();
  const {
    data: floorList,
    isLoading: isFloorListLoading,
    isError: isFloorListError,
    refetch: refetchFloorList,
  } = useGetFloorList();
  const currentFloor = searchParams.get('floor') || floorList?.[0]?.name;
  const queryFloorId = findFloorId(floorList, currentFloor);
  const {
    data: floorData,
    isLoading: isFloorLoading,
    isError: isFloorError,
    refetch: refetchFloor,
  } = useGetFloor(queryFloorId);
  const [imgInfo, setImgInfo] = useState({
    naturalWidth: 1,
    naturalHeight: 1,
    width: 1,
    height: 1,
  });

  // 接聽socket事件 接收事件後refetch api
  useSocketEvent('update_security_floor_alert', () => {
    refetchFloorList();
    if (queryFloorId) {
      refetchFloor();
    }
  });

  useEffect(() => {
    if (isFloorListLoading || isFloorLoading) {
      setIsLoading(true, 'security');
    } else {
      setIsLoading(false, 'security');
    }
    return () => {
      setIsLoading(false, 'security');
    };
  }, [isFloorListLoading, isFloorLoading, setIsLoading]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSearchParams({ floor: newValue });
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    // 取得圖片原始大小
    setImgInfo({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      width: img.width,
      height: img.height,
    });
  };

  return (
    <>
      <Stack p={4} spacing={4}>
        <Typography variant={'h3'} component={'h1'}>
          {t('safety_overview_page_title')}
        </Typography>
        {isFloorListError || isFloorError ? (
          <MessageView type="error" message={t('safety_error')} />
        ) : floorList && floorList.length === 0 ? (
          <MessageView type="empty" message={t('safety_empty_data')} />
        ) : (
          <Stack spacing={3}>
            <Tabs
              value={currentFloor}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {floorList &&
                floorList.map((floor) => (
                  <Tab
                    key={floor.id}
                    label={
                      <Stack direction={'row'} alignItems={'center'} spacing={1}>
                        <div>{floor.name}</div>
                        {floor.is_alert && <Dot color={'error'} />}
                      </Stack>
                    }
                    value={floor.name}
                  />
                ))}
            </Tabs>
            {floorData && (
              <>
                <Stack
                  direction={'row'}
                  justifyContent={'flex-end'}
                  spacing={2.5}
                  flexWrap={'wrap'}
                >
                  {floorData.pin_type_arr.map((pinTypeData) =>
                    Object.entries(pinTypeData.text).map(([key, value]) => (
                      <MapLabel
                        key={value}
                        icon={pinStatusIconMap[pinTypeData.type]}
                        label={t(value)}
                        color={pinStatusColorMap[key]}
                      />
                    )),
                  )}
                </Stack>
                <Paper sx={{ overflow: 'hidden' }}>
                  <TransformWrapper key={floorData.id}>
                    <TransformComponent>
                      <Box position={'relative'}>
                        <Box
                          component={'img'}
                          src={floorData.floor_plan_url}
                          alt={floorData.name}
                          width={'100%'}
                          height={'100%'}
                          display={'block'}
                          onLoad={handleImageLoad}
                        />
                        {floorData.pin_arr.map((pin) => {
                          const { ml, mt } = getPinPosition(imgInfo, pin.x, pin.y);
                          return (
                            <PinWrapper
                              key={pin.id}
                              sx={{ marginLeft: `${ml}%`, marginTop: `${mt}%` }}
                            >
                              <Pin
                                type={pin.is_alert ? 'error' : 'success'}
                                icon={pinStatusIconMap[pin.pin_type]}
                                label={pin.title}
                                text={`${pin.device_name} ${t(pin.description)}`}
                              />
                            </PinWrapper>
                          );
                        })}
                        {/* <PinWrapper sx={{ marginLeft: '1.6%', marginTop: '10%' }}>
                        <Pin
                          type={'success'}
                          icon={<IconElevator />}
                          label={'1'}
                          text={'電梯機坑1運轉'}
                        />
                      </PinWrapper> */}
                      </Box>
                    </TransformComponent>
                  </TransformWrapper>
                </Paper>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </>
  );
}

interface MapLabelProps {
  label: string;
  icon: React.ReactNode;
  color?: 'success' | 'error';
}
function MapLabel({ label, icon, color = 'success' }: MapLabelProps) {
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={1} py={1}>
      <Stack
        width={'32px'}
        height={'32px'}
        color={(t) => t.palette.common.black}
        bgcolor={(t) => t.palette[color].main}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'50%'}
      >
        {icon}
      </Stack>
      <Typography variant={'body2'}>{label}</Typography>
    </Stack>
  );
}
