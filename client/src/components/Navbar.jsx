import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

function Navbar({ handleLogout }) {
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/profile");

      setProfilePic(res.data.user?.profileImage || "");
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  const uploadProfile = async (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    // Instant preview
    const previewUrl = URL.createObjectURL(file);
    setProfilePic(previewUrl);

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await api.post(
        "/user/profile-image",
        formData
      );

      setProfilePic(
        res.data.user?.profileImage || ""
      );

      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Profile upload error:", error);

      // Reload previous saved image
      await fetchProfile();

      toast.error(
        error.response?.data?.message ||
          "Failed to upload profile picture"
      );
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadProfile(file);
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 md:px-8 py-4 rounded-xl shadow-lg">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        {/* LOGO */}
        <h1 className="text-2xl md:text-3xl font-bold">
          Expense Tracker
        </h1>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* PROFILE */}
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            title="Change profile picture"
            className="relative group disabled:cursor-not-allowed"
          >
            <img
              src={profilePic || "/default-profile.png"}
              alt="Profile"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-105"
            />

            {!uploading && (
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity">
                Edit
              </span>
            )}

            {uploading && (
              <span className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </button>

          {/* HIDDEN INPUT */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFileChange}
          />

          {/* CHANGE PROFILE */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-white text-blue-600 px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading
              ? "Uploading..."
              : "Change Profile"}
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={uploading}
            className="bg-red-500 px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;