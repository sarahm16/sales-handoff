import { useContext } from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// MUI Icons
import { CalendarMonth } from "@mui/icons-material";

// Constants
const renewalOptions = ["Auto-Renewing", "Fixed Term"];

function ContractDetails() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <CalendarMonth sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Contract Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required>
            <InputLabel>Renewal Type</InputLabel>
            <Select
              value={formValues.renewal}
              label="Renewal Type"
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  renewal: e.target.value,
                })
              }
            >
              {renewalOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {formValues.renewal === "Fixed Term" && (
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Contract Duration"
              value={formValues.duration}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  duration: e.target.value,
                })
              }
              required
              placeholder="e.g., 2 years, 36 months"
              variant="outlined"
            />
          </Grid>
        )}

        <Grid item size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Annual Escalation"
            value={formValues.annualEscalation}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                annualEscalation: e.target.value,
              })
            }
            placeholder="e.g., 3%, $500"
            variant="outlined"
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Contract Start Date"
            type="date"
            value={formValues.startDate}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                startDate: e.target.value,
              })
            }
            required
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Contract End Date"
            type="date"
            value={formValues.endDate}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                endDate: e.target.value,
              })
            }
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ContractDetails;
