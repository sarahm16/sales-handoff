import { useContext } from "react";

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
import Autocomplete from "@mui/material/Autocomplete";

// MUI Icons
import { Business } from "@mui/icons-material";

// Constants
import { softwares, serviceLines } from "../../../constants";

const serviceLineOptions = serviceLines.map((sl) => ({
  ...sl,
  assignedTo: "",
  dueDate: "",
  priority: "",
  pricing: [],
}));

function ClientInformation() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;

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
          <TextField
            fullWidth
            label="Client Name"
            value={formValues.client}
            onChange={(e) =>
              setFormValues({ ...formValues, client: e.target.value })
            }
            required
            variant="outlined"
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Service Line</InputLabel>
            <Select
              value={formValues.serviceLine}
              label="Service Line"
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  serviceLine: e.target.value,
                })
              }
            >
              {serviceLineOptions.map((line) => (
                <MenuItem key={line.id} value={line}>
                  {line.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Autocomplete
            renderInput={(params) => (
              <TextField {...params} label="Software Portal" />
            )}
            label="Software Portal"
            freeSolo
            options={softwares}
            onChange={(e, value) =>
              setFormValues({ ...formValues, software: value })
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClientInformation;
