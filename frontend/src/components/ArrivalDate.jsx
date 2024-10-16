
import React, { useEffect, useRef, useState } from 'react';
import styled from "styled-components";

import PropTypes from 'prop-types';
import Moment from 'moment';




const DayField = styled.a`
background: 0 0;
    border-style: none;
    font-size: 9px;
    position: relative;
    height: 40px;
    width: 100%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    display: block;
    padding: .2em;
    text-align: right;
    text-decoration: none;


    .ui-datepicker-item {
        font-size: 13px;
        height: 100%;
        left: 0;
        line-height: 44px;
        position: absolute;
        text-align: center;
        top: 0;
        width: 100%;
    }
    `


const renderDayContents = (day, date) => {
    return (
        <div>
            <DayField>25<div className="ui-datepicker-item">
                <var amount=""><sup>$</sup>249</var>

            </div>
            </DayField>
        </div>
    )
}



const DatePicker = ({ onChange, ...props }) => {
  const datepickerRef = useRef(null);

  useEffect(() => {
    // Initialize datepicker when the component mounts
    if (datepickerRef.current && !datepickerRef.current.classList.contains('hasDatePicker')) {
      $(datepickerRef.current).datepicker({
        onSelect: (value) => onChange(value ? Moment(value, 'MM/DD/YYYY') : '')
      });
    }
  }, [onChange]);

  return (
    <div
      type="text"
      ref={datepickerRef}
      className="ui-datepicker"
      {...props}
    />
  );
};

DatePicker.propTypes = {
  onChange: PropTypes.func
};




const ArrivalDate = ({onChange}) => {

    const changeDate = (date)=>{
      console.log(date)
      if(typeof(onChange) === 'function'){
        onChange(date);
      }
    }
    return (
        <div className='arrival-date-inline '>
            <DatePicker
                inline
                className='col-12 '
                onChange={(e)=>changeDate(e)}
                minDate={new Date()}
                showDisabledMonthNavigation
            />
        </div>
    )
}

export default ArrivalDate;