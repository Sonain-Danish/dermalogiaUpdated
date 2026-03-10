import { Salon } from "@/utils/models/schema-prisma";
import axios from "axios";
import { create } from "zustand";

interface ZustandState {
  _salons: Salon[] | null;
  loading: boolean;
  error: string | null;

  fetchSalons: () => Promise<void>;
}

const useSalonsState = create<ZustandState>()((set) => ({
  _salons: null,
  loading: false,
  error: null,

  fetchSalons: async () => {
    const state = useSalonsState();

    if ((state._salons?.length ?? 0) > 0 || state.loading) {
      return;
    }

    set(() => ({ loading: true }));

    try {
      let res = await axios.get<Salon[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/salons/dermalogica`);
      set(() => ({ loading: false, salons: res.data }));
    } catch (e) {
      console.log(e);
      set(() => ({ loading: false, error: "Failed To Get Salons!" }));
    }
  },
}));

export default useSalonsState;
