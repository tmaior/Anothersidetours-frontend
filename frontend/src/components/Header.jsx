import React from 'react';
import styled from 'styled-components';
import CloseButton from './CloseButton';

const HeaderWrapper = styled.section`
  display: none;
`;

const Header = () => {
  return <HeaderWrapper id="header" ><CloseButton /></HeaderWrapper>;
};

export default Header;
