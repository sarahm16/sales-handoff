import { createContext, useMemo, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

// MUI Components
import {
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Container,
  Divider,
  Tooltip,
} from "@mui/material";

// Constants
import { serviceLineServices } from "../../constants";

// Auth
import { useAuth } from "../../auth/useAuth";

// API
import { saveItemToAzure } from "../../api/azureApi";
import { saveImagesToBlobStorage } from "../../api/blobStorageApi";
import { getCoordsForAnArray } from "../../api/mapsAPI";

// Components
import FormHeader from "./Components/FormHeader";
import ClientInformation from "./Components/ClientInformation";
import FileUpload from "./Components/FileUpload";
import SitesDataGrid from "./Components/SitesDataGrid";
import PricingConfiguration from "./Components/PricingConfiguration";
import ContactInfo from "./Components/ContactInfo";
import ContractDetails from "./Components/ContractDetails";
import PaymentAndInvoicing from "./Components/PaymentAndInvoicing";
import ValidationSummary from "./Components/ValidationSummary";

export const HandoffContext = createContext({
  formValues: {},
  updateFormValues: () => {},
  sitesToUpload: [],
  setSitesToUpload: () => {},
  contract: null,
  setContract: () => {},
  excelFileName: "",
  setExcelFileName: () => {},
  contractFileName: "",
  setContractFileName: () => {},
  error: "",
  setError: () => {},
  pricingColumns: [],
  setPricingColumns: () => {},
  availableServices: [],
});

const initialFormValues = {
  client: "",
  contractUrl: "",
  serviceLine: {
    name: "Snow",
    id: 2,
    assignedTo: "",
    dueDate: "",
    priority: "",
    pricing: [],
  },
  status: "Pending",
  handoffId: "",
  paymentTerms: "",
  invoicingDirections: "",
  software: "No Portal",
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

function HandoffForm() {
  const user = useAuth()?.user;
  const email = user?.email || "unknown_user";
  const [sitesToUpload, setSitesToUpload] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState("");
  const [contract, setContract] = useState(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [contractFileName, setContractFileName] = useState("");
  const [success, setSuccess] = useState(false);
  const [pricingColumns, setPricingColumns] = useState([]);

  // Memoize available services
  const availableServices = useMemo(
    () => serviceLineServices[formValues.serviceLine?.name] || [],
    [formValues.serviceLine?.name]
  );

  // Memoize form validation
  const isFormValid = useMemo(
    () =>
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
      (formValues.renewal === "Fixed Term" ? formValues.duration : true),
    [
      loading,
      contract,
      sitesToUpload.length,
      formValues.client,
      formValues.serviceLine,
      formValues.paymentTerms,
      formValues.invoicingDirections,
      formValues.software,
      formValues.contact.name,
      formValues.contact.email,
      formValues.contact.phone,
      formValues.renewal,
      formValues.startDate,
      formValues.duration,
    ]
  );

  // Memoize handlers with useCallback
  const handleSubmit = useCallback(async () => {
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
        createdBy: user,
        createdByEmail: email,
        createdAt: new Date().toISOString(),
      });

      const handoffId = handoffResponse.id;

      // Get Geo Coordinates for sites
      const sitesWithCoordinates = await getCoordsForAnArray(sitesToUpload);

      // Save each site with handoff ID
      for (const site of sitesWithCoordinates) {
        const serviceLine = {
          ...formValues.serviceLine,
          pricing: pricingColumns.map((col) => ({
            ...col,
            Price: site[col.column] || 0,
          })),
        };

        const siteToSave = {
          address: site.address,
          city: site.city,
          state: site.state,
          zipcode: site.zipcode,
          store: site.store,
          siteMapUrl: site.siteMapUrl || "",
          lat: site.lat,
          lng: site.lng,
          client: formValues.client,
          serviceLines: [serviceLine],
          handoffId: handoffId,
          subcontractors: [],
        };

        console.log("saving site for handoff", siteToSave);

        console.log("service line to save", serviceLine);
        await saveItemToAzure("sites", siteToSave);
      }

      setSuccess(true);

      // Reset form
      setFormValues(initialFormValues);
      setSitesToUpload([]);
      setContract(null);
      setExcelFileName("");
      setContractFileName("");
      setPricingColumns([]);
    } catch (err) {
      setError("Failed to submit handoff. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [contract, formValues, sitesToUpload, user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      formValues,
      setFormValues,
      sitesToUpload,
      setSitesToUpload,
      contract,
      setContract,
      excelFileName,
      setExcelFileName,
      contractFileName,
      setContractFileName,
      error,
      setError,
      pricingColumns,
      setPricingColumns,
      availableServices,
    }),
    [
      formValues,
      sitesToUpload,
      contract,
      excelFileName,
      contractFileName,
      error,
      pricingColumns,
      availableServices,
    ]
  );

  // Memoize conditional render checks
  const showSitesGrid = useMemo(
    () => sitesToUpload.length > 0,
    [sitesToUpload.length]
  );

  const showPricingConfig = useMemo(
    () =>
      pricingColumns.length > 0 &&
      availableServices.length > 0 &&
      sitesToUpload.length > 0,
    [pricingColumns.length, availableServices.length, sitesToUpload.length]
  );

  return (
    <HandoffContext.Provider value={contextValue}>
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
            <FormHeader />

            <CardContent sx={{ p: 5 }}>
              {/* Client Information */}
              <ClientInformation />

              <Divider sx={{ my: 4 }} />

              {/* File Upload Section */}
              <FileUpload />

              {/* Sites DataGrid */}
              {showSitesGrid && <SitesDataGrid />}

              {/* Pricing Configuration */}
              {showPricingConfig && <PricingConfiguration />}

              <Divider sx={{ my: 4 }} />

              {/* Contact Information */}
              <ContactInfo />

              {/* Contract Details */}
              <ContractDetails />

              {/* Payment & Invoicing */}
              <PaymentAndInvoicing />

              {/* Validation Summary */}
              <ValidationSummary
                contract={contract}
                sitesToUpload={sitesToUpload}
                formValues={formValues}
                isFormValid={isFormValid}
              />

              {/* Submit Button */}
              <Tooltip
                title={
                  !isFormValid
                    ? "Please complete all required fields above"
                    : ""
                }
                arrow
                placement="top"
              >
                <span>
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
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                </span>
              </Tooltip>
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
    </HandoffContext.Provider>
  );
}

export default HandoffForm;
