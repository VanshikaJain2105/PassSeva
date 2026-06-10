import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  Image,
  FileCheck,
} from "lucide-react";

function UploadDocument() {
  const { applicationId } = useParams();

  const [documentType, setDocumentType] = useState("Aadhaar");
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!applicationId || !file) {
      alert("Please select file");
      return;
    }

    const formData = new FormData();
    formData.append("application_id", applicationId);
    formData.append("document_type", documentType);
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Passport Documents</h1>
          <p className="page-subtitle">
            Upload supporting documents for OCR extraction and officer verification.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "24px",
          }}
        >
          <div className="icon-box">
            <UploadCloud size={24} />
          </div>

          <div>
            <h2 style={{ margin: 0, color: "#0f2f57" }}>
              Document Upload
            </h2>
            <p className="page-subtitle">
              Application ID: {applicationId}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <div className="info-box">
            <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
              <FileText size={18} /> Select Document Type
            </h3>

            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="Aadhaar">Aadhaar</option>
              <option value="Address Proof">Address Proof</option>
              <option value="Birth Certificate">Birth Certificate</option>
              <option value="Passport Photo">Passport Photo</option>
            </select>
          </div>

          <div className="info-box">
            <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
              <UploadCloud size={18} /> Choose File
            </h3>

            <input
              className="input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            {file && (
              <div className="info-box" style={{ background: "white" }}>
                <FileCheck size={20} />
                <p>
                  <b>Selected File:</b> {file.name}
                </p>
                <p>
                  <b>Size:</b> {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-3">
            <div className="info-box">
              <Image size={20} />
              <p><b>JPG / PNG</b></p>
              <p>Best for OCR extraction.</p>
            </div>

            <div className="info-box">
              <FileText size={20} />
              <p><b>PDF</b></p>
              <p>Accepted for document storage.</p>
            </div>

            <div className="info-box">
              <ShieldCheck size={20} />
              <p><b>Verification</b></p>
              <p>Officer can review uploaded documents.</p>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" type="submit">
              <UploadCloud size={16} /> Upload Document
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => (window.location.href = "/my-applications")}
            >
              Back to My Applications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDocument;