// hooks/useBuyNowLink.ts
import { useMemo } from 'react';

export function useBuyNowLink() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const ispValue = params.get('isp');
    const refValue = params.get('ref');

    let buyNowLink: string = '';
    let isPhoenix: boolean = false;

    // collect all query params into an object
    const getQueryParams: Record<string, string> = {};
    params.forEach((value, key) => {
      getQueryParams[key] = value;
    });

    // also prepare query string once
    const queryString = new URLSearchParams(getQueryParams).toString();

    if (ispValue === '1') {
      if (refValue === 'tf') {
        buyNowLink = 'https://1.envato.market/jrEAbP';
        isPhoenix = true;
      } else {
        buyNowLink = 'https://codedthemes.com/item/able-pro-nextjs-mui-react-admin-template/';
        isPhoenix = false;
      }
    } else {
      if (refValue === 'tf') {
        buyNowLink = 'https://1.envato.market/zNkqj6';
        isPhoenix = true;
      } else {
        buyNowLink = 'https://codedthemes.com/item/able-pro-dashboard-templates';
        isPhoenix = false;
      }
    }

    return {
      buyNowLink,
      isPhoenix,
      getQueryParams: queryString ? `?${queryString}` : ''
    };
  }, []);
}
