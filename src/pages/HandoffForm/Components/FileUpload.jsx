import { useContext, useState } from "react";
import { HandoffContext } from "../HandoffForm";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// MUI Icons
import {
  Description,
  Info,
  Download,
  TableChart,
  CloudUpload,
  CheckCircleOutline,
  CheckCircle,
  Delete,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";

// Constants
const OPTIONAL_COLUMNS = ["Site Map"];
const REQUIRED_COLUMNS = ["Store", "Address", "City", "State", "Zipcode"];

function FileUpload() {
  const handoffContext = useContext(HandoffContext);

  const {
    sitesToUpload,
    setSitesToUpload,
    contracts,
    setContracts,
    excelFileName,
    setExcelFileName,
    setError,
    setPricingColumns,
  } = handoffContext;

  const handleContractUpload = async (event) => {
    console.log("event target files", event.target.files);
    const files = Array.from(event.target.files);
    setContracts([...contracts, ...files]);
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

  // Excel Upload Handler

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
          address: site["Address"] || "",
          city: site["City"] || "",
          state: site["State"] || "",
          zipcode: site["Zipcode"] || "",
          store: site["Store"] || "",
          rowId: index + 1,
          siteMapUrl: site["Site Map"] || "",
        }));
        console.log("sites with ids", sitesWithIds);
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

  const handleRemoveContract = (indexToRemove) => () => {
    setContracts(contracts.filter((_, index) => index !== indexToRemove));
  };

  return (
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
        <Description sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
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
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Info sx={{ color: "info.main", mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Excel File Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
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
                        <Info sx={{ fontSize: 16, color: "info.main" }} />
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
            multiple
          />
          <label htmlFor="contract-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<CloudUpload />}
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
              Upload Signed Contract(s) *
            </Button>
          </label>

          {contracts.length > 0 &&
            contracts.map((contract, index) => (
              <Box
                sx={{ display: "flex", alignItems: "center", mt: 1 }}
                key={index}
              >
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {contract.name}
                </Typography>{" "}
                <IconButton onClick={handleRemoveContract(index)}>
                  <Delete color="error" size="small" />
                </IconButton>
              </Box>
            ))}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FileUpload;
