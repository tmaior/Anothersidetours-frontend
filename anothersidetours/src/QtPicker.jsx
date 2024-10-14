import "./Apps.css";
import QuantityPicker from "./components/QuantityPicker";

const QtPicker = () => {
  return (
    <div>
      <h1>Product Quantity Selector</h1>
      <QuantityPicker initialQuantity={1} min={1} max={10} />
    </div>
  );
};

export default QtPicker;
