import { Salon } from "@/utils/models/schema-prisma";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Function to remove everything after the last comma from an address string
const removeCountryName = (address?: string): string | undefined => {
  if (!address) {
    return undefined;
  }

  const lastCommaIndex = address.lastIndexOf(",");

  if (lastCommaIndex !== -1) {
    // If a comma is found, return the substring before it, then trim
    return address.substring(0, lastCommaIndex).trim();
  }
  // If no comma is found, return the original address
  return address;
};

// Async thunk for fetching saloons
export const fetchSaloons = createAsyncThunk("saloon/fetchSaloons", async ({}, { rejectWithValue }) => {
  try {
    const response = await axios.get<Salon[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/salons/dermalogica`, {
      // location: location,
      // placeId, // Include placeId in the request
      // radius: radius || 5000, // Default to 5000 if radius is not provided
    });

    let salons = response.data;

    // Iterate over each salon and modify its address, Remove to show Country Name
    salons = salons.map((salon) => ({
      ...salon,
      address: removeCountryName(salon.address),
    }));

    console.log("Fetched Saloons:", salons);

    return salons;
  } catch (error) {
    return rejectWithValue((error as any).response?.data || "Error fetching saloons");
  }
});

const saloonSlice = createSlice({
  name: "saloon",
  initialState: {
    location: null,
    placeId: null, // Initial placeId is null
    saloons: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLocation(state, action) {
      state.location = action.payload;
    },
    setPlaceId(state, action) {
      state.placeId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaloons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaloons.fulfilled, (state, action) => {
        state.loading = false;
        state.saloons = action.payload as any;
      })
      .addCase(fetchSaloons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });
  },
});

export const { setLocation, setPlaceId } = saloonSlice.actions;

export default saloonSlice.reducer;
