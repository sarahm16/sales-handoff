import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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

    // Primary Contact - either noContact or all fields filled
    const primaryContactValid =
      formValues.contact?.noContact ||
      (!!formValues.contact?.name &&
        !!formValues.contact?.email &&
        !!formValues.contact?.phone);

    items.push({
      label: "Primary Contact",
      valid: primaryContactValid,
      section: "Contact Information",
      detail: formValues.contact?.noContact ? "No contact" : null,
    });

    // Billing Contact - either noContact or all fields filled
    const billingContactValid =
      formValues.billingContact?.noContact ||
      (!!formValues.billingContact?.name &&
        !!formValues.billingContact?.email &&
        !!formValues.billingContact?.phone);

    items.push({
      label: "Billing Contact",
      valid: billingContactValid,
      section: "Contact Information",
      detail: formValues.billingContact?.noContact ? "No contact" : null,
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

    // Payment Method
    items.push({
      label: "Payment Method",
      valid: !!formValues.paymentMethod,
      section: "Payment & Invoicing",
    });

    // 3rd Party Provider (only required if payment method is 3rd Party)
    if (formValues.paymentMethod === "3rd Party") {
      items.push({
        label: "3rd Party Payment Provider",
        valid: !!formValues.thirdPartyPaymentProvider,
        section: "Payment & Invoicing",
      });
    }

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

  return (
    <Paper
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor:
          missingItems.length > 0
            ? "warning.main"
            : isFormValid
            ? "success.main"
            : "grey.300",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: isFormValid
            ? "success.50"
            : missingItems.length > 0
            ? "warning.50"
            : "grey.50",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {isFormValid ? (
            <CheckCircle sx={{ color: "success.main", fontSize: 28 }} />
          ) : missingItems.length > 0 ? (
            <ErrorOutline sx={{ color: "warning.main", fontSize: 28 }} />
          ) : (
            <ErrorOutline sx={{ color: "grey.400", fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Form Completion: {completionPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isFormValid
                ? "Ready to submit!"
                : missingItems.length > 0
                ? `${missingItems.length} required field${
                    missingItems.length !== 1 ? "s" : ""
                  } remaining`
                : "Start filling out the form"}
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
            bgcolor: isFormValid
              ? "success.main"
              : missingItems.length > 0
              ? "warning.main"
              : "grey.300",
            height: "100%",
            width: `${completionPercentage}%`,
            transition: "width 0.3s ease",
          }}
        />
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, maxHeight: "70vh", overflow: "auto" }}>
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
