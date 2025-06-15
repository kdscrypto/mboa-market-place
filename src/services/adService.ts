
// Main ad service - exports all functionality from sub-services
export { fetchAdsWithStatus } from "./adService/adFetchService";
export { updateAdStatus } from "./adService/adUpdateService";
export { deleteAd } from "./adService/adDeleteService";
export { validateAdServiceAuth } from "./adService/adAuthService";
