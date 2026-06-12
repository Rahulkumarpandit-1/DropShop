const BASE_URL = "http://localhost:3000/api";

export const getProducts = async (page,category="All") => {
  try {
       const query = category && category !== "All" ? `&category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`http://localhost:3000/api/products?page=${page}${query}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};


export const addToCart = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User not logged in");
    }
     
    const res = await fetch("http://localhost:3000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
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

    const res = await fetch("http://localhost:3000/api/cart", {
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
  const res = await fetch(`http://localhost:3000/api/cart/${itemId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ quantity })
  });
  return res.json();
};

export const placeOrder = async (address, itemId = null, couponCode = "") => {
 console.log("sending itemId:", itemId, "couponCode:", couponCode);
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/orders/place", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ address, itemId, couponCode })
  });

  const data = await res.json();
  console.log("placeOrder response:", data); // 👈 what error comes back?
  return data;
};
export const getOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/orders", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  console.log("Fetching profile with token:", token); // 👈 check token value
  const res = await fetch("http://localhost:3000/api/profile", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

export const updateProfile = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export const changePassword = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export const updateAddress = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export const addAddress = async (data) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/profile/addresses", {
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
  const res = await fetch(`http://localhost:3000/api/profile/addresses/${addressId}`, {
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
  const res = await fetch(`http://localhost:3000/api/profile/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const setDefaultAddress = async (addressId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/api/profile/addresses/${addressId}/default`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};
// api.js — add these at the bottom

export const createRazorpayOrder = async (amount) => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/payment/create-order", {
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
  const res = await fetch("http://localhost:3000/api/payment/verify", {
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
  const res = await fetch("http://localhost:3000/api/reviews", {
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
  const res = await fetch(`http://localhost:3000/api/reviews/${productId}`);
  return res.json();
};

export const deleteReview = async (reviewId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const getAllOrdersAdmin = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/orders/admin/orders", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const updateOrderStatusAdmin = async (orderId, status, message = "") => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/api/orders/admin/${orderId}/tracking`, {
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
  const res = await fetch("http://localhost:3000/api/products", {
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
  const res = await fetch(`http://localhost:3000/api/products/${productId}`, {
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
  const res = await fetch(`http://localhost:3000/api/products/${productId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const forgotPassword = async (email) => {
  const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return res.json();
};

export const resetPassword = async (token, password) => {
  const res = await fetch("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  return res.json();
};

export const getWishlist = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { wishlist: [] };
  const res = await fetch("http://localhost:3000/api/wishlist", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const toggleWishlist = async (productId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication required");
  const res = await fetch("http://localhost:3000/api/wishlist/toggle", {
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
  const res = await fetch(`http://localhost:3000/api/orders/${orderId}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};

export const getAllUsersAdmin = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/admin/users", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
};

export const updateUserRoleAdmin = async (userId, role) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  return res.json();
};