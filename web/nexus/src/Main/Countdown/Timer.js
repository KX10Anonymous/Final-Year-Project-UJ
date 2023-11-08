import React from 'react';
import DateTimeDisplay from './DateTimeDisplay';
import { useCountdown } from './useCountdown';

const ExpiredNotice = () => {
    return (
      <div className="expired-counter">
        <p>Expired.</p>
      </div>
    );
  };
  
  const Counter = ({ days, hours, minutes, seconds }) => {
    return (
      <div className="show-counter">
        <a
          href="https://tapasadhikary.com"
          target="_blank"
          rel="noopener noreferrer"
          className="countdown-link"
        >
          <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 1} />
          <p>:</p>
          <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
          <p>:</p>
          <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
          <p>:</p>
          <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
        </a>
      </div>
    );
  };
  

const Timer = ({ bookingTargetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(bookingTargetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />;
  } else {
    return (
      <Counter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default Timer;