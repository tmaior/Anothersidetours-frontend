import React from 'react';
import styled from 'styled-components';

// Styled components for each section
const FooterBody = styled.div`
  .row {
    display: flex;
    flex-wrap: wrap;
  }
`;

const FooterCommon = styled.div`
  background-color: #f8f9fa; /* Example background */
  padding: 20px 0;
  .row {
    display: flex;
    justify-content: space-between;
  }
`;

const BackLink = styled.a`
  text-decoration: none;
  color: #000;
  cursor: pointer;

  &.hidden {
    display: none;
  }

`
const Verisign = styled.div`
  img {
    height: 40px; /* Adjust the size as needed */
  }
`;

const ActionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  background-color: ${(props) => (props.success ? '#28a745' : '#6c757d')};
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &.hidden {
    display: none;
  }

  .xola-icon {
    margin-right: 5px;
  }
`;

// Footer component
const Footer = () => {
  return (
    <FooterBody>
      <div className="row">
        <div className="col-sm-9">
          <FooterCommon className="footer-common">
            <div className="row">
              <div className="col-md-1 col-sm-1">
                <BackLink className="action-back hidden" tabIndex="0">
                  Back
                </BackLink>
              </div>
              <div className="col-md-8 col-sm-7">
               
              </div>
              <div className="col-md-3 col-sm-4">
                <Verisign>
                  <img alt="Secure SSL encryption" src="images/ssl-secure-encryption.svg" />
                </Verisign>
              </div>
            </div>
          </FooterCommon>
        </div>
        <div className="col-sm-3">
          <ActionsWrapper className="actions">
            <div className="purchase-footer-actions">
              <ActionButton className="btn action-back hidden">
                <span className="xola-icon xola-icon-leftcaret" title="back"></span>
              </ActionButton>
              <ActionButton type="submit" className="btn btn-success action-submit action-continue" success>
                Continue
              </ActionButton>
            </div>
          </ActionsWrapper>
        </div>
      </div>
    </FooterBody>
  );
};

export default Footer;
