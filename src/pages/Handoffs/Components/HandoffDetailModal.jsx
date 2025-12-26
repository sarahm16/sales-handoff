import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Close,
  Business,
  ContactPhone,
  CalendarMonth,
  Payment,
  Description,
  LocationOn,
  AttachFile,
} from "@mui/icons-material";

function HandoffDetailModal({ open, onClose, handoff }) {
  if (!handoff) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {handoff.client}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Handoff Details
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {/* Status and Basic Info */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Chip label={handoff.status} color="primary" />
            <Chip label={handoff.serviceLine?.name} variant="outlined" />
            <Chip
              label={`${handoff.numberOfSites} Sites`}
              variant="outlined"
              color="info"
            />
          </Box>
        </Box>

        {/* Client Information */}
        <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Business sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Client Information
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Software Portal
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.software || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Service Line
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.serviceLine?.name || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Contact Information */}
        <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ContactPhone sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Contact Information
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.contact?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.contact?.email || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.contact?.phone || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Contract Details */}
        <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CalendarMonth sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Contract Details
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Renewal Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.renewal || "N/A"}
              </Typography>
            </Grid>
            {handoff.duration && (
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {handoff.duration}
                </Typography>
              </Grid>
            )}
            {handoff.annualEscalation && (
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Annual Escalation
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {handoff.annualEscalation}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(handoff.startDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(handoff.endDate)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Payment & Invoicing */}
        <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Payment sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Payment & Invoicing
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Payment Terms
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {handoff.paymentTerms || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Invoicing Directions
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {handoff.invoicingDirections || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Documents */}
        {handoff.documents && handoff.documents.length > 0 && (
          <Paper elevation={0} sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AttachFile sx={{ color: "primary.main", mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Documents
              </Typography>
            </Box>
            <List dense>
              {handoff.documents.map((doc, index) => (
                <ListItem key={index} disablePadding>
                  <Link
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <Description fontSize="small" />
                    <Typography variant="body2">{doc.name}</Typography>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Submission Info */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created By
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {handoff.createdBy || "N/A"}
            </Typography>
            {handoff.createdByEmail && (
              <Typography variant="caption" color="text.secondary">
                {handoff.createdByEmail}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Submitted On
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(handoff.createdAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          Edit Handoff
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HandoffDetailModal;
