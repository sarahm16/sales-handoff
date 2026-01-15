import { useContext } from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

// MUI Icons
import { ContactPhone, AccountBalance } from "@mui/icons-material";

function ContactInfo() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Regular Contact Information */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "grey.50",
          p: 3,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <ContactPhone sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Primary Contact Information
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.contact.noContact || false}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  contact: {
                    ...formValues.contact,
                    noContact: e.target.checked,
                    ...(e.target.checked && {
                      name: "",
                      email: "",
                      phone: "",
                    }),
                  },
                })
              }
            />
          }
          label="No Contact (all communications through portal)"
          sx={{ mb: 2 }}
        />

        {!formValues.contact.noContact && (
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formValues.contact.name || ""}
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
                value={formValues.contact.email || ""}
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
                value={formValues.contact.phone || ""}
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
        )}
      </Paper>

      {/* Billing Contact Information */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "grey.50",
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <AccountBalance
            sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
          />
          <Typography variant="h6" fontWeight={600}>
            Billing Contact Information
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.billingContact.noContact || false}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  billingContact: {
                    ...formValues.billingContact,
                    noContact: e.target.checked,
                    ...(e.target.checked && {
                      name: "",
                      email: "",
                      phone: "",
                    }),
                  },
                })
              }
            />
          }
          label="No Billing Contact (all communications through portal)"
          sx={{ mb: 2 }}
        />

        {!formValues.billingContact.noContact && (
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Billing Contact Name"
                value={formValues.billingContact.name || ""}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    billingContact: {
                      ...formValues.billingContact,
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
                label="Billing Contact Email"
                type="email"
                value={formValues.billingContact.email || ""}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    billingContact: {
                      ...formValues.billingContact,
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
                label="Billing Contact Phone"
                type="tel"
                value={formValues.billingContact.phone || ""}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    billingContact: {
                      ...formValues.billingContact,
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
        )}
      </Paper>
    </Box>
  );
}

export default ContactInfo;
