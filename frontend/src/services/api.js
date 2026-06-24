export const BASE_URL = (() => {
  let url = import.meta.env.VITE_API_URL;
  if (url) {
    url = url.trim().replace(/\/$/, "");
    if (!url.endsWith("/api")) {
      url += "/api";
    }
    return url;
  }
  const hostname = window.location.hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "") {
    return `http://${hostname}:3000/api`;
  }
  return "http://localhost:3000/api";
})();

export const getProducts = async (page, category = "All", search = "") => {
  try {
    let url = `${BASE_URL}/products?page=${page}`;
    if (category && category !== "All") {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export const getTrendingProducts = async (limit = 8) => {
  try {
    const res = await fetch(`${BASE_URL}/products/trending?limit=${limit}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching trending products:", err);
    return [];
  }
};

export const addToCart = async (productId, variantSku = "", selectedAttributes = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not logged in");
    }
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId, variantSku, selectedAttributes })
    });
    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Add to cart error:", err);
  }
};

export const getCart = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not logged in");
    }
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error("Failed to fetch cart");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("getCart error:", err.message);
    return { items: [] };
  }
};

export const updateCartItem = async (itemId, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/${itemId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ quantity })
  });
  return res.json();
};

export const validateCoupon = async (code, cartTotal) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ code, cartTotal })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("validateCoupon API error:", err);
    return { error: err.message };
  }
};

export const placeOrder = async (address, itemId = null, couponCode = "") => {
  console.log("sending itemId:", itemId, "couponCode:", couponCode);
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/place`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ address, itemId, couponCode })
  });
  const data = await res.json();
  console.log("placeOrder response:", data);
  return data;
};

export const getOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  console.log("Fetching profile with token:", token);
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const changePassword = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateAddress = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/address`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const addAddress = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateAddressItem = async (addressId, data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteAddress = async (addressId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const setDefaultAddress = async (addressId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/profile/addresses/${addressId}/default`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const createRazorpayOrder = async (amount) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  return res.json();
};

export const verifyPayment = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const addReview = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getReviews = async (productId) => {
  const res = await fetch(`${BASE_URL}/reviews/${productId}`);
  return res.json();
};

export const deleteReview = async (reviewId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const getAllOrdersAdmin = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/admin/orders`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const updateOrderStatusAdmin = async (orderId, status, message = "") => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/admin/${orderId}/tracking`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status, message })
  });
  return res.json();
};

export const addProductAdmin = async (productData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  return res.json();
};

export const updateProductAdmin = async (productId, productData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  return res.json();
};

export const deleteProductAdmin = async (productId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return res.json();
};

export const resetPassword = async (token, password) => {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  return res.json();
};

export const getWishlist = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { wishlist: [] };
  const res = await fetch(`${BASE_URL}/wishlist`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const toggleWishlist = async (productId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication required");
  const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ productId })
  });
  return res.json();
};

export const cancelOrder = async (orderId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const getAllUsersAdmin = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const updateUserRoleAdmin = async (userId, role) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  return res.json();
};

export const checkPincode = async (pincode) => {
  try {
    const res = await fetch(`${BASE_URL}/pincodes/check/${pincode}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("checkPincode API error:", err);
    return { serviceable: false, error: err.message };
  }
};