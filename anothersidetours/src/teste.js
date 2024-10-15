import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ".assets/DatePickerCustom.css"; // Arquivo de estilos customizados

const CustomDatePicker = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <div className="datepicker-container">
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText="Selecione uma data"
        showPopperArrow={false}
        fixedHeight
        popperPlacement="bottom"
        popperClassName="custom-datepicker-popper"
        className="custom-datepicker-input"
      />
    </div>
  );
};

export default CustomDatePicker;
