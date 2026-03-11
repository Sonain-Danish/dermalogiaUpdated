"use client";

import { useEffect } from "react";

export default function HeightProvider({ children, ...props }: any) {
  // function postHeight() {
  //   const height = document.documentElement.scrollHeight;
  //   parent.postMessage({ type: "resize", height }, "*");
  // }

  // Function to post the current height of the body to the parent window
  function postHeight() {
    // Use document.body.offsetHeight which reflects the rendered height
    // This should correctly decrease when content is removed.
    const height = document.body.offsetHeight;

    // Ensure height is a valid number before sending
    if (!isNaN(height)) {
      // Post the height message to the parent window
      // The '*' allows posting to any origin, which is acceptable here
      // as the parent window checks the origin on the receiving end.
      parent.postMessage({ type: "resize", height }, "*");
    }
  }

  useEffect(() => {
    // Send once on load
    window.addEventListener("load", postHeight);

    //  observe DOM changes and update height
    const observer = new MutationObserver(postHeight);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", postHeight);
  }, []);

  return <div {...props}>{children}</div>;
}
