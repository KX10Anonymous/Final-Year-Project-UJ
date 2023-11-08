import Badge from "@mui/material/Badge"; 
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const dayNum = props.day.date();
  const isSelected = !highlightedDays.includes(dayNum) && !outsideCurrentMonth;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "❎" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

export default function Availability({ room }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [month, setMonth] = useState(dayjs())
  
  useEffect(() => {
    const fetchData = async() =>{
      if (room) {
        const reqBody = {
          month: month,
        };
        await fetch("http://localhost:8080/nexus/api/rooms/availability/" + room, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify(reqBody),
        })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } 
          })
          .then((data) => {
            setAvailableDates(data);
          })
          .catch((error) => {
            console.log("Error Occurred While Reading Interval Dates");
          });
      }
    }
   fetchData();
  }, [room, month]);

  const handleMonthChange = (m) => {
    setAvailableDates([]);
    const currentMonth = dayjs(m);
    const nextMonth = currentMonth.add(1, 'month');
  
    if (nextMonth.year() > currentMonth.year()) {
      setMonth(dayjs(currentMonth.add(1, 'year').startOf('year')));
    } else {
      setMonth(dayjs(nextMonth));
    }
  };
    
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        onMonthChange={(m)=>handleMonthChange(m)}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            highlightedDays: availableDates,
          },
        }}
      />
    </LocalizationProvider>
  );
}
