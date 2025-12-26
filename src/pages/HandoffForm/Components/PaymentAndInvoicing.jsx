import { useContext } from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

// MUI Icons
import { Payment } from "@mui/icons-material";

function PaymentAndInvoicing() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Payment sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Payment & Invoicing
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Payment Terms"
            value={formValues.paymentTerms}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                paymentTerms: e.target.value,
              })
            }
            required
            placeholder="e.g., Net 30"
            variant="outlined"
          />
        </Grid>

        <Grid item size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Invoicing Directions"
            value={formValues.invoicingDirections}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                invoicingDirections: e.target.value,
              })
            }
            required
            multiline
            rows={4}
            placeholder="Enter detailed invoicing instructions..."
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default PaymentAndInvoicing;
