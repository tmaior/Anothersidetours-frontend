import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Header from './components/Header';
import CloseButton from './components/CloseButton';
import Banner from './components/Banner';
import BookingForm from './components/BookingForm';
import styled from 'styled-components';


const RootLayout = styled.div`

`

function App() {
  return (
    <RootLayout>
      <Header />
      <main id="main-wrapper">
        <section id="main">
          <Banner />
          <BookingForm  className='p-4'/>
        </section>
      </main>
    </RootLayout>
  );
}

export default App;

