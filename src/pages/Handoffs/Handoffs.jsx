import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// MUI Components
import {
  Box,
  Container,
  Card,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// MUI Icons
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  TrendingUp,
  Launch,
} from "@mui/icons-material";

// API
import { getItemsFromAzure } from "../../api/azureApi";

// Status color mapping
const statusColors = {
  Pending: "warning",
  "In Progress": "info",
  Approved: "success",
  Cancelled: "error",
  "On Hold": "default",
};

// Status icons
const statusIcons = {
  Pending: <HourglassEmpty fontSize="small" />,
  "In Progress": <TrendingUp fontSize="small" />,
  Approved: <CheckCircle fontSize="small" />,
  Cancelled: <Cancel fontSize="small" />,
  "On Hold": <HourglassEmpty fontSize="small" />,
};

function HandoffsPage() {
  const navigate = useNavigate();
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch handoffs on mount
  useEffect(() => {
    fetchHandoffs();
  }, []);

  const fetchHandoffs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItemsFromAzure("handoffs");
      setHandoffs(data);
    } catch (err) {
      setError("Failed to load handoffs. Please try again.");
      console.error("Error fetching handoffs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle view handoff details
  const handleViewHandoff = useCallback(
    (handoff) => {
      navigate(`/handoffs/${handoff.id}`);
    },
    [navigate]
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Memoize columns configuration
  const columns = useMemo(
    () => [
      {
        field: "client",
        headerName: "Client",
        flex: 1,
        minWidth: 200,
        headerClassName: "handoffs-header",
      },
      {
        field: "serviceLine",
        headerName: "Service Line",
        width: 150,
        headerClassName: "handoffs-header",
        valueGetter: (value, row) => row.serviceLine?.name || "N/A",
      },
      {
        field: "numberOfSites",
        headerName: "Sites",
        width: 100,
        headerClassName: "handoffs-header",
        align: "center",
        headerAlign: "center",
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        headerClassName: "handoffs-header",
        renderCell: (params) => (
          <Chip
            icon={statusIcons[params.value] || statusIcons.Pending}
            label={params.value}
            color={statusColors[params.value] || "default"}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        field: "startDate",
        headerName: "Start Date",
        width: 130,
        headerClassName: "handoffs-header",
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: "endDate",
        headerName: "End Date",
        width: 130,
        headerClassName: "handoffs-header",
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: "renewal",
        headerName: "Renewal",
        width: 130,
        headerClassName: "handoffs-header",
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color={params.value === "Auto-Renewing" ? "success" : "default"}
          />
        ),
      },
      {
        field: "createdBy",
        headerName: "Created By",
        width: 150,
        headerClassName: "handoffs-header",
      },
      {
        field: "createdAt",
        headerName: "Submitted",
        width: 130,
        headerClassName: "handoffs-header",
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        headerClassName: "handoffs-header",
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewHandoff(params.row)}
              sx={{
                color: "primary.main",
                "&:hover": { bgcolor: "primary.50" },
              }}
            >
              <Launch fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [handleViewHandoff]
  );

  // Summary statistics
  const stats = useMemo(() => {
    const total = handoffs.length;
    const pending = handoffs.filter((h) => h.status === "Pending").length;
    const inProgress = handoffs.filter(
      (h) => h.status === "In Progress"
    ).length;
    const approved = handoffs.filter((h) => h.status === "Approved").length;
    const totalSites = handoffs.reduce(
      (sum, h) => sum + (h.numberOfSites || 0),
      0
    );

    return { total, pending, inProgress, approved, totalSites };
  }, [handoffs]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 6, px: 2, bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Sales to Ops Handoffs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage all client handoffs from sales to operations
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <Card sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Handoffs
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {stats.total}
            </Typography>
          </Card>

          <Card sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pending
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {stats.pending}
              </Typography>
              <HourglassEmpty color="warning" />
            </Box>
          </Card>

          <Card sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              In Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {stats.inProgress}
              </Typography>
              <TrendingUp color="info" />
            </Box>
          </Card>

          <Card sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Approved
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.approved}
              </Typography>
              <CheckCircle color="success" />
            </Box>
          </Card>

          <Card sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Sites
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {stats.totalSites}
            </Typography>
          </Card>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* DataGrid */}
        <Card elevation={2}>
          <Box sx={{ height: 700, width: "100%" }}>
            <DataGrid
              rows={handoffs}
              columns={columns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
                sorting: {
                  sortModel: [{ field: "createdAt", sort: "desc" }],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                border: "none",
                "& .handoffs-header": {
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: 600,
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f0f0f0",
                },
                "& .MuiDataGrid-row:hover": {
                  bgcolor: "primary.50",
                  cursor: "pointer",
                },
              }}
            />
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default HandoffsPage;
