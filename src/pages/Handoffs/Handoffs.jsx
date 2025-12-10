import { useState, useEffect } from "react";
import { getItemsFromAzure } from "../../api/azureApi";

function Handoffs() {
  const [handoffs, setHandoffs] = useState([]);

  useEffect(() => {
    const fetchHandoffs = async () => {
      const response = await getItemsFromAzure("handoffs");
      setHandoffs(response);
    };
    fetchHandoffs();
  }, []);

  return (
    <>
      <h1>Handoffs Page</h1>
    </>
  );
}

export default Handoffs;
