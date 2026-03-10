// Function to copy text to clipboard
export const copyToClipboard: (text: string) => Promise<boolean> = async (text: string) => {
  const parentMessage = {
    type: "copyToClipboard",
    payload: text,
  };
  window.parent.postMessage(parentMessage, "*");
  await navigator.clipboard.writeText(text);

  return true;
};
