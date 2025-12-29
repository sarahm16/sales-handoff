import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

function ValidationSummary({
  contract,
  sitesToUpload,
  formValues,
  isFormValid,
}) {
  const [expanded, setExpanded] = useState(true);

  // Check each required field
  const validationItems = useMemo(() => {
    const items = [];

    // Contract upload
    items.push({
      label: "Signed Contract uploaded",
      valid: !!contract,
      section: "Documents",
    });

    // Sites Excel
    items.push({
      label: "Sites Excel uploaded",
      valid: sitesToUpload.length > 0,
      section: "Documents",
      detail: sitesToUpload.length > 0 ? `${sitesToUpload.length} sites` : null,
    });

    // Client name
    items.push({
      label: "Client Name",
      valid: !!formValues.client,
      section: "Client Information",
    });

    items.push({
      label: "Address",
      valid: !!formValues.address,
      section: "Client Information",
    });

    // Service Line
    items.push({
      label: "Service Line",
      valid: !!formValues.serviceLine,
      section: "Client Information",
    });

    // Software
    items.push({
      label: "Software Portal",
      valid: !!formValues.software,
      section: "Client Information",
    });

    // Contact Name
    items.push({
      label: "Contact Name",
      valid: !!formValues.contact?.name,
      section: "Contact Information",
    });

    // Contact Email
    items.push({
      label: "Contact Email",
      valid: !!formValues.contact?.email,
      section: "Contact Information",
    });

    // Contact Phone
    items.push({
      label: "Contact Phone",
      valid: !!formValues.contact?.phone,
      section: "Contact Information",
    });

    // Renewal Type
    items.push({
      label: "Renewal Type",
      valid: !!formValues.renewal,
      section: "Contract Details",
    });

    // Duration (only required if Fixed Term)
    if (formValues.renewal === "Fixed Term") {
      items.push({
        label: "Contract Duration",
        valid: !!formValues.duration,
        section: "Contract Details",
      });
    }

    // Start Date
    items.push({
      label: "Contract Start Date",
      valid: !!formValues.startDate,
      section: "Contract Details",
    });

    // Payment Terms
    items.push({
      label: "Payment Terms",
      valid: !!formValues.paymentTerms,
      section: "Payment & Invoicing",
    });

    // Invoicing Directions
    items.push({
      label: "Invoicing Directions",
      valid: !!formValues.invoicingDirections,
      section: "Payment & Invoicing",
    });

    return items;
  }, [contract, sitesToUpload, formValues]);

  const missingItems = useMemo(
    () => validationItems.filter((item) => !item.valid),
    [validationItems]
  );

  const completedItems = useMemo(
    () => validationItems.filter((item) => item.valid),
    [validationItems]
  );

  const completionPercentage = useMemo(
    () => Math.round((completedItems.length / validationItems.length) * 100),
    [completedItems.length, validationItems.length]
  );

  // Don't show if form is valid
  if (isFormValid) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: "2px solid",
        borderColor: missingItems.length > 0 ? "warning.main" : "success.main",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: missingItems.length > 0 ? "warning.50" : "success.50",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {missingItems.length > 0 ? (
            <ErrorOutline sx={{ color: "warning.main", fontSize: 28 }} />
          ) : (
            <CheckCircle sx={{ color: "success.main", fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Form Completion: {completionPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {missingItems.length > 0
                ? `${missingItems.length} required field${
                    missingItems.length !== 1 ? "s" : ""
                  } remaining`
                : "All required fields completed!"}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ bgcolor: "grey.100", height: 4 }}>
        <Box
          sx={{
            bgcolor: missingItems.length > 0 ? "warning.main" : "success.main",
            height: "100%",
            width: `${completionPercentage}%`,
            transition: "width 0.3s ease",
          }}
        />
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Missing Items */}
          {missingItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="warning.main"
                sx={{ mb: 1 }}
              >
                Required Fields Missing:
              </Typography>
              <List dense disablePadding>
                {missingItems.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 0.5,
                      px: 0,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorOutline
                        sx={{ fontSize: 18, color: "warning.main" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.section}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="success.main"
                sx={{ mb: 1 }}
              >
                Completed ({completedItems.length}):
              </Typography>
              <List dense disablePadding>
                {completedItems.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 0.5,
                      px: 0,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.detail || item.section}
                      primaryTypographyProps={{
                        variant: "body2",
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default ValidationSummary;
