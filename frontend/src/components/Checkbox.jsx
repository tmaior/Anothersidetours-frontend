import { useState } from "react";
import { SectionTitle } from "./PickupSpinner";

const Checkbox = ({ onChange, title, description }) => {
  const handleValueChange = (change) => {
    if (typeof (onChange))
      onChange(change);
  };

  return (
    <div className="ml-5 spinner-wrapper spinner row">
      <div className="col-4">

      <SectionTitle>
       {title}
      </SectionTitle>
      </div>
      <div className="col-12">
      <label class="checkbox-label-container" notranslate="">
        <input type="checkbox" name="checkbox" class="" onChange={handleValueChange} />
        <span class="checkmark"></span>
        <SectionTitle>{description}</SectionTitle>
      </label>
    </div>
    </div>
  );
};

export default Checkbox;
