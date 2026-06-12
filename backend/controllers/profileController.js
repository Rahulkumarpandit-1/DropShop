const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select("-password");
        res.json({ message: "Profile updated", user });

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
        const user = await User.findByIdAndUpdate(req.user.id, {
            address: { street, city, state, pincode, phone }
        }, { new: true }).select("-password");
        res.json({ message: "Address updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, pincode, label, isDefault } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // If this is set as default, mark all others as non-default
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If it's the first address, automatically make it default
        const makeDefault = user.addresses.length === 0 ? true : !!isDefault;

        user.addresses.push({
            fullName,
            phone,
            street,
            city,
            state,
            pincode,
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

        if (isDefault) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        address.fullName = fullName !== undefined ? fullName : address.fullName;
        address.phone = phone !== undefined ? phone : address.phone;
        address.street = street !== undefined ? street : address.street;
        address.city = city !== undefined ? city : address.city;
        address.state = state !== undefined ? state : address.state;
        address.pincode = pincode !== undefined ? pincode : address.pincode;
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