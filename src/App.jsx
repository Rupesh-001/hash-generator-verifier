import { useState } from "react";
import "./App.css";

const API_URL = "";

function App() {
  const [operation, setOperation] = useState("generate");
  const [mode, setMode] = useState("text");

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [algorithm, setAlgorithm] = useState("sha256");

  const [hash, setHash] = useState("");
  const [expectedHash, setExpectedHash] = useState("");

  const [verificationResult, setVerificationResult] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  // =========================================
  // GENERATE TEXT HASH
  // =========================================

  const generateTextHash = async () => {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);
    setError("");
    setHash("");
    setCopied(false);

    try {
      const params = new URLSearchParams({
        text,
        algorithm,
      });

      const response = await fetch(
        `${API_URL}/api/hash/text?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate hash."
        );
      }

      setHash(data.hash);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GENERATE FILE HASH
  // =========================================

  const generateFileHash = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError("");
    setHash("");
    setCopied(false);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/hash/file?algorithm=${algorithm}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to hash file."
        );
      }

      setHash(data.hash);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // VERIFY TEXT HASH
  // =========================================

  const verifyTextHash = async () => {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    if (!expectedHash.trim()) {
      setError("Please enter the expected hash.");
      return;
    }

    setLoading(true);
    setError("");
    setVerificationResult(null);

    try {
      const params = new URLSearchParams({
        text,
        expected_hash: expectedHash.trim(),
        algorithm,
      });

      const response = await fetch(
        `${API_URL}/api/verify/text?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Verification failed."
        );
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // VERIFY FILE HASH
  // =========================================

  const verifyFileHash = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (!expectedHash.trim()) {
      setError("Please enter the expected hash.");
      return;
    }

    setLoading(true);
    setError("");
    setVerificationResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const params = new URLSearchParams({
        algorithm,
        expected_hash: expectedHash.trim(),
      });

      const response = await fetch(
        `${API_URL}/api/verify/file?${params.toString()}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Verification failed."
        );
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // MAIN ACTION
  // =========================================

  const handleAction = () => {
    if (operation === "generate") {
      if (mode === "text") {
        generateTextHash();
      } else {
        generateFileHash();
      }
    } else {
      if (mode === "text") {
        verifyTextHash();
      } else {
        verifyFileHash();
      }
    }
  };

  // =========================================
  // FILE SELECT
  // =========================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setHash("");
    setError("");
    setVerificationResult(null);
    setCopied(false);
  };

  // =========================================
  // DRAG OVER
  // =========================================

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  // =========================================
  // DRAG LEAVE
  // =========================================

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  // =========================================
  // DROP
  // =========================================

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    if (!droppedFile) {
      return;
    }

    setFile(droppedFile);
    setHash("");
    setError("");
    setVerificationResult(null);
    setCopied(false);
  };

  // =========================================
  // CHANGE OPERATION
  // =========================================

  const changeOperation = (newOperation) => {
    setOperation(newOperation);

    setHash("");
    setError("");
    setVerificationResult(null);
    setExpectedHash("");
    setCopied(false);
  };

  // =========================================
  // CHANGE MODE
  // =========================================

  const changeMode = (newMode) => {
    setMode(newMode);

    setText("");
    setFile(null);
    setHash("");
    setExpectedHash("");
    setError("");
    setVerificationResult(null);
    setCopied(false);
  };

  // =========================================
  // COPY HASH
  // =========================================

  const copyHash = async () => {
    if (!hash) {
      return;
    }

    try {
      await navigator.clipboard.writeText(hash);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy hash.");
    }
  };

  return (
    <div className="app">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="header">
        <div className="logo">
          <div className="logo-icon">⌘</div>
          <span>HashLab</span>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          API Connected
        </div>
      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="container">

        {/* HERO */}

        <section className="hero">
          <p className="eyebrow">
            CRYPTOGRAPHIC UTILITY
          </p>

          <h1>
            Hash Generator
            <br />
            <span>&amp; Verifier</span>
          </h1>

          <p className="description">
            Generate and verify cryptographic hashes for
            text and files using industry-standard
            algorithms.
          </p>
        </section>

        {/* ===================================
            MAIN CARD
        ==================================== */}

        <section className="card">

          <div className="card-header">
            <h2>
              {operation === "generate"
                ? "Generate Hash"
                : "Verify Hash"}
            </h2>

            <p>
              {operation === "generate"
                ? "Generate a cryptographic hash from text or a file."
                : "Verify whether a hash matches your text or file."}
            </p>
          </div>

          {/* OPERATION */}

          <div className="operation-switch">
            <button
              className={
                operation === "generate"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeOperation("generate")
              }
            >
              Generate Hash
            </button>

            <button
              className={
                operation === "verify"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeOperation("verify")
              }
            >
              Verify Hash
            </button>
          </div>

          {/* INPUT TYPE */}

          <div className="mode-switch">
            <button
              className={
                mode === "text" ? "active" : ""
              }
              onClick={() => changeMode("text")}
            >
              Text
            </button>

            <button
              className={
                mode === "file" ? "active" : ""
              }
              onClick={() => changeMode("file")}
            >
              File
            </button>
          </div>

          {/* =================================
              TEXT
          ================================== */}

          {mode === "text" && (
            <div className="input-section">

              <label htmlFor="text">
                Text Input
              </label>

              <textarea
                id="text"
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                placeholder={
                  operation === "generate"
                    ? "Enter text to hash..."
                    : "Enter the original text..."
                }
              />

            </div>
          )}

          {/* =================================
              FILE
          ================================== */}

          {mode === "file" && (
            <div className="input-section">

              <label htmlFor="file">
                File Input
              </label>

              <div
                className={`file-upload ${
                  dragging ? "dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                />

                <div className="upload-icon">
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line
                      x1="12"
                      y1="18"
                      x2="12"
                      y2="11"
                    />
                    <polyline points="9 14 12 11 15 14" />
                  </svg>
                </div>

                {!file ? (
                  <>
                    <div className="upload-title">
                      Drag &amp; drop your file here
                    </div>

                    <div className="upload-subtitle">
                      or click to browse
                    </div>

                    <div className="upload-description">
                      Any file type is supported
                    </div>

                    <label
                      htmlFor="file"
                      className="choose-file-button"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3v12" />
                        <polyline points="7 8 12 3 17 8" />
                        <path d="M5 21h14" />
                      </svg>

                      Choose File
                    </label>
                  </>
                ) : (
                  <>
                    <div className="selected-file">

                      <div className="selected-file-name">
                        {file.name}
                      </div>

                      <div className="selected-file-size">
                        {formatFileSize(file.size)}
                      </div>

                    </div>

                    <label
                      htmlFor="file"
                      className="change-file-button"
                    >
                      Change File
                    </label>
                  </>
                )}

              </div>
            </div>
          )}

          {/* =================================
              EXPECTED HASH
          ================================== */}

          {operation === "verify" && (
            <div className="expected-hash-section">

              <label htmlFor="expectedHash">
                Expected Hash
              </label>

              <input
                id="expectedHash"
                type="text"
                value={expectedHash}
                onChange={(event) =>
                  setExpectedHash(event.target.value)
                }
                placeholder="Paste the expected hash here..."
              />

              <p className="input-hint">
                Enter the hash you received from the
                original source.
              </p>

            </div>
          )}

          {/* =================================
              CONTROLS
          ================================== */}

          <div className="controls">

            <div className="algorithm-control">

              <label htmlFor="algorithm">
                Algorithm
              </label>

              <select
                id="algorithm"
                value={algorithm}
                onChange={(event) =>
                  setAlgorithm(event.target.value)
                }
              >
                <option value="md5">
                  MD5
                </option>

                <option value="sha256">
                  SHA-256
                </option>

                <option value="sha512">
                  SHA-512
                </option>
              </select>

            </div>

            <button
              className="generate-button"
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>

                  {operation === "generate"
                    ? "Generating..."
                    : "Verifying..."}
                </>
              ) : operation === "generate" ? (
                "Generate Hash"
              ) : (
                "Verify Hash"
              )}
            </button>

          </div>

          {/* =================================
              ERROR
          ================================== */}

          {error && (
            <div className="error">
              <span>!</span>
              {error}
            </div>
          )}

          {/* =================================
              GENERATED HASH
          ================================== */}

          {operation === "generate" && hash && (
            <div className="result">

              <div className="result-header">

                <div>
                  <span className="result-label">
                    HASH RESULT
                  </span>

                  <h3>
                    {algorithm.toUpperCase()}
                  </h3>
                </div>

                <button
                  className="copy-button"
                  onClick={copyHash}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

              </div>

              {mode === "file" && file && (
                <div className="file-result">
                  <span>File</span>
                  <strong>{file.name}</strong>
                </div>
              )}

              <div className="hash-value">
                {hash}
              </div>

            </div>
          )}

          {/* =================================
              VERIFICATION RESULT
          ================================== */}

          {operation === "verify" &&
            verificationResult && (
              <div
                className={`verification-result ${
                  verificationResult.verified
                    ? "verified"
                    : "not-verified"
                }`}
              >

                <div className="verification-icon">
                  {verificationResult.verified
                    ? "✓"
                    : "✕"}
                </div>

                <div className="verification-content">

                  <h3>
                    {verificationResult.verified
                      ? "Hash Verified"
                      : "Hash Mismatch"}
                  </h3>

                  <p>
                    {verificationResult.verified
                      ? "The calculated hash matches the expected hash."
                      : "The calculated hash does not match the expected hash."}
                  </p>

                  <div className="verification-details">

                    <div>
                      <span>
                        Expected Hash
                      </span>

                      <code>
                        {
                          verificationResult.expected_hash
                        }
                      </code>
                    </div>

                    <div>
                      <span>
                        Calculated Hash
                      </span>

                      <code>
                        {
                          verificationResult.actual_hash
                        }
                      </code>
                    </div>

                  </div>

                </div>

              </div>
            )}

        </section>

        {/* ===================================
            ALGORITHM CARDS
        ==================================== */}

        <section className="info-grid">

          <div className="info-card">

            <div className="info-number">
              01
            </div>

            <h3>MD5</h3>

            <p>
              Fast legacy hash function. Not
              recommended for security-critical
              applications.
            </p>

            <span className="warning-tag">
              Legacy
            </span>

          </div>

          <div className="info-card featured">

            <div className="info-number">
              02
            </div>

            <h3>SHA-256</h3>

            <p>
              Widely used cryptographic hash
              function suitable for integrity
              verification.
            </p>

            <span className="recommended-tag">
              Recommended
            </span>

          </div>

          <div className="info-card">

            <div className="info-number">
              03
            </div>

            <h3>SHA-512</h3>

            <p>
              SHA-2 family algorithm producing
              a 512-bit hash value.
            </p>

            <span className="secure-tag">
              Secure
            </span>

          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer>
        <p>
          HashLab &nbsp;•&nbsp; Built for cybersecurity
          learning
        </p>
      </footer>

    </div>
  );
}


// =========================================
// FILE SIZE FORMATTER
// =========================================

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return (
    parseFloat(
      (bytes / Math.pow(1024, index)).toFixed(2)
    ) +
    " " +
    units[index]
  );
}

export default App;
