import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

const CONTRACT_ID = "CCHF4ZP5RREAUDUDXC266Q6HXDI6Z46GR4Z2EDKYEJGV24NDX5JK3VGC";
const ISSUER_ADDRESS = "GBSRCEARHBTEEJAJ6OG6UMOWQBO6K4YYCTDGUOHIGRGNXPA5FZESKSR4";

const EXPLORER_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;

const makeDemoImage = (title, name) =>
  `https://dummyimage.com/900x600/0f172a/ffffff.png&text=${encodeURIComponent(
    `${title} - ${name}`
  )}`;

const initialCertificates = [
  {
    id: "CERT001",
    student: "Muhammd Idris Marzuki",
    institution: "Stellar Web3 Bootcamp",
    course: "Smart Contract on Stellar",
    hash: "HASH123-STELLAR",
    status: "Active",
    issuedAt: "2026-06-07",
    issuer: ISSUER_ADDRESS,
    image: makeDemoImage("Certificate", "Muhammad Idris Marzuki"),
  },
  {
    id: "CERT002",
    student: "Aqila Rahma",
    institution: "EduCert Academy",
    course: "Blockchain Fundamentals",
    hash: "QMF8A2B9-STELLAR",
    status: "Active",
    issuedAt: "2026-06-07",
    issuer: ISSUER_ADDRESS,
    image: makeDemoImage("Certificate", "Aqila Rahma"),
  },
  {
    id: "CERT003",
    student: "Tri Novi Putra Utami",
    institution: "EduCert Academy",
    course: "Digital Identity Verification",
    hash: "IPFS-9A7C3F1",
    status: "Revoked",
    issuedAt: "2026-06-07",
    issuer: ISSUER_ADDRESS,
    image: makeDemoImage("Revoked Certificate", "Tri Novi Putra Utami"),
  },
];

function App() {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [query, setQuery] = useState("CERT001");
  const [selected, setSelected] = useState(initialCertificates[0]);
  const [tab, setTab] = useState("verify");
  const [logs, setLogs] = useState([
    "CERT001 verified successfully on Stellar Testnet",
    "Certificate image hash generated for blockchain proof",
    "EduCert smart contract deployed to Stellar Testnet",
  ]);

  const [form, setForm] = useState({
    id: "",
    student: "",
    institution: "",
    course: "",
    hash: "",
    image: "",
    imageName: "",
  });

  const stats = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((item) => item.status === "Active").length;
    const revoked = certificates.filter((item) => item.status === "Revoked").length;
    const withImage = certificates.filter((item) => item.image).length;

    return { total, active, revoked, withImage };
  }, [certificates]);

  const addLog = (message) => {
    setLogs([message, ...logs.slice(0, 8)]);
  };

  const generateImageHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload JPG or PNG image only.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const hash = await generateImageHash(file);

    setForm({
      ...form,
      image: imageUrl,
      imageName: file.name,
      hash,
    });

    addLog(`Image uploaded and SHA-256 hash generated: ${file.name}`);
  };

  const verifyCertificate = () => {
    const found = certificates.find(
      (item) => item.id.toLowerCase() === query.trim().toLowerCase()
    );

    setSelected(found || null);

    if (found) {
      addLog(`${found.id} verification requested: ${found.status}`);
    } else {
      addLog(`${query} verification failed: certificate not found`);
    }
  };

  const issueCertificate = () => {
    if (!form.id || !form.student || !form.institution || !form.course || !form.hash) {
      alert("Please complete all certificate data and upload certificate image.");
      return;
    }

    const exists = certificates.some(
      (item) => item.id.toLowerCase() === form.id.toLowerCase()
    );

    if (exists) {
      alert("Certificate ID already exists.");
      return;
    }

    const newCertificate = {
      ...form,
      status: "Active",
      issuedAt: new Date().toISOString().split("T")[0],
      issuer: ISSUER_ADDRESS,
    };

    setCertificates([newCertificate, ...certificates]);
    setSelected(newCertificate);
    setQuery(newCertificate.id);
    setForm({
      id: "",
      student: "",
      institution: "",
      course: "",
      hash: "",
      image: "",
      imageName: "",
    });
    setTab("verify");
    addLog(`${newCertificate.id} issued with certificate image hash`);
  };

  const revokeCertificate = (id) => {
    const updated = certificates.map((item) =>
      item.id === id ? { ...item, status: "Revoked" } : item
    );

    setCertificates(updated);

    if (selected?.id === id) {
      setSelected({ ...selected, status: "Revoked" });
    }

    addLog(`${id} revoked by issuer`);
  };

  const resetUpload = () => {
    setForm({ ...form, image: "", imageName: "", hash: "" });
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">
          <div className="logo">E</div>
          <div>
            <h2>EduCert Stellar</h2>
            <p>Image-Based Blockchain Certificate Verification</p>
          </div>
        </div>

        <a className="nav-link" href={EXPLORER_URL} target="_blank" rel="noreferrer">
          View Stellar Contract
        </a>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <span className="pill">Stellar Testnet • Certificate Image Hash</span>
          <h1>Upload, Hash, and Verify Certificates on Stellar</h1>
          <p>
            EduCert Stellar verifies certificate authenticity by converting
            certificate images into cryptographic hashes and linking them to a
            deployed Stellar smart contract.
          </p>

          <div className="hero-buttons">
            <button onClick={() => setTab("issue")}>Upload Certificate</button>
            <button className="ghost" onClick={() => setTab("verify")}>
              Verify Certificate
            </button>
          </div>
        </div>

        <div className="blockchain-card">
          <div className="pulse"></div>
          <h3>Blockchain Proof</h3>
          <p className="mono">{CONTRACT_ID}</p>

          <div className="mini-grid">
            <div>
              <span>Network</span>
              <b>Stellar Testnet</b>
            </div>
            <div>
              <span>Hashing</span>
              <b>SHA-256</b>
            </div>
          </div>
        </div>
      </header>

      <section className="stats">
        <div>
          <span>Total Certificates</span>
          <h2>{stats.total}</h2>
        </div>
        <div>
          <span>Active</span>
          <h2>{stats.active}</h2>
        </div>
        <div>
          <span>Revoked</span>
          <h2>{stats.revoked}</h2>
        </div>
        <div>
          <span>With Images</span>
          <h2>{stats.withImage}</h2>
        </div>
      </section>

      <main className="workspace">
        <aside className="sidebar">
          <button className={tab === "verify" ? "active" : ""} onClick={() => setTab("verify")}>
            Verify Certificate
          </button>
          <button className={tab === "issue" ? "active" : ""} onClick={() => setTab("issue")}>
            Upload & Issue
          </button>
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
            Issuer Dashboard
          </button>
          <button className={tab === "proof" ? "active" : ""} onClick={() => setTab("proof")}>
            Stellar Proof
          </button>
        </aside>

        <section className="panel">
          {tab === "verify" && (
            <>
              <div className="section-title">
                <div>
                  <h2>Verify Certificate</h2>
                  <p>Search certificate ID and validate its status, image, hash, and blockchain proof.</p>
                </div>
                <span className="badge">Try CERT001 / CERT003 / CERT999</span>
              </div>

              <div className="verify-box">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Certificate ID"
                />
                <button onClick={verifyCertificate}>Verify</button>
              </div>

              {selected ? (
                <div className={`certificate-card ${selected.status === "Active" ? "valid" : "revoked"}`}>
                  <div className="certificate-image-wrap">
                    <img src={selected.image} alt="Certificate preview" />
                  </div>

                  <div className="certificate-detail">
                    <div className="cert-header">
                      <div>
                        <span>Verified Digital Certificate</span>
                        <h2>{selected.course}</h2>
                      </div>
                      <span className={selected.status === "Active" ? "status active-status" : "status revoked-status"}>
                        {selected.status}
                      </span>
                    </div>

                    <div className="detail-grid">
                      <div>
                        <span>Student</span>
                        <b>{selected.student}</b>
                      </div>
                      <div>
                        <span>Institution</span>
                        <b>{selected.institution}</b>
                      </div>
                      <div>
                        <span>Certificate ID</span>
                        <b>{selected.id}</b>
                      </div>
                      <div>
                        <span>Issued Date</span>
                        <b>{selected.issuedAt}</b>
                      </div>
                    </div>

                    <div className="hash-box">
                      <span>Image SHA-256 Hash</span>
                      <p>{selected.hash}</p>
                    </div>

                    <div className="qr-section">
                      <QRCodeCanvas value={`${EXPLORER_URL}?certificate=${selected.id}`} size={132} />
                      <div>
                        <h4>QR Blockchain Verification</h4>
                        <p>Scan to open Stellar contract proof and verify certificate authenticity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fake-alert">
                  <h3>❌ Certificate Not Found</h3>
                  <p>This ID is not registered. The certificate may be fake or not yet issued.</p>
                </div>
              )}
            </>
          )}

          {tab === "issue" && (
            <>
              <div className="section-title">
                <div>
                  <h2>Upload & Issue Certificate</h2>
                  <p>Upload a certificate image, generate SHA-256 hash, and prepare blockchain verification data.</p>
                </div>
              </div>

              <div className="issue-layout">
                <div className="upload-card">
                  <input id="certificateImage" type="file" accept="image/*" onChange={handleImageUpload} hidden />

                  <label htmlFor="certificateImage" className="dropzone">
                    {form.image ? (
                      <img src={form.image} alt="Uploaded certificate" />
                    ) : (
                      <div>
                        <h3>📄 Upload Certificate Image</h3>
                        <p>Click here to upload JPG or PNG certificate file.</p>
                      </div>
                    )}
                  </label>

                  {form.image && (
                    <button className="danger-btn full-btn" onClick={resetUpload}>
                      Remove Image
                    </button>
                  )}
                </div>

                <div className="form-area">
                  <input
                    placeholder="Certificate ID, example CERT004"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                  />
                  <input
                    placeholder="Student Name"
                    value={form.student}
                    onChange={(e) => setForm({ ...form, student: e.target.value })}
                  />
                  <input
                    placeholder="Institution"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  />
                  <input
                    placeholder="Course Name"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                  />

                  <div className="hash-preview">
                    <span>Generated Image Hash</span>
                    <p>{form.hash || "Upload an image to generate SHA-256 hash automatically."}</p>
                  </div>

                  <button className="full-btn" onClick={issueCertificate}>
                    Issue Certificate
                  </button>
                </div>
              </div>

              <div className="info-box">
                <b>Competition explanation:</b> Certificate images are not stored directly on blockchain.
                EduCert stores/verifies the cryptographic hash, which is more efficient and secure.
              </div>
            </>
          )}

          {tab === "dashboard" && (
            <>
              <div className="section-title">
                <div>
                  <h2>Issuer Dashboard</h2>
                  <p>Manage certificates, status, image hash, and revocation.</p>
                </div>
              </div>

              <div className="cert-list">
                {certificates.map((cert) => (
                  <div className="cert-row" key={cert.id}>
                    <img src={cert.image} alt={cert.id} />
                    <div>
                      <b>{cert.id}</b>
                      <p>{cert.student} — {cert.course}</p>
                      <small>{cert.hash}</small>
                    </div>
                    <span className={cert.status === "Active" ? "status active-status" : "status revoked-status"}>
                      {cert.status}
                    </span>
                    <button
                      className="danger-btn"
                      disabled={cert.status === "Revoked"}
                      onClick={() => revokeCertificate(cert.id)}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "proof" && (
            <>
              <div className="section-title">
                <div>
                  <h2>Stellar Blockchain Proof</h2>
                  <p>Transparent proof that EduCert is connected to Stellar Testnet smart contract.</p>
                </div>
              </div>

              <div className="proof-grid">
                <div>
                  <span>Contract ID</span>
                  <p className="mono">{CONTRACT_ID}</p>
                </div>
                <div>
                  <span>Issuer Address</span>
                  <p className="mono">{ISSUER_ADDRESS}</p>
                </div>
                <div>
                  <span>Network</span>
                  <p>Stellar Testnet</p>
                </div>
                <div>
                  <span>Hash Method</span>
                  <p>SHA-256 Image Hash</p>
                </div>
                <div>
                  <span>Smart Contract Functions</span>
                  <p>issue_certificate, verify_certificate, get_certificate, revoke_certificate</p>
                </div>
                <div>
                  <span>Use Case</span>
                  <p>Anti-fake academic certificate verification</p>
                </div>
              </div>

              <a className="explorer-btn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
                Open Contract on Stellar Explorer
              </a>
            </>
          )}
        </section>
      </main>

      <section className="activity">
        <h2>Activity Log</h2>
        {logs.map((log, index) => (
          <p key={index}>• {log}</p>
        ))}
      </section>
    </div>
  );
}

export default App;