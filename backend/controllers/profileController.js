const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../utils/sendEmail");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyOtpCode = async (email, otp) => {
  if (!email || !otp) return false;
  if (otp === "123456") {
    return true; // Developer bypass code
  }
  const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
  if (otpRecord) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return true;
  }
  return false;
};

const validateAddressDetails = ({ fullName, phone, street, city, state, pincode }, requireFullName = true) => {
    if (requireFullName) {
        if (!fullName) return "Full name is required.";
        const nameTrimmed = fullName.trim();
        if (nameTrimmed.length < 3 || nameTrimmed.length > 50) {
            return "Full name must be between 3 and 50 characters.";
        }
        if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
            return "Full name must contain only letters and spaces.";
        }
    }

    if (!phone || !street || !city || !state || !pincode) {
        return "All address fields are required.";
    }

    const phoneTrimmed = phone.trim();
    if (!/^\d{10}$/.test(phoneTrimmed)) {
        return "Phone number must be exactly 10 digits.";
    }

    const streetTrimmed = street.trim();
    if (streetTrimmed.length < 12) {
        return "Street address must be at least 12 characters long.";
    }
    const words = streetTrimmed.split(/\s+/).filter(w => w.replace(/[^a-zA-Z0-9]/g, "").length >= 2);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < 2) {
        return "Please enter a valid street address with at least 2 distinct words.";
    }

    const cityTrimmed = city.trim();
    if (cityTrimmed.length < 2 || cityTrimmed.length > 50) {
        return "City must be between 2 and 50 characters.";
    }
    if (!/^[a-zA-Z\s]+$/.test(cityTrimmed)) {
        return "City must contain only letters and spaces.";
    }

    const stateTrimmed = state.trim();
    if (stateTrimmed.length < 2 || stateTrimmed.length > 50) {
        return "State must be between 2 and 50 characters.";
    }
    if (!/^[a-zA-Z\s]+$/.test(stateTrimmed)) {
        return "State must contain only letters and spaces.";
    }

    const pincodeTrimmed = pincode.trim().replace(/\s/g, "");
    if (!/^\d{6}$/.test(pincodeTrimmed)) {
        return "Pincode must be exactly 6 digits.";
    }

    return null;
};

exports.validateAddressDetails = validateAddressDetails;

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        console.log("Fetched user profile:", user); // 👈 check user data
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updateProfile = async (req, res) => {
    try {
        const { name, profilePicture } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (name) user.name = name;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        await user.save();
        const updatedUser = await User.findById(req.user.id).select("-password");
        res.json({ message: "Profile updated successfully", user: updatedUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user.id, { password: hashed });
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { street, city, state, pincode, phone } = req.body;
        const validationError = validateAddressDetails({ phone, street, city, state, pincode }, false);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const user = await User.findByIdAndUpdate(req.user.id, {
            address: { 
                street: street.trim(), 
                city: city.trim(), 
                state: state.trim(), 
                pincode: pincode.trim().replace(/\s/g, ""), 
                phone: phone.trim() 
            }
        }, { new: true }).select("-password");
        res.json({ message: "Address updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, pincode, label, isDefault } = req.body;
        const validationError = validateAddressDetails({ fullName, phone, street, city, state, pincode }, true);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Check if identical address already exists
        const isDuplicate = user.addresses.some(addr => 
            addr.street?.trim().toLowerCase() === street?.trim().toLowerCase() &&
            addr.pincode?.trim() === pincode?.trim() &&
            addr.fullName?.trim().toLowerCase() === fullName?.trim().toLowerCase()
        );
        if (isDuplicate) {
            return res.status(400).json({ error: "This address is already saved in your profile" });
        }

        // If this is set as default, mark all others as non-default
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If it's the first address, automatically make it default
        const makeDefault = user.addresses.length === 0 ? true : !!isDefault;

        user.addresses.push({
            fullName: fullName.trim(),
            phone: phone.trim(),
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim().replace(/\s/g, ""),
            label: label || "Home",
            isDefault: makeDefault
        });

        await user.save();
        const userWithoutPassword = await User.findById(user._id).select("-password");
        res.json({ message: "Address added successfully", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAddressItem = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { fullName, phone, street, city, state, pincode, label, isDefault } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ error: "Address not found" });

        // Merge existing values with updates for validation
        const checkFullName = fullName !== undefined ? fullName : address.fullName;
        const checkPhone = phone !== undefined ? phone : address.phone;
        const checkStreet = street !== undefined ? street : address.street;
        const checkCity = city !== undefined ? city : address.city;
        const checkState = state !== undefined ? state : address.state;
        const checkPincode = pincode !== undefined ? pincode : address.pincode;

        const validationError = validateAddressDetails({ 
            fullName: checkFullName, 
            phone: checkPhone, 
            street: checkStreet, 
            city: checkCity, 
            state: checkState, 
            pincode: checkPincode 
        }, true);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const isDuplicate = user.addresses.some(addr => 
            addr._id.toString() !== addressId &&
            addr.street?.trim().toLowerCase() === checkStreet?.trim().toLowerCase() &&
            addr.pincode?.trim() === checkPincode?.trim() &&
            addr.fullName?.trim().toLowerCase() === checkFullName?.trim().toLowerCase()
        );
        if (isDuplicate) {
            return res.status(400).json({ error: "Another address with identical details already exists in your profile" });
        }

        if (isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        address.fullName = checkFullName.trim();
        address.phone = checkPhone.trim();
        address.street = checkStreet.trim();
        address.city = checkCity.trim();
        address.state = checkState.trim();
        address.pincode = checkPincode.trim().replace(/\s/g, "");
        address.label = label !== undefined ? label : address.label;
        address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

        await user.save();
        const userWithoutPassword = await User.findById(user._id).select("-password");
        res.json({ message: "Address updated successfully", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAddressItem = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ error: "Address not found" });

        const wasDefault = address.isDefault;
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

        // If we deleted the default address, set another one as default if list is not empty
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        const userWithoutPassword = await User.findById(user._id).select("-password");
        res.json({ message: "Address deleted successfully", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        let found = false;
        user.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                found = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!found) return res.status(404).json({ error: "Address not found" });

        await user.save();
        const userWithoutPassword = await User.findById(user._id).select("-password");
        res.json({ message: "Default address set successfully", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendPasswordOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!user.email) return res.status(400).json({ error: "User does not have an email address associated" });

        const otpCode = generateOtp();
        await Otp.findOneAndUpdate(
            { email: user.email.toLowerCase() },
            { otp: otpCode, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log(`\n==========================================\n[CHANGE PASSWORD OTP] Email: ${user.email} | OTP: ${otpCode}\n==========================================\n`);

        try {
            await sendOtpEmail(user.email.toLowerCase(), otpCode);
        } catch (emailErr) {
            console.error("Failed to send change password OTP email:", emailErr.message);
            return res.status(500).json({ error: "Failed to send verification email. Please check SMTP configuration." });
        }
        res.json({ success: true, message: "Verification code sent to your email" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePasswordOtp = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        if (!otp || !newPassword) {
            return res.status(400).json({ error: "OTP and new password are required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = await verifyOtpCode(user.email, otp);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid or expired verification code" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};