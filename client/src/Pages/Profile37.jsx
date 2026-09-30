/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  FaBookOpen,
  FaCheckCircle,
  FaChevronRight,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFacebookF,
  FaGlobe,
  FaHeart,
  FaInstagram,
  FaLink,
  FaMapMarkerAlt,
  FaMusic,
  FaPhoneAlt,
  FaRegStar,
  FaSnapchatGhost,
  FaStar,
  FaTwitter,
  FaUserPlus,
  FaUtensils,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";
import { getPublicProfile, incrementVisit, PUBLIC_BASE_URL } from "../api.js";

const BRAND = { burgundy: "#8d061c" };
const cleanText = (value = "") => String(value || "").replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]+>/g, "").trim();
const displayValue = (value, fallback = "") => cleanText(value) || fallback;
const normalizeWhatsApp = (value = "") => String(value || "").replace(/[^0-9]/g, "");
const slotSuffix = (index) => (index === 0 ? "" : `0${index + 1}`);

const DividerTitle = ({ children }) => (
  <div className="mb-4 mt-6 flex items-center gap-3">
    <span className="h-px flex-1 bg-[#e8cda7]" />
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="font-serif text-[13px] font-bold uppercase tracking-[0.20em] text-[#7b1223]">{children}</span>
    <FaRegStar className="text-[#d9aa62]" size={11} />
    <span className="h-px flex-1 bg-[#e8cda7]" />
  </div>
);

const ContactRow = ({ icon, label, value, href }) => {
  if (!value) return null;
  const content = (
    <div className="flex w-full items-center justify-between gap-3 border-b border-[#ead9c9] px-4 py-3 transition-all duration-200 last:border-b-0 hover:bg-[#fff5e9]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#5d0618] text-white shadow-[0_5px_12px_rgba(141,6,28,0.24)]">{icon}</div>
        <span className="font-serif text-[13px] font-semibold text-[#3c3130]">{label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-3 text-right">
        <span className="truncate text-[12px] font-medium text-[#a04555]">{value}</span>
        {href ? <FaChevronRight className="shrink-0 text-[#7b1223]" size={13} /> : null}
      </div>
    </div>
  );
  if (!href) return content;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
};

const Profile37 = () => {
  const { id: clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchClient = async () => {
      try { const data = await getPublicProfile(clientId); if (!cancelled) setClient(data); }
      catch { if (!cancelled) setClient(null); }
      finally { if (!cancelled) setLoading(false); }
    };
    if (clientId) fetchClient(); else setLoading(false);
    return () => { cancelled = true; };
  }, [clientId]);

  useEffect(() => {
    if (!client?._id) return;
    incrementVisit(client._id).then((data) => setVisitCount(data?.count || 0)).catch(() => {});
  }, [client?._id]);

  const brandName = displayValue(client?.name || client?.companyName, "Starlink");
  const personName = displayValue(client?.clientName, "Starlink Representative");
  const roleName = displayValue(client?.designation, "Technology Advisor");
  const locationLabel = displayValue(client?.address || client?.googleMapName || client?.location, `${brandName} Store`);
  const profileImage = client?.logo || client?.images;
  const galleryImages = [client?.img01, client?.img02, client?.img03, client?.img04, client?.img05, client?.img06, client?.img07, client?.img08, client?.img09, client?.img10].filter(Boolean);

  const phones = [client?.phone01, client?.phone02, client?.phone03].map(cleanText).filter(Boolean);
  const telephones = [client?.telephone01, client?.telephone02, client?.telephone03].map(cleanText).filter(Boolean);
  const whatsapps = [client?.whatsapp01, client?.whatsapp02, client?.whatsapp03].map(cleanText).filter(Boolean);
  const emails = [client?.email, client?.email02, client?.email03].map(cleanText).filter(Boolean);

  const socialGroups = [
    { label: "Instagram", icon: <FaInstagram size={17} />, linkBase: "instagramLink", nameBase: "instagramName" },
    { label: "Snapchat", icon: <FaSnapchatGhost size={17} />, linkBase: "snapchatLink", nameBase: "snapchatName" },
    { label: "YouTube", icon: <FaYoutube size={17} />, linkBase: "youtubeLink", nameBase: "youtubeName" },
    { label: "YouTube Shorts", icon: <FaYoutube size={17} />, linkBase: "youtubeShortsLink", nameBase: "youtubeShortsName" },
    { label: "TikTok", icon: <FaMusic size={17} />, linkBase: "tiktokLink", nameBase: "tiktokName" },
    { label: "X / Twitter", icon: <FaTwitter size={17} />, linkBase: "twitterLink", nameBase: "twitterName" },
    { label: "Facebook", icon: <FaFacebookF size={17} />, linkBase: "facebookLink", nameBase: "facebookName" },
  ];
  const socialLinks = socialGroups.flatMap((group) => {
    return [0, 1, 2].map((index) => {
      const suffix = slotSuffix(index);
      const url = cleanText(client?.[`${group.linkBase}${suffix}`]);
      const name = cleanText(client?.[`${group.nameBase}${suffix}`]);
      return url || name ? { ...group, key: `${group.linkBase}${suffix}`, url, name: name || `${group.label}${index ? ` ${index + 1}` : ""}` } : null;
    }).filter(Boolean);
  });

  const linkGroups = [
    { label: "Google Review", icon: <FaStar size={17} />, linkBase: "googleReviewLink", nameBase: "googleReviewName" },
    { label: "Google Maps", icon: <FaMapMarkerAlt size={17} />, linkBase: "googleMapLink", nameBase: "googleMapName" },
    { label: "Website", icon: <FaGlobe size={17} />, linkBase: "website", nameBase: "websiteName" },
  ];
  const extraLinks = linkGroups.flatMap((group) => [0, 1, 2].map((index) => {
    const suffix = slotSuffix(index);
    const url = cleanText(client?.[`${group.linkBase}${suffix}`]);
    const name = cleanText(client?.[`${group.nameBase}${suffix}`]);
    return url || name ? { ...group, key: `${group.linkBase}${suffix}`, url, name: name || `${group.label}${index ? ` ${index + 1}` : ""}` } : null;
  }).filter(Boolean));

  const customLinks = [
    client?.menuLink || client?.menuName ? { key: "menu", label: "Menu", icon: <FaUtensils size={17} />, url: cleanText(client?.menuLink), name: displayValue(client?.menuName, "Menu") } : null,
    client?.catalogueLink || client?.catalogueName ? { key: "catalogue", label: "Catalogue", icon: <FaBookOpen size={17} />, url: cleanText(client?.catalogueLink), name: displayValue(client?.catalogueName, "Catalogue") } : null,
    client?.profileLink01 || client?.profileName01 ? { key: "profile1", label: "Profile", icon: <FaLink size={17} />, url: cleanText(client?.profileLink01), name: displayValue(client?.profileName01, "Profile Link 1") } : null,
    client?.profileLink02 || client?.profileName02 ? { key: "profile2", label: "Profile", icon: <FaLink size={17} />, url: cleanText(client?.profileLink02), name: displayValue(client?.profileName02, "Profile Link 2") } : null,
  ].filter(Boolean);

  const downloadContactCard = () => {
    const telLines = [...phones, ...telephones].map((value) => `TEL;TYPE=CELL:${value}`).join("\n");
    const emailLines = emails.map((value) => `EMAIL:${value}`).join("\n");
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${personName};;;\nFN:${personName}\nORG:${brandName}\nTITLE:${roleName}\n${telLines}\n${emailLines}\nURL:${client?.website || ""}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) window.location.href = url;
    else { const link = document.createElement("a"); link.download = `${personName}.vcf`; link.href = url; link.click(); }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]"><ScaleLoader color={BRAND.burgundy} aria-label="Loading profile" /></div>;
  if (!client) return <div className="flex min-h-screen items-center justify-center bg-[#fff8ef] px-5 text-center"><div className="max-w-sm rounded-[28px] border border-[#ead9c9] bg-white px-7 py-8 shadow-lg"><h1 className="font-serif text-3xl font-bold text-[#5d0618]">Profile not found</h1><p className="mt-3 text-[#8d8178]">Unable to load this digital profile.</p></div></div>;

  const canonicalUrl = `${PUBLIC_BASE_URL}/${encodeURIComponent(client?.companyName || clientId)}`;

  return (
    <section className="min-h-screen bg-[#fbf4e9] px-3 py-4 sm:px-5">
      <Helmet>
        <meta charSet="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{personName}</title>
        {profileImage ? <link rel="icon" href={profileImage} /> : null}
        <meta name="description" content={roleName || brandName} /><meta property="og:title" content={personName} /><meta property="og:description" content={roleName || brandName} /><meta property="og:url" content={canonicalUrl} />
        {profileImage ? <meta property="og:image" content={profileImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={personName} /><meta name="twitter:description" content={roleName || brandName} /><link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="mx-auto max-w-[430px] rounded-[22px] bg-white/45 p-[3px] shadow-[0_10px_28px_rgba(88,45,20,0.16)]">
        <article className="relative overflow-hidden rounded-[22px] border border-white bg-[#fffaf3] px-3 py-5 text-center shadow-[inset_0_0_0_1px_rgba(232,205,167,0.55)]">
          <button type="button" onClick={downloadContactCard} className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-[10px] bg-[#5d0618] px-4 py-2.5 text-[15px] font-bold text-white shadow-[0_5px_12px_rgba(104,3,22,0.34)]"><FaUserPlus size={19} /> Save Contact</button>

          <div className="relative z-10 pt-14">
            <div className="mx-auto flex h-[128px] w-[128px] items-center justify-center rounded-full border-[3px] border-white bg-[#fff7ed] shadow-[0_0_0_3px_rgba(232,205,167,0.85),0_10px_24px_rgba(117,58,28,0.16)]">
              {profileImage ? <img src={profileImage} alt={personName} className="h-[116px] w-[116px] rounded-full object-cover" /> : <div className="flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[#f1dfc9] font-serif text-5xl font-bold text-[#5d0618]">{personName.charAt(0)}</div>}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2"><p className="font-serif text-[16px] font-bold text-[#5d0618]">{brandName}</p><FaCheckCircle className="text-[#5d0618]" size={18} /></div>
            <h1 className="mt-3 font-serif text-[25px] font-bold leading-[1.03] tracking-[-0.04em] text-[#5d0618]">{personName}</h1>
            <p className="mt-2 text-[16px] font-semibold text-[#8d8178]">{roleName}</p>
            {locationLabel ? <div className="mx-auto mt-1 flex max-w-full items-center justify-center gap-2 text-[16px] font-semibold text-[#3c3130]"><span className="truncate">{locationLabel}</span></div> : null}

            {(phones.length || telephones.length || whatsapps.length || emails.length) ? (
              <><DividerTitle>Contact</DividerTitle><div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">
                {phones.map((value, i) => <ContactRow key={`phone-${i}`} icon={<FaPhoneAlt size={17} />} label={`Call${phones.length > 1 ? ` ${i + 1}` : ""}`} value={value} href={`tel:${value}`} />)}
                {telephones.map((value, i) => <ContactRow key={`tel-${i}`} icon={<FaPhoneAlt size={17} />} label={`Telephone${telephones.length > 1 ? ` ${i + 1}` : ""}`} value={value} href={`tel:${value}`} />)}
                {whatsapps.map((value, i) => <ContactRow key={`wa-${i}`} icon={<FaWhatsapp size={17} />} label={`WhatsApp${whatsapps.length > 1 ? ` ${i + 1}` : ""}`} value={value} href={`https://wa.me/${normalizeWhatsApp(value)}`} />)}
                {emails.map((value, i) => <ContactRow key={`email-${i}`} icon={<FaEnvelope size={17} />} label={`Email${emails.length > 1 ? ` ${i + 1}` : ""}`} value={value} href={`mailto:${value}`} />)}
              </div></>
            ) : null}

            {socialLinks.length ? <><DividerTitle>Social Media</DividerTitle><div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">{socialLinks.map((item) => <ContactRow key={item.key} icon={item.icon} label={item.label} value={item.name} href={item.url || undefined} />)}</div></> : null}

            {(extraLinks.length || customLinks.length) ? <><DividerTitle>Links</DividerTitle><div className="overflow-hidden rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] py-2 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">
              {[...extraLinks, ...customLinks].map((item) => <ContactRow key={item.key} icon={item.icon || <FaExternalLinkAlt size={17} />} label={item.label} value={item.name} href={item.url || undefined} />)}
            </div></> : null}

            {galleryImages.length ? <><DividerTitle>Photos</DividerTitle><div className="grid grid-cols-2 gap-2 rounded-[14px] border border-[#ead9c9] bg-[#fffdf8] p-3 shadow-[0_4px_14px_rgba(106,57,28,0.1)]">{galleryImages.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${personName} gallery ${index + 1}`} loading="lazy" className="aspect-square w-full rounded-[12px] object-cover" />)}</div></> : null}

            <div className="mb-4 mt-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e8cda7]" /><FaRegStar className="text-[#d9aa62]" size={11} /><span className="h-px flex-1 bg-[#e8cda7]" /></div>
            <footer className="text-center"><p className="font-serif text-[14px] font-bold text-[#7b1223]">We appreciate your time and feedback.</p><p className="text-[15px] font-semibold text-[#8d8178]">It helps us serve you better every day.</p><FaHeart className="mx-auto mt-2 text-[#d9aa62]" size={20} />{visitCount ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.20em] text-[#c7a77d]">Visits {visitCount}</p> : null}</footer>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Profile37;
