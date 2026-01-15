import {
  memo,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";

// Context
import { HandoffContext } from "../HandoffForm";

// MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// MUI Icons
import { Payment } from "@mui/icons-material";

const paymentMethods = ["ACH", "Check", "Wire", "3rd Party"];

const PaymentAndInvoicing = memo(function PaymentAndInvoicing() {
  const handoffContext = useContext(HandoffContext);
  const { formValues, setFormValues } = handoffContext;

  const [localInvoicing, setLocalInvoicing] = useState("");

  const syncTimeoutRef = useRef(null);

  const syncToParent = useCallback(
    (value) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Set new timeout to sync after 500ms of no typing
      syncTimeoutRef.current = setTimeout(() => {
        setFormValues((prev) => ({
          ...prev,
          invoicingDirections: value,
        }));
      }, 500);
    },
    [setFormValues]
  );

  useEffect(() => {
    setLocalInvoicing(formValues.invoicingDirections || "");
  }, [formValues.invoicingDirections]);

  const handleInvoicingChange = useCallback(
    (e) => {
      const value = e.target.value;
      setLocalInvoicing(value);
      syncToParent(value);
    },
    [syncToParent]
  );

  const handleInvoicingDirectionsBlur = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    setFormValues((prev) => ({
      ...prev,
      invoicingDirections: localInvoicing,
    }));
  }, [localInvoicing, setFormValues]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Payment sx={{ color: "primary.main", mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Payment & Invoicing
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Payment Terms"
            value={formValues.paymentTerms || ""}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                paymentTerms: e.target.value,
              })
            }
            required
            placeholder="e.g., Net 30, Due on Receipt"
            variant="outlined"
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={formValues.paymentMethod || ""}
              label="Payment Method"
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  paymentMethod: e.target.value,
                  // Clear 3rd party provider if switching away from 3rd Party
                  ...(e.target.value !== "3rd Party" && {
                    thirdPartyPaymentProvider: "",
                  }),
                })
              }
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {formValues.paymentMethod === "3rd Party" && (
          <Grid item size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="3rd Party Payment Provider"
              value={formValues.thirdPartyPaymentProvider || ""}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  thirdPartyPaymentProvider: e.target.value,
                })
              }
              required
              placeholder="e.g., Bill.com, AvidXchange, Stripe"
              variant="outlined"
            />
          </Grid>
        )}

        <Grid item size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Invoicing Directions"
            value={localInvoicing}
            onChange={handleInvoicingChange}
            onBlur={handleInvoicingDirectionsBlur}
            required
            multiline
            rows={4}
            placeholder="Specify invoicing frequency and timing (e.g., 'Per event - invoice after each service', 'Monthly at end of month', 'Monthly at beginning of month', 'Seasonally - invoice at end of season', etc.)"
            variant="outlined"
            helperText="Include details about when and how often invoices should be sent"
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default PaymentAndInvoicing;
