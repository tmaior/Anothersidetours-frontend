import React, { useState } from 'react';

// Main booking form component
const BookingForm = () => {
  const [guestQuantity, setGuestQuantity] = useState(1);
  const [pickupQuantity, setPickupQuantity] = useState(0);
  const [tourProtection, setTourProtection] = useState(false);
  const [arrivalDate, setArrivalDate] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Handler to update guest quantity
  const handleGuestQuantityChange = (change) => {
    setGuestQuantity((prev) => Math.max(0, prev + change));
  };

  // Handler for pick-up quantity
  const handlePickupQuantityChange = (change) => {
    setPickupQuantity((prev) => Math.max(0, prev + change));
  };

  // Handler to update contact info
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="form-group">
      <div className="row">
        {/* Left-hand side: Quantity and date selection */}
        <div className="col-md-6">
          <QuantitySelector
            label="Guests"
            quantity={guestQuantity}
            onQuantityChange={handleGuestQuantityChange}
          />
          <DatePicker
            label="Date"
            selectedDate={arrivalDate}
            onDateChange={setArrivalDate}
          />
        </div>

        {/* Right-hand side: Contact info */}
        <div className="col-md-6">
          <ContactInfo
            contactInfo={contactInfo}
            onContactInfoChange={handleContactInfoChange}
          />
        </div>
      </div>

      {/* Add-ons section */}
      <AddOns
        pickupQuantity={pickupQuantity}
        onPickupQuantityChange={handlePickupQuantityChange}
        tourProtection={tourProtection}
        onTourProtectionChange={setTourProtection}
      />
    </form>
  );
};

// Quantity selector component
const QuantitySelector = ({ label, quantity, onQuantityChange }) => (
  <div className="quantity">
    <h3 className="title">{label}</h3>
    <div className="spinner">
      <button
        type="button"
        className="btn btn-default spin-down"
        onClick={() => onQuantityChange(-1)}
      >
        -
      </button>
      <input type="text" className="form-control" value={quantity} readOnly />
      <button
        type="button"
        className="btn btn-default spin-up"
        onClick={() => onQuantityChange(1)}
      >
        +
      </button>
    </div>
  </div>
);

// Date picker component
const DatePicker = ({ label, selectedDate, onDateChange }) => (
  <div className="arrival-date">
    <div className="form-group">
      <label>{label}</label>
      <input
        type="date"
        className="form-control"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </div>
  </div>
);

// Contact info component
const ContactInfo = ({ contactInfo, onContactInfoChange }) => (
  <div className="contact-info">
    <h3 className="title">Contact Info</h3>
    <div className="form-group">
      <label>Name</label>
      <input
        type="text"
        className="form-control"
        name="name"
        value={contactInfo.name}
        onChange={onContactInfoChange}
        placeholder="Full Name"
      />
    </div>
    <div className="form-group">
      <label>Email</label>
      <input
        type="email"
        className="form-control"
        name="email"
        value={contactInfo.email}
        onChange={onContactInfoChange}
        placeholder="Email Address"
      />
    </div>
    <div className="form-group">
      <label>Phone</label>
      <input
        type="tel"
        className="form-control"
        name="phone"
        value={contactInfo.phone}
        onChange={onContactInfoChange}
        placeholder="Phone Number"
      />
    </div>
  </div>
);

// Add-ons component
const AddOns = ({
  pickupQuantity,
  onPickupQuantityChange,
  tourProtection,
  onTourProtectionChange,
}) => (
  <div className="addons">
    <h3 className="title">Add Ons</h3>

    <QuantitySelector
      label="Add a Pick-Up?"
      quantity={pickupQuantity}
      onQuantityChange={onPickupQuantityChange}
    />

    <div className="boolean-addon-wrapper">
      <label>
        Tour Protection
        <input
          type="checkbox"
          checked={tourProtection}
          onChange={(e) => onTourProtectionChange(e.target.checked)}
        />
        <span>Allows you to cancel or reschedule up to 3 hours prior</span>
      </label>
    </div>
  </div>
);

export default BookingForm;
