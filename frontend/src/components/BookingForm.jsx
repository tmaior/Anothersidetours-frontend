import React, { useState } from 'react';
import PickupSpinner from './PickupSpinner';
import ContactInfo from './ContactInfo';
import ArrivalDate from './ArrivalDate';
import CheckBox from './Checkbox';

import styled from 'styled-components';
import ArrivalTime from './ArrivalTime';
import Footer from './Footer';

const SectionTitle = styled.h3`
    font-size: 16px;
    color: #337ab7;
    font-weight: 300;
    font-family: MavenPro;
    text-transform: uppercase;
    margin: 0;
    `

// Main booking form component
const BookingForm = () => {
  const [guestQuantity, setGuestQuantity] = useState(1);
  const [pickupQuantity, setPickupQuantity] = useState(2);
  const [tourProtection, setTourProtection] = useState(false);

  const [arrivalDate, setArrivalDate] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });


  // Handler to update contact info
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <form className="form-group p-4 ">
        <div className="purchase-create-details  container p-4">

          <div className="row">
            {/* Left-hand side: Quantity and date selection */}
            <div className="col ">
              <div className="quantity">
                <SectionTitle>Quantity</SectionTitle>
                <PickupSpinner title="Guests" minValue="1" value={guestQuantity} onChange={setGuestQuantity} />
              </div>
              <div>
                <SectionTitle>Contact Info</SectionTitle>
                <ContactInfo
                  contactInfo={contactInfo}
                  onContactInfoChange={handleContactInfoChange}
                />

              </div>
              <div>
                <SectionTitle>Add-ons</SectionTitle>
                <PickupSpinner title="ADD A PICK-UP?" minValue="0" value={pickupQuantity} onChange={setPickupQuantity} description="Add Round-Trip Transportation from your point of origination. This option is $20 per guest. (5 miles max)" />

                <CheckBox title="Tour Protection" description="Add Tour Protection for $10 per guest. This option allows you to cancel your tour up to 24 hours before the tour start time and receive a full refund." />
              </div>
            </div>
            <div className="col">
              <div className="row">

                <ArrivalDate onChange={setArrivalDate} />

                {arrivalDate && (
                  <ArrivalTime onChange={setArrivalTime} />
                )}


              </div>
            </div>



          </div>


        </div>
        <Footer />
      </form>
    </>
  );
};



export default BookingForm;
