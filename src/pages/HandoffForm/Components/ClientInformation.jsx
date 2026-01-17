import { useContext, useEffect, useMemo, useState } from "react";
import Autocomplete from "react-google-autocomplete";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MuiAutocomplete from "@mui/material/Autocomplete";

// MUI Icons
import { Business } from "@mui/icons-material";

// Constants
import { softwares, serviceLines } from "../../../constants";

// Functions
import { getItemsFromAzure } from "../../../api/azureApi";

const validStatuses = ["Active", "Sourcing"];

const serviceLineOptions = serviceLines.map((sl) => ({
  ...sl,
  assignedTo: "",
  dueDate: "",
  priority: "",
  pricing: [],
}));

function ClientInformation() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues, availableServiceTypes } = handoffContext;

  const [existingClients, setExistingClients] = useState([]);

  // Local state for performance optimization
  const [localClientValue, setLocalClientValue] = useState(
    formValues.client || ""
  );

  useEffect(() => {
    const fetchClients = async () => {
      const response = await getItemsFromAzure("clients");
      const clients = response.filter((client) =>
        validStatuses.includes(client.status)
      );
      setExistingClients(clients);
    };
    fetchClients();
  }, []);

  // Sync local state with form values when they change externally
  useEffect(() => {
    setLocalClientValue(formValues.client || "");
  }, [formValues.client]);

  const clientNames = useMemo(() => {
    return existingClients.map((client) => client.client);
  }, [existingClients]);

  const handleClientChange = (e, value) => {
    console.log("event", e);
    console.log("selected client", value);

    const selectedClient = existingClients.find(
      (client) => client.client === value
    );

    const updates = {
      newClient: false,
      client: value?.trim(),
      contact: selectedClient?.contact || {
        name: "",
        email: "",
        phone: "",
        secondaryName: "",
        secondaryEmail: "",
        secondaryPhone: "",
        quickbooksId: "",
        noContact: false,
      },
      billingContact: selectedClient?.billingContact || {
        name: "",
        email: "",
        phone: "",
        noContact: false,
      },
    };

    setLocalClientValue(value || "");
    setFormValues((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleClientInputChange = (e, value) => {
    console.log("client input change", value);
    setLocalClientValue(value || "");
  };

  const handleClientBlur = () => {
    // Sync to parent on blur
    if (localClientValue !== formValues.client) {
      setFormValues((prev) => ({
        ...prev,
        client: localClientValue?.trim(),
        newClient: true,
      }));
    }
  };

  const handlePlaceSelected = (place) => {
    if (place) {
      setFormValues((prev) => ({
        ...prev,
        address: place.formatted_address || "",
        lat: place.geometry?.location.lat() || null,
        lng: place.geometry?.location.lng() || null,
      }));
    }
  };

  const handleSoftwareChange = (e, value) => {
    setFormValues((prev) => ({
      ...prev,
      software: value?.trim(),
    }));
  };

  const handleNewSoftwareChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      newSoftware: e.target.value,
    }));
  };

  const handleServiceLineChange = (e) => {
    const selectedLine = serviceLineOptions.find(
      (line) => line.name === e.target.value
    );
    setFormValues((prev) => ({
      ...prev,
      serviceLine: selectedLine || {
        name: "",
        id: null,
        assignedTo: "",
        dueDate: "",
        priority: "",
        pricing: [],
      },
    }));
  };

  const handleServiceTypeChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      serviceType: e.target.value,
    }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Business sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Client Information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12 }}>
          <MuiAutocomplete
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client Name"
                required
                onBlur={handleClientBlur}
              />
            )}
            value={localClientValue}
            inputValue={localClientValue}
            freeSolo
            options={clientNames}
            onChange={handleClientChange}
            onInputChange={handleClientInputChange}
          />
        </Grid>

        <Grid item size={{ xs: 12 }}>
          <Autocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            onPlaceSelected={handlePlaceSelected}
            options={{
              types: ["address"],
            }}
            defaultValue={formValues.address || ""}
            style={{
              width: "100%",
              padding: "16.5px 0px 16.5px 14px",
              fontSize: "1rem",
              fontFamily: "inherit",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.23)",
              outline: "none",
            }}
            placeholder="Address *"
            required
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Service Line</InputLabel>
            <Select
              value={formValues.serviceLine.name}
              label="Service Line"
              onChange={handleServiceLineChange}
            >
              {serviceLineOptions.map((line) => (
                <MenuItem key={line.id} value={line.name}>
                  {line.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Service Type</InputLabel>
            <Select
              value={formValues.serviceType || ""}
              label="Service Type"
              onChange={handleServiceTypeChange}
            >
              {availableServiceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12 }}>
          <MuiAutocomplete
            renderInput={(params) => (
              <TextField {...params} label="Software Portal" />
            )}
            value={formValues.software || ""}
            onChange={handleSoftwareChange}
            options={softwares}
          />

          {formValues.software === "New Portal" && (
            <TextField
              label="Please specify the software portal"
              fullWidth
              required={formValues.software === "New Portal"}
              sx={{ mt: 2 }}
              value={formValues.newSoftware || ""}
              onChange={handleNewSoftwareChange}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClientInformation;
