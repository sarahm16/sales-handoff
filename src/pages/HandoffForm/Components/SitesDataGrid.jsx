import { useContext } from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Components
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

// MUI Data Grid
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import TableChart from "@mui/icons-material/TableChart";
import ImageIcon from "@mui/icons-material/Image";

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

function SitesDataGrid() {
  const handoffContext = useContext(HandoffContext);
  const { sitesToUpload } = handoffContext;

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
        <TableChart sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
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
  );
}

export default SitesDataGrid;
