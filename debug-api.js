
async function checkApi() {
  try {
    const response = await fetch("https://api.salonz.cloud/api/salons?salonType=SALON_ONLINE");
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Is Array:", Array.isArray(data));
    if (!Array.isArray(data)) {
        console.log("Data keys:", Object.keys(data));
        if (data.data && Array.isArray(data.data)) {
            console.log("Found data array in 'data' property");
            console.log("First item:", JSON.stringify(data.data[0], null, 2));
        } else {
             console.log("Structure:", JSON.stringify(data, null, 2).substring(0, 500));
        }
    } else {
        console.log("Data length:", data.length);
        if (data.length > 0) {
            console.log("First item:", JSON.stringify(data[0], null, 2));
        }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkApi();
