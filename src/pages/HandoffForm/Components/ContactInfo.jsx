import { useContext } from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

// MUI Icons
import { ContactPhone } from "@mui/icons-material";

function ContactInfo() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;
  return (
    <>
      {" "}
      {/* Contact Information */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <ContactPhone sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Contact Information
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Contact Name"
              value={formValues.contact.name}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  contact: {
                    ...formValues.contact,
                    name: e.target.value,
                  },
                })
              }
              required
              variant="outlined"
            />
          </Grid>

          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={formValues.contact.email}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  contact: {
                    ...formValues.contact,
                    email: e.target.value,
                  },
                })
              }
              required
              variant="outlined"
            />
          </Grid>

          <Grid item size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Contact Phone"
              type="tel"
              value={formValues.contact.phone}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  contact: {
                    ...formValues.contact,
                    phone: e.target.value,
                  },
                })
              }
              required
              variant="outlined"
              placeholder="(555) 555-5555"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ContactInfo;
