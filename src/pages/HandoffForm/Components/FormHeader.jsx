import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function FormHeader() {
  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 5,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          New Sales to Ops Handoff
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95 }}>
          Submit client information and site details
        </Typography>
      </Box>
    </>
  );
}

export default FormHeader;
