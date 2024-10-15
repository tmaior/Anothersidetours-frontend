import React from 'react';
import styled from 'styled-components';

const BannerWrapper = styled.section`
  position: relative;

  .img-banner {
    background-image: url('https://xola.com/api/experiences/5489ba3dcf8b9cb7608b456b/medias/5b27d2976864ea736e8b45d9?size=large');
    background-position: 0 20%;
    background-size: cover;
    height: 265px;
  }
    .img-overlay{
        top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    position: absolute;
    .experience-info {
      color: #fff;
        text-align: center;
    }
}

  h1 {
    font-size: 2rem;
  }
`;

const Banner = () => {
    return (
        <BannerWrapper className="region-banner">
            <div className="img-banner">
            </div>
            <div className="img-overlay">
                <div className="experience-info">
                    <h1>The Ultimate Hollywood Tour</h1>
                    <div className="experience-info-items">
                        <span>4 hours</span>
                    </div>
                    <p>Enjoy our most popular private tour of Hollywood, Beverly Hills, &amp; The Sunset Strip...</p>
                </div>
            </div>
        </BannerWrapper>
    );
};

export default Banner;
