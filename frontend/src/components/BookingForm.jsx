import React, { useState } from 'react';
import PickupSpinner from './PickupSpinner';
import ContactInfo from './ContactInfo';
import BookingDatePicker from './BookingDatePicker';

// Main booking form component
const BookingForm = () => {
  const [guestQuantity, setGuestQuantity] = useState(1);
  const [pickupQuantity, setPickupQuantity] = useState(2);
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
    <div className="purchase-create-details  container p-4">

    <form className="form-group p-4 ">
      <div className="row">
        {/* Left-hand side: Quantity and date selection */}
        <div className="col ">
          <div className="quantity">
            <h3 className="title">Quantity</h3>
            <PickupSpinner title="Guests" minValue="1" value={guestQuantity} onChange={handleGuestQuantityChange} />
            <ContactInfo
              contactInfo={contactInfo}
              onContactInfoChange={handleContactInfoChange}
            />
          </div>
        </div>
        <div className="col">
          <div className="row">

         <BookingDatePicker />
          </div>
        </div>



      </div>


    </form>
              </div>
  );
};



export default BookingForm;
