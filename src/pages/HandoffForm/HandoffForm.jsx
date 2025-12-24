import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Stack,
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
  Download,
  CheckCircleOutline,
  Info,
  PriceCheck,
  Settings,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

// Constants
import {
  serviceLines,
  serviceLineServices,
  softwares,
  units,
} from "../../constants";

// Auth
import { useAuth } from "../../auth/useAuth";

// API
import { saveItemToAzure } from "../../api/azureApi";
import { saveImagesToBlobStorage } from "../../api/blobStorageApi";
import { getCoordsForAnArray } from "../../api/mapsAPI";

const serviceLineOptions = serviceLines.map((sl) => ({
  ...sl,
  assignedTo: "",
  dueDate: "",
  priority: "",
  pricing: [],
}));

const renewalOptions = ["Auto-Renewing", "Fixed Term"];

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
  renewal: "Auto-Renewing",
  duration: "",
  annualEscalation: "",
  startDate: "",
  endDate: "",
  notes: [],
};

const REQUIRED_COLUMNS = ["Store", "Address", "City", "State", "Zipcode"];
const OPTIONAL_COLUMNS = ["Site Map"];
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
  const [pricingColumns, setPricingColumns] = useState([]);

  const availableServices = useMemo(
    () => serviceLineServices[formValues.serviceLine?.name] || [],
    [formValues.serviceLine]
  );

  const handleContractUpload = async (event) => {
    const file = event.target.files[0];
    setContract(file);
    setContractFileName(file?.name || "");
  };

  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        Store: "Store Name",
        Address: "123 Main St",
        City: "Seattle",
        State: "WA",
        Zipcode: "98101",
        "Site Map": "https://example.com/sitemap.jpg (optional)",
      },
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Store
      { wch: 20 }, // Address
      { wch: 15 }, // City
      { wch: 8 }, // State
      { wch: 10 }, // Zipcode
      { wch: 40 }, // Site Map
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sites");

    // Download file
    XLSX.writeFile(wb, "sites_template.xlsx");
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
        // Add unique id and normalize Site Map column
        const sitesWithIds = jsonData.map((site, index) => ({
          ...site,
          rowId: index + 1,
          siteMapUrl: site["Site Map"] || "",
        }));
        setSitesToUpload(sitesWithIds);
        setExcelFileName(file.name);

        const pricingColumnNames = Object.keys(jsonData[0])?.filter(
          (key) => !REQUIRED_COLUMNS.includes(key) && key !== "Site Map"
        );
        setPricingColumns(
          pricingColumnNames.map((col) => ({
            id: uuidv4(),
            column: col,
            Name: "",
            Price: 0,
            Service: "",
            AddlInfo: "",
            Unit: "Service",
            Volume: "0",
          }))
        );
      }
    };

    reader.readAsArrayBuffer(file);
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

      // Get Geo Coordinates for sites
      const sitesWithCoordinates = await getCoordsForAnArray(sitesToUpload);

      // Save each site with handoff ID
      for (const site of sitesWithCoordinates) {
        await saveItemToAzure("sites", {
          ...site,
          handoffId,
          siteMapUrl: site.siteMapUrl || null,
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
    (formValues.renewal === "Fixed Term" ? formValues.duration : true);

  // DataGrid columns
  const columns = [
    {
      field: "rowId",
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
      field: "siteMapUrl",
      headerName: "Site Map URL",
      width: 300,
      headerClassName: "datagrid-header",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.value ? (
            <Tooltip title={params.value}>
              <Chip
                icon={<ImageIcon />}
                label="Site Map Provided"
                size="small"
                color="success"
                sx={{ maxWidth: 280 }}
              />
            </Tooltip>
          ) : (
            <Chip
              label="No Site Map"
              size="small"
              variant="outlined"
              sx={{ maxWidth: 280 }}
            />
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
            {/* Client Information - Moved to top */}
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

            <Divider sx={{ my: 4 }} />

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

              {/* Excel Upload Instructions */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "info.50",
                  border: "1px solid",
                  borderColor: "info.200",
                  p: 2.5,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
                  <Info sx={{ color: "info.main", mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Excel File Requirements
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                    >
                      Your Excel file must contain the following columns:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                          display="block"
                        >
                          Required Columns:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {REQUIRED_COLUMNS.map((col) => (
                            <ListItem key={col} sx={{ py: 0, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <CheckCircleOutline
                                  sx={{ fontSize: 16, color: "success.main" }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={col}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: 500,
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                          display="block"
                        >
                          Optional Columns:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {OPTIONAL_COLUMNS.map((col) => (
                            <ListItem key={col} sx={{ py: 0, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <Info
                                  sx={{ fontSize: 16, color: "info.main" }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={col}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: 500,
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Download />}
                      onClick={handleDownloadTemplate}
                      sx={{ mt: 1, textTransform: "none" }}
                    >
                      Download Template
                    </Button>
                  </Box>
                </Box>
              </Paper>

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
                    getRowId={(row) => row.rowId}
                    rows={sitesToUpload}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10 },
                      },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
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

            {/* Pricing Configuration - Compact DataGrid Design */}
            {pricingColumns.length > 0 &&
              availableServices.length > 0 &&
              sitesToUpload.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "grey.50",
                    p: 3,
                    borderRadius: 2,
                    mb: 4,
                    border: "2px solid",
                    borderColor: "primary.100",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PriceCheck
                      sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Service & Pricing Configuration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Map your Excel columns to services and configure pricing
                        details
                      </Typography>
                    </Box>
                    <Chip
                      label={`${pricingColumns.length} columns`}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      height: Math.min(600, pricingColumns.length * 52 + 110),
                      width: "100%",
                    }}
                  >
                    <DataGrid
                      getRowId={(row) => row.id}
                      rows={pricingColumns}
                      columns={[
                        {
                          field: "column",
                          headerName: "Excel Column",
                          width: 180,
                          headerClassName: "pricing-header",
                          renderCell: (params) => (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={
                                  params.api.getRowIndexRelativeToVisibleRows(
                                    params.id
                                  ) + 1
                                }
                                size="small"
                                sx={{
                                  bgcolor: "primary.50",
                                  color: "primary.main",
                                  fontWeight: 600,
                                  minWidth: 28,
                                  height: 24,
                                }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {params.value}
                              </Typography>
                            </Box>
                          ),
                        },
                        {
                          field: "Name",
                          headerName: "Service Name",
                          width: 250,
                          editable: false,
                          headerClassName: "pricing-header",
                          renderCell: (params) => (
                            <Select
                              value={params.value}
                              onChange={(e) => {
                                const updatedColumns = pricingColumns.map(
                                  (col) =>
                                    col.id === params.id
                                      ? { ...col, Name: e.target.value }
                                      : col
                                );
                                setPricingColumns(updatedColumns);
                              }}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiSelect-select": { py: 0.5 },
                              }}
                            >
                              {availableServices.map((service) => (
                                <MenuItem key={service} value={service}>
                                  {service}
                                </MenuItem>
                              ))}
                            </Select>
                          ),
                        },
                        {
                          field: "Volume",
                          headerName: "Volume",
                          width: 100,
                          editable: false,
                          headerClassName: "pricing-header",
                          renderCell: (params) => (
                            <TextField
                              value={params.value}
                              onChange={(e) => {
                                const updatedColumns = pricingColumns.map(
                                  (col) =>
                                    col.id === params.id
                                      ? { ...col, Volume: e.target.value }
                                      : col
                                );
                                setPricingColumns(updatedColumns);
                              }}
                              size="small"
                              fullWidth
                              placeholder="0"
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiInputBase-input": {
                                  py: 0.5,
                                  textAlign: "center",
                                },
                              }}
                            />
                          ),
                        },
                        {
                          field: "Unit",
                          headerName: "Unit",
                          width: 140,
                          editable: false,
                          headerClassName: "pricing-header",
                          renderCell: (params) => (
                            <Select
                              value={params.value}
                              onChange={(e) => {
                                const updatedColumns = pricingColumns.map(
                                  (col) =>
                                    col.id === params.id
                                      ? { ...col, Unit: e.target.value }
                                      : col
                                );
                                setPricingColumns(updatedColumns);
                              }}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiSelect-select": { py: 0.5 },
                              }}
                            >
                              {units.map((unit) => (
                                <MenuItem key={unit} value={unit}>
                                  {unit}
                                </MenuItem>
                              ))}
                            </Select>
                          ),
                        },
                        {
                          field: "AddlInfo",
                          headerName: "Additional Info",
                          flex: 1,
                          minWidth: 200,
                          editable: false,
                          headerClassName: "pricing-header",
                          renderCell: (params) => (
                            <TextField
                              value={params.value}
                              onChange={(e) => {
                                const updatedColumns = pricingColumns.map(
                                  (col) =>
                                    col.id === params.id
                                      ? { ...col, AddlInfo: e.target.value }
                                      : col
                                );
                                setPricingColumns(updatedColumns);
                              }}
                              size="small"
                              fullWidth
                              placeholder="Optional notes..."
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiInputBase-input": { py: 0.5 },
                              }}
                            />
                          ),
                        },
                      ]}
                      disableRowSelectionOnClick
                      hideFooter={pricingColumns.length <= 10}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10 },
                        },
                      }}
                      pageSizeOptions={[10, 25, 50]}
                      sx={{
                        bgcolor: "white",
                        border: "none",
                        "& .pricing-header": {
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600,
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: "1px solid #f0f0f0",
                          py: 0.5,
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-cell:focus-within": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-row:hover": {
                          bgcolor: "primary.50",
                        },
                      }}
                    />
                  </Box>
                </Paper>
              )}

            <Divider sx={{ my: 4 }} />

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
