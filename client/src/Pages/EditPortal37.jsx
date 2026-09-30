/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFacebookF,
  FaGlobe,
  FaImage,
  FaInstagram,
  FaLink,
  FaMapMarkerAlt,
  FaMusic,
  FaPhoneAlt,
  FaPlus,
  FaQuoteLeft,
  FaRegStar,
  FaSave,
  FaSignOutAlt,
  FaSnapchatGhost,
  FaStar,
  FaTrash,
  FaTwitter,
  FaUpload,
  FaUtensils,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  getEditableProfile,
  logout,
  PUBLIC_BASE_URL,
  updateProfile,
  uploadProfileImage,
} from "../api.js";

const FIELDS = [
  "companyName", "name", "description",
  "phone01", "phone02", "phone03",
  "telephone01", "telephone02", "telephone03",
  "services", "clientName", "designation", "qr", "address",
  "whatsapp01", "whatsapp02", "whatsapp03", "location",
  "instagramLink", "instagramLink02", "instagramLink03", "instagramName", "instagramName02", "instagramName03",
  "snapchatLink", "snapchatLink02", "snapchatLink03", "snapchatName", "snapchatName02", "snapchatName03",
  "youtubeLink", "youtubeLink02", "youtubeLink03", "youtubeName", "youtubeName02", "youtubeName03",
  "tiktokLink", "tiktokLink02", "tiktokLink03", "tiktokName", "tiktokName02", "tiktokName03",
  "twitterLink", "twitterLink02", "twitterLink03", "twitterName", "twitterName02", "twitterName03",
  "facebookLink", "facebookLink02", "facebookLink03", "facebookName", "facebookName02", "facebookName03",
  "googleReviewLink", "googleReviewLink02", "googleReviewLink03", "googleReviewName", "googleReviewName02", "googleReviewName03",
  "website", "website02", "website03", "websiteName", "websiteName02", "websiteName03",
  "email", "email02", "email03",
  "youtubeShortsLink", "youtubeShortsLink02", "youtubeShortsLink03", "youtubeShortsName", "youtubeShortsName02", "youtubeShortsName03",
  "googleMapLink", "googleMapLink02", "googleMapLink03", "googleMapName", "googleMapName02", "googleMapName03",
  "menuLink", "menuName", "catalogueLink", "catalogueName",
  "profileLink01", "profileLink02", "profileName01", "profileName02",
  "logo", "romanName", "images",
  "img01", "img02", "img03", "img04", "img05", "img06", "img07", "img08", "img09", "img10",
  "color01", "color02", "color03", "option",
];

const normalizeForm = (profile = {}) =>
  FIELDS.reduce((result, field) => {
    result[field] = profile[field] == null ? "" : String(profile[field]);
    return result;
  }, {});

const slotSuffix = (index) => (index === 0 ? "" : `0${index + 1}`);

const SOCIAL_GROUPS = [
  { label: "Instagram", icon: <FaInstagram size={17} />, linkBase: "instagramLink", nameBase: "instagramName" },
  { label: "Snapchat", icon: <FaSnapchatGhost size={17} />, linkBase: "snapchatLink", nameBase: "snapchatName" },
  { label: "YouTube", icon: <FaYoutube size={17} />, linkBase: "youtubeLink", nameBase: "youtubeName" },
  { label: "YouTube Shorts", icon: <FaYoutube size={17} />, linkBase: "youtubeShortsLink", nameBase: "youtubeShortsName" },
  { label: "TikTok", icon: <FaMusic size={17} />, linkBase: "tiktokLink", nameBase: "tiktokName" },
  { label: "X / Twitter", icon: <FaTwitter size={17} />, linkBase: "twitterLink", nameBase: "twitterName" },
  { label: "Facebook", icon: <FaFacebookF size={17} />, linkBase: "facebookLink", nameBase: "facebookName" },
];

const LINK_GROUPS = [
  { label: "Google Reviews", icon: <FaStar size={17} />, linkBase: "googleReviewLink", nameBase: "googleReviewName" },
  { label: "Google Maps", icon: <FaMapMarkerAlt size={17} />, linkBase: "googleMapLink", nameBase: "googleMapName" },
  { label: "Website", icon: <FaGlobe size={17} />, linkBase: "website", nameBase: "websiteName" },
];

const DividerTitle = ({ children }) => (
  <div className="mb-4 mt-6 flex items-center gap-3">
    <span className="h-px flex-1 bg-[#e8cda7]" />
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="font-serif text-[12px] font-bold uppercase tracking-[0.18em] text-[#7b1223]">{children}</span>
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="h-px flex-1 bg-[#e8cda7]" />
  </div>
);

const FieldActions = ({ onDelete, hasValue }) => (
  <div className="flex shrink-0 items-center gap-1">
    {hasValue ? (
      <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ead9c9] bg-white text-[#8d061c] transition hover:bg-[#fff1f1]" aria-label="Delete value" title="Delete">
        <FaTrash size={12} />
      </button>
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3dec1] text-[#7b1223]"><FaPlus size={12} /></span>
    )}
  </div>
);

const EditableRow = ({ icon, label, value, onChange, type = "text", placeholder }) => {
  const hasValue = Boolean(String(value || "").trim());
  return (
    <div className="flex items-center gap-3 border-b border-[#ead9c9] px-3 py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#5d0618] text-white shadow-[0_5px_12px_rgba(141,6,28,0.20)]">{icon}</div>
      <div className="min-w-0 flex-1 text-left">
        <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8d8178]">{label}</label>
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || `Add ${label.toLowerCase()}`} className="mt-0.5 w-full border-0 bg-transparent p-0 text-[13px] font-semibold text-[#3c3130] outline-none placeholder:font-medium placeholder:text-[#c0aaa0]" />
      </div>
      <FieldActions hasValue={hasValue} onDelete={() => onChange("")} />
    </div>
  );
};

const EditableText = ({ label, value, onChange, multiline = false, required = false, className = "" }) => {
  const shared = `w-full rounded-[10px] border border-transparent bg-white/65 px-3 py-2 text-center outline-none transition focus:border-[#d8b78d] focus:bg-white focus:ring-2 focus:ring-[#8d061c]/10 ${className}`;
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} placeholder={`Add ${label.toLowerCase()}`} className={`${shared} resize-y`} required={required} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Add ${label.toLowerCase()}`} className={shared} required={required} />
      )}
    </label>
  );
};

const TripleLinkEditor = ({ group, form, updateField }) => (
  <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] text-left shadow-[0_4px_14px_rgba(106,57,28,0.08)]">
    <div className="flex items-center gap-3 border-b border-[#ead9c9] bg-[#fff8ee] px-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#5d0618] text-white">{group.icon}</div>
      <span className="font-serif text-sm font-bold text-[#5d0618]">{group.label}</span>
    </div>
    {[0, 1, 2].map((index) => {
      const suffix = slotSuffix(index);
      const linkField = `${group.linkBase}${suffix}`;
      const nameField = `${group.nameBase}${suffix}`;
      const hasValue = Boolean((form[linkField] || "").trim() || (form[nameField] || "").trim());
      return (
        <div key={linkField} className="border-b border-[#ead9c9] px-3 py-3 last:border-b-0">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a8175]">Account {index + 1}</span>
            {hasValue ? (
              <button type="button" onClick={() => { updateField(nameField, ""); updateField(linkField, ""); }} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-[#8d061c] hover:bg-[#fff1f1]">
                <FaTrash size={10} /> Delete
              </button>
            ) : null}
          </div>
          <input value={form[nameField]} onChange={(e) => updateField(nameField, e.target.value)} placeholder={`${group.label} display name`} className="w-full bg-transparent py-1 text-[13px] font-semibold text-[#3c3130] outline-none placeholder:text-[#c0aaa0]" />
          <input value={form[linkField]} onChange={(e) => updateField(linkField, e.target.value)} placeholder={`${group.label} link`} className="mt-1 w-full border-t border-[#f0e2d7] bg-transparent pt-2 text-[12px] font-medium text-[#a04555] outline-none placeholder:text-[#c0aaa0]" />
        </div>
      );
    })}
  </div>
);

const EditPortal37 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => normalizeForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const profile = await getEditableProfile(id);
        if (!cancelled) setForm(normalizeForm(profile));
      } catch (loadError) {
        if (loadError.status === 401 || loadError.status === 403) {
          navigate("/login", { replace: true });
          return;
        }
        if (!cancelled) setError(loadError.message || "Unable to load this profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const profileUrl = useMemo(() => {
    const slug = form.companyName.trim();
    return slug ? `${PUBLIC_BASE_URL}/${encodeURIComponent(slug)}` : "";
  }, [form.companyName]);

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Image must be 8 MB or smaller."); return; }
    setUploading(true); setError(""); setMessage("");
    try {
      const url = await uploadProfileImage(file);
      setForm((current) => ({ ...current, logo: url }));
      setMessage("Photo uploaded. Save changes to publish it.");
    } catch (uploadError) { setError(uploadError.message || "Image upload failed."); }
    finally { setUploading(false); }
  };

  const uploadGalleryImage = async (field, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Image must be 8 MB or smaller."); return; }
    setUploading(true); setError("");
    try {
      const url = await uploadProfileImage(file);
      updateField(field, url);
      setMessage("Photo uploaded. Save changes to publish it.");
    } catch (uploadError) { setError(uploadError.message || "Image upload failed."); }
    finally { setUploading(false); }
  };

  const deleteImage = () => {
    setForm((current) => ({ ...current, logo: "", images: "" }));
    setMessage("Photo removed locally. Save changes to publish the removal.");
  };

  const save = async () => {
    if (!form.companyName.trim()) { setError("Profile URL name is required."); return; }
    if (!form.email.trim()) { setError("Email is required because it is used to sign in."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await updateProfile(id, form);
      setForm(normalizeForm(response.profile));
      setMessage("Profile saved successfully.");
    } catch (saveError) {
      if (saveError.status === 401 || saveError.status === 403) { navigate("/login", { replace: true }); return; }
      setError(saveError.message || "Unable to save this profile.");
    } finally { setSaving(false); }
  };

  const signOut = async () => {
    try { await logout(); } finally { navigate("/login", { replace: true }); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]"><ScaleLoader color="#8d061c" aria-label="Loading editor" /></div>;

  if (error && !form.companyName && !form.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-5 text-center">
        <div className="max-w-sm rounded-[28px] border border-[#ead9c9] bg-white px-7 py-8 shadow-lg">
          <h1 className="font-serif text-3xl font-bold text-[#5d0618]">Unable to open editor</h1>
          <p className="mt-3 text-[#8d8178]">{error}</p>
          <button onClick={() => navigate("/login")} className="mt-5 rounded-xl bg-[#5d0618] px-5 py-3 font-bold text-white">Back to login</button>
        </div>
      </div>
    );
  }

  const personName = form.clientName || "Starlink Representative";
  const profileImage = form.logo || form.images;

  return (
    <section className="min-h-screen bg-[#fbf4e9] px-3 py-4 sm:px-5">
      <div className="mx-auto mb-3 flex max-w-[680px] items-center justify-between gap-2">
        <button type="button" onClick={() => profileUrl && window.open(profileUrl, "_blank", "noopener,noreferrer")} disabled={!profileUrl} className="flex items-center gap-2 rounded-[10px] border border-[#ead9c9] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#7b1223] shadow-sm disabled:opacity-50"><FaExternalLinkAlt size={11} /> Preview</button>
        <button type="button" onClick={signOut} className="flex items-center gap-2 rounded-[10px] border border-[#ead9c9] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#7b1223] shadow-sm"><FaSignOutAlt size={12} /> Logout</button>
      </div>

      <div className="mx-auto max-w-[680px] rounded-[22px] bg-white/45 p-[3px] shadow-[0_10px_28px_rgba(88,45,20,0.16)]">
        <article className="relative overflow-hidden rounded-[22px] border border-white bg-[#fffaf3] px-3 py-5 text-center shadow-[inset_0_0_0_1px_rgba(232,205,167,0.55)] sm:px-5">
          <button type="button" onClick={save} disabled={saving || uploading} className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-[10px] bg-[#5d0618] px-4 py-2.5 text-[14px] font-bold text-white shadow-[0_5px_12px_rgba(104,3,22,0.34)] disabled:opacity-60"><FaSave size={16} /> {saving ? "Saving..." : "Save"}</button>

          <div className="relative z-10 pt-14">
            <div className="relative mx-auto h-[128px] w-[128px]">
              <div className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-[#fff7ed] shadow-[0_0_0_3px_rgba(232,205,167,0.85),0_10px_24px_rgba(117,58,28,0.16)]">
                {profileImage ? <img src={profileImage} alt={personName} className="h-[116px] w-[116px] rounded-full object-cover" /> : <div className="flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[#f1dfc9] font-serif text-5xl font-bold text-[#5d0618]">{personName.charAt(0)}</div>}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#5d0618] text-white shadow-lg" title="Upload photo">{uploading ? <FaImage className="animate-pulse" /> : <FaUpload />}</button>
              {profileImage ? <button type="button" onClick={deleteImage} className="absolute -bottom-1 left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-[#8d061c] shadow-lg" title="Delete photo"><FaTrash size={13} /></button> : null}
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2"><div className="min-w-0 flex-1"><EditableText label="Brand name" value={form.name} onChange={(value) => updateField("name", value)} className="font-serif text-[16px] font-bold text-[#5d0618]" /></div><FaCheckCircle className="shrink-0 text-[#5d0618]" size={18} /></div>
            <div className="mt-2"><EditableText label="Person name" value={form.clientName} onChange={(value) => updateField("clientName", value)} className="font-serif text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#5d0618]" /></div>
            <div className="mt-1"><EditableText label="Designation" value={form.designation} onChange={(value) => updateField("designation", value)} className="text-[16px] font-semibold text-[#8d8178]" /></div>

            <div className="mt-3 overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 text-left">
              <EditableRow icon={<FaMapMarkerAlt size={17} />} label="Address" value={form.address} onChange={(value) => updateField("address", value)} />
              <EditableRow icon={<FaMapMarkerAlt size={17} />} label="Location" value={form.location} onChange={(value) => updateField("location", value)} />
              <EditableRow icon={<FaLink size={15} />} label="Services" value={form.services} onChange={(value) => updateField("services", value)} />
              <EditableRow icon={<FaLink size={15} />} label="Roman Name" value={form.romanName} onChange={(value) => updateField("romanName", value)} />
            </div>

            <DividerTitle>Welcome</DividerTitle>
            <div className="rounded-[12px] border border-[#ead9c9] bg-[#fffdf8] px-4 py-4 text-center shadow-[0_5px_16px_rgba(106,57,28,0.12)]"><div className="flex items-start gap-2"><FaQuoteLeft className="mt-2 shrink-0 text-[#5d0618]" size={20} /><div className="flex-1"><EditableText label="Welcome message" value={form.description} onChange={(value) => updateField("description", value)} multiline className="font-serif text-[13px] font-medium leading-[1.5] text-[#3c3130]" /></div><FieldActions hasValue={Boolean(form.description.trim())} onDelete={() => updateField("description", "")} /></div></div>

            <DividerTitle>Contact Details</DividerTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2">
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Phone 1" value={form.phone01} onChange={(v) => updateField("phone01", v)} />
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Phone 2" value={form.phone02} onChange={(v) => updateField("phone02", v)} />
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Phone 3" value={form.phone03} onChange={(v) => updateField("phone03", v)} />
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Telephone 1" value={form.telephone01} onChange={(v) => updateField("telephone01", v)} />
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Telephone 2" value={form.telephone02} onChange={(v) => updateField("telephone02", v)} />
                <EditableRow icon={<FaPhoneAlt size={17} />} label="Telephone 3" value={form.telephone03} onChange={(v) => updateField("telephone03", v)} />
              </div>
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2">
                <EditableRow icon={<FaWhatsapp size={17} />} label="WhatsApp 1" value={form.whatsapp01} onChange={(v) => updateField("whatsapp01", v)} />
                <EditableRow icon={<FaWhatsapp size={17} />} label="WhatsApp 2" value={form.whatsapp02} onChange={(v) => updateField("whatsapp02", v)} />
                <EditableRow icon={<FaWhatsapp size={17} />} label="WhatsApp 3" value={form.whatsapp03} onChange={(v) => updateField("whatsapp03", v)} />
                <EditableRow icon={<FaEnvelope size={17} />} label="Email 1" value={form.email} onChange={(v) => updateField("email", v)} type="email" />
                <EditableRow icon={<FaEnvelope size={17} />} label="Email 2" value={form.email02} onChange={(v) => updateField("email02", v)} type="email" />
                <EditableRow icon={<FaEnvelope size={17} />} label="Email 3" value={form.email03} onChange={(v) => updateField("email03", v)} type="email" />
              </div>
            </div>

            <DividerTitle>Social Media</DividerTitle>
            <div className="grid gap-3 md:grid-cols-2">{SOCIAL_GROUPS.map((group) => <TripleLinkEditor key={group.linkBase} group={group} form={form} updateField={updateField} />)}</div>

            <DividerTitle>Links & Locations</DividerTitle>
            <div className="grid gap-3 md:grid-cols-2">{LINK_GROUPS.map((group) => <TripleLinkEditor key={group.linkBase} group={group} form={form} updateField={updateField} />)}</div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2">
                <EditableRow icon={<FaUtensils size={15} />} label="Menu Name" value={form.menuName} onChange={(v) => updateField("menuName", v)} />
                <EditableRow icon={<FaLink size={14} />} label="Menu Link" value={form.menuLink} onChange={(v) => updateField("menuLink", v)} />
                <EditableRow icon={<FaBookOpen size={15} />} label="Catalogue Name" value={form.catalogueName} onChange={(v) => updateField("catalogueName", v)} />
                <EditableRow icon={<FaLink size={14} />} label="Catalogue Link" value={form.catalogueLink} onChange={(v) => updateField("catalogueLink", v)} />
              </div>
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2">
                <EditableRow icon={<FaLink size={14} />} label="Profile Link 1 Name" value={form.profileName01} onChange={(v) => updateField("profileName01", v)} />
                <EditableRow icon={<FaExternalLinkAlt size={13} />} label="Profile Link 1" value={form.profileLink01} onChange={(v) => updateField("profileLink01", v)} />
                <EditableRow icon={<FaLink size={14} />} label="Profile Link 2 Name" value={form.profileName02} onChange={(v) => updateField("profileName02", v)} />
                <EditableRow icon={<FaExternalLinkAlt size={13} />} label="Profile Link 2" value={form.profileLink02} onChange={(v) => updateField("profileLink02", v)} />
              </div>
            </div>

            <DividerTitle>Photos</DividerTitle>
            <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] p-3 shadow-[0_4px_14px_rgba(106,57,28,0.1)] sm:grid-cols-3 md:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => {
                const field = `img${String(index + 1).padStart(2, "0")}`;
                const image = form[field];
                return (
                  <div key={field} className="relative aspect-square overflow-hidden rounded-[12px] border border-[#ead9c9] bg-[#fff7ed]">
                    {image ? <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b89572]"><FaImage size={24} /><span className="text-[11px] font-bold uppercase tracking-[0.10em]">Photo {index + 1}</span></div>}
                    <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#5d0618] text-white shadow-lg" title={image ? "Replace photo" : "Add photo"}>{image ? <FaUpload size={12} /> : <FaPlus size={12} />}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; uploadGalleryImage(field, file); }} /></label>
                    {image ? <button type="button" onClick={() => updateField(field, "")} className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[#8d061c] shadow-lg" title="Delete photo"><FaTrash size={11} /></button> : null}
                  </div>
                );
              })}
            </div>

            <DividerTitle>Profile Settings</DividerTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 text-left">
                <EditableRow icon={<FaArrowLeft size={14} />} label="Profile URL name" value={form.companyName} onChange={(value) => updateField("companyName", value.replace(/\s+/g, "-"))} />
                <EditableRow icon={<FaLink size={13} />} label="QR" value={form.qr} onChange={(v) => updateField("qr", v)} />
                <EditableRow icon={<FaLink size={13} />} label="Option" value={form.option} onChange={(v) => updateField("option", v)} />
              </div>
              <div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 text-left">
                <EditableRow icon={<FaStar size={13} />} label="Color 1" value={form.color01} onChange={(v) => updateField("color01", v)} />
                <EditableRow icon={<FaStar size={13} />} label="Color 2" value={form.color02} onChange={(v) => updateField("color02", v)} />
                <EditableRow icon={<FaStar size={13} />} label="Color 3" value={form.color03} onChange={(v) => updateField("color03", v)} />
              </div>
            </div>

            {profileUrl ? <p className="mt-2 break-all px-2 text-[11px] font-medium text-[#a68c79]">{profileUrl}</p> : null}
            {error ? <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
            {message ? <p className="mt-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p> : null}

            <button type="button" onClick={save} disabled={saving || uploading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#5d0618] px-4 py-3.5 text-sm font-bold text-white shadow-[0_7px_16px_rgba(104,3,22,0.28)] disabled:opacity-60"><FaSave /> {saving ? "Saving changes..." : "Save All Changes"}</button>
          </div>
        </article>
      </div>
    </section>
  );
};

export default EditPortal37;
