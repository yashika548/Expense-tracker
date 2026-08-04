import { useState, useEffect, useRef } from "react";
import api from "../services/api";

function Navbar({ handleLogout }) {
  const [profilePic, setProfilePic] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfilePic(res.data.user.profilePic);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadProfile = async (file) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const res = await api.put("/user/upload-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfilePic(res.data.user.profilePic);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center px-8 py-3 rounded-xl shadow-lg">

      <h1 className="text-3xl font-bold">
        Expense Tracker
      </h1>

      <div className="flex items-center gap-5">

        <img
          src={
            profilePic ||
            "https://via.placeholder.com/150"
          }
          alt=""
          className="w-14 h-14 rounded-full object-cover border-2 border-white"
        />

        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(e) => {
            if (e.target.files[0]) {
              uploadProfile(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={() => inputRef.current.click()}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
        >
          Change Profile
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;