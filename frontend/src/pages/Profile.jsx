import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfile, updateProfile, updateAddress, getOrders, addAddress, updateAddressItem, deleteAddress, setDefaultAddress, sendPasswordOtp, changePasswordOtp } from "../services/api";
import AuthModal from "../Components/AuthModal";

const profileStyles = `
  .profile-layout {
    background: #09090b;
    min-height: 100vh;
    padding: 100px 2rem 4rem;
    color: #f4f4f5;
    font-family: 'Inter', sans-serif;
  }
  .profile-container {
    max-width: 820px;
    margin: 0 auto;
  }
  .profile-header-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 20px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  .profile-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #e2b87f;
    color: #09090b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid #27272a;
  }
  .profile-tab-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #18181b;
    color: #a1a1aa;
    border: 1px solid #27272a;
    border-radius: 980px;
    padding: 0.5rem 1.25rem;
    font-size: 0.82rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .profile-tab-btn:hover {
    color: #f4f4f5;
    border-color: #71717a;
  }
  .profile-tab-btn.active {
    background: #e2b87f;
    color: #09090b;
    border-color: #e2b87f;
    font-weight: 600;
  }
  .profile-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }
  .profile-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: #a1a1aa;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
  }
  .profile-input {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 0.85rem 1rem;
    font-size: 0.88rem;
    color: #f4f4f5;
    outline: none;
    width: 100%;
    font-family: inherit;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
  }
  .profile-input:focus {
    border-color: #e2b87f;
    box-shadow: 0 0 0 1px #e2b87f;
  }
  .profile-btn {
    background: #e2b87f;
    color: #09090b;
    border: none;
    border-radius: 980px;
    padding: 0.8rem 2rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  .profile-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(226, 184, 127, 0.3);
  }
  .profile-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .latest-order-card {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 14px;
    padding: 1.25rem;
    text-align: left;
    margin-top: 1rem;
  }
  .profile-message {
    border-radius: 12px;
    padding: 0.85rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .profile-message.success {
    background: rgba(48, 209, 88, 0.15);
    border: 1px solid rgba(48, 209, 88, 0.25);
    color: #30d158;
  }
  .profile-message.error {
    background: rgba(255, 69, 58, 0.15);
    border: 1px solid rgba(255, 69, 58, 0.25);
    color: #ff453a;
  }
  .address-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  .address-card {
    background: #09090b;
    border: 1px solid #27272a;
    padding: 1.25rem;
    border-radius: 14px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 190px;
    transition: all 0.2s ease;
  }
  .address-card:hover {
    border-color: #71717a;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .address-card.default {
    border-color: #e2b87f;
    background: rgba(226, 184, 127, 0.03);
  }
  .address-label-badge {
    display: inline-block;
    background: rgba(226, 184, 127, 0.15);
    color: #e2b87f;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .address-default-badge {
    display: inline-block;
    background: rgba(48, 209, 88, 0.15);
    color: #30d158;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .address-card-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
    border-top: 1px solid #27272a;
    padding-top: 0.75rem;
  }
  .address-card-btn {
    background: transparent;
    border: none;
    color: #a1a1aa;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  .address-card-btn:hover {
    color: #f4f4f5;
  }
  .address-card-btn.delete:hover {
    color: #ff453a;
  }
  .address-card-btn.default-btn {
    color: #e2b87f;
    margin-left: auto;
  }
  .address-chip-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .address-chip {
    background: #09090b;
    border: 1px solid #27272a;
    color: #a1a1aa;
    padding: 0.55rem 1.1rem;
    border-radius: 8px;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    font-weight: 500;
  }
  .address-chip:hover {
    color: #f4f4f5;
    border-color: #71717a;
  }
  .address-chip.active {
    background: #e2b87f;
    border-color: #e2b87f;
    color: #09090b;
    font-weight: 600;
  }
`;

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [addressMode, setAddressMode] = useState("list"); // "list", "add", "edit"
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", street: "", city: "", state: "", pincode: "", label: "Home", isDefault: false
  });
  const [message, setMessage] = useState("");
  const [isSuccessMsg, setIsSuccessMsg] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);

  // Change password states
  const [passwordStep, setPasswordStep] = useState(1);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      if (data.user) {
        setUser(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      }

      // Fetch customer orders list
      const ordersData = await getOrders();
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      setCustomerOrders(ordersList);
    } catch (err) {
      console.error("Failed to load profile details", err);
    }
  };

  const showMessage = (msg, isSuccess = true) => {
    setMessage(msg);
    setIsSuccessMsg(isSuccess);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setLoading(true);
      const res = await updateProfile({ ...profileForm, profilePicture: compressed });
      setLoading(false);
      if (res.user) {
        setUser(res.user);
        showMessage("✓ Profile picture updated successfully", true);
      } else {
        showMessage(res.error || "✗ Failed to update profile picture", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ Image processing failed", false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(profileForm);
      setLoading(false);
      if (res.user) {
        setUser(res.user);
        showMessage("✓ Profile details updated successfully", true);
      } else {
        showMessage(res.error || "✗ Failed to update profile details", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred while updating profile", false);
    }
  };

  const handleSendPasswordOtp = async () => {
    setLoading(true);
    try {
      const res = await sendPasswordOtp();
      setLoading(false);
      if (res.success) {
        showMessage("✓ Verification code sent to your email", true);
        setPasswordStep(2);
      } else {
        showMessage(res.error || res.message || "✗ Failed to send verification code", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred while sending verification code", false);
    }
  };

  const handleChangePasswordOtp = async () => {
    if (!passwordOtp || !newPassword) {
      return showMessage("✗ Please fill all fields", false);
    }
    if (passwordOtp.length !== 6) {
      return showMessage("✗ Please enter a valid 6-digit verification code", false);
    }
    if (newPassword.length < 6) {
      return showMessage("✗ Password must be at least 6 characters long", false);
    }

    setLoading(true);
    try {
      const res = await changePasswordOtp(passwordOtp, newPassword);
      setLoading(false);
      if (res.success) {
        showMessage("✓ Password updated successfully!", true);
        setPasswordStep(1);
        setPasswordOtp("");
        setNewPassword("");
      } else {
        showMessage(res.error || res.message || "✗ Failed to update password", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred while updating password", false);
    }
  };

  const handleAddressSave = async () => {
    const { fullName, phone, street, city, state, pincode, label, isDefault } = addressForm;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return showMessage("✗ Please fill all address fields", false);
    }
    
    const nameTrimmed = fullName.trim();
    if (nameTrimmed.length < 3 || nameTrimmed.length > 50) {
      return showMessage("✗ Full name must be between 3 and 50 characters", false);
    }
    if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      return showMessage("✗ Full name must only contain letters and spaces", false);
    }

    const phoneTrimmed = phone.trim();
    if (!/^\d{10}$/.test(phoneTrimmed)) {
      return showMessage("✗ Phone number must be exactly 10 digits", false);
    }

    const streetTrimmed = street.trim();
    if (streetTrimmed.length < 12) {
      return showMessage("✗ Street address must be at least 12 characters long", false);
    }
    const words = streetTrimmed.split(/\s+/).filter(w => w.replace(/[^a-zA-Z0-9]/g, "").length >= 2);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < 2) {
      return showMessage("✗ Please enter a valid street address with at least 2 distinct words (e.g. '123 Main St')", false);
    }

    const cityTrimmed = city.trim();
    if (cityTrimmed.length < 2 || cityTrimmed.length > 50) {
      return showMessage("✗ City must be between 2 and 50 characters", false);
    }
    if (!/^[a-zA-Z\s]+$/.test(cityTrimmed)) {
      return showMessage("✗ City must only contain letters and spaces", false);
    }

    const stateTrimmed = state.trim();
    if (stateTrimmed.length < 2 || stateTrimmed.length > 50) {
      return showMessage("✗ State must be between 2 and 50 characters", false);
    }
    if (!/^[a-zA-Z\s]+$/.test(stateTrimmed)) {
      return showMessage("✗ State must only contain letters and spaces", false);
    }

    const pincodeTrimmed = pincode.trim().replace(/\s/g, "");
    if (!/^\d{6}$/.test(pincodeTrimmed)) {
      return showMessage("✗ Pincode must be exactly 6 digits", false);
    }

    const sanitizedAddressForm = {
      ...addressForm,
      fullName: nameTrimmed,
      phone: phoneTrimmed,
      street: streetTrimmed,
      city: cityTrimmed,
      state: stateTrimmed,
      pincode: pincodeTrimmed
    };

    setLoading(true);
    try {
      let res;
      if (addressMode === "add") {
        res = await addAddress(sanitizedAddressForm);
      } else {
        res = await updateAddressItem(editingAddressId, sanitizedAddressForm);
      }
      setLoading(false);
      if (res.user) {
        setUser(res.user);
        showMessage(addressMode === "add" ? "✓ Address added successfully" : "✓ Address updated successfully", true);
        setAddressMode("list");
        setEditingAddressId(null);
        setAddressForm({ fullName: "", phone: "", street: "", city: "", state: "", pincode: "", label: "Home", isDefault: false });
      } else {
        showMessage(res.error || "✗ Failed to save address", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred while saving address", false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setLoading(true);
    try {
      const res = await deleteAddress(addressId);
      setLoading(false);
      if (res.user) {
        setUser(res.user);
        showMessage("✓ Address deleted successfully", true);
      } else {
        showMessage(res.error || "✗ Failed to delete address", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred while deleting address", false);
    }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      const res = await setDefaultAddress(addressId);
      setLoading(false);
      if (res.user) {
        setUser(res.user);
        showMessage("✓ Default address updated", true);
      } else {
        showMessage(res.error || "✗ Failed to set default address", false);
      }
    } catch (err) {
      setLoading(false);
      showMessage("✗ An error occurred", false);
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      label: addr.label || "Home",
      isDefault: addr.isDefault || false
    });
    setAddressMode("edit");
  };

  const baseTabs = [
    { id: "profile", label: "Account Info", icon: "👤" },
    { id: "address", label: "Shipping Address", icon: "📍" },
    { id: "orders", label: "My Orders", icon: "📦" },
  ];
  
  const tabs = user?.role === "admin"
    ? [...baseTabs, { id: "admin", label: "Seller Hub", icon: "🛡️" }]
    : baseTabs;

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Calculate order statistics
  const pendingOrders = customerOrders.filter(o => o.trackingStatus !== "Delivered" && o.trackingStatus !== "Cancelled");
  const latestOrder = customerOrders.length > 0 ? customerOrders[customerOrders.length - 1] : null;

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="profile-layout">
        <style dangerouslySetInnerHTML={{ __html: profileStyles }} />
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "24px",
          maxWidth: "480px",
          margin: "4rem auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>👤</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f4f4f5", marginBottom: "0.75rem", fontFamily: "Playfair Display, serif" }}>
            Sign in to view your profile
          </h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.88rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Track order status, manage delivery addresses, and update security credentials by signing in.
          </p>
          <button 
            onClick={() => setShowAuthModal(true)} 
            className="profile-btn"
            style={{ padding: "0.9rem 2.5rem" }}
          >
            Sign In / Register
          </button>

          {showAuthModal && (
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
              onSuccess={() => {
                setShowAuthModal(false);
                fetchProfile();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <style dangerouslySetInnerHTML={{ __html: profileStyles }} />
      <div className="profile-container">

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div 
            style={{ position: "relative", cursor: "pointer", width: "72px", height: "72px", flexShrink: 0 }} 
            onClick={() => document.getElementById("profile-upload-input").click()}
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e2b87f"
                }}
              />
            ) : (
              <div className="profile-avatar" style={{ margin: 0 }}>{initials}</div>
            )}
            <div 
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                background: "#e2b87f",
                color: "#09090b",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                border: "2.5px solid #18181b",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}
            >
              📷
            </div>
            <input 
              id="profile-upload-input" 
              type="file" 
              accept="image/*" 
              style={{ display: "none" }} 
              onChange={handleAvatarChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f4f4f5", margin: 0, fontFamily: "Outfit", sans-serif" }}>
                {user?.name || "Customer Account"}
              </h2>
              {user?.role === "admin" && (
                <span style={{ fontSize: "0.65rem", background: "rgba(226,184,127,0.15)", color: "#e2b87f", border: "1px solid rgba(226,184,127,0.25)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 600, letterSpacing: "0.05em" }}>
                  ADMIN
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.82rem", color: "#a1a1aa", margin: "0.15rem 0 0" }}>{user?.email}</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="profile-tab-btn"
            style={{ padding: "0.55rem 1.25rem", borderRadius: "980px" }}
          >
            Orders Page →
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`profile-tab-btn ${activeTab === id ? "active" : ""}`}
            >
              <span style={{ fontSize: "0.9rem" }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Alert Feedback Messages */}
        {message && (
          <div className={`profile-message ${isSuccessMsg ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {/* Tab Cards Content */}
        <div className="profile-card">

          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === "profile" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f4f4f5", margin: "0 0 0.3rem" }}>Personal Information</h3>
                <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: 0 }}>Review and modify your billing name or store account details</p>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
                <div>
                  <label className="profile-label">Full Name</label>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="e.g. John Doe"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="profile-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="profile-input"
                    placeholder="e.g. email@domain.com"
                    value={profileForm.email}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <button className="profile-btn" onClick={handleProfileUpdate} disabled={loading}>
                {loading ? "Saving Changes..." : "Update Details"}
              </button>

              {/* Change Password Block */}
              <div style={{ marginTop: "3rem", borderTop: "1px solid #27272a", paddingTop: "2rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f4f4f5", margin: "0 0 0.3rem" }}>Security & Password</h3>
                <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: "0 0 1.5rem" }}>Update your password securely by verifying your email address</p>

                {passwordStep === 1 ? (
                  <div>
                    <button 
                      className="profile-btn" 
                      onClick={handleSendPasswordOtp} 
                      disabled={loading}
                      style={{ background: "transparent", border: "1px solid #e2b87f", color: "#e2b87f" }}
                    >
                      {loading ? "Sending Code..." : "Send Verification Code to Email"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem", maxWidth: "400px" }}>
                    <div>
                      <label className="profile-label">Verification Code (OTP)</label>
                      <input
                        type="text"
                        className="profile-input"
                        placeholder="6-digit code"
                        maxLength={6}
                        value={passwordOtp}
                        onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <div>
                      <label className="profile-label">New Password</label>
                      <input
                        type="password"
                        className="profile-input"
                        placeholder="Enter new password (min. 6 chars)"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                      <button className="profile-btn" onClick={handleChangePasswordOtp} disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                      <button 
                        className="profile-btn" 
                        onClick={() => { setPasswordStep(1); setPasswordOtp(""); setNewPassword(""); }}
                        style={{ background: "transparent", border: "1px solid #3f3f46", color: "#a1a1aa" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING ADDRESS */}
          {activeTab === "address" && (
            <div>
              {addressMode === "list" ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f4f4f5", margin: "0 0 0.3rem" }}>Saved Delivery Addresses</h3>
                      <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: 0 }}>Manage your saved addresses for quick checkout</p>
                    </div>
                    <button 
                      className="profile-btn" 
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.82rem" }}
                      onClick={() => {
                        setAddressForm({ fullName: "", phone: "", street: "", city: "", state: "", pincode: "", label: "Home", isDefault: false });
                        setAddressMode("add");
                      }}
                    >
                      + Add Address
                    </button>
                  </div>

                  {!user?.addresses || user.addresses.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--border)", borderRadius: "14px", background: "rgba(255,255,255,0.01)" }}>
                      <span style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}>📍</span>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.5rem" }}>No Saved Addresses</h4>
                      <p style={{ color: "var(--grey)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>You haven't saved any shipping addresses yet.</p>
                      <button 
                        className="profile-btn" 
                        onClick={() => setAddressMode("add")}
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="address-grid">
                      {user.addresses.map((addr) => (
                        <div key={addr._id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <span className="address-label-badge">{addr.label}</span>
                              {addr.isDefault && <span className="address-default-badge">Default</span>}
                            </div>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--white)", marginBottom: "0.3rem" }}>{addr.fullName}</h4>
                            <p style={{ fontSize: "0.82rem", color: "var(--grey)", margin: "0.1rem 0" }}>📞 {addr.phone}</p>
                            <p style={{ fontSize: "0.82rem", color: "var(--grey)", margin: "0.1rem 0", lineHeight: "1.4" }}>
                              {addr.street},<br />
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <div className="address-card-actions">
                            <button className="address-card-btn" onClick={() => startEditAddress(addr)}>Edit</button>
                            <button className="address-card-btn delete" onClick={() => handleAddressDelete(addr._id)}>Delete</button>
                            {!addr.isDefault && (
                              <button className="address-card-btn default-btn" onClick={() => handleSetDefault(addr._id)}>Set Default</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f4f4f5", margin: "0 0 0.3rem" }}>
                        {addressMode === "add" ? "Add New Address" : "Edit Saved Address"}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: 0 }}>Please fill out the shipping address details below</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button 
                        className="profile-tab-btn" 
                        onClick={() => {
                          setAddressMode("list");
                          setEditingAddressId(null);
                        }}
                      >
                        ← Back to List
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="profile-label">Full Name</label>
                      <input
                        className="profile-input"
                        placeholder="Recipient's Full Name"
                        value={addressForm.fullName}
                        onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="profile-label">Contact Phone</label>
                      <input
                        className="profile-input"
                        placeholder="10-digit phone number"
                        value={addressForm.phone}
                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="profile-label">Pincode</label>
                      <input
                        className="profile-input"
                        placeholder="6-digit PIN code"
                        value={addressForm.pincode}
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="profile-label">Street Address</label>
                      <input
                        className="profile-input"
                        placeholder="Flat/House No., Colony, Street Name"
                        value={addressForm.street}
                        onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="profile-label">City</label>
                      <input
                        className="profile-input"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="profile-label">State</label>
                      <input
                        className="profile-input"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                      />
                    </div>
                    
                    <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
                      <label className="profile-label">Address Label</label>
                      <div className="address-chip-group">
                        {["Home", "Work", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            className={`address-chip ${addressForm.label === lbl ? "active" : ""}`}
                            onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                          >
                            {lbl === "Home" ? "🏠 Home" : lbl === "Work" ? "💼 Work" : "📍 Other"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <input
                        type="checkbox"
                        id="isDefaultCheckbox"
                        checked={addressForm.isDefault}
                        disabled={addressMode === "edit" && addressForm.isDefault}
                        onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--accent)" }}
                      />
                      <label htmlFor="isDefaultCheckbox" style={{ fontSize: "0.82rem", color: "var(--grey)", cursor: "pointer", userSelect: "none" }}>
                        Set as default shipping address
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                      className="profile-btn" 
                      onClick={handleAddressSave} 
                      disabled={loading}
                    >
                      {loading ? "Saving Address..." : addressMode === "add" ? "Save Address" : "Update Address"}
                    </button>
                    <button 
                      className="profile-tab-btn" 
                      onClick={() => {
                        setAddressMode("list");
                        setEditingAddressId(null);
                      }}
                      style={{ borderRadius: "980px", padding: "0.8rem 2rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS VIEW */}
          {activeTab === "orders" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f4f4f5", margin: "0 0 0.3rem" }}>Shopping Activity</h3>
                <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: 0 }}>Review items you have purchased, track delivery statuses, and verify billing totals</p>
              </div>

              {customerOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.03)", border: "1px solid #27272a", margin: "0 auto 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem"
                  }}>🛒</div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f4f4f5", marginBottom: "0.5rem" }}>
                    No Orders Placed Yet
                  </h4>
                  <p style={{ color: "#a1a1aa", fontSize: "0.82rem", marginBottom: "1.5rem", maxWidth: "300px", margin: "0 auto 1.5rem" }}>
                    Browse our premium inventory catalogs and add listings to your checkout cart!
                  </p>
                  <button className="profile-btn" onClick={() => navigate("/")}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "#09090b", border: "1px solid #27272a", padding: "1rem", borderRadius: "12px" }}>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase" }}>Total Orders</p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "1.4rem", fontWeight: 700, color: "#e2b87f" }}>{customerOrders.length}</p>
                    </div>
                    <div style={{ background: "#09090b", border: "1px solid #27272a", padding: "1rem", borderRadius: "12px" }}>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase" }}>In Transit</p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "1.4rem", fontWeight: 700, color: "#30d158" }}>{pendingOrders.length}</p>
                    </div>
                  </div>

                  {latestOrder && (
                    <div>
                      <h4 style={{ fontSize: "0.8rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Most Recent Transaction
                      </h4>
                      <div className="latest-order-card">
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid #27272a", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                          <div>
                            <span style={{ fontSize: "0.68rem", color: "#a1a1aa" }}>ORDER ID</span>
                            <p style={{ margin: "0.1rem 0 0", fontSize: "0.8rem", fontWeight: 600 }}>{latestOrder._id}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: "0.68rem", color: "#a1a1aa" }}>TOTAL PAID</span>
                            <p style={{ margin: "0.1rem 0 0", fontSize: "0.85rem", fontWeight: 700, color: "#e2b87f" }}>₹{latestOrder.total?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: "0.68rem", color: "#a1a1aa" }}>STATUS</span>
                            <p style={{ margin: "0.1rem 0 0", fontSize: "0.85rem", fontWeight: 700, color: latestOrder.trackingStatus === "Cancelled" ? "#ff453a" : "#30d158" }}>
                              {latestOrder.trackingStatus || "Placed"}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
                          {latestOrder.items?.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#d1d1d6" }}>
                              <span>{item.name} ✕ {item.quantity}</span>
                              <span style={{ color: "#a1a1aa" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <button 
                          className="profile-btn" 
                          style={{ padding: "0.5rem 1.25rem", fontSize: "0.78rem", width: "100%" }}
                          onClick={() => navigate(`/orders/${latestOrder._id}/tracking`)}
                        >
                          Track Delivery Shipment
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <button 
                      onClick={() => navigate("/orders")}
                      style={{ background: "transparent", border: "none", color: "#e2b87f", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                    >
                      View All Past Orders History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADMIN HUB GATE */}
          {activeTab === "admin" && (
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "rgba(226, 184, 127, 0.15)", color: "#e2b87f", margin: "0 auto 1.5rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem"
              }}>🛡️</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5", marginBottom: "0.5rem" }}>
                Partner Seller Portal
              </h3>
              <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "2rem", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: "1.6" }}>
                You have administrative access to this storefront. Click below to launch the Seller Hub, where you can modify catalog listings, fulfill shipments, and review revenue graphs.
              </p>
              <button
                style={profileStyles ? { ...btnStyle, background: "#e2b87f", color: "#09090b" } : {}}
                className="profile-btn"
                onClick={() => navigate("/admin")}
              >
                Launch Seller Hub →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#e2b87f",
  color: "#09090b",
  border: "none",
  borderRadius: "980px",
  padding: "0.8rem 2rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  transition: "all 0.2s ease"
};

export default Profile;