import { GlobalConstants } from "@/utils/constants/global-constants";
import { createSlice } from "@reduxjs/toolkit";

const brandSlice = createSlice({
  name: "brand",
  initialState: {
    selectedBrand: GlobalConstants.defaultValues.selectedServiceDefaultValue, // Default brand
  },
  reducers: {
    setBrand: (state, action) => {
      state.selectedBrand = action.payload;
    },
  },
});

export const { setBrand } = brandSlice.actions;
export default brandSlice.reducer;
