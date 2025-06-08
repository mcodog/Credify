import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectUserRole } from "../../features/user/userSelector";
import { clearUser } from "../../features/user/userSlice";
import {
  selectCertificates,
  selectFetchLoading,
  selectFetchError,
  selectValidCertificates,
} from "../../features/certificates/certificatesSelector";
import {
  fetchUserCertificates,
  clearFetchError,
} from "../../features/certificates/certificatesSlice";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layouts/Header";
import styles from "../../styles/Profile.jsx";
import Loader from "../../components/layouts/Loader";

const HEADER_HEIGHT = 88;

const Profile = () => {
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const certificates = useSelector(selectCertificates);
  const validCertificates = useSelector(selectValidCertificates);
  const certificatesLoading = useSelector(selectFetchLoading);
  const certificatesError = useSelector(selectFetchError);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCert, setSelectedCert] = useState(null);
  const [tab, setTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader fullPage size="xl" />;
  } 

  // Fetch certificates when component mounts or user changes
  useEffect(() => {
  console.log('Profile useEffect - user:', user); // Add this debug log
  console.log('Profile useEffect - user.id:', user?.id); // Changed from auth_id to id
  
  if (user?.id) { // Changed from auth_id to id
    console.log('Dispatching fetchUserCertificates for userId:', user.id); // Changed from auth_id to id
    dispatch(
      fetchUserCertificates({
        userId: user.id, // Changed from auth_id to id
      })
    );
  }
}, [dispatch, user?.id]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearFetchError());
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/login");
  };

  const handleTabChange = (newTab) => {
  setTab(newTab);
  if (newTab === "certificates" && user?.id) { // Changed from auth_id to id
    dispatch(
      fetchUserCertificates({
        userId: user.id, // Changed from auth_id to id
        // Remove firstName and lastName - backend will handle this
      })
    );
  }
};

  const handleRefreshCertificates = () => {
  if (user?.auth_id) {
    console.log('🔄 Refreshing certificates for user:', user.auth_id); // Debug log
    dispatch(
      fetchUserCertificates({
        userId: user.auth_id,
        // Remove firstName and lastName - backend will handle this
      })
    );
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeStyle = (cert) => {
    if (cert.revoked) {
      return {
        ...styles.certBadge("revoked"),
        backgroundColor: "#ef4444",
        color: "white",
      };
    }
    if (cert.verification_status === "verified") {
      return {
        ...styles.certBadge("valid"),
        backgroundColor: "#10b981",
        color: "white",
      };
    }
    return {
      ...styles.certBadge("pending"),
      backgroundColor: "#f59e0b",
      color: "white",
    };
  };

  const getStatusText = (cert) => {
    if (cert.revoked) return "Revoked";
    if (cert.verification_status === "verified") return "Valid";
    return "Pending";
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={{ ...styles.container, paddingTop: HEADER_HEIGHT + 32 }}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.profileSection}>
            <div style={styles.avatar}>
              {user?.firstname?.charAt(0)?.toUpperCase() ||
                user?.name?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            <div style={styles.userInfo}>
              <h3 style={styles.userName}>
                {user?.firstname || user?.name || "User"} {user?.lastname || ""}
              </h3>
              <span style={styles.userRole}>{userRole}</span>
            </div>
          </div>

          <nav style={styles.navigation}>
            <button
              style={styles.navButton(tab === "profile")}
              onClick={() => handleTabChange("profile")}
            >
              <i className="fas fa-user" style={styles.icon}></i>
              Profile Information
            </button>
            <button
              style={styles.navButton(tab === "certificates")}
              onClick={() => handleTabChange("certificates")}
            >
              <i className="fas fa-certificate" style={styles.icon}></i>
              My Certificates
              {validCertificates.length > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    backgroundColor: "#10b981",
                    color: "white",
                    fontSize: "12px",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {validCertificates.length}
                </span>
              )}
            </button>
          </nav>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <i className="fas fa-sign-out-alt" style={styles.icon}></i>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>
              {tab === "profile" ? "Profile Information" : "My Certificates"}
            </h1>
            <p style={styles.breadcrumb}>
              Dashboard / {tab === "profile" ? "Profile" : "Certificates"}
            </p>
            {tab === "certificates" && (
              <button
                onClick={handleRefreshCertificates}
                style={{
                  ...styles.editButton,
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                disabled={certificatesLoading}
              >
                <i
                  className={`fas ${
                    certificatesLoading ? "fa-spinner fa-spin" : "fa-sync-alt"
                  }`}
                ></i>
                {certificatesLoading ? "Loading..." : "Refresh"}
              </button>
            )}
          </div>

          {tab === "profile" ? (
            <div style={styles.contentCard}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Personal Details</h2>
                <button style={styles.editButton}>
                  <i className="fas fa-pen"></i>
                  Edit Profile
                </button>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>First Name</label>
                  <p style={styles.infoValue}>
                    {user?.firstname || "Not provided"}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Last Name</label>
                  <p style={styles.infoValue}>
                    {user?.lastname || "Not provided"}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Email</label>
                  <p style={styles.infoValue}>
                    {user?.email || "Not provided"}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Role</label>
                  <p style={styles.infoValue}>{userRole || "User"}</p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Username</label>
                  <p style={styles.infoValue}>
                    {user?.username || "Not provided"}
                  </p>
                </div>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>User ID</label>
                  <p style={styles.infoValue}>
                    {user?.auth_id || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Certificates Loading State */}
              {certificatesLoading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "60px",
                    color: "#6b7280",
                  }}
                >
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ marginRight: "12px" }}
                  ></i>
                  Loading certificates...
                </div>
              )}

              {/* Certificates Error State */}
              {certificatesError && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                    color: "#dc2626",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle"></i>
                    <strong>Error loading certificates:</strong>
                  </div>
                  <p style={{ margin: "8px 0 0 0" }}>{certificatesError}</p>
                  <button
                    onClick={handleRefreshCertificates}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Certificates Content */}
              {!certificatesLoading && !certificatesError && (
                <>
                  {certificates.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#6b7280",
                      }}
                    >
                      <i
                        className="fas fa-certificate"
                        style={{
                          fontSize: "48px",
                          marginBottom: "16px",
                          opacity: 0.5,
                        }}
                      ></i>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          color: "#374151",
                        }}
                      >
                        No Certificates Found
                      </h3>
                      <p style={{ margin: "0 0 24px 0" }}>
                        You don't have any certificates yet. Upload your first
                        certificate to get started.
                      </p>
                      <Link
                        to="/upload"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 24px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "8px",
                          fontWeight: "500",
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Upload Certificate
                      </Link>
                    </div>
                  ) : (
                    <div style={styles.certificatesGrid}>
                      {certificates.map((cert) => (
                        <div key={cert.id} style={styles.certCard}>
                          <div style={styles.certHeader}>
                            <span style={getStatusBadgeStyle(cert)}>
                              {getStatusText(cert)}
                            </span>
                            <h3 style={styles.certTitle}>
                              {cert.certificate_name ||
                                cert.certificate_hash ||
                                "Certificate"}
                            </h3>
                          </div>

                          <div style={styles.certDetails}>
                            <div style={styles.certInfo}>
                              <span style={styles.certLabel}>Issue Date</span>
                              <span style={styles.certValue}>
                                {formatDate(cert.created_at)}
                              </span>
                            </div>
                            <div style={styles.certInfo}>
                              <span style={styles.certLabel}>
                                Certificate ID
                              </span>
                              <span style={styles.certValue}>
                                {cert.id.toString().slice(-8)}
                              </span>
                            </div>
                            <div style={styles.certInfo}>
                              <span style={styles.certLabel}>File Type</span>
                              <span style={styles.certValue}>
                                {cert.file_type?.toUpperCase() || "N/A"}
                              </span>
                            </div>
                            <div style={styles.certInfo}>
                              <span style={styles.certLabel}>File Size</span>
                              <span style={styles.certValue}>
                                {cert.file_size
                                  ? `${(cert.file_size / 1024 / 1024).toFixed(
                                      2
                                    )} MB`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          <button
                            style={styles.viewCertButton}
                            onClick={() => setSelectedCert(cert)}
                          >
                            <i
                              className="fas fa-eye"
                              style={styles.buttonIcon}
                            ></i>
                            View Certificate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCert(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {selectedCert.certificate_name ||
                  selectedCert.certificate_hash ||
                  "Certificate"}
              </h3>
              <button
                style={styles.modalClose}
                onClick={() => setSelectedCert(null)}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <img
                src={selectedCert.image_url}
                alt={selectedCert.certificate_name || "Certificate"}
                style={styles.certImage}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div
                style={{
                  display: "none",
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <i
                  className="fas fa-image"
                  style={{ fontSize: "48px", marginBottom: "16px" }}
                ></i>
                <p>Image not available</p>
              </div>

              {/* OCR Content */}
              {selectedCert.ocr_content && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>
                    Extracted Text:
                  </h4>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      color: "#6b7280",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedCert.ocr_content}
                  </p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <a
                href={selectedCert.image_url}
                download={`${selectedCert.certificate_name || "certificate"}.${
                  selectedCert.file_type || "jpg"
                }`}
                style={styles.downloadButton}
              >
                <i className="fas fa-download" style={styles.buttonIcon}></i>
                Download Certificate
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
