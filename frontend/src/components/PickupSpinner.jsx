
const PickupSpinner = ({ value, onChange, title, description, minValue }) => {

  const handleQuantityChange = (change) => {
    if(change < minValue ) {
        onChange(minValue)    
    }
    onChange(newQuantity); // Call the parent's update function
  };

  return (
    <div className="spinner-wrapper spinner row">
      {/* Label */}
      <div className="spinner-label-wrapper col-sm-12 col-xs-7">
        <label className="spinner-label control-label" htmlFor="pickupSpinner">
          <span>{title}</span>
        </label>
      </div>

      {/* Quantity Spinner */}
      <div className="spinner-input input-group col-sm-4" data-trigger="spinner">
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
          value={value}
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

      {/* Spinner Description */}
      <div className="spinner-description-wrapper col-sm-8 col-xs-12">
        <span
          className="spinner-description"
          title={description}
        >
          {description}
        </span>
      </div>
    </div>
  );
};

export default PickupSpinner;
