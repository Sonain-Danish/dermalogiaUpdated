"use client";

import { Provider } from "react-redux";
import { ReduxStore } from "./store";

const StoreProvider = ({ children }: any) => {
  return <Provider store={ReduxStore}>{children}</Provider>;
};

export default StoreProvider;
