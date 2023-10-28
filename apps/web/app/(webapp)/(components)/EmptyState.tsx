import { EmptyStateProps } from '@/types/webappTypes/componentsTypes';
import React from 'react';

const EmptyState = ({
  type,
  title,
  body,
  parentStyle,
  titleStyle,
  bodyStyle,
  iconStyle,
  containerStyle
}: EmptyStateProps) => {
  return (
    <section className={`w-full h-full flex flex-col items-center ${parentStyle}`}>
      <div className={`h-fit my-auto min-w-[393] flex flex-col items-center ${containerStyle}`}>
        <div className={`w-full mb-[24px] flex justify-center h-fit ${iconStyle}`}>
          {
            type == 'NOTIFICATIONS' ?
              <svg width="159" height="155" viewBox="0 0 159 155" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_590_3021)">
                  <rect x="17.6987" y="9" width="123.602" height="56" rx="9.8432" fill="white"/>
                </g>
                <rect opacity="0.3" x="28.4004" y="22.3337" width="84.5419" height="4.8" rx="2.4" fill="#1B3554"/>
                <rect opacity="0.3" x="28.4004" y="31.9333" width="60.4635" height="4.8" rx="2.4" fill="#1B3554"/>
                <rect opacity="0.15" x="28.4004" y="46.8669" width="19.7978" height="4.8" rx="2.4" fill="#1B3554"/>
                <ellipse opacity="0.3" cx="119.363" cy="43.1333" rx="11.2366" ry="11.2" fill="#1B3554"/>
                <g filter="url(#filter1_d_590_3021)">
                  <rect x="17.6987" y="73.0002" width="123.602" height="56" rx="9.8432" fill="white"/>
                </g>
                <rect opacity="0.3" x="28.4004" y="86.3337" width="84.5419" height="4.8" rx="2.4" fill="#1B3554"/>
                <rect opacity="0.3" x="28.4004" y="95.9333" width="60.4635" height="4.8" rx="2.4" fill="#1B3554"/>
                <rect opacity="0.15" x="28.4004" y="110.867" width="19.7978" height="4.8" rx="2.4" fill="#1B3554"/>
                <ellipse opacity="0.3" cx="119.363" cy="107.133" rx="11.2366" ry="11.2" fill="#1B3554"/>
                <defs>
                  <filter id="filter0_d_590_3021" x="0.928829" y="0.979612" width="157.142" height="89.5398" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="8.74951"/>
                    <feGaussianBlur stdDeviation="8.38495"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.247059 0 0 0 0 0.27451 0 0 0 0 0.313726 0 0 0 0.0769928 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_590_3021"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_590_3021" result="shape"/>
                  </filter>
                  <filter id="filter1_d_590_3021" x="0.928829" y="64.9799" width="157.142" height="89.5398" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="8.74951"/>
                    <feGaussianBlur stdDeviation="8.38495"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.245434 0 0 0 0 0.276208 0 0 0 0 0.312899 0 0 0 0.0769928 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_590_3021"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_590_3021" result="shape"/>
                  </filter>
                </defs>
              </svg>
              :
              null
          }
        </div>

        <div className={`mb-[8px] w-full text-center text-o-text-medium2 text-f18 font-[500] ${titleStyle}`}>
          {title}
        </div>

        <div className={`text-o-text-medium3 text-center text-f14 ${bodyStyle}`}>
          {body}
        </div>
      </div>
    </section>
  );
};

export default EmptyState;