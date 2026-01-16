import {
  createContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
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
  Grid,
  Paper,
} from "@mui/material";

// Constants
import { serviceLineServices, serviceTypes } from "../../constants";

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
  availableServiceTypes: [],
});

const initialFormValues = {
  client: "",
  address: "",
  documents: [],
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
    noContact: false,
  },
  billingContact: {
    name: "",
    email: "",
    phone: "",
    noContact: false,
  },
  paymentMethod: "",
  thirdPartyPaymentProvider: "",
  renewal: "Auto-Renewing",
  duration: "",
  annualEscalation: "",
  startDate: "",
  endDate: "",
  notes: [],
  lat: 0,
  lng: 0,
  newClient: false,
  serviceType: "Per Event",
};

// Service types by service line
const getServiceTypesByServiceLine = (serviceLineName) => {
  switch (serviceLineName) {
    case "Snow":
      return ["Per Event", "Per Season", "Per Push"];
    case "Janitorial":
    case "Landscaping":
    case "Lot Sweeping":
      return ["Per Service"];
    case "On Demand":
      return ["1 Time Service"];
    default:
      return ["Per Event"];
  }
};

function HandoffForm() {
  const user = useAuth()?.user;
  const email = user?.mail || "unknown_user";
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

  // Memoize available service types based on service line
  const availableServiceTypes = useMemo(
    () => getServiceTypesByServiceLine(formValues.serviceLine?.name),
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
      // Regular contact validation
      (formValues.contact.noContact ||
        (formValues.contact.name &&
          formValues.contact.email &&
          formValues.contact.phone)) &&
      // Billing contact validation
      (formValues.billingContact.noContact ||
        (formValues.billingContact.name &&
          formValues.billingContact.email &&
          formValues.billingContact.phone)) &&
      formValues.paymentMethod &&
      (formValues.paymentMethod !== "3rd Party" ||
        formValues.thirdPartyPaymentProvider) &&
      formValues.renewal &&
      formValues.startDate &&
      (formValues.renewal === "Fixed Term" ? formValues.duration : true) &&
      formValues.address,
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
      formValues.contact.noContact,
      formValues.billingContact.name,
      formValues.billingContact.email,
      formValues.billingContact.phone,
      formValues.billingContact.noContact,
      formValues.paymentMethod,
      formValues.thirdPartyPaymentProvider,
      formValues.renewal,
      formValues.startDate,
      formValues.duration,
      formValues.address,
    ]
  );

  useEffect(() => {
    console.log("Form Values Updated: ", formValues);
  }, [formValues]);

  // Update service type when service line changes
  useEffect(() => {
    const newServiceTypes = getServiceTypesByServiceLine(
      formValues.serviceLine?.name
    );
    if (!newServiceTypes.includes(formValues.serviceType)) {
      setFormValues((prev) => ({
        ...prev,
        serviceType: newServiceTypes[0],
      }));
    }
  }, [formValues.serviceLine?.name, formValues.serviceType]);

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
        activity: [
          {
            date: new Date().getTime(),
            user,
            action: "Created handoff",
          },
        ],
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
          demo: true, // Remove in production
          address: site.address,
          city: site.city,
          state: site.state,
          zipcode: site.zipcode,
          store: site.store,
          siteMapUrl: site.siteMapUrl || "",
          lat: site.lat,
          lng: site.lng,
          client: formValues.client?.trim(),
          serviceLines: [serviceLine],
          handoffId: handoffId,
          subcontractors: [],
          status: "Pending",
          activity: [
            {
              date: new Date().getTime(),
              user,
              action: "Created site for handoff",
            },
          ],
          software: formValues.software,
        };

        console.log("saving site for handoff", siteToSave);
        console.log("service line to save", serviceLine);
        await saveItemToAzure("sites", siteToSave);
      }

      // If new client, save to clients container
      if (formValues?.newClient) {
        const newClient = {
          demo: true, // Remove in production
          client: formValues.client?.trim(),
          address: formValues.address,
          lat: formValues.lat,
          lng: formValues.lng,
          contact: formValues.contact.noContact
            ? { noContact: true }
            : {
                name: formValues.contact.name,
                email: formValues.contact.email,
                phone: formValues.contact.phone,
                secondaryName: formValues.contact.secondaryName,
                secondaryEmail: formValues.contact.secondaryEmail,
                secondaryPhone: formValues.contact.secondaryPhone,
                quickbooksId: "",
              },
          billingContact: formValues.billingContact.noContact
            ? { noContact: true }
            : {
                name: formValues.billingContact.name,
                email: formValues.billingContact.email,
                phone: formValues.billingContact.phone,
              },
          documents: [
            {
              name: contract.name,
              url: contractUrl[0],
            },
          ],
          serviceLines: [formValues.serviceLine],
          software: formValues.software,
          status: "Pending",
          paymentMethod: formValues.paymentMethod,
          thirdPartyPaymentProvider: formValues.thirdPartyPaymentProvider,
          createdBy: user,
          createdByEmail: email,
          createdAt: new Date().toISOString(),
          activity: [
            {
              date: new Date().getTime(),
              user,
              action: "Created client for handoff",
            },
          ],
          handoffId: handoffId,
        };
        console.log("saving new client", newClient);
        await saveItemToAzure("clients", newClient);
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
  }, [contract, formValues, sitesToUpload, user, email, pricingColumns]);

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
      availableServiceTypes,
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
      availableServiceTypes,
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
        <Container>
          <Grid container spacing={3}>
            {/* Left Column - Form */}
            <Grid size={{ xs: 12, lg: 8 }}>
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

                  {/* Submit Button */}
                  <Tooltip
                    title={
                      !isFormValid ? "Please complete all required fields" : ""
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
                          mt: 4,
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
            </Grid>

            {/* Right Column - Validation Summary (Sticky) */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                elevation={4}
                sx={{
                  position: "sticky",
                  top: 24,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <ValidationSummary
                  contract={contract}
                  sitesToUpload={sitesToUpload}
                  formValues={formValues}
                  isFormValid={isFormValid}
                />
              </Paper>
            </Grid>
          </Grid>
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
