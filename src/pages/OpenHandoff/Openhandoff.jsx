import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// API
import { getItemFromAzure } from "../../api/azureApi";

function OpenHandoff() {
  const params = useParams();
  const { id } = params;

  const [handoff, setHandoff] = useState(null);

  useEffect(() => {
    const fetchHandoff = async () => {
      const response = await getItemFromAzure("handoffs", id);
      setHandoff(response);
    };
    fetchHandoff();
  }, [id]);

  return <></>;
}

export default OpenHandoff;
