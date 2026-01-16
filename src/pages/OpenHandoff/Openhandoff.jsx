import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Google Autocomplete
import Autocomplete from "react-google-autocomplete";

// MUI Components
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Link,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { Autocomplete as MUIAutocomplete } from "@mui/material";

// MUI Icons
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Business,
  ContactPhone,
  CalendarMonth,
  Payment,
  Description,
  TableChart,
  CheckCircle,
  LocationOn,
  AccountBalance,
  AttachMoney,
} from "@mui/icons-material";

// API
import {
  getItemFromAzure,
  saveItemToAzure,
  updateItemInAzure,
} from "../../api/azureApi";

// Auth
import { useAuth } from "../../auth/useAuth";

// Constants
import { softwares, serviceLines } from "../../constants";

// Utilities
import getObjectDiff from "../../utilities/getObjectDiff";

const serviceLineOptions = serviceLines.map((sl) => ({
  ...sl,
  assignedTo: "",
  dueDate: "",
  priority: "",
  pricing: [],
}));

const serviceTypesByLine = {
  Snow: ["Per Event", "Per Season", "Per Push"],
  Janitorial: ["Per Service"],
  Landscaping: ["Per Service"],
  "Lot Sweeping": ["Per Service"],
  "On Demand": ["1 Time Service"],
};

const paymentMethods = ["ACH", "Check", "Wire", "3rd Party"];
const renewalOptions = ["Auto-Renewing", "Fixed Term"];

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

function OpenHandoff() {
  const params = useParams();
  const navigate = useNavigate();
  const user = useAuth()?.user;
  const { id } = params;

  const [handoff, setHandoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editedHandoff, setEditedHandoff] = useState(null);

  useEffect(() => {
    const fetchHandoff = async () => {
      try {
        setLoading(true);
        const response = await getItemFromAzure("handoffs", id);
        setHandoff(response);
        setEditedHandoff(response);
      } catch (err) {
        setError("Failed to load handoff");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHandoff();
  }, [id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedHandoff(handoff);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates = getObjectDiff(handoff, editedHandoff);
      console.log("Updates to save:", updates);
      await updateItemInAzure("handoffs", id, {
        ...updates,
        activity: [
          ...(editedHandoff.activity || []),
          {
            date: new Date().getTime(),
            user,
            action: "Updated handoff",
          },
        ],
      });
      setHandoff(editedHandoff);
      setEditMode(false);
    } catch (err) {
      setError("Failed to save changes");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !handoff) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || "Handoff not found"}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/handoffs")}
          sx={{ mt: 2 }}
        >
          Back to Handoffs
        </Button>
      </Container>
    );
  }

  const displayData = editMode ? editedHandoff : handoff;

  const handlePlaceSelected = (place) => {
    if (place) {
      setEditedHandoff((prev) => ({
        ...prev,
        address: place.formatted_address || "",
        lat: place.geometry?.location.lat() || null,
        lng: place.geometry?.location.lng() || null,
      }));
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/handoffs")}
                sx={{ color: "white" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" fontWeight={700}>
                {displayData.client}
              </Typography>
              <Chip
                label={displayData.status}
                color={displayData.status === "Pending" ? "warning" : "success"}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Edit Handoff
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Handoff ID: {displayData.id} • Created{" "}
            {new Date(displayData.createdAt).toLocaleDateString()}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
              >
                <Tab label="Overview" />
                <Tab label="Contact & Billing" />
                <Tab label="Contract Details" />
                <Tab label="Sites" />
              </Tabs>

              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <CardContent sx={{ p: 3 }}>
                  {/* Client Information */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Business sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Client Information
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Client Name
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedHandoff.client}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                client: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.client}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "start",
                            gap: 0.5,
                          }}
                        >
                          <LocationOn
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          {editMode ? (
                            <Autocomplete
                              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                              onPlaceSelected={handlePlaceSelected}
                              options={{
                                types: ["address"],
                              }}
                              defaultValue={editedHandoff.address || ""}
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
                          ) : (
                            <Typography variant="body1">
                              {displayData.address}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Service Line
                        </Typography>
                        {editMode ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedHandoff.serviceLine?.name || ""}
                              onChange={(e) => {
                                const selectedLine = serviceLineOptions.find(
                                  (line) => line.name === e.target.value
                                );
                                const newServiceTypes =
                                  serviceTypesByLine[e.target.value] || [];
                                setEditedHandoff({
                                  ...editedHandoff,
                                  serviceLine: selectedLine,
                                  serviceType: newServiceTypes[0] || "",
                                });
                              }}
                            >
                              {serviceLineOptions.map((line) => (
                                <MenuItem key={line.id} value={line.name}>
                                  {line.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={displayData.serviceLine?.name || "N/A"}
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Service Type
                        </Typography>
                        {editMode ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedHandoff.serviceType || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  serviceType: e.target.value,
                                })
                              }
                            >
                              {(
                                serviceTypesByLine[
                                  editedHandoff.serviceLine?.name
                                ] || []
                              ).map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.serviceType || "N/A"}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Software Portal
                        </Typography>
                        {editMode ? (
                          <MUIAutocomplete
                            freeSolo
                            size="small"
                            options={softwares}
                            value={editedHandoff.software || ""}
                            onChange={(e, value) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                software: value,
                              })
                            }
                            onInputChange={(e, value) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                software: value,
                              })
                            }
                            renderInput={(params) => <TextField {...params} />}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.software}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Number of Sites
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {displayData.numberOfSites}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Documents */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Description sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Documents
                      </Typography>
                    </Box>
                    <List>
                      {displayData.documents?.map((doc, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <CheckCircle
                            sx={{ color: "success.main", mr: 2, fontSize: 20 }}
                          />
                          <ListItemText
                            primary={doc.name}
                            secondary={
                              <Link
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Document
                              </Link>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Contact & Billing Tab */}
              <TabPanel value={tabValue} index={1}>
                <CardContent sx={{ p: 3 }}>
                  {/* Primary Contact */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <ContactPhone sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Primary Contact
                      </Typography>
                    </Box>
                    {editMode && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editedHandoff.contact?.noContact || false}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                contact: {
                                  ...editedHandoff.contact,
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
                    )}
                    {displayData.contact?.noContact && !editMode ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No contact - all communications through portal
                      </Alert>
                    ) : !editedHandoff.contact?.noContact ? (
                      <Grid container spacing={2}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Name
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedHandoff.contact?.name || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  contact: {
                                    ...editedHandoff.contact,
                                    name: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1" fontWeight={500}>
                              {displayData.contact?.name || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="email"
                              value={editedHandoff.contact?.email || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  contact: {
                                    ...editedHandoff.contact,
                                    email: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1">
                              {displayData.contact?.email || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Phone
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="tel"
                              value={editedHandoff.contact?.phone || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  contact: {
                                    ...editedHandoff.contact,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1">
                              {displayData.contact?.phone || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    ) : null}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Billing Contact */}
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AccountBalance sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Billing Contact
                      </Typography>
                    </Box>
                    {editMode && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              editedHandoff.billingContact?.noContact || false
                            }
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                billingContact: {
                                  ...editedHandoff.billingContact,
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
                    )}
                    {displayData.billingContact?.noContact && !editMode ? (
                      <Alert severity="info">
                        No billing contact - all communications through portal
                      </Alert>
                    ) : !editedHandoff.billingContact?.noContact ? (
                      <Grid container spacing={2}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Name
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedHandoff.billingContact?.name || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  billingContact: {
                                    ...editedHandoff.billingContact,
                                    name: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1" fontWeight={500}>
                              {displayData.billingContact?.name || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="email"
                              value={editedHandoff.billingContact?.email || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  billingContact: {
                                    ...editedHandoff.billingContact,
                                    email: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1">
                              {displayData.billingContact?.email || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Phone
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="tel"
                              value={editedHandoff.billingContact?.phone || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  billingContact: {
                                    ...editedHandoff.billingContact,
                                    phone: e.target.value,
                                  },
                                })
                              }
                            />
                          ) : (
                            <Typography variant="body1">
                              {displayData.billingContact?.phone || "N/A"}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    ) : null}
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Contract Details Tab */}
              <TabPanel value={tabValue} index={2}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarMonth sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Contract Information
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Renewal Type
                        </Typography>
                        {editMode ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedHandoff.renewal || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
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
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.renewal}
                          </Typography>
                        )}
                      </Grid>
                      {(editedHandoff.renewal === "Fixed Term" ||
                        displayData.duration) && (
                        <Grid item size={{ xs: 12, md: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Duration
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedHandoff.duration || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  duration: e.target.value,
                                })
                              }
                              placeholder="e.g., 2 years, 36 months"
                            />
                          ) : (
                            <Typography variant="body1" fontWeight={500}>
                              {displayData.duration}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            value={editedHandoff.startDate || ""}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                startDate: e.target.value,
                              })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.startDate || "N/A"}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          End Date
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            value={editedHandoff.endDate || ""}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                endDate: e.target.value,
                              })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.endDate || "N/A"}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Annual Escalation
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedHandoff.annualEscalation || ""}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                annualEscalation: e.target.value,
                              })
                            }
                            placeholder="e.g., 3%, $500"
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.annualEscalation || "N/A"}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Payment sx={{ color: "primary.main", mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Payment & Invoicing
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Terms
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedHandoff.paymentTerms || ""}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                paymentTerms: e.target.value,
                              })
                            }
                            placeholder="e.g., Net 30"
                          />
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.paymentTerms}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item size={{ xs: 12, md: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Method
                        </Typography>
                        {editMode ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedHandoff.paymentMethod || ""}
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  paymentMethod: e.target.value,
                                  ...(e.target.value !== "3rd Party" && {
                                    thirdPartyPaymentProvider: "",
                                  }),
                                })
                              }
                            >
                              {paymentMethods.map((method) => (
                                <MenuItem key={method} value={method}>
                                  {method}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body1" fontWeight={500}>
                            {displayData.paymentMethod || "N/A"}
                          </Typography>
                        )}
                      </Grid>
                      {(editedHandoff.paymentMethod === "3rd Party" ||
                        displayData.thirdPartyPaymentProvider) && (
                        <Grid item size={{ xs: 12, md: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            3rd Party Provider
                          </Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={
                                editedHandoff.thirdPartyPaymentProvider || ""
                              }
                              onChange={(e) =>
                                setEditedHandoff({
                                  ...editedHandoff,
                                  thirdPartyPaymentProvider: e.target.value,
                                })
                              }
                              placeholder="e.g., Bill.com, AvidXchange"
                            />
                          ) : (
                            <Typography variant="body1" fontWeight={500}>
                              {displayData.thirdPartyPaymentProvider}
                            </Typography>
                          )}
                        </Grid>
                      )}
                      <Grid item size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">
                          Invoicing Directions
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            size="small"
                            value={editedHandoff.invoicingDirections || ""}
                            onChange={(e) =>
                              setEditedHandoff({
                                ...editedHandoff,
                                invoicingDirections: e.target.value,
                              })
                            }
                            placeholder="Specify invoicing frequency and timing..."
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              whiteSpace: "pre-wrap",
                              bgcolor: "grey.50",
                              p: 2,
                              borderRadius: 1,
                              mt: 1,
                            }}
                          >
                            {displayData.invoicingDirections}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Sites Tab */}
              <TabPanel value={tabValue} index={3}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TableChart sx={{ color: "primary.main", mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Sites ({displayData.numberOfSites})
                    </Typography>
                  </Box>
                  <Alert severity="info">
                    Sites are managed separately. Navigate to the Sites page to
                    view and manage sites for this handoff.
                  </Alert>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/sites")}
                    sx={{ mt: 2 }}
                  >
                    View Sites
                  </Button>
                </CardContent>
              </TabPanel>
            </Paper>
          </Grid>

          {/* Right Column - Activity & Status */}
          <Grid item size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Info
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {displayData.createdBy || "Unknown"}
                  </Typography>
                  {/*                   <Typography variant="caption" color="text.secondary">
                    {displayData.createdByEmail}
                  </Typography> */}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(displayData.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={displayData.status}
                    color={
                      displayData.status === "Pending" ? "warning" : "success"
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Activity Log
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {displayData.activity
                  ?.sort((a, b) => b.date - a.date)
                  .map((activity, index) => (
                    <ListItem
                      key={index}
                      sx={{ px: 0, alignItems: "flex-start" }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user?.displayName || "Unknown"} •{" "}
                          {new Date(activity.date).toLocaleString()}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default OpenHandoff;
