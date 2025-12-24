import { useState } from "react";
import * as XLSX from "xlsx";

// MUI Components
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Chip,
  Grid,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload,
  Description,
  TableChart,
  Business,
  Payment,
  CheckCircle,
  Image as ImageIcon,
  Delete as DeleteIcon,
  ContactPhone,
  CalendarMonth,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

// Constants
import { serviceLines, softwares } from "../../constants";

// Auth
import { useAuth } from "../../auth/useAuth";

// API
import { saveItemToAzure } from "../../api/azureApi";
import { saveImagesToBlobStorage } from "../../api/blobStorageApi";

const serviceLineOptions = serviceLines.map((sl) => ({
  ...sl,
  assignedTo: "",
  dueDate: "",
  priority: "",
  pricing: [],
}));

const renewalOptions = ["Auto", "Manual"];

const initialFormValues = {
  client: "",
  contractUrl: "",
  serviceLine: serviceLineOptions[0],
  status: "Pending",
  handoffId: "",
  paymentTerms: "",
  invoicingDirections: "",
  software: softwares[0],
  numberOfSites: 0,
  demo: true,
  contact: {
    name: "",
    email: "",
    phone: "",
  },
  renewal: "Auto",
  startDate: "",
  endDate: "",
};

const REQUIRED_COLUMNS = ["Store", "Address", "City", "State", "Zipcode"];
const REQUIRED_FIELDS = [
  "client",
  "contract",
  "serviceLine",
  "paymentTerms",
  "invoicingDirections",
  "software",
  "contact.name",
  "contact.email",
  "contact.phone",
  "renewal",
  "startDate",
  "endDate",
];

function HandoffForm() {
  const user = useAuth()?.user;
  const [sitesToUpload, setSitesToUpload] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState("");
  const [contract, setContract] = useState(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [contractFileName, setContractFileName] = useState("");
  const [success, setSuccess] = useState(false);

  const handleContractUpload = async (event) => {
    const file = event.target.files[0];
    setContract(file);
    setContractFileName(file?.name || "");
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const missingColumns = REQUIRED_COLUMNS.filter(
        (col) => !Object.keys(jsonData[0] || {}).includes(col)
      );

      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(", ")}`);
        setExcelFileName("");
        setSitesToUpload([]);
      } else {
        setError("");
        // Add unique id and siteMap field to each row
        const sitesWithIds = jsonData.map((site, index) => ({
          ...site,
          id: index + 1,
          siteMap: null,
          siteMapName: "",
        }));
        setSitesToUpload(sitesWithIds);
        setExcelFileName(file.name);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSiteMapUpload = (siteId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    // Update the site with the uploaded file
    setSitesToUpload((prevSites) =>
      prevSites.map((site) =>
        site.id === siteId
          ? { ...site, siteMap: file, siteMapName: file.name }
          : site
      )
    );
  };

  const handleSiteMapRemove = (siteId) => {
    setSitesToUpload((prevSites) =>
      prevSites.map((site) =>
        site.id === siteId ? { ...site, siteMap: null, siteMapName: "" } : site
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const contractUrl = await saveImagesToBlobStorage([contract]);

      // Save handoff to handoffs container and get handoff ID
      const handoffResponse = await saveItemToAzure("handoffs", {
        ...formValues,
        contractUrl: contractUrl[0],
        numberOfSites: sitesToUpload.length,
        documents: [
          {
            name: contract.name,
            url: contractUrl[0],
          },
        ],
        createdBy: user.name,
        createdByEmail: user.email,
        createdAt: new Date().toISOString(),
      });

      const handoffId = handoffResponse.id;

      // Save each site with its site map (if available)
      for (const site of sitesToUpload) {
        // If site has a site map, upload it to blob storage first
        if (site.siteMap) {
          const siteMapUrl = await saveImagesToBlobStorage([site.siteMap]);
          site.siteMapUrl = siteMapUrl[0];
        }

        // Save site to sites container with handoff ID
        await saveItemToAzure("sites", {
          ...site,
          handoffId,
          siteMap: null, // Remove file object, store URL instead
          siteMapUrl: site.siteMap ? site.siteMapUrl : null,
        });
      }

      setSuccess(true);

      // Reset form
      setFormValues(initialFormValues);
      setSitesToUpload([]);
      setContract(null);
      setExcelFileName("");
      setContractFileName("");
    } catch (err) {
      setError("Failed to submit handoff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    !loading &&
    contract &&
    sitesToUpload.length > 0 &&
    formValues.client &&
    formValues.serviceLine &&
    formValues.paymentTerms &&
    formValues.invoicingDirections &&
    formValues.software &&
    formValues.contact.name &&
    formValues.contact.email &&
    formValues.contact.phone &&
    formValues.renewal &&
    formValues.startDate &&
    formValues.endDate;

  // DataGrid columns
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      headerClassName: "datagrid-header",
    },
    {
      field: "Store",
      headerName: "Store",
      width: 150,
      headerClassName: "datagrid-header",
    },
    {
      field: "Address",
      headerName: "Address",
      width: 200,
      headerClassName: "datagrid-header",
    },
    {
      field: "City",
      headerName: "City",
      width: 130,
      headerClassName: "datagrid-header",
    },
    {
      field: "State",
      headerName: "State",
      width: 100,
      headerClassName: "datagrid-header",
    },
    {
      field: "Zipcode",
      headerName: "Zipcode",
      width: 100,
      headerClassName: "datagrid-header",
    },
    {
      field: "siteMap",
      headerName: "Site Map",
      width: 250,
      headerClassName: "datagrid-header",
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.row.siteMapName ? (
            <>
              <Chip
                icon={<ImageIcon />}
                label={params.row.siteMapName}
                size="small"
                color="success"
                onDelete={() => handleSiteMapRemove(params.row.id)}
              />
            </>
          ) : (
            <>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id={`site-map-upload-${params.row.id}`}
                type="file"
                onChange={(e) => handleSiteMapUpload(params.row.id, e)}
              />
              <label htmlFor={`site-map-upload-${params.row.id}`}>
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  startIcon={<CloudUpload />}
                  sx={{ textTransform: "none" }}
                >
                  Upload
                </Button>
              </label>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Card
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 5,
              textAlign: "center",
            }}
          >
            <Typography variant="h3" fontWeight={700} gutterBottom>
              New Handoff
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              Submit client information and site details
            </Typography>
          </Box>

          <CardContent sx={{ p: 5 }}>
            {/* File Upload Section */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "grey.50",
                p: 3,
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Description
                  sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Document Uploads
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Sites Excel Upload */}
                <Grid item size={{ xs: 12, md: 6 }}>
                  <input
                    accept=".xlsx, .xls"
                    style={{ display: "none" }}
                    id="excel-upload"
                    type="file"
                    onChange={handleExcelUpload}
                  />
                  <label htmlFor="excel-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<TableChart />}
                      endIcon={excelFileName && <CheckCircle color="success" />}
                      sx={{
                        height: 56,
                        borderWidth: 2,
                        borderStyle: "dashed",
                        textTransform: "none",
                        fontSize: 15,
                        justifyContent: "flex-start",
                        "&:hover": {
                          borderWidth: 2,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {excelFileName || "Upload Sites Excel *"}
                    </Button>
                  </label>
                  {sitesToUpload.length > 0 && (
                    <Chip
                      size="small"
                      label={`${sitesToUpload.length} sites loaded`}
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                {/* Contract Upload */}
                <Grid item size={{ xs: 12, md: 6 }}>
                  <input
                    style={{ display: "none" }}
                    id="contract-upload"
                    type="file"
                    onChange={handleContractUpload}
                  />
                  <label htmlFor="contract-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<CloudUpload />}
                      endIcon={
                        contractFileName && <CheckCircle color="success" />
                      }
                      sx={{
                        height: 56,
                        borderWidth: 2,
                        borderStyle: "dashed",
                        textTransform: "none",
                        fontSize: 15,
                        justifyContent: "flex-start",
                        "&:hover": {
                          borderWidth: 2,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {contractFileName || "Upload Signed Contract *"}
                    </Button>
                  </label>
                </Grid>
              </Grid>
            </Paper>

            {/* Sites DataGrid */}
            {sitesToUpload.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "grey.50",
                  p: 3,
                  borderRadius: 2,
                  mb: 4,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <TableChart
                    sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Sites to Upload ({sitesToUpload.length})
                  </Typography>
                </Box>

                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={sitesToUpload}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    disableSelectionOnClick
                    sx={{
                      bgcolor: "white",
                      border: "none",
                      "& .datagrid-header": {
                        bgcolor: "primary.main",
                        color: "white",
                        fontWeight: 600,
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid #f0f0f0",
                      },
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Client Information */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Business
                  sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Client Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item size={12}>
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
                  <FormControl fullWidth required>
                    <InputLabel>Software</InputLabel>
                    <Select
                      value={formValues.software}
                      label="Software"
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          software: e.target.value,
                        })
                      }
                    >
                      {softwares.map((software) => (
                        <MenuItem key={software} value={software}>
                          {software}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <ContactPhone
                  sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                />
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

            {/* Contract Details */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <CalendarMonth
                  sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                />
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
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Payment & Invoicing */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Payment
                  sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  Payment & Invoicing
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item size={12}>
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

                <Grid item size={12}>
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

            {/* Submit Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={!isFormValid}
              sx={{
                py: 2,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                },
                "&:disabled": {
                  background: "grey.300",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit Handoff"
              )}
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbars */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Handoff submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HandoffForm;
