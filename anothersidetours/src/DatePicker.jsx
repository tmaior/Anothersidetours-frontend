import { useState } from "react";
import "./Apps.css";
import { Calendar, utils } from "react-modern-calendar-datepicker";
import "bootstrap/dist/css/bootstrap.min.css";

const DatePicker = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  return (
    <Calendar
      value={selectedDay}
      onChange={setSelectedDay}
      minimumDate={utils().getToday()}
      shouldHighlightWeekends
    />
  );
};

export default DatePicker;
