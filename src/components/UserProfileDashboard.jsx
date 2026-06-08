import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../supabase-client";
import {
  User,
  Phone,
  Calendar,
  Mail,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft,
  Camera,
  Image,
  Upload,
  Users,
  Church,
} from "lucide-react";

const PRESET_AVATARS = [
  {
    name: "Grace Teal",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    name: "Caleb Slate",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    name: "Mercy Emerald",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    name: "Joshua Gold",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    name: "Zoe Azure",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    name: "Timothy Indigo",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

export default function UserProfileDashboard({
  session,
  userData,
  onUpdateProfile,
  onBackToHome,
}) {
  const [newFirstName, setFirstName] = useState(userData?.firstName || "");
  const [newLastName, setLastName] = useState(userData?.lastName || "");
  const [newPhoneNumber, setPhoneNumber] = useState(
    userData?.phoneNumber || "",
  );
  const [newGender, setGender] = useState(userData?.gender || "");
  const [newChurch, setChurch] = useState(userData?.churches?.id || "");
  const [newChurchName, setChurchName] = useState(
    userData?.churches?.name || "",
  );
  const [newBirthDate, setBirthDate] = useState(userData?.birthDate || "");
  const [password, setPassword] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(userData?.profileImg || "");
  const [userRole, setUserRole] = useState(userData?.role || "");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  //const [profileImgUrl, setProfileImgUrl] = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    let profileImgUrl = null;

    if (!newFirstName.trim() || !newLastName.trim()) {
      setErrorMsg("First name and last name are required fields.");
      setIsSubmitting(false);
      return;
    }

    if (photoFile) {
      profileImgUrl = await uploadImage(photoFile);
      setPhotoUrl(profileImgUrl); // update preview immediately
    }

    // Build update object only with changed fields
    const updates = {};
    if (newFirstName !== userData.firstName) updates.firstName = newFirstName;
    if (newLastName !== userData.lastName) updates.lastName = newLastName;
    if (newBirthDate !== userData.birthDate) updates.birthDate = newBirthDate;
    if (newPhoneNumber !== userData.phoneNumber)
      updates.phoneNumber = newPhoneNumber;
    if (newGender !== userData.gender) updates.gender = newGender;
    if (newChurch !== userData.churches?.id) updates.churchID = newChurch;
    if (profileImgUrl && profileImgUrl !== userData.profileImg)
      updates.profileImg = profileImgUrl;
    if (photoUrl && photoUrl !== userData.profileImg)
      updates.profileImg = photoUrl;

    // If no changes, show error instead of updating
    if (Object.keys(updates).length === 0) {
      setErrorMsg("No changes detected. Please update a field before saving.");
      setTimeout(() => setErrorMsg(""), 5000);
      setIsSubmitting(false);
      return;
    }

    // Add lastUpdateDate if there are changes
    updates.lastUpdateDate = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id);

    if (!error) {
      onUpdateProfile(); // refresh parent data
      setSuccessMsg("Profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } else {
      setErrorMsg(error.message || "Failed to update profile.");
    }

    setIsSubmitting(false);
  };

  const uploadImage = async (file) => {
    const filePath = `${file.name}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("profile-pic")
      .upload(filePath, file);

    if (error) {
      console.log("Error uploading Image:", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("profile-pic")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Handle local file base64 encoding conversion
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Restrict to reasonably sized files under 2MB to fit smoothly into Supabase strings
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(
          "Please select an image file under 2MB to guarantee instant mobile sync.",
        );
        return;
      }

      setPhotoFile(file); // keep File object for Supabase upload

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoUrl(reader.result);
          setSuccessMsg(
            'Custom profile picture uploaded. Click "Save Profile Changes" below to sync.',
          );
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      };
      reader.onerror = () => {
        setErrorMsg(
          "Error processing selected image file. Please try a different profile photo.",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const phoneNumberChangeHandler = (e) => {
    // Remove all non-digits
    let digits = e.target.value.replace(/\D/g, "");

    // Convert +639... → 09...
    if (digits.startsWith("639")) {
      digits = "09" + digits.slice(3);
    }

    // Limit to max 11 digits
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setPhoneNumber(digits);

    // Validation: must be exactly 11 digits (ignoring dashes)
    const plainDigits = digits.replace(/-/g, "");
    if (plainDigits.length !== 11) {
      setErrorMsg("Phone number must be exactly 11 digits.");
    } else {
      setErrorMsg("");
    }
  };

  useEffect(() => {
    if (photoUrl) {
      console.log("Photo URL updated");
    }
  }, [photoUrl]);

  return (
    <div
      className="bg-slate-50 min-h-screen py-10"
      id="profile-dashboard-layout"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back and Breadcrumb panel */}
        <div
          className="flex items-center justify-between"
          id="profile-dashboard-header"
        >
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            id="profile-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Community Home</span>
          </button>

          <div
            className="flex items-center gap-2 text-xs text-slate-400 font-mono"
            id="profile-mode-indicator"
          >
            <span className="h-2.5 w-2.5 rounded-full  bg-emerald-500 animate-pulse" />
            <span>CLOUD AUTHENTICATED</span>
          </div>
        </div>

        {/* Outer Frame with Split Screen UI */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          id="profile-split-container"
        >
          {/* Col 1: Bio & Security Level */}
          <div
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs h-fit space-y-6"
            id="profile-sidebar-card"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Circular Avatar Facebook style with hover upload trigger */}
              <div
                className="relative group"
                id="profile-avatar-uploader-shell"
              >
                <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center font-sans font-bold text-3xl text-indigo-700 overflow-hidden relative">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="User avatar preview"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-600/10 flex items-center justify-center text-indigo-700">
                      {newFirstName[0]}
                      {newLastName[0]}
                    </div>
                  )}
                </div>

                {/* Facebook/Instagram style circular edit overlay button */}
                <label
                  htmlFor="avatar-file-upload"
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full border border-white shadow-md cursor-pointer transition transform hover:scale-110 flex items-center justify-center"
                  title="Upload profile picture"
                  id="avatar-upload-trigger-label"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="avatar-file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h2 className="font-sans font-extrabold text-slate-800 text-lg leading-tight">
                  {userData.firstName} {userData.lastName}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      userRole === "Admin"
                        ? "bg-red-100 text-red-800"
                        : userRole === "Pastor"
                          ? "bg-indigo-100 text-indigo-800"
                          : userRole === "Secretary"
                            ? "bg-sky-100 text-sky-800"
                            : userRole === "Treasurer"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {userRole} Officer
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-sans">
                    {newChurchName} Chapel
                  </span>
                </div>
              </div>
            </div>

            <div
              className="border-t border-slate-100 pt-4 space-y-4"
              id="profile-status-summary"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                  SECURE EMAIL IDENTIFIER
                </span>
                <span className="text-xs text-slate-600 font-sans break-all font-semibold">
                  {session.user.email}
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("avatar-file-upload")?.click()
                  }
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  id="direct-upload-helper-btn"
                >
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Upload Custom Photo</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                  PORTAL DATABASE ASSIGNMENT
                </span>
                <span className="text-xs text-slate-600 font-sans font-semibold">
                  {newChurchName} Church Database
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                  SECURITY LEVEL
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Multifactor Handshake Completed</span>
                </div>
              </div>
              {userData.gender && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    GENDER
                  </span>
                  <span className="text-xs text-slate-600 font-sans font-semibold">
                    {userData.gender}
                  </span>
                </div>
              )}

              {newChurch && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                    CHURCH AFFILIATION
                  </span>
                  <span className="text-xs text-slate-600 font-sans font-semibold">
                    {userData.churches?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Col 2 & 3: Interactive Settings Form */}
          <div
            className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
            id="profile-details-form-card"
          >
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-sans font-extrabold text-slate-900">
                  Personal Security Parameters
                </h3>
                <p className="text-xs text-slate-500">
                  Modify your localized database profile parameters.
                </p>
              </div>
              <User className="h-5 w-5 text-indigo-600" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
              id="profile-details-form"
            >
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Beautiful Interactive Avatar Presets Choice panel */}
              <div
                className="border border-indigo-50 bg-indigo-50/15 rounded-2xl p-4.5 space-y-3.5"
                id="profile-avatar-presets-box"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="h-4 w-4 text-indigo-600" />
                    <span>Choose Instant High-Quality Portrait Preset</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Instant selector
                  </span>
                </div>

                <div
                  className="grid grid-cols-6 gap-2.5"
                  id="preset-avatar-grid"
                >
                  {PRESET_AVATARS.map((avatar, idx) => {
                    const isSelected = photoUrl === avatar.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(avatar.url);
                          setSuccessMsg(
                            `Selected avatar preset: "${avatar.name}". Please click "Save Profile Changes" to register.`,
                          );
                          setTimeout(() => setSuccessMsg(""), 5000);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition transform hover:scale-105 active:scale-95 cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 ring-2 ring-indigo-500/30"
                            : "border-slate-205 hover:border-slate-300 bg-slate-100"
                        }`}
                        title={avatar.name}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                            <span className="bg-indigo-600 text-white p-0.5 rounded-full shadow-md">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <span>First Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                    placeholder="Enter first name"
                    id="profile-firstname-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <span>Last Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                    placeholder="Enter last name"
                    id="profile-lastname-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={newPhoneNumber}
                    onChange={phoneNumberChangeHandler}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans font-mono"
                    placeholder="0917-000-0000"
                    id="profile-phone-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={newBirthDate} //"2026-06-04"
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                    id="profile-birthday-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>Gender Identity</span>
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                    id="profile-gender-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Church className="h-3.5 w-3.5 text-slate-400" />
                    <span>Local Church / Congregation</span>
                  </label>
                  <input
                    type="text"
                    //onChange={handleChurchChange}
                    value={newChurchName}
                    onChange={(e) => {
                      setChurchName(e.target.value);
                      const option = document.querySelector(
                        `#church-presets option[value="${e.target.value}"]`,
                      );
                      setChurch(option?.getAttribute("data-id") || "");
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans"
                    placeholder="Enter the church you belong to"
                    id="profile-church-input"
                    list="church-presets"
                  />
                  <datalist id="church-presets">
                    <option value="Pinamungajan" data-id="1" />
                    <option value="Naga" data-id="2" />
                    <option value="Aloguinsan" data-id="3" />
                    <option value="Samar" data-id="4" />
                    <option value="Dulag" data-id="5" />
                    <option value="Mandaue" data-id="6" />
                  </datalist>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-805 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Key className="h-4 w-4 text-slate-400" />
                  <span>Interactive Security Key Password</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans leading-relaxed mb-1.5">
                      Enter a new secure portal password. This security
                      credential guarantees offline verification and protects
                      admin dashboards.
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 pr-12 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 text-slate-800 font-sans font-mono"
                        placeholder="••••••••••••"
                        id="profile-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase py-1 px-1.5 rounded bg-slate-100 transition"
                        id="profile-toggle-password"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100"
                id="profile-actions-bar"
              >
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
                  id="profile-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  id="profile-save-btn"
                >
                  {isSubmitting ? (
                    <span>Synchronizing...</span>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
