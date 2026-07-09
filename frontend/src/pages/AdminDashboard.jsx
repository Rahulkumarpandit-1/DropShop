import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getProducts,
  addProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin,
  changeUserPasswordAdmin
} from "../services/api";
import toast from "react-hot-toast";

const categoryMap = {
  All: [],
  Electronic: ["Phones", "Laptops", "Audio", "Tools", "Accessories"],
  Fashion: ["Shirts", "Jeans", "Shoes", "Dresses", "Ethnic"],
  Accessories: ["Watches", "Bags", "Jewellery", "Sunglasses"],
  Home: ["Furniture", "Kitchen", "Decor", "Lighting"],
  Kids: ["Toys", "Clothing", "Baby Care"]
};

const dashboardStyles = `
  .seller-layout {
    display: flex;
    min-height: 100vh;
    background: #09090b;
    color: #f4f4f5;
    font-family: 'Inter', sans-serif;
  }
  
  /* Sidebar */
  .seller-sidebar {
    width: 260px;
    background: #18181b;
    border-right: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #27272a;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .sidebar-menu {
    padding: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }
  
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: #a1a1aa;
    text-decoration: none;
    border-left: 3px solid transparent;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .sidebar-link:hover {
    color: #f4f4f5;
    background: rgba(255, 255, 255, 0.03);
  }
  
  .sidebar-link.active {
    color: #e2b87f;
    background: rgba(226, 184, 127, 0.08);
    border-left: 3px solid #e2b87f;
    font-weight: 600;
  }
  
  .sidebar-footer {
    padding: 1.5rem 1rem;
    border-top: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  /* Main Content */
  .seller-main {
    margin-left: 260px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: all 0.3s ease;
  }
  
  .seller-header {
    height: 64px;
    background: #18181b;
    border-bottom: 1px solid #27272a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    z-index: 90;
  }
  
  .menu-toggle-btn {
    display: none;
    background: none;
    border: none;
    color: #f4f4f5;
    font-size: 1.25rem;
    cursor: pointer;
  }
  
  .seller-body {
    padding: 2rem;
    flex: 1;
    overflow-y: auto;
  }
  
  /* Metrics Card */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .metric-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: transparent;
    transition: all 0.3s ease;
  }
  
  .metric-card:hover {
    border-color: rgba(226, 184, 127, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }
  
  .metric-card:hover::before {
    background: #e2b87f;
  }
  
  .metric-card.alert:hover::before {
    background: #ff453a;
  }
  
  .metric-info h4 {
    font-size: 0.75rem;
    color: #a1a1aa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem 0;
  }
  
  .metric-info .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f4f4f5;
  }
  
  .metric-info .subtext {
    font-size: 0.72rem;
    color: #71717a;
    margin-top: 0.25rem;
  }
  
  .metric-icon {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #e2b87f;
  }
  
  /* Cards */
  .dashboard-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .card-header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #27272a;
    padding-bottom: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .card-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: #f4f4f5;
    margin: 0;
  }
  
  /* Tables */
  .seller-table-container {
    overflow-x: auto;
  }
  
  .seller-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  .seller-table th {
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #a1a1aa;
    font-weight: 600;
    border-bottom: 1px solid #27272a;
    letter-spacing: 0.05em;
  }
  
  .seller-table td {
    padding: 1rem;
    font-size: 0.85rem;
    color: #e4e4e7;
    border-bottom: 1px solid #27272a;
  }
  
  .table-row:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
  
  /* Status Badges */
  .status-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 600;
  }
  
  .status-pill.placed { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
  .status-pill.confirmed { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
  .status-pill.shipped { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
  .status-pill.delivery { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
  .status-pill.delivered { background: rgba(16, 185, 129, 0.15); color: #10b981; }
  .status-pill.cancelled { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  
  /* Stock Badges */
  .stock-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 600;
  }
  
  .stock-pill.instock { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .stock-pill.lowstock { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .stock-pill.outofstock { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  
  /* Modals */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  
  .seller-modal {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 20px;
    width: 100%;
    max-width: 550px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  
  .modal-header-container {
    padding: 1.5rem;
    border-bottom: 1px solid #27272a;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-header-container h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #f4f4f5;
  }
  
  .modal-close-btn {
    background: none;
    border: none;
    color: #a1a1aa;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
  }
  
  .modal-close-btn:hover {
    color: #f4f4f5;
  }
  
  .modal-content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .modal-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #27272a;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
  
  /* Form Controls */
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #a1a1aa;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .form-input {
    width: 100%;
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    color: #f4f4f5;
    font-size: 0.88rem;
    outline: none;
    font-family: inherit;
    transition: all 0.2s ease;
  }
  
  .form-input:focus {
    border-color: #e2b87f;
    box-shadow: 0 0 0 1px #e2b87f;
  }
  
  /* Filter Pills */
  .filter-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-pill {
    padding: 0.5rem 1rem;
    background: #18181b;
    border: 1px solid #27272a;
    color: #a1a1aa;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  
  .filter-pill:hover {
    color: #f4f4f5;
    border-color: #71717a;
  }
  
  .filter-pill.active {
    background: rgba(226, 184, 127, 0.1);
    border-color: #e2b87f;
    color: #e2b87f;
  }
  
  .filter-pill-count {
    background: rgba(255,255,255,0.08);
    color: #f4f4f5;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-weight: 600;
  }
  
  .filter-pill.active .filter-pill-count {
    background: #e2b87f;
    color: #09090b;
  }
  
  /* Responsive and Layout Overrides */
  .mobile-top-bar {
    display: none;
  }
  
  .mobile-close-btn {
    display: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  html, body {
    background-color: #09090b !important;
  }

  @media (max-width: 992px) {
    .mobile-top-bar {
      display: flex !important;
    }
    .seller-sidebar {
      left: -260px;
      padding-top: 60px;
    }
    .seller-sidebar.open {
      left: 0;
    }
    .mobile-close-btn {
      display: block !important;
    }
    .seller-main {
      margin-left: 0 !important;
    }
    .seller-header {
      margin-top: 52px;
      position: sticky;
      top: 52px;
      z-index: 90;
    }
    .seller-body {
      padding: 1rem;
      overflow-y: visible;
    }
    .menu-toggle-btn {
      display: block !important;
    }
    .dashboard-two-col {
      grid-template-columns: 1fr !important;
    }
  }
`;

function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search and Filters state
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productSubcategoryFilter, setProductSubcategoryFilter] = useState("All");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Electronic",
    subcategory: "Phones",
    description: "",
    image: "",
    images: [],
    stock: "",
    sourceUrl: ""
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Editing state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Electronic",
    subcategory: "",
    description: "",
    image: "",
    images: [],
    stock: "",
    sourceUrl: ""
  });

  // User Management state
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [adminUserPassword, setAdminUserPassword] = useState("");

  useEffect(() => {
    checkAdminAccess();

    // Check for Meesho product import query parameter
    const params = new URLSearchParams(window.location.search);
    const importDataStr = params.get("importData");
    if (importDataStr) {
      try {
        const imported = JSON.parse(decodeURIComponent(importDataStr));
        if (imported && imported.name) {
          setNewProduct({
            name: imported.name || "",
            price: imported.price || "",
            originalPrice: imported.originalPrice || "",
            category: imported.category || "Electronic",
            subcategory: imported.subcategory || "Phones",
            description: imported.description || "",
            image: imported.image || "",
            images: imported.images || [],
            stock: imported.stock || "100",
            sourceUrl: imported.sourceUrl || ""
          });
          setIsAddModalOpen(true);
          toast.success("Product imported from Meesho! Review details before saving.");
          
          // Clear query params so reloading doesn't prompt again
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (err) {
        console.error("Failed to parse importData:", err);
        toast.error("Failed to import product data");
      }
    }
  }, []);

  const checkAdminAccess = async () => {
    try {
      const data = await getProfile();
      if (data && data.user && data.user.role === "admin") {
        setIsAdmin(true);
        setCurrentUserId(data.user._id);
        fetchOrders();
        fetchProductsList();
        fetchUsersList();
      } else {
        toast.error("Access denied. Admin only.");
        navigate("/");
      }
    } catch (err) {
      console.error("Admin check failed", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const data = await getAllUsersAdmin();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load users");
    }
  };

  const handleUpdateUserRole = async (userId, targetRole) => {
    if (userId === currentUserId && targetRole !== "admin") {
      toast.error("You cannot demote yourself from admin status.");
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to ${targetRole}?`)) {
      fetchUsersList();
      return;
    }

    try {
      const res = await updateUserRoleAdmin(userId, targetRole);
      if (res.message && res.message.includes("successfully")) {
        toast.success(res.message);
        fetchUsersList();
      } else {
        toast.error(res.error || "Failed to update role");
        fetchUsersList();
      }
    } catch (err) {
      console.error("Update role error", err);
      toast.error("Failed to update user role");
      fetchUsersList();
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      try {
        const res = await deleteUserAdmin(userId);
        if (res.message && res.message.includes("successfully")) {
          toast.success(res.message);
          fetchUsersList();
        } else {
          toast.error(res.error || "Failed to delete user");
        }
      } catch (err) {
        console.error("Delete user error:", err);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!adminUserPassword || adminUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await changeUserPasswordAdmin(selectedUser._id, adminUserPassword);
      if (res.message && res.message.includes("successfully")) {
        toast.success(`Password for ${selectedUser.name} updated successfully!`);
        setIsChangePasswordModalOpen(false);
        setSelectedUser(null);
        setAdminUserPassword("");
      } else {
        toast.error(res.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      toast.error("Failed to update user password");
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Failed to load orders");
    }
  };

  const fetchProductsList = async () => {
    try {
      const data = await getProducts(1, "All");
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Failed to load products");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusAdmin(orderId, newStatus, `Order status updated to ${newStatus}`);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error", err);
      toast.error("Failed to update order status");
    }
  };

  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleNewProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const compressed = [];
    const toastId = toast.loading("Uploading and compressing images...");
    try {
      for (const file of files) {
        const base64 = await compressImage(file);
        compressed.push(base64);
      }

      const updatedImages = [...(newProduct.images || []), ...compressed];
      const updatedMainImage = newProduct.image || compressed[0] || "";

      setNewProduct(prev => ({
        ...prev,
        images: updatedImages,
        image: updatedMainImage
      }));
      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images", { id: toastId });
    }
  };

  const handleGenerateAiImage = async () => {
    if (!newProduct.name) {
      return toast.error("Please enter a product title first to generate an image!");
    }
    const toastId = toast.loading("Generating AI product image...");
    try {
      const prompt = encodeURIComponent(`high resolution premium product photography, studio lighting, white background, ${newProduct.name}`);
      const seed = Math.floor(Math.random() * 100000);
      let imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=800&nologo=true&seed=${seed}`;
      
      if (newProduct.image) {
        imageUrl += `&image=${encodeURIComponent(newProduct.image)}`;
      }
      
      setNewProduct(prev => ({
        ...prev,
        image: imageUrl,
        images: [imageUrl, ...(prev.images || []).slice(1)]
      }));
      toast.success("AI Image generated successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI image", { id: toastId });
    }
  };

  const handleGenerateAiImageEdit = async () => {
    if (!editProduct.name) {
      return toast.error("Please enter a product title first to generate an image!");
    }
    const toastId = toast.loading("Generating AI product image...");
    try {
      const prompt = encodeURIComponent(`high resolution premium product photography, studio lighting, white background, ${editProduct.name}`);
      const seed = Math.floor(Math.random() * 100000);
      let imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=800&nologo=true&seed=${seed}`;
      
      if (editProduct.image) {
        imageUrl += `&image=${encodeURIComponent(editProduct.image)}`;
      }
      
      setEditProduct(prev => ({
        ...prev,
        image: imageUrl,
        images: [imageUrl, ...(prev.images || []).slice(1)]
      }));
      toast.success("AI Image generated successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI image", { id: toastId });
    }
  };

  const handleEditProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const compressed = [];
    const toastId = toast.loading("Uploading and compressing images...");
    try {
      for (const file of files) {
        const base64 = await compressImage(file);
        compressed.push(base64);
      }

      const updatedImages = [...(editProduct.images || []), ...compressed];
      const updatedMainImage = editProduct.image || compressed[0] || "";

      setEditProduct(prev => ({
        ...prev,
        images: updatedImages,
        image: updatedMainImage
      }));
      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images", { id: toastId });
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const { name, price, originalPrice, category, subcategory, description, image, images, stock } = newProduct;
    if (!name || !price || !category || !subcategory || !description || !image || stock === "") {
      return toast.error("Please fill all product fields");
    }

    try {
      const res = await addProductAdmin({
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category,
        subcategory,
        description,
        image,
        images: images && images.length > 0 ? images : [image],
        stock: Number(stock),
        sourceUrl
      });
      if (res.message && res.message.includes("successfully")) {
        toast.success("Product added successfully!");
        setNewProduct({
          name: "",
          price: "",
          originalPrice: "",
          category: "Electronic",
          subcategory: "Phones",
          description: "",
          image: "",
          images: [],
          stock: "",
          sourceUrl: ""
        });
        setIsAddModalOpen(false);
        fetchProductsList();
      } else {
        toast.error(res.error || res.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Add product error", err);
      toast.error("Failed to add product");
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setEditProduct({
      name: product.name || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      category: product.category || "Electronic",
      subcategory: product.subcategory || "",
      description: product.description || "",
      image: product.image || "",
      images: product.images || (product.image ? [product.image] : []),
      stock: product.stock !== undefined ? product.stock : "",
      sourceUrl: product.sourceUrl || ""
    });
  };

  const handleUpdateProductSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const res = await updateProductAdmin(id, {
        ...editProduct,
        price: Number(editProduct.price),
        originalPrice: editProduct.originalPrice ? Number(editProduct.originalPrice) : null,
        images: editProduct.images && editProduct.images.length > 0 ? editProduct.images : [editProduct.image],
        stock: Number(editProduct.stock),
        sourceUrl: editProduct.sourceUrl
      });
      if (res.message && res.message.includes("successfully")) {
        toast.success("Product updated successfully!");
        setEditingProductId(null);
        fetchProductsList();
      } else {
        toast.error(res.error || res.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Update product error", err);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await deleteProductAdmin(id);
      if (res.message && res.message.includes("deleted")) {
        toast.success("Product deleted successfully!");
        fetchProductsList();
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Delete product error", err);
      toast.error("Failed to delete product");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Helper calculations for Overview
  const activeOrders = orders.filter(o => o.trackingStatus !== "Cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.trackingStatus === "Placed" || o.trackingStatus === "Confirmed").length;

  // Filter lists
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === "All" || o.trackingStatus === orderStatusFilter;
    const lowerSearch = orderSearchQuery.toLowerCase();
    const matchesSearch =
      o._id.toLowerCase().includes(lowerSearch) ||
      (o.userId?.name || "").toLowerCase().includes(lowerSearch) ||
      (o.userId?.email || "").toLowerCase().includes(lowerSearch);
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter(p => {
    const matchesCategory = productCategoryFilter === "All" || p.category === productCategoryFilter;
    const matchesSubcategory = productSubcategoryFilter === "All" || p.subcategory === productSubcategoryFilter;
    const lowerSearch = productSearchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(lowerSearch) ||
      (p.description || "").toLowerCase().includes(lowerSearch);
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const filteredUsers = users.filter(u => {
    const lowerSearch = userSearchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(lowerSearch) ||
      (u.phone || "").toLowerCase().includes(lowerSearch) ||
      (u.email || "").toLowerCase().includes(lowerSearch) ||
      (u.role || "").toLowerCase().includes(lowerSearch)
    );
  });

  const bookmarksletHref = `javascript:void((function(){try{const getHighRes=function(url){if(!url)return '';return url.replace(/_[a-z0-9]+\\.(webp|jpg|jpeg|png)/i,'_512.$1');};let name=document.querySelector('meta[property="og:title"]')?.content||document.querySelector('h1')?.innerText||'';name=name.replace(/Buy\\\\s+|online\\\\s+at\\\\s+low\\\\s+price.*/i,'').trim();let image=getHighRes(document.querySelector('meta[property="og:image"]')?.content||'');let images=[];if(image)images.push(image);document.querySelectorAll('img').forEach(img=>{let src=img.src||img.getAttribute('data-src')||img.getAttribute('data-lazy')||'';if(src&&src.startsWith('https://images.meesho.com/')&&src.includes('/products/')){const highResUrl=getHighRes(src);if(!images.includes(highResUrl)){images.push(highResUrl);}}});let priceText='';let priceMeta=document.querySelector('meta[property="product:price:amount"]')?.content;if(priceMeta){priceText=priceMeta;}else{let bodyText=document.body.innerText;let match=bodyText.match(/₹\\\\s*([0-9,]+)/);if(match){priceText=match[1].replace(/,/g,'');}}let price=parseFloat(priceText)||0;let description=document.querySelector('meta[property="og:description"]')?.content||'';const importData={name,price,originalPrice:Math.round(price*1.5),image,images:images.slice(0,5),description:description.substring(0,1000),category:'All',stock:100,sourceUrl:window.location.href};const finalUrl='${window.location.origin}/admin?importData='+encodeURIComponent(JSON.stringify(importData));window.open(finalUrl,'_blank');}catch(e){alert('Import failed: '+e.message);}})());`;

  const linkRef = useRef(null);
  useEffect(() => {
    if (linkRef.current) {
      linkRef.current.setAttribute("href", bookmarksletHref);
    }
  }, [bookmarksletHref]);

  if (loading) {
    return (
      <div style={{ background: "#09090b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#a1a1aa", fontSize: "1rem", fontFamily: "Inter, sans-serif" }}>Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="seller-layout">
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar" style={{
        display: "none",
        background: "#18181b",
        borderBottom: "1px solid #27272a",
        padding: "0.75rem 1.5rem",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: "52px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#f4f4f5", fontSize: "1.25rem", cursor: "pointer" }}>
            ☰
          </button>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "Outfit", sans-serif", letterSpacing: "0.05em" }}>
            DropShop<span style={{ color: "#e2b87f" }}>.</span> <span style={{ fontSize: "0.72rem", color: "#a1a1aa", border: "1px solid #27272a", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>PARTNER</span>
          </span>
        </div>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#e2b87f", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
          Go to Shop
        </button>
      </div>

      {/* Sidebar Layout */}
      <div className={`seller-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, fontFamily: "Outfit", sans-serif", letterSpacing: "0.05em" }}>
              DropShop<span style={{ color: "#e2b87f" }}>.</span>
            </h2>
            <span style={{ fontSize: "0.68rem", color: "#a1a1aa", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Seller Hub</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: "1.25rem", cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <div className="sidebar-menu">
          <div
            className={`sidebar-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: "1.15rem" }}>📊</span> Dashboard Overview
          </div>
          <div
            className={`sidebar-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => { setActiveTab("orders"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: "1.15rem" }}>📦</span> Customer Orders
          </div>
          <div
            className={`sidebar-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => { setActiveTab("products"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: "1.15rem" }}>🏷️</span> Inventory Catalog
          </div>
          <div
            className={`sidebar-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: "1.15rem" }}>👥</span> User Management
          </div>
        </div>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 0.5rem 0.75rem", borderBottom: "1px solid #27272a", marginBottom: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e2b87f", color: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
              AD
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#f4f4f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Store Admin</p>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>admin@dropshop.com</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", background: "transparent", border: "1px solid #27272a", borderRadius: "8px", padding: "0.5rem", color: "#f4f4f5", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            <span>🏠</span> Back to Shop
          </button>
          <button
            onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "0.5rem", color: "#ef4444", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="seller-main">
        {/* Top Header Bar */}
        <header className="seller-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div style={{ fontSize: "0.82rem", color: "#a1a1aa", fontWeight: 500, letterSpacing: "0.02em" }}>
              Seller Central &gt; <span style={{ color: "#f4f4f5", fontWeight: 600, textTransform: "capitalize" }}>{activeTab}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => navigate("/")}
              style={{ background: "#e2b87f", color: "#09090b", border: "none", borderRadius: "980px", padding: "0.45rem 1.25rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 15px rgba(226, 184, 127, 0.3)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              Go to Storefront
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <main className="seller-body">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "Outfit", sans-serif", letterSpacing: "0.02em" }}>Dashboard Overview</h1>
                <p style={{ color: "#a1a1aa", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>Real-time catalog analytics, performance summaries, and active alerts</p>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-info">
                    <h4>Total Revenue</h4>
                    <div className="value">₹{totalRevenue.toLocaleString()}</div>
                    <div className="subtext">From {activeOrders.length} completed orders</div>
                  </div>
                  <div className="metric-icon">📈</div>
                </div>

                <div className="metric-card">
                  <div className="metric-info">
                    <h4>Orders Count</h4>
                    <div className="value">{orders.length}</div>
                    <div className="subtext">{pendingOrdersCount} awaiting shipments</div>
                  </div>
                  <div className="metric-icon">📦</div>
                </div>

                <div className="metric-card">
                  <div className="metric-info">
                    <h4>Catalog Listings</h4>
                    <div className="value">{products.length}</div>
                    <div className="subtext">Items listed in store</div>
                  </div>
                  <div className="metric-icon">🏷️</div>
                </div>

                <div className={`metric-card ${lowStockCount > 0 ? "alert" : ""}`}>
                  <div className="metric-info">
                    <h4>Low Stock Alerts</h4>
                    <div className="value" style={{ color: lowStockCount > 0 ? "#ff453a" : "#f4f4f5" }}>{lowStockCount}</div>
                    <div className="subtext">Require restocking</div>
                  </div>
                  <div className="metric-icon" style={{ color: lowStockCount > 0 ? "#ff453a" : "#e2b87f" }}>⚠️</div>
                </div>
              </div>

              {/* Graph & Dynamic Analytics */}
              <div className="dashboard-card" style={{ padding: "1.5rem 2rem" }}>
                <div className="card-header-flex" style={{ border: "none", marginBottom: "0.5rem" }}>
                  <div>
                    <h3 className="card-title">Weekly Revenue Trends</h3>
                    <p style={{ margin: "0.1rem 0 0", color: "#a1a1aa", fontSize: "0.75rem" }}>Daily product transaction volumes & store performance (Mock Data)</p>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#e2b87f", fontWeight: 600 }}>
                    +12.4% vs last week
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <svg viewBox="0 0 500 180" width="100%" height="180">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e2b87f" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#e2b87f" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="65" x2="480" y2="65" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="150" x2="480" y2="150" stroke="#27272a" strokeWidth="1" />

                    <path
                      d="M 40 140 L 110 115 L 180 130 L 250 85 L 320 95 L 390 60 L 460 45"
                      fill="none"
                      stroke="#e2b87f"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M 40 140 L 110 115 L 180 130 L 250 85 L 320 95 L 390 60 L 460 45 L 460 150 L 40 150 Z"
                      fill="url(#chartGradient)"
                    />

                    <circle cx="40" cy="140" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="110" cy="115" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="180" cy="130" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="250" cy="85" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="320" cy="95" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="390" cy="60" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />
                    <circle cx="460" cy="45" r="3.5" fill="#e2b87f" stroke="#09090b" strokeWidth="1.5" />

                    <text x="35" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Mon</text>
                    <text x="105" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Tue</text>
                    <text x="175" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Wed</text>
                    <text x="245" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Thu</text>
                    <text x="315" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Fri</text>
                    <text x="385" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Sat</text>
                    <text x="455" y="170" fill="#71717a" fontSize="8" fontFamily="Inter">Sun</text>
                  </svg>
                </div>
              </div>

              {/* Two Column Layout: Pending Orders and Out of stock warnings */}
              <div className="dashboard-two-col" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>

                {/* Pending Orders */}
                <div className="dashboard-card">
                  <div className="card-header-flex">
                    <h3 className="card-title">Recent Pending Shipments</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      style={{ background: "transparent", border: "none", color: "#e2b87f", fontSize: "0.78rem", cursor: "pointer", fontWeight: 500 }}
                    >
                      View All Orders →
                    </button>
                  </div>

                  {orders.filter(o => o.trackingStatus === "Placed" || o.trackingStatus === "Confirmed").length === 0 ? (
                    <p style={{ textAlign: "center", color: "#a1a1aa", fontSize: "0.85rem", padding: "2rem 0" }}>No pending order operations</p>
                  ) : (
                    <div className="seller-table-container">
                      <table className="seller-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.filter(o => o.trackingStatus === "Placed" || o.trackingStatus === "Confirmed").slice(0, 5).map(order => (
                            <tr key={order._id} className="table-row">
                              <td style={{ fontWeight: 600 }}>{order._id.substring(order._id.length - 8)}</td>
                              <td>{order.userId?.name || "Customer"}</td>
                              <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                              <td style={{ color: "#e2b87f", fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                              <td>
                                <span className={`status-pill ${order.trackingStatus?.toLowerCase().replace(/\s+/g, "") || "placed"}`}>
                                  {order.trackingStatus || "Placed"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Stock Warning Box */}
                <div className="dashboard-card">
                  <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>Restocking Alert Center</h3>

                  {lowStockCount === 0 ? (
                    <div style={{ textAlign: "center", color: "#a1a1aa", padding: "2.5rem 1rem" }}>
                      <p style={{ fontSize: "1.5rem", margin: 0 }}>✓</p>
                      <p style={{ fontSize: "0.8rem", margin: "0.5rem 0 0" }}>All listings healthy and in stock</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {products.filter(p => p.stock !== undefined && p.stock <= 5).slice(0, 5).map(product => (
                        <div key={product._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid #27272a", borderRadius: "10px", padding: "0.6rem 0.85rem" }}>
                          <img src={product.image} alt={product.name} style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "4px", background: "#09090b" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "#f4f4f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h4>
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "#a1a1aa" }}>ID: {product._id?.substring(product._id?.length - 6)}</p>
                          </div>
                          <div>
                            <span className={`stock-pill ${product.stock === 0 ? "outofstock" : "lowstock"}`} style={{ padding: "0.15rem 0.35rem", fontSize: "0.68rem" }}>
                              {product.stock === 0 ? "Out" : `${product.stock} left`}
                            </span>
                          </div>
                        </div>
                      ))}
                      {products.filter(p => p.stock !== undefined && p.stock <= 5).length > 5 && (
                        <button
                          onClick={() => { setActiveTab("products"); setProductCategoryFilter("All"); }}
                          style={{ background: "transparent", border: "none", color: "#e2b87f", fontSize: "0.75rem", cursor: "pointer", textAlign: "center", marginTop: "0.5rem" }}
                        >
                          View All low-stock listings
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "Outfit", sans-serif", letterSpacing: "0.02em" }}>Customer Shipments</h1>
                <p style={{ color: "#a1a1aa", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>Fulfill active orders, process payments, and trace client deliveries</p>
              </div>

              {/* Filters & Search Row */}
              <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontSize: "0.9rem" }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search orders by Order ID, Client Name or Email..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      style={{
                        width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: "10px", padding: "0.65rem 1rem 0.65rem 2.2rem", color: "#f4f4f5", fontSize: "0.84rem", outline: "none", transition: "all 0.2s"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="filter-pills-row">
                {[
                  { id: "All", label: "All Orders" },
                  { id: "Placed", label: "Placed" },
                  { id: "Confirmed", label: "Confirmed" },
                  { id: "Shipped", label: "Shipped" },
                  { id: "Out for Delivery", label: "Out for Delivery" },
                  { id: "Delivered", label: "Delivered" },
                  { id: "Cancelled", label: "Cancelled" }
                ].map(tab => {
                  const count = tab.id === "All"
                    ? orders.length
                    : orders.filter(o => o.trackingStatus === tab.id).length;
                  return (
                    <div
                      key={tab.id}
                      className={`filter-pill ${orderStatusFilter === tab.id ? "active" : ""}`}
                      onClick={() => setOrderStatusFilter(tab.id)}
                    >
                      {tab.label}
                      <span className="filter-pill-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "4rem 2rem", textAlign: "center" }}>
                  <span style={{ fontSize: "2rem" }}>📭</span>
                  <p style={{ color: "#a1a1aa", fontSize: "0.88rem", margin: "1rem 0 0" }}>No customer orders found matching your active filters</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {filteredOrders.map(order => (
                    <div key={order._id} style={{
                      background: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "1.25rem", overflow: "hidden"
                    }}>
                      {/* Top Header of Card */}
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid #27272a", paddingBottom: "1rem", marginBottom: "1rem" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Order ID</p>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "#f4f4f5" }}>
                            {order._id}
                            <span
                              style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#e2b87f", cursor: "pointer", textDecoration: "underline" }}
                              onClick={() => {
                                navigator.clipboard.writeText(order._id);
                                toast.success("Copied order ID");
                              }}
                            >Copy</span>
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Customer Detail</p>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", fontWeight: 500, color: "#f4f4f5" }}>
                            {order.userId?.name || "Deleted Customer"} ({order.userId?.email || "N/A"})
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Date / Payment</p>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#f4f4f5" }}>
                            {new Date(order.createdAt).toLocaleDateString()} / <span style={{ textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 }}>{order.paymentMethod || "COD"}</span>
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em" }}>Grand Total</p>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "1.1rem", fontWeight: 700, color: "#e2b87f" }}>₹{order.total?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Items & Shipping Status Panel */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                        <div style={{ flex: 1, minWidth: "250px" }}>
                          <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Order Items</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                                <span style={{ color: "#e4e4e7", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                                  <span>{item.name} <span style={{ color: "#a1a1aa" }}>x{item.quantity}</span></span>
                                  {item.productId && item.productId.sourceUrl && (
                                    <a href={item.productId.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#e2b87f", textDecoration: "none", fontSize: "0.7rem", border: "1px solid rgba(226, 184, 127, 0.4)", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(226, 184, 127, 0.1)", display: "inline-block" }}>
                                      Order on Meesho ↗
                                    </a>
                                  )}
                                </span>
                                <span style={{ color: "#a1a1aa" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dropdown status selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#09090b", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "1px solid #27272a" }}>
                          <span style={{ fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Fulfillment status</span>
                          <select
                            value={order.trackingStatus || "Placed"}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            style={{
                              background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.82rem", outline: "none", cursor: "pointer"
                            }}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY CATALOG */}
          {activeTab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "Outfit", sans-serif", letterSpacing: "0.02em" }}>Product Listings</h1>
                  <p style={{ color: "#a1a1aa", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>Update stock, prices, descriptions, and categories across listings</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  style={{
                    background: "#e2b87f", color: "#09090b", border: "none", borderRadius: "980px", padding: "0.6rem 1.5rem", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 15px rgba(226, 184, 127, 0.3)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  + Add New Product
                </button>
              </div>

              {/* Meesho Importer Banner */}
              <div style={{
                background: "linear-gradient(135deg, rgba(226, 184, 127, 0.08) 0%, rgba(24, 24, 27, 0.5) 100%)",
                border: "1px solid rgba(226, 184, 127, 0.2)",
                borderRadius: "16px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🛍️</span>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#e2b87f" }}>Meesho 1-Click Importer</h3>
                </div>
                <p style={{ color: "#a1a1aa", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                  Want to import products from Meesho without typing everything manually? 
                  Drag the button below to your browser's bookmarks bar. When viewing any product page on Meesho, click the bookmark to instantly pre-fill the product form on DropShop! (Make sure you are logged in to this Admin panel first).
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <a
                    ref={linkRef}
                    style={{
                      display: "inline-block",
                      background: "rgba(226, 184, 127, 0.15)",
                      color: "#e2b87f",
                      border: "1px dashed #e2b87f",
                      borderRadius: "980px",
                      padding: "0.5rem 1.25rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "grab",
                      transition: "all 0.2s"
                    }}
                    onClick={e => {
                      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toast.info("Drag this button to your browser's Bookmarks Bar!");
                      }
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(226, 184, 127, 0.25)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(226, 184, 127, 0.15)";
                    }}
                  >
                    📦 Drag to Bookmarks
                  </a>
                  <span style={{ color: "#71717a", fontSize: "0.8rem" }}>or</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(bookmarksletHref);
                      toast.success("Code copied! Right-click bookmarks bar -> Add Page -> Paste code in URL field.", { duration: 5000 });
                    }}
                    style={{
                      display: "inline-block",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#f4f4f5",
                      border: "1px solid #27272a",
                      borderRadius: "980px",
                      padding: "0.5rem 1.25rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
                  >
                    📋 Copy Bookmark Code
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "#71717a" }}>← Drag the link or copy code as a manual bookmark</span>
                </div>
              </div>

              {/* Filters and Searches */}
              <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>

                  {/* Search */}
                  <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontSize: "0.9rem" }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search listings by title or description..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      style={{
                        width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: "10px", padding: "0.65rem 1rem 0.65rem 2.2rem", color: "#f4f4f5", fontSize: "0.84rem", outline: "none"
                      }}
                    />
                  </div>

                  {/* Category Filter */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase" }}>Category</span>
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => {
                        setProductCategoryFilter(e.target.value);
                        setProductSubcategoryFilter("All");
                      }}
                      style={{
                        background: "#09090b", color: "#f4f4f5", border: "1px solid #27272a", borderRadius: "10px", padding: "0.65rem 1rem", fontSize: "0.84rem", outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Electronic">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home">Home</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {productCategoryFilter !== "All" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.78rem", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase" }}>Subcategory</span>
                      <select
                        value={productSubcategoryFilter}
                        onChange={(e) => setProductSubcategoryFilter(e.target.value)}
                        style={{
                          background: "#09090b", color: "#f4f4f5", border: "1px solid #27272a", borderRadius: "10px", padding: "0.65rem 1rem", fontSize: "0.84rem", outline: "none", cursor: "pointer"
                        }}
                      >
                        <option value="All">All Subcategories</option>
                        {(categoryMap[productCategoryFilter] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}

                </div>
              </div>

              {/* Product Catalog Table */}
              <div className="dashboard-card" style={{ padding: "1rem", overflow: "hidden" }}>
                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#a1a1aa", padding: "3rem 0" }}>
                    <p style={{ fontSize: "1.8rem", margin: 0 }}>🛍️</p>
                    <p style={{ fontSize: "0.85rem", marginTop: "1rem" }}>No products found matching your description or category filter</p>
                  </div>
                ) : (
                  <div className="seller-table-container">
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>Listing Image</th>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Category</th>
                          <th>Stock Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => {
                          let stockClass = "instock";
                          let stockLabel = "In Stock";
                          if (product.stock === 0) {
                            stockClass = "outofstock";
                            stockLabel = "Out of Stock";
                          } else if (product.stock <= 5) {
                            stockClass = "lowstock";
                            stockLabel = `Low Stock (${product.stock})`;
                          } else {
                            stockLabel = `In Stock (${product.stock})`;
                          }

                          return (
                            <tr key={product._id} className="table-row">
                              <td style={{ width: "80px" }}>
                                <img src={product.image} alt={product.name} style={{ width: "44px", height: "44px", objectFit: "contain", background: "#09090b", borderRadius: "8px", padding: "0.2rem", border: "1px solid #27272a" }} />
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#f4f4f5" }}>{product.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "0.15rem", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.description}</div>
                              </td>
                              <td style={{ color: "#e2b87f", fontWeight: 600 }}>
                                <div>₹{product.price?.toLocaleString()}</div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <div style={{ fontSize: "0.72rem", color: "#71717a", textDecoration: "line-through", fontWeight: 400 }}>
                                    ₹{product.originalPrice?.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                  <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.04)", border: "1px solid #27272a", padding: "0.2rem 0.5rem", borderRadius: "4px", textTransform: "capitalize", width: "fit-content" }}>{product.category}</span>
                                  {product.subcategory && (
                                    <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>{product.subcategory}</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`stock-pill ${stockClass}`}>
                                  {stockLabel}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                  <button
                                    onClick={() => handleEditClick(product)}
                                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #27272a", color: "#f4f4f5", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)", color: "#ff453a", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,48,0.18)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,59,48,0.08)"}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "Outfit", sans-serif", letterSpacing: "0.02em" }}>User & Staff Management</h1>
                <p style={{ color: "#a1a1aa", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>View registered customers and promote staff members to admin roles</p>
              </div>

              {/* Filters & Search Row */}
              <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#71717a", fontSize: "0.9rem" }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search users by name, email, phone, or role..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      style={{
                        width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: "10px", padding: "0.65rem 1rem 0.65rem 2.2rem", color: "#f4f4f5", fontSize: "0.84rem", outline: "none", transition: "all 0.2s"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Users Catalog Table */}
              <div className="dashboard-card" style={{ padding: "1rem", overflow: "hidden" }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#a1a1aa", padding: "3rem 0" }}>
                    <p style={{ fontSize: "1.8rem", margin: 0 }}>👥</p>
                    <p style={{ fontSize: "0.85rem", marginTop: "1rem" }}>No users found matching your search</p>
                  </div>
                ) : (
                  <div className="seller-table-container">
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user._id} className="table-row">
                            <td style={{ fontWeight: 600, color: "#f4f4f5" }}>
                              {user.name} {user._id === currentUserId && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "rgba(226, 184, 127, 0.15)", color: "#e2b87f", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>YOU</span>}
                            </td>
                            <td>{user.phone || "N/A"}</td>
                            <td>{user.email || "N/A"}</td>
                            <td>
                              <span className={`status-pill ${user.role === "admin" ? "delivered" : "confirmed"}`} style={{ textTransform: "capitalize" }}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", alignItems: "center" }}>
                                <select
                                  value={user.role}
                                  disabled={user._id === currentUserId}
                                  onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                  style={{
                                    background: "#09090b", color: "#f4f4f5", border: "1px solid #27272a", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.78rem", outline: "none", cursor: user._id === currentUserId ? "not-allowed" : "pointer", opacity: user._id === currentUserId ? 0.6 : 1
                                  }}
                                >
                                  <option value="user">User (Customer)</option>
                                  <option value="admin">Admin (Staff)</option>
                                </select>

                                <button
                                  onClick={() => { setSelectedUser(user); setIsChangePasswordModalOpen(true); }}
                                  style={{
                                    background: "rgba(226, 184, 127, 0.08)",
                                    border: "1px solid rgba(226, 184, 127, 0.2)",
                                    color: "#e2b87f",
                                    borderRadius: "8px",
                                    padding: "0.4rem 0.6rem",
                                    fontSize: "0.78rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    transition: "all 0.2s"
                                  }}
                                  title="Change User Password"
                                  onMouseEnter={e => e.currentTarget.style.background = "rgba(226, 184, 127, 0.15)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "rgba(226, 184, 127, 0.08)"}
                                >
                                  🔑 Password
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  disabled={user._id === currentUserId}
                                  style={{
                                    background: "rgba(239, 68, 68, 0.08)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "#ef4444",
                                    borderRadius: "8px",
                                    padding: "0.4rem 0.6rem",
                                    fontSize: "0.78rem",
                                    cursor: user._id === currentUserId ? "not-allowed" : "pointer",
                                    opacity: user._id === currentUserId ? 0.4 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    transition: "all 0.2s"
                                  }}
                                  title="Delete User Account"
                                  onMouseEnter={e => { if (user._id !== currentUserId) e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"; }}
                                  onMouseLeave={e => { if (user._id !== currentUserId) e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"; }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="seller-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-container">
              <h3>Add Product to Catalog</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProductSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Product Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Vintage Leather Messenger Bag"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Source URL (Meesho Drop-shipping Link)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.sourceUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, sourceUrl: e.target.value })}
                    placeholder="https://www.meesho.com/s/p/..."
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="999"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (₹ - Optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      placeholder="1999"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Units</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const subcats = categoryMap[cat] || [];
                        setNewProduct({
                          ...newProduct,
                          category: cat,
                          subcategory: subcats[0] || ""
                        });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home">Home</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select
                      className="form-input"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                      style={{ cursor: "pointer" }}
                    >
                      {(categoryMap[newProduct.category] || []).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Product Images</span>
                    <span style={{ fontSize: "0.72rem", color: "#a1a1aa", fontWeight: 400 }}>(Add by URL or upload multiple from device)</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      type="text"
                      className="form-input"
                      id="new-product-url-input"
                      placeholder="Paste image URL (e.g. https://...)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("new-product-url-input");
                        const val = input.value.trim();
                        if (val) {
                          const updatedImages = [...(newProduct.images || []), val];
                          const updatedMain = newProduct.image || val;
                          setNewProduct(prev => ({
                            ...prev,
                            images: updatedImages,
                            image: updatedMain
                          }));
                          input.value = "";
                        }
                      }}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid #27272a",
                        color: "#f4f4f5",
                        borderRadius: "8px",
                        padding: "0 1rem",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Add URL
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAiImage}
                      style={{
                        background: "rgba(226, 184, 127, 0.12)",
                        border: "1px solid rgba(226, 184, 127, 0.3)",
                        color: "#e2b87f",
                        borderRadius: "8px",
                        padding: "0 1rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      ✨ Generate AI Cover
                    </button>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="new-product-file-upload"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1.5rem",
                        border: "2px dashed #27272a",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: "rgba(255,255,255,0.01)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#27272a"}
                    >
                      <span style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📁</span>
                      <span style={{ fontSize: "0.8rem", color: "#f4f4f5", fontWeight: 600 }}>Upload images from device</span>
                      <span style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "0.25rem" }}>Supports PNG, JPG, WEBP (Auto-compressed)</span>
                    </label>
                    <input
                      type="file"
                      id="new-product-file-upload"
                      multiple
                      accept="image/*"
                      onChange={handleNewProductImageUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                  {newProduct.images && newProduct.images.length > 0 && (
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "12px", border: "1px solid #27272a" }}>
                      {newProduct.images.map((imgUrl, idx) => {
                        const isCover = newProduct.image === imgUrl;
                        return (
                          <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", border: `2px solid ${isCover ? "var(--accent)" : "#27272a"}`, overflow: "hidden", background: "#09090b" }}>
                            <img src={imgUrl} alt="gallery" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedImages = newProduct.images.filter((_, i) => i !== idx);
                                let updatedMain = newProduct.image;
                                if (isCover) {
                                  updatedMain = updatedImages[0] || "";
                                }
                                setNewProduct(prev => ({
                                  ...prev,
                                  images: updatedImages,
                                  image: updatedMain
                                }));
                              }}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "rgba(255, 59, 48, 0.8)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                fontSize: "0.7rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                            >
                              ×
                            </button>
                            {isCover ? (
                              <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--accent)", color: "#000", fontSize: "0.62rem", fontWeight: 700, textAlign: "center", padding: "1px 0" }}>
                                COVER
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setNewProduct(prev => ({ ...prev, image: imgUrl }))}
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "rgba(0,0,0,0.6)",
                                  color: "#fff",
                                  border: "none",
                                  fontSize: "0.6rem",
                                  textAlign: "center",
                                  padding: "2px 0",
                                  cursor: "pointer"
                                }}
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Detailed specifications, warranty details, fabric structure etc..."
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ background: "transparent", border: "1px solid #27272a", color: "#a1a1aa", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#e2b87f", color: "#09090b", border: "none", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {editingProductId !== null && (
        <div className="modal-backdrop" onClick={() => setEditingProductId(null)}>
          <div className="seller-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-container">
              <h3>Edit Catalog Listing</h3>
              <button className="modal-close-btn" onClick={() => setEditingProductId(null)}>✕</button>
            </div>
            <form onSubmit={(e) => handleUpdateProductSubmit(e, editingProductId)} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Product Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Source URL (Meesho Drop-shipping Link)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editProduct.sourceUrl || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, sourceUrl: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original Price (₹ - Optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editProduct.originalPrice}
                      onChange={(e) => setEditProduct({ ...editProduct, originalPrice: e.target.value })}
                      placeholder="e.g. 1999"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={editProduct.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const subcats = categoryMap[cat] || [];
                        setEditProduct({
                          ...editProduct,
                          category: cat,
                          subcategory: subcats[0] || ""
                        });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Electronic">Electronic</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home">Home</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select
                      className="form-input"
                      value={editProduct.subcategory}
                      onChange={(e) => setEditProduct({ ...editProduct, subcategory: e.target.value })}
                      style={{ cursor: "pointer" }}
                    >
                      {(categoryMap[editProduct.category] || []).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Product Images</span>
                    <span style={{ fontSize: "0.72rem", color: "#a1a1aa", fontWeight: 400 }}>(Add by URL or upload multiple from device)</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      type="text"
                      className="form-input"
                      id="edit-product-url-input"
                      placeholder="Paste image URL (e.g. https://...)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("edit-product-url-input");
                        const val = input.value.trim();
                        if (val) {
                          const updatedImages = [...(editProduct.images || []), val];
                          const updatedMain = editProduct.image || val;
                          setEditProduct(prev => ({
                            ...prev,
                            images: updatedImages,
                            image: updatedMain
                          }));
                          input.value = "";
                        }
                      }}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid #27272a",
                        color: "#f4f4f5",
                        borderRadius: "8px",
                        padding: "0 1rem",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Add URL
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAiImageEdit}
                      style={{
                        background: "rgba(226, 184, 127, 0.12)",
                        border: "1px solid rgba(226, 184, 127, 0.3)",
                        color: "#e2b87f",
                        borderRadius: "8px",
                        padding: "0 1rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      ✨ Generate AI Cover
                    </button>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="edit-product-file-upload"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1.5rem",
                        border: "2px dashed #27272a",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: "rgba(255,255,255,0.01)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#27272a"}
                    >
                      <span style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📁</span>
                      <span style={{ fontSize: "0.8rem", color: "#f4f4f5", fontWeight: 600 }}>Upload images from device</span>
                      <span style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "0.25rem" }}>Supports PNG, JPG, WEBP (Auto-compressed)</span>
                    </label>
                    <input
                      type="file"
                      id="edit-product-file-upload"
                      multiple
                      accept="image/*"
                      onChange={handleEditProductImageUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                  {editProduct.images && editProduct.images.length > 0 && (
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "12px", border: "1px solid #27272a" }}>
                      {editProduct.images.map((imgUrl, idx) => {
                        const isCover = editProduct.image === imgUrl;
                        return (
                          <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", border: `2px solid ${isCover ? "var(--accent)" : "#27272a"}`, overflow: "hidden", background: "#09090b" }}>
                            <img src={imgUrl} alt="gallery" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedImages = editProduct.images.filter((_, i) => i !== idx);
                                let updatedMain = editProduct.image;
                                if (isCover) {
                                  updatedMain = updatedImages[0] || "";
                                }
                                setEditProduct(prev => ({
                                  ...prev,
                                  images: updatedImages,
                                  image: updatedMain
                                }));
                              }}
                              style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "rgba(255, 59, 48, 0.8)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                fontSize: "0.7rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                            >
                              ×
                            </button>
                            {isCover ? (
                              <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--accent)", color: "#000", fontSize: "0.62rem", fontWeight: 700, textAlign: "center", padding: "1px 0" }}>
                                COVER
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditProduct(prev => ({ ...prev, image: imgUrl }))}
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "rgba(0,0,0,0.6)",
                                  color: "#fff",
                                  border: "none",
                                  fontSize: "0.6rem",
                                  textAlign: "center",
                                  padding: "2px 0",
                                  cursor: "pointer"
                                }}
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingProductId(null)}
                  style={{ background: "transparent", border: "1px solid #27272a", color: "#a1a1aa", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#e2b87f", color: "#09090b", border: "none", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD (ADMIN ACTION ON USER) */}
      {isChangePasswordModalOpen && selectedUser && (
        <div className="modal-backdrop" onClick={() => { setIsChangePasswordModalOpen(false); setSelectedUser(null); setAdminUserPassword(""); }}>
          <div className="seller-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-container">
              <h3>Change Password for {selectedUser.name}</h3>
              <button className="modal-close-btn" onClick={() => { setIsChangePasswordModalOpen(false); setSelectedUser(null); setAdminUserPassword(""); }}>✕</button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div className="modal-content">
                <div style={{ background: "rgba(226, 184, 127, 0.05)", border: "1px solid rgba(226, 184, 127, 0.15)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#e2b87f", lineHeight: "1.4" }}>
                    <strong>User Details:</strong><br />
                    Email: {selectedUser.email || "N/A"}<br />
                    Phone: {selectedUser.phone || "N/A"}<br />
                    Role: {selectedUser.role}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={adminUserPassword}
                    onChange={(e) => setAdminUserPassword(e.target.value)}
                    placeholder="Enter new secure password (min. 6 characters)"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setIsChangePasswordModalOpen(false); setSelectedUser(null); setAdminUserPassword(""); }}
                  style={{ background: "transparent", border: "1px solid #27272a", color: "#a1a1aa", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#e2b87f", color: "#09090b", border: "none", borderRadius: "980px", padding: "0.5rem 1.5rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
