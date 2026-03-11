import { createSlice } from "@reduxjs/toolkit";

const searchSalonSlice = createSlice({
  name: "searchSalon",
  initialState: {
    value: "", // Default brand
  },
  reducers: {
    setSearchValue: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setSearchValue } = searchSalonSlice.actions;
export default searchSalonSlice.reducer;
