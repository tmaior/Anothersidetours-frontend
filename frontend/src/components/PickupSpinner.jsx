import { useState } from "react";
import { styled } from 'styled-components';

export const SectionTitle = styled.span`
text-size-adjust: 100%;
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
font-size: 14px;
font-weight: 400;
line-height: 20px;
text-align: right;
word-break: break-word;
`


const PickupSpinner = ({ value, onChange, title, description, minValue }) => {
  const [PickerQuantity, setPickerQuantity] = useState(value);
  const handleQuantityChange = (change) => {

    const newQuantity = PickerQuantity + change;
    if (newQuantity < minValue) {
      return;
    }
    setPickerQuantity(newQuantity)
    onChange(PickerQuantity);
  };

  return (
    <div className="ml-5 spinner-wrapper spinner row">
      {/* Label */}
      <div className="col-3 offset-1 p-4">
        <SectionTitle>
          {title}
        </SectionTitle>
        <div className="spinner-input input-group" data-trigger="spinner">
          <button
            type="button"
            className="btn btn-default spin-down spinner"
            aria-label={`Decrease ${title} by 1. Current count is ${value}`}
            onClick={() => handleQuantityChange(-1)}
          >
            -
          </button>
          <input
            type="text"
            name="quantity"
            className="form-control spinner-input spinner"
            readOnly
            id="pickupSpinner"
            value={PickerQuantity}
            aria-label={`${title} quantity`}
          />
          <button
            type="button"
            className="btn btn-default spin-up spinner"
            aria-label={`Increase ${title} by 1. Current count is ${value}`}
            onClick={() => handleQuantityChange(1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Spinner Description */}
      <div className="p-5 col-8">
        <span
          title={description}
        >
          {description}
        </span>
      </div>
    </div>
  );
};

export default PickupSpinner;
