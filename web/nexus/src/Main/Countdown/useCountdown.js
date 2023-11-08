import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const useCountdown = (bookingTargetDate) => {
  const countDownDate = dayjs(bookingTargetDate);

  const [countDown, setCountDown] = useState(
    countDownDate -  dayjs()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate -  dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };
