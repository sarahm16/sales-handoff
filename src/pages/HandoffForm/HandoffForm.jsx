import { useState } from "react";
import * as XLSX from "xlsx";

// Mock constants - replace with your actual imports
const serviceLines = ["Service Line 1", "Service Line 2", "Service Line 3"];
const softwares = ["Software A", "Software B", "Software C"];

// Mock auth - replace with your actual auth
const useAuth = () => ({
  user: { name: "Demo User", email: "demo@example.com" },
});

// Mock API - replace with your actual API
const saveItemToAzure = async (container, data) => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ id: Math.random().toString(36).substr(2, 9) }),
      1000
    );
  });
};

const initialFormValues = {
  client: "",
  contract: "",
  serviceLine: "",
  status: "Pending",
  handoffId: "",
  paymentTerms: "",
  invoicingDirections: "",
  software: "",
};

const REQUIRED_COLUMNS = ["Store", "Address", "City", "State", "Zipcode"];
const REQUIRED_FIELDS = [
  "client",
  "contract",
  "serviceLine",
  "paymentTerms",
  "invoicingDirections",
  "software",
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

  const handleContractUpload = async (event) => {
    const file = event.target.files[0];
    setContract(file);
    setContractFileName(file?.name || "");
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
        setSitesToUpload(jsonData);
        setExcelFileName(file.name);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const handoffResponse = await saveItemToAzure("handoffs", {
        ...formValues,
        createdBy: user.name,
        createdByEmail: user.email,
        createdAt: new Date().toISOString(),
      });

      const handoffId = handoffResponse.id;
      alert(`Handoff submitted successfully! ID: ${handoffId}`);

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
    REQUIRED_FIELDS.every((field) => formValues[field]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "40px",
            color: "white",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "600" }}>
            New Handoff
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "16px" }}>
            Submit client information and site details
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              margin: "20px 40px 0",
              padding: "16px",
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c33",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#c33",
                cursor: "pointer",
                fontSize: "20px",
                padding: "0",
                lineHeight: "1",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <div style={{ padding: "40px" }}>
          {/* File Upload Section */}
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "32px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              📄 Document Uploads
            </h3>

            {/* Sites Excel Upload */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#555",
                }}
              >
                Sites Excel File *
              </label>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  background: "white",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#667eea")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#ddd")
                }
              >
                <span style={{ fontSize: "24px" }}>📊</span>
                <span
                  style={{ flex: 1, color: excelFileName ? "#333" : "#999" }}
                >
                  {excelFileName || "Choose Excel file..."}
                </span>
                {excelFileName && (
                  <span style={{ color: "#667eea", fontSize: "20px" }}>✓</span>
                )}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  style={{ display: "none" }}
                />
              </label>
              {sitesToUpload.length > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#667eea",
                  }}
                >
                  ✓ {sitesToUpload.length} sites loaded
                </div>
              )}
            </div>

            {/* Contract Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#555",
                }}
              >
                Contract Document *
              </label>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  background: "white",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#667eea")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#ddd")
                }
              >
                <span style={{ fontSize: "24px" }}>📋</span>
                <span
                  style={{ flex: 1, color: contractFileName ? "#333" : "#999" }}
                >
                  {contractFileName || "Choose contract file..."}
                </span>
                {contractFileName && (
                  <span style={{ color: "#667eea", fontSize: "20px" }}>✓</span>
                )}
                <input
                  type="file"
                  onChange={handleContractUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* Client Information */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              🏢 Client Information
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#555",
                }}
              >
                Client Name *
              </label>
              <input
                type="text"
                value={formValues.client}
                onChange={(e) =>
                  setFormValues({ ...formValues, client: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "15px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                placeholder="Enter client name"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#555",
                  }}
                >
                  Service Line *
                </label>
                <select
                  value={formValues.serviceLine}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      serviceLine: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                >
                  <option value="">Select service line</option>
                  {serviceLines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#555",
                  }}
                >
                  Software *
                </label>
                <select
                  value={formValues.software}
                  onChange={(e) =>
                    setFormValues({ ...formValues, software: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                >
                  <option value="">Select software</option>
                  {softwares.map((software) => (
                    <option key={software} value={software}>
                      {software}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment & Invoicing */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              💰 Payment & Invoicing
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#555",
                }}
              >
                Payment Terms *
              </label>
              <input
                type="text"
                value={formValues.paymentTerms}
                onChange={(e) =>
                  setFormValues({ ...formValues, paymentTerms: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "15px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                placeholder="e.g., Net 30"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#555",
                }}
              >
                Invoicing Directions *
              </label>
              <textarea
                value={formValues.invoicingDirections}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    invoicingDirections: e.target.value,
                  })
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "15px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                placeholder="Enter detailed invoicing instructions..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: isFormValid
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#ccc",
              border: "none",
              borderRadius: "8px",
              cursor: isFormValid ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: isFormValid
                ? "0 4px 12px rgba(102, 126, 234, 0.4)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "Submitting..." : "Submit Handoff"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HandoffForm;
