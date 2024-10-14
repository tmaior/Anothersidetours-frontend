import { useState } from "react";
import PropTypes from "prop-types";

const QuantityPicker = ({ initialQuantity = 1, min = 1, max = 10 }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const increaseQuantity = () => {
    if (quantity < max) {
      setQuantity(quantity + 1);
    }
  };

  QuantityPicker.propTypes = {
    initialQuantity: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  };

  const decreaseQuantity = () => {
    if (quantity > min) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button onClick={decreaseQuantity} disabled={quantity === min}>
        -
      </button>
      <input
        type="number"
        value={quantity}
        readOnly
        style={{ width: "50px", textAlign: "center" }}
      />
      <button onClick={increaseQuantity} disabled={quantity === max}>
        +
      </button>
    </div>
  );
};

export default QuantityPicker;
