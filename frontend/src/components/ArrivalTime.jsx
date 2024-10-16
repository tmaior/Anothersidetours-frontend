import React from 'react';

const ArrivalTime = () => {
  const timeOptions = [
    { value: '1300', label: '13:00', price: '$169.00' },
    { value: '1400', label: '14:00', price: '$169.00' },
    { value: '1500', label: '15:00', price: '$169.00' },
    { value: '1600', label: '16:00', price: '$169.00' },
    { value: '1700', label: '17:00', price: '$169.00' }
  ];

  return (
    <div className="arrivalTime">
      <div className="input-group">
        <select name="arrivalTime" className="form-control" defaultValue="">
          <option disabled value="">
            Pick a time
          </option>
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.price})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ArrivalTime;
