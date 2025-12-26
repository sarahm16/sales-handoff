import { memo, useContext, useCallback } from "react";
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// MUI Data Grid
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import PriceCheck from "@mui/icons-material/PriceCheck";

// Constants
import { units } from "../../../constants";

// Memoized cell renderers
const ExcelColumnCell = memo(({ value, rowIndex }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Chip
      label={rowIndex + 1}
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
      {value}
    </Typography>
  </Box>
));

const ServiceNameCell = memo(({ value, id, onChange, services }) => (
  <Select
    value={value}
    onChange={(e) => onChange(id, "Name", e.target.value)}
    size="small"
    fullWidth
    sx={{
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
      "& .MuiSelect-select": { py: 0.5 },
    }}
  >
    {services.map((service) => (
      <MenuItem key={service} value={service}>
        {service}
      </MenuItem>
    ))}
  </Select>
));

const VolumeCell = memo(({ value, id, onChange }) => (
  <TextField
    value={value}
    onChange={(e) => onChange(id, "Volume", e.target.value)}
    size="small"
    fullWidth
    placeholder="0"
    sx={{
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
      "& .MuiInputBase-input": { py: 0.5, textAlign: "center" },
    }}
  />
));

const UnitCell = memo(({ value, id, onChange }) => (
  <Select
    value={value}
    onChange={(e) => onChange(id, "Unit", e.target.value)}
    size="small"
    fullWidth
    sx={{
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
      "& .MuiSelect-select": { py: 0.5 },
    }}
  >
    {units.map((unit) => (
      <MenuItem key={unit} value={unit}>
        {unit}
      </MenuItem>
    ))}
  </Select>
));

const AddlInfoCell = memo(({ value, id, onChange }) => (
  <TextField
    value={value}
    onChange={(e) => onChange(id, "AddlInfo", e.target.value)}
    size="small"
    fullWidth
    placeholder="Optional notes..."
    sx={{
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
      "& .MuiInputBase-input": { py: 0.5 },
    }}
  />
));

export const PricingConfiguration = memo(function PricingConfiguration() {
  const { pricingColumns, setPricingColumns, availableServices } =
    useContext(HandoffContext);

  // Single optimized handler for all field changes
  const handleCellChange = useCallback(
    (id, field, value) => {
      setPricingColumns((prev) =>
        prev.map((col) => (col.id === id ? { ...col, [field]: value } : col))
      );
    },
    [setPricingColumns]
  );

  // Memoized columns configuration
  const columns = [
    {
      field: "column",
      headerName: "Excel Column",
      width: 180,
      headerClassName: "pricing-header",
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
        return <ExcelColumnCell value={params.value} rowIndex={rowIndex} />;
      },
    },
    {
      field: "Name",
      headerName: "Service Name",
      width: 250,
      headerClassName: "pricing-header",
      renderCell: (params) => (
        <ServiceNameCell
          value={params.value}
          id={params.id}
          onChange={handleCellChange}
          services={availableServices}
        />
      ),
    },
    {
      field: "Volume",
      headerName: "Volume",
      width: 100,
      headerClassName: "pricing-header",
      renderCell: (params) => (
        <VolumeCell
          value={params.value}
          id={params.id}
          onChange={handleCellChange}
        />
      ),
    },
    {
      field: "Unit",
      headerName: "Unit",
      width: 140,
      headerClassName: "pricing-header",
      renderCell: (params) => (
        <UnitCell
          value={params.value}
          id={params.id}
          onChange={handleCellChange}
        />
      ),
    },
    {
      field: "AddlInfo",
      headerName: "Additional Info",
      flex: 1,
      minWidth: 200,
      headerClassName: "pricing-header",
      renderCell: (params) => (
        <AddlInfoCell
          value={params.value}
          id={params.id}
          onChange={handleCellChange}
        />
      ),
    },
  ];

  return (
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
        <PriceCheck sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Service & Pricing Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Map your Excel columns to services and configure pricing details
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
          columns={columns}
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
  );
});
