import React from 'react';
import styled from 'styled-components';

const CloseButtonWrapper = styled.section`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
`;

const Button = styled.div`
  cursor: pointer;
  background-color: #f00;
  padding: 0.5rem 1rem;
  color: #fff;
  border-radius: 5px;
`;

const CloseButton = () => {
  return (
    <CloseButtonWrapper id="close">
      <Button className="close-btn">
        <span className="closelink">Close</span>
      </Button>
    </CloseButtonWrapper>
  );
};

export default CloseButton;
