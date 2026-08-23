import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  FaCheckCircle,
  FaChevronRight,
  FaEnvelope,
  FaHeart,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaQuoteLeft,
  FaRegStar,
  FaStar,
  FaUserPlus,
  FaWhatsapp,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  getPublicProfile,
  incrementVisit,
  PUBLIC_BASE_URL,
} from "../api.js";

const BRAND = {
  burgundy: "#8d061c",
};

const cleanText = (value = "") =>
  String(value || "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

const displayValue = (value, fallback = "") => cleanText(value) || fallback;
const normalizeWhatsApp = (value = "") =>
  String(value || "").replace(/[^0-9]/g, "");

const DividerTitle = ({ children }) => (
  <div className="mb-4 mt-6 flex items-center gap-3">
    <span className="h-px flex-1 bg-[#e8cda7]" />
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="font-serif text-[13px] font-bold uppercase tracking-[0.20em] text-[#7b1223]">
      {children}
    </span>
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="h-px flex-1 bg-[#e8cda7]" />
  </div>
);

const ContactRow = ({ icon, label, value, href }) => {
  if (!value) return null;

  const content = (
    <div className="flex w-full items-center justify-between gap-3 border-b border-[#ead9c9] px-4 py-3 transition-all duration-200 last:border-b-0 hover:bg-[#fff5e9]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#5d0618] text-white shadow-[0_5px_12px_rgba(141,6,28,0.24)]">
          {icon}
        </div>
        <span className="font-serif text-[13px] font-semibold text-[#3c3130]">
          {label}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-3 text-right">
        <span className="truncate text-[12px] font-medium text-[#a04555]">
          {value}
        </span>
        <FaChevronRight className="shrink-0 text-[#7b1223]" size={13} />
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  );
};

const GoogleIcon = () => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_13px_rgba(80,55,30,0.16)]">
    <svg viewBox="0 0 48 48" className="h-[25px] w-[25px]" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  </div>
);

const Profile37 = () => {
  const { id: clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchClient = async () => {
      try {
        const data = await getPublicProfile(clientId);
        if (!cancelled) setClient(data);
      } catch {
        if (!cancelled) setClient(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (clientId) fetchClient();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!client?._id) return;

    incrementVisit(client._id)
      .then((data) => setVisitCount(data?.count || 0))
      .catch(() => {});
  }, [client?._id]);

  const {
    companyName,
    name,
    description,
    phone01,
    clientName,
    designation,
    address,
    whatsapp01,
    location,
    googleReviewLink,
    googleReviewName,
    website,
    email,
    googleMapLink,
    googleMapName,
    logo,
    images,
    img01,
    img02,
    img03,
    img04,
    img05,
    img06,
    img07,
    img08,
    img09,
    img10,
  } = client || {};

  const brandName = displayValue(name || companyName, "Starlink");
  const personName = displayValue(clientName, "Starlink Representative");
  const roleName = displayValue(designation, "Technology Advisor");
  const locationLabel = displayValue(
    address || googleMapName || location,
    `${brandName} Store`,
  );
  const profileImage = logo || images;
  const galleryImages = [img01, img02, img03, img04, img05, img06, img07, img08, img09, img10].filter(Boolean);
  const phoneValue = displayValue(phone01);
  const whatsappValue = displayValue(whatsapp01);
  const emailValue = displayValue(email);
  const reviewLabel = displayValue(
    googleReviewName,
    "Share us your Google review",
  );
  const whatsappNumber = normalizeWhatsApp(whatsapp01);
  const quoteText =
    displayValue(description) ||
    `Thank you for visiting ${brandName}.\nI'm here whenever you need technology advice.`;

  const downloadContactCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${personName};;;\nFN:${personName}\nORG:${brandName}\nTITLE:${roleName}\nTEL;TYPE=CELL:${phoneValue}\nEMAIL;HOME:${emailValue}\nURL:${website || ""}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) window.location.href = url;
    else {
      const link = document.createElement("a");
      link.download = `${personName}.vcf`;
      link.href = url;
      link.click();
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]">
        <ScaleLoader color={BRAND.burgundy} aria-label="Loading profile" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-5 text-center">
        <div className="max-w-sm rounded-[28px] border border-[#ead9c9] bg-white px-7 py-8 shadow-lg">
          <h1 className="font-serif text-3xl font-bold text-[#5d0618]">Profile not found</h1>
          <p className="mt-3 text-[#8d8178]">Unable to load this digital profile.</p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${PUBLIC_BASE_URL}/${encodeURIComponent(companyName || clientId)}`;

  return (
    <section className="min-h-screen bg-[#fbf4e9] px-3 py-4 sm:px-5">
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{personName}</title>
        {profileImage ? <link rel="icon" href={profileImage} /> : null}
        <meta name="description" content={roleName || brandName} />
        <meta property="og:title" content={personName} />
        <meta property="og:description" content={roleName || brandName} />
        <meta property="og:url" content={canonicalUrl} />
        {profileImage ? <meta property="og:image" content={profileImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={personName} />
        <meta name="twitter:description" content={roleName || brandName} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="mx-auto max-w-[430px] rounded-[22px] bg-white/45 p-[3px] shadow-[0_10px_28px_rgba(88,45,20,0.16)]">
        <article className="relative overflow-hidden rounded-[22px] border border-white bg-[#fffaf3] px-3 py-5 text-center shadow-[inset_0_0_0_1px_rgba(232,205,167,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_42%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(246,226,200,0.16))]" />

          <button
            type="button"
            onClick={downloadContactCard}
            className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-[10px] bg-[#5d0618] px-4 py-2.5 text-[15px] font-bold text-white shadow-[0_5px_12px_rgba(104,3,22,0.34)] transition hover:-translate-y-0.5 hover:bg-[#690316]"
          >
            <FaUserPlus size={19} />
            Save Contact
          </button>

          <div className="relative z-10 pt-14">
            <div className="mx-auto flex h-[128px] w-[128px] items-center justify-center rounded-full border-[3px] border-white bg-[#fff7ed] shadow-[0_0_0_3px_rgba(232,205,167,0.85),0_10px_24px_rgba(117,58,28,0.16)]">
              {profileImage ? (
                <img src={profileImage} alt={personName} className="h-[116px] w-[116px] rounded-full object-cover" />
              ) : (
                <div className="flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[#f1dfc9] font-serif text-5xl font-bold text-[#5d0618]">
                  {personName.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <p className="font-serif text-[16px] font-bold text-[#5d0618]">{brandName}</p>
              <FaCheckCircle className="text-[#5d0618]" size={18} />
            </div>

            <h1 className="mt-3 font-serif text-[34px] font-bold leading-[1.03] tracking-[-0.04em] text-[#5d0618] sm:text-[44px]">
              {personName}
            </h1>
            <p className="mt-2 text-[16px] font-semibold text-[#8d8178]">{roleName}</p>

            {locationLabel ? (
              googleMapLink ? (
                <a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto mt-1 flex max-w-full items-center justify-center gap-2 text-[16px] font-semibold text-[#3c3130]"
                >
                  <FaMapMarkerAlt className="shrink-0 text-[#5d0618]" size={18} />
                  <span className="truncate">{locationLabel}</span>
                </a>
              ) : (
                <div className="mx-auto mt-1 flex max-w-full items-center justify-center gap-2 text-[16px] font-semibold text-[#3c3130]">
                  <FaMapMarkerAlt className="shrink-0 text-[#5d0618]" size={18} />
                  <span className="truncate">{locationLabel}</span>
                </div>
              )
            ) : null}

            <DividerTitle>Welcome</DividerTitle>

            <div className="rounded-[12px] border border-[#ead9c9] bg-[#fffdf8] px-4 py-5 text-center shadow-[0_5px_16px_rgba(106,57,28,0.12)]">
              <div className="flex items-start gap-2">
                <FaQuoteLeft className="mt-1 shrink-0 text-[#5d0618]" size={20} />
                <p className="w-full whitespace-pre-line font-serif text-[13px] font-medium leading-[1.5] text-[#3c3130]">
                  {quoteText}
                </p>
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">
              <ContactRow icon={<FaPhoneAlt size={17} />} label="Call" value={phoneValue} href={phoneValue ? `tel:${phoneValue}` : undefined} />
              <ContactRow icon={<FaWhatsapp size={17} />} label="WhatsApp" value={whatsappValue} href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined} />
              <ContactRow icon={<FaEnvelope size={17} />} label="Email" value={emailValue} href={emailValue ? `mailto:${emailValue}` : undefined} />
            </div>

            {googleReviewLink ? (
              <a
                href={googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#ead9c9] bg-[#fffdf8] px-4 py-5 text-left shadow-[0_5px_16px_rgba(106,57,28,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(106,57,28,0.18)]"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <FaStar className="absolute text-[#dfaa5e] drop-shadow" size={30} />
                  <FaStar className="absolute text-[#f8d28b]" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-[12px] font-bold leading-tight text-[#7b1223]">{reviewLabel}</h2>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-[#8d8178]">
                    Your feedback helps us improve and recognize great service.
                  </p>
                </div>
                <GoogleIcon />
                <FaChevronRight className="shrink-0 text-[#7b1223]" size={14} />
              </a>
            ) : null}

            {galleryImages.length ? (
              <>
                <DividerTitle>Photos</DividerTitle>
                <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] p-3 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">
                  {galleryImages.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${personName} gallery ${index + 1}`}
                      loading="lazy"
                      className="aspect-square w-full rounded-[12px] object-cover"
                    />
                  ))}
                </div>
              </>
            ) : null}

            <div className="mb-4 mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e8cda7]" />
              <FaRegStar className="text-[#d9aa62]" size={11} />
              <span className="h-px flex-1 bg-[#e8cda7]" />
            </div>

            <footer className="text-center">
              <p className="font-serif text-[14px] font-bold text-[#7b1223]">We appreciate your time and feedback.</p>
              <p className="text-[15px] font-semibold text-[#8d8178]">It helps us serve you better every day.</p>
              <FaHeart className="mx-auto mt-2 text-[#d9aa62]" size={20} />
              {visitCount ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.20em] text-[#c7a77d]">Visits {visitCount}</p>
              ) : null}
            </footer>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Profile37;
