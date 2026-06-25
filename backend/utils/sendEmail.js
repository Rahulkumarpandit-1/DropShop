const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderConfirmation = async (to, order) => {
  const transporter = createTransporter();

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5; vertical-align: middle;">
        <img src="${item.image}" width="64" height="64"
          style="border-radius: 12px; object-fit: contain; background: #f8f8f8; padding: 4px;" />
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111;">${item.name}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; text-align: right;">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #111;">₹${(item.price * item.quantity).toLocaleString()}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999;">₹${item.price.toLocaleString()} each</p>
      </td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"DropShop" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Order Confirmed #${order._id.toString().slice(-6).toUpperCase()} — DropShop`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">
        DropShop<span style="color: #e8d5b7;">.</span>
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">PREMIUM SHOPPING</p>
    </div>

    <!-- Success Banner -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 40px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(48,209,88,0.15); border: 2px solid #30d158; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; text-align: center; font-size: 28px;">✅</div>
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700;">Order Confirmed!</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6;">
        Thank you for your order. We'll start processing it right away<br/>and notify you when it's on its way.
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">

      <!-- Order ID + Status -->
      <div style="background: #f8f8f8; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #111; font-family: monospace;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>
            </td>
            <td style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Status</p>
              <span style="display: inline-block; margin-top: 4px; background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 980px; border: 1px solid #a5d6a7;">
                ✓ ${order.status || "Placed"}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <h3 style="margin: 0 0 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Items Ordered</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        ${itemsHtml}
      </table>

      <!-- Price Summary -->
      <div style="background: #f8f8f8; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 13px; color: #555; padding-bottom: 8px;">Subtotal</td>
            <td style="text-align: right; font-size: 13px; color: #111; padding-bottom: 8px;">₹${order.total?.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #555; padding-bottom: 16px;">Delivery</td>
            <td style="text-align: right; font-size: 13px; color: #30d158; font-weight: 600; padding-bottom: 16px;">FREE</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: 1px solid #e5e5e5; padding-top: 16px;"></td>
          </tr>
          <tr>
            <td style="font-size: 15px; font-weight: 700; color: #111;">Total</td>
            <td style="text-align: right; font-size: 18px; font-weight: 800; color: #111;">₹${order.total?.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <!-- Delivery Address -->
      <div style="background: #f8f8f8; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
        <p style="margin: 0 0 12px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Address</p>
        <p style="margin: 0; font-size: 14px; color: #111; font-weight: 600;">${order.address?.fullName}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #555; line-height: 1.6;">
          ${order.address?.street}<br/>
          ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
        </p>
        <p style="margin: 8px 0 0; font-size: 13px; color: #555;">📞 ${order.address?.phone}</p>
      </div>

      <!-- Payment -->
      <div style="background: #f8f8f8; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">💳 Payment Method</p>
        <p style="margin: 0; font-size: 14px; color: #111; font-weight: 600;">
          ${order.paymentMethod === "COD" ? "💵 Cash on Delivery" : "💳 " + order.paymentMethod}
        </p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999;">
          ${order.paymentMethod === "COD" ? "Pay when your order arrives" : "Payment completed online"}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="http://localhost:5173/orders"
          style="display: inline-block; background: #111; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 980px; font-size: 14px; font-weight: 600;">
          Track Your Order →
        </a>
      </div>

      <!-- Features -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        <tr>
          <td width="33%" style="text-align: center; padding: 16px; background: #f8f8f8; border-radius: 12px;">
            <p style="margin: 0 0 6px; font-size: 20px;">🚚</p>
            <p style="margin: 0; font-size: 11px; color: #555; font-weight: 600;">Free Delivery</p>
          </td>
          <td width="4%"></td>
          <td width="33%" style="text-align: center; padding: 16px; background: #f8f8f8; border-radius: 12px;">
            <p style="margin: 0 0 6px; font-size: 20px;">↩️</p>
            <p style="margin: 0; font-size: 11px; color: #555; font-weight: 600;">7 Day Returns</p>
          </td>
          <td width="4%"></td>
          <td width="33%" style="text-align: center; padding: 16px; background: #f8f8f8; border-radius: 12px;">
            <p style="margin: 0 0 6px; font-size: 20px;">🔒</p>
            <p style="margin: 0; font-size: 11px; color: #555; font-weight: 600;">Secure Payment</p>
          </td>
        </tr>
      </table>

    </div>

    <!-- Footer -->
    <div style="background: #111; padding: 24px 40px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; color: #fff;">DropShop<span style="color: #e8d5b7;">.</span></p>
      <p style="margin: 0 0 16px; font-size: 12px; color: #86868b;">Premium products delivered to your door</p>
      <div style="margin-bottom: 16px;">
        <a href="http://localhost:5173" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Home</a>
        <a href="http://localhost:5173/orders" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Orders</a>
        <a href="http://localhost:5173/profile" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Profile</a>
      </div>
      <p style="margin: 0; font-size: 11px; color: #444;">© 2026 DropShop. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.log("sendMail error:", err.message);
  }
};

const sendWelcomeEmail = async (to, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"DropShop" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Welcome to DropShop! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff;">DropShop<span style="color: #e8d5b7;">.</span></h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">PREMIUM SHOPPING</p>
    </div>

    <!-- Welcome Banner -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 40px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(232,213,183,0.15); border: 2px solid #e8d5b7; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px; text-align: center;">🎉</div>
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700;">Welcome, ${name}!</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6;">
        Your account has been created successfully.<br/>Start exploring premium products!
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <h3 style="margin: 0 0 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999;">What you get with DropShop</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        ${[
        { icon: "🛍️", title: "Premium Products", sub: "Curated selection of quality products" },
        { icon: "🚚", title: "Free Delivery", sub: "On every single order, no minimums" },
        { icon: "💵", title: "Cash on Delivery", sub: "Pay when your order arrives" },
        { icon: "↩️", title: "Easy Returns", sub: "7 day hassle-free return policy" },
      ].map(({ icon, title, sub }) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f5f5f5; vertical-align: middle; width: 48px;">
              <span style="font-size: 24px;">${icon}</span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111;">${title}</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #999;">${sub}</p>
            </td>
          </tr>
        `).join("")}
      </table>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="http://localhost:5173"
          style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 980px; font-size: 14px; font-weight: 600;">
          Start Shopping →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #111; padding: 24px 40px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; color: #fff;">DropShop<span style="color: #e8d5b7;">.</span></p>
      <p style="margin: 0; font-size: 11px; color: #444;">© 2026 DropShop. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", to);
  } catch (err) {
    console.log("Welcome email error:", err.message);
  }
};

const sendPasswordResetEmail = async (to, token) => {
  const transporter = createTransporter();
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    from: `"DropShop" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reset Your Password — DropShop 🔒`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff;">DropShop<span style="color: #e8d5b7;">.</span></h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">PREMIUM SHOPPING</p>
    </div>

    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 40px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(232,213,183,0.15); border: 2px solid #e8d5b7; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px; text-align: center;">🔒</div>
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700;">Password Reset Request</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6;">
        We received a request to reset your password.<br/>Click the button below to choose a new one.
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px; text-align: center;">
      <p style="margin: 0 0 24px; font-size: 15px; color: #555; line-height: 1.6;">
        This password reset link is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetUrl}"
          style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 980px; font-size: 14px; font-weight: 600;">
          Reset Password →
        </a>
      </div>
      
      <p style="margin: 24px 0 0; font-size: 12px; color: #999;">
        If you're having trouble with the button above, copy and paste the URL below into your web browser:<br/>
        <a href="${resetUrl}" style="color: #0f3460; text-decoration: underline;">${resetUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #111; padding: 24px 40px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; color: #fff;">DropShop<span style="color: #e8d5b7;">.</span></p>
      <p style="margin: 0; font-size: 11px; color: #444;">© 2026 DropShop. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", to);
  } catch (err) {
    console.log("Password reset email error:", err.message);
  }
};

const sendOrderStatusUpdateEmail = async (to, order, status, message) => {
  const transporter = createTransporter();

  const statusColors = {
    Placed: "#3b82f6",
    Confirmed: "#8b5cf6",
    Shipped: "#f59e0b",
    "Out for Delivery": "#f97316",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
  };
  const color = statusColors[status] || "#111111";

  const mailOptions = {
    from: `"DropShop" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🔔 Order Status Update #${order._id.toString().slice(-6).toUpperCase()}: ${status} — DropShop`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">
        DropShop<span style="color: #e8d5b7;">.</span>
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">PREMIUM SHOPPING</p>
    </div>

    <!-- Status Banner -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 40px; text-align: center;">
      <div style="display: inline-block; background: ${color}20; border: 2px solid ${color}; color: #ffffff; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 980px; margin-bottom: 16px;">
        ${status.toUpperCase()}
      </div>
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700;">Order Status Updated</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">
        ${message || `Your order status has been updated to ${status}.`}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">

      <!-- Order ID + Status -->
      <div style="background: #f8f8f8; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #111; font-family: monospace;">
                #${order._id.toString().toUpperCase()}
              </p>
            </td>
            <td style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Estimated Delivery</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #22c55e;">
                ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "TBD"}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
        <a href="http://localhost:5173/orders/${order._id}/tracking"
          style="display: inline-block; background: #111; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 980px; font-size: 14px; font-weight: 600;">
          Track Live Order Status →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #111; padding: 24px 40px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; color: #fff;">DropShop<span style="color: #e8d5b7;">.</span></p>
      <p style="margin: 0 0 16px; font-size: 12px; color: #86868b;">Premium products delivered to your door</p>
      <div style="margin-bottom: 16px;">
        <a href="http://localhost:5173" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Home</a>
        <a href="http://localhost:5173/orders" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Orders</a>
        <a href="http://localhost:5173/profile" style="color: #86868b; text-decoration: none; font-size: 12px; margin: 0 8px;">Profile</a>
      </div>
      <p style="margin: 0; font-size: 11px; color: #444;">© 2026 DropShop. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${to} (Status: ${status})`);
  } catch (err) {
    console.error("sendOrderStatusUpdateEmail error:", err.message);
  }
};

const sendOtpEmail = async (to, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"DropShop" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🔐 Your Verification Code is ${otp} — DropShop`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff;">DropShop<span style="color: #e8d5b7;">.</span></h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">SECURE ACCESS</p>
    </div>
    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 40px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(232,213,183,0.15); border: 2px solid #e8d5b7; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px; text-align: center;">🔐</div>
      <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700;">Verification Code</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6;">
        Please use the verification code below to verify your identity.
      </p>
    </div>
    <!-- Body -->
    <div style="padding: 32px 40px; text-align: center;">
      <div style="display: inline-block; background: #f8f8f8; border: 1px dashed #e2e8f0; border-radius: 12px; padding: 16px 32px; margin: 8px 0 24px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111111; font-family: monospace;">${otp}</span>
      </div>
      <p style="margin: 0 0 24px; font-size: 14px; color: #555; line-height: 1.6;">
        This code is valid for <strong>5 minutes</strong>. If you did not request this verification, please ignore this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="background: #111; padding: 24px 40px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; color: #fff;">DropShop<span style="color: #e8d5b7;">.</span></p>
      <p style="margin: 0; font-size: 11px; color: #444;">© 2026 DropShop. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to:", to);
  } catch (err) {
    console.log("OTP email error:", err.message);
  }
};

const sendLoginNotificationEmail = async (to, userAgent, ipAddress) => {
  const transporter = createTransporter();
  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const mailOptions = {
    from: `"DropShop Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚨 New Sign-in Alert — DropShop`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
  <div style="max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: #111111; padding: 32px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px;">
        DropShop<span style="color: #e8d5b7;">.</span>
      </h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #86868b; letter-spacing: 0.5px;">SECURITY ALERT</p>
    </div>

    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #1e1e24, #2a2b36); padding: 40px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(255,159,10,0.15); border: 2px solid #ff9f0a; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; text-align: center; font-size: 28px;">🔑</div>
      <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff; font-weight: 700;">New Account Sign-in</h2>
      <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6;">
        A new sign-in was detected on your DropShop account.
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="font-size: 14px; color: #333333; margin: 0 0 20px; line-height: 1.6;">
        Hello,
      </p>
      <p style="font-size: 14px; color: #333333; margin: 0 0 24px; line-height: 1.6;">
        Your DropShop account was signed in from a new device or browser session. Below are the details of this activity:
      </p>

      <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #555555;">
          <tr>
            <td style="padding-bottom: 10px; font-weight: 600; color: #888888;" width="35%">Time</td>
            <td style="padding-bottom: 10px; color: #111111;">${dateStr} (IST)</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; font-weight: 600; color: #888888;">Device/Browser</td>
            <td style="padding-bottom: 10px; color: #111111; word-break: break-all;">${userAgent || "Unknown"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #888888;">IP Address</td>
            <td style="color: #111111;">${ipAddress || "Unknown"}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #999999; margin: 0 0 24px; line-height: 1.6;">
        If this was you, you can safely ignore this email. If you do not recognize this activity, please change your password immediately in your account settings or contact support.
      </p>

      <div style="text-align: center;">
        <a href="https://frontend-liard-nine-30.vercel.app/profile" 
           style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 980px; font-size: 13px; font-weight: 600; transition: background 0.2s;">
          Manage Your Account
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f8f8; padding: 20px 40px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="margin: 0; font-size: 11px; color: #999999;">
        © ${new Date().getFullYear()} DropShop. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Sign-in alert email sent successfully to:", to);
  } catch (err) {
    console.error("Failed to send sign-in alert email:", err.message);
  }
};

// Test SMTP connection on startup
const verifyTransporter = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("SMTP Connection verified - Ready to send emails!");
  } catch (err) {
    console.log("SMTP Warning (Verification failed):", err.message);
  }
};
verifyTransporter();

module.exports = { 
  sendOrderConfirmation, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendOrderStatusUpdateEmail, 
  sendOtpEmail,
  sendLoginNotificationEmail
};