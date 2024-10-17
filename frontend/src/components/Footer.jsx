import React from 'react';
import styled from 'styled-components';

// Styled components for each section
const FooterBody = styled.div`
      height: 60px;
    line-height: 60px;
    background-color: #eee;
    width: 100%;

`;

const FooterCommon = styled.div`
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
  
`;

const BackLink = styled.a`
  flex-grow: 1;

`
const Verisign = styled.div`
    margin-right: 20px;
    text-align: right;
  img {
    height: 30px;
    vertical-align: middle;
  }
`;

const ActionsWrapper = styled.div`

`;

const ActionButton = styled.button`

    padding: 0 15px;
    color: #fff;
    background-color: #5cb85c;
    float: left;
    font-family: MavenPro;
    font-size: 18px;
    border: none;
    border-radius: 0;
    height: 61px;
    line-height: 1em;
    text-transform: uppercase;
    white-space: normal;

`;

// Footer component
const Footer = () => {
  return (
    <FooterBody>
      <div className="row">
        <div className="col-sm-9">
          <FooterCommon>
            <div className="row">
     
              <div className="col-md-8 col-sm-7">
               
              </div>
              <div className="col-md-3 col-sm-4">
                <Verisign>
                  <img alt="Secure SSL encryption" src="https://checkout.xola.app/images/ssl-secure-encryption.svg" />
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
