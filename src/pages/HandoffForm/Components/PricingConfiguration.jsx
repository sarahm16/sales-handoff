import {
  memo,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

// MUI Data Grid
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import PriceCheck from "@mui/icons-material/PriceCheck";

// Constants
import { units } from "../../../constants";

const PricingConfiguration = memo(function PricingConfiguration() {
  const { pricingColumns, setPricingColumns, availableServices } =
    useContext(HandoffContext);

  // Local state for fast editing - changes happen here instantly
  const [localRows, setLocalRows] = useState(pricingColumns);

  // Use ref to always have latest localRows value (avoids stale closure)
  const localRowsRef = useRef(localRows);

  // Keep ref in sync with state
  useEffect(() => {
    localRowsRef.current = localRows;
  }, [localRows]);

  // Sync local state when parent state changes (e.g., new Excel upload)
  useEffect(() => {
    setLocalRows(pricingColumns);
  }, [pricingColumns]);

  // Update parent state when user stops editing a cell
  const handleCellEditStop = useCallback(() => {
    console.log("Cell edit stopped, syncing to parent:", localRowsRef.current);
    // Use ref to get the latest value (not stale closure)
    setPricingColumns(localRowsRef.current);
  }, [setPricingColumns]);

  // Process row updates in local state only (fast!)
  const processRowUpdate = useCallback(
    (newRow, oldRow) => {
      console.log("Processing row update:", { newRow, oldRow });

      // Update local state immediately for instant feedback
      const updatedRows = localRowsRef.current.map((row) =>
        row.id === newRow.id ? newRow : row
      );

      setLocalRows(updatedRows);

      // ✅ SYNC TO PARENT IMMEDIATELY
      // This ensures changes are saved even when jumping between rows
      setPricingColumns(updatedRows);

      return newRow;
    },
    [setPricingColumns]
  );

  // Handle any errors during row update
  const handleProcessRowUpdateError = useCallback((error) => {
    console.error("Error updating row:", error);
  }, []);

  // Memoize columns configuration
  const columns = useMemo(
    () => [
      {
        field: "column",
        headerName: "Excel Column",
        width: 180,
        editable: false,
        headerClassName: "pricing-header",
        renderCell: (params) => {
          const rowIndex = params.api.getRowIndexRelativeToVisibleRows(
            params.id
          );
          return (
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
                {params.value}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "Name",
        headerName: "Service Name",
        width: 250,
        editable: true,
        type: "singleSelect",
        valueOptions: availableServices,
        headerClassName: "pricing-header",
      },
      {
        field: "Volume",
        headerName: "Volume",
        width: 100,
        editable: true,
        headerClassName: "pricing-header",
      },
      {
        field: "Unit",
        headerName: "Unit",
        width: 140,
        editable: true,
        type: "singleSelect",
        valueOptions: units,
        headerClassName: "pricing-header",
      },
      {
        field: "AddlInfo",
        headerName: "Additional Info",
        flex: 1,
        minWidth: 200,
        editable: true,
        headerClassName: "pricing-header",
      },
    ],
    [availableServices]
  );

  // Memoize grid height calculation
  const gridHeight = useMemo(
    () => Math.min(600, localRows.length * 52 + 110),
    [localRows.length]
  );

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
            Double-click any cell to edit - changes save when you press Enter or
            click away
          </Typography>
        </Box>
        <Chip
          label={`${localRows.length} columns`}
          color="primary"
          size="small"
        />
      </Box>

      <Box sx={{ height: gridHeight, width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.id}
          rows={localRows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter={localRows.length <= 10}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          // Key props for cell editing with local state
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onCellEditStop={handleCellEditStop}
          // Performance optimizations
          disableVirtualization={false}
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
            "& .MuiDataGrid-cell--editable": {
              cursor: "cell",
              bgcolor: "grey.50",
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
            "& .MuiDataGrid-cell--editing": {
              bgcolor: "primary.50",
              boxShadow: "inset 0 0 0 2px",
              boxShadowColor: "primary.main",
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

PricingConfiguration.displayName = "PricingConfiguration";

export default PricingConfiguration;
