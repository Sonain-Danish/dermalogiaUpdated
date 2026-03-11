import { Salon } from "@/utils/models/schema-prisma";
import { configureStore } from "@reduxjs/toolkit";
import brandReducer from "./brandSlice"; // Import brand reducer
import saloonReducer from "./saloonSlice";
import searchSalonSlice from "./searchSalonSlice";

export const ReduxStore = configureStore({
  reducer: {
    saloon: saloonReducer,
    brand: brandReducer,
    searchSalon: searchSalonSlice,
  },
});

export interface ReduxStoreType {
  saloon: ReduxStoreSalonType;
  brand: ReduxStoreBrandType;
  searchSalon: ReduxStoreSearchSalonType;
}

export interface ReduxStoreSalonType {
  location: null;
  placeId: null;
  saloons: Salon[];
  loading: boolean;
  error: null;
}

export interface ReduxStoreBrandType {
  selectedBrand: string;
}

export interface ReduxStoreSearchSalonType {
  value: string;
}
