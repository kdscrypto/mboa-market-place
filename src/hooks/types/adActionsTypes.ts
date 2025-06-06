
import { Ad } from "@/types/adTypes";

export type AdListState = {
  pendingAds: Ad[];
  approvedAds: Ad[];
  rejectedAds: Ad[];
  setPendingAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setApprovedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setRejectedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
};
