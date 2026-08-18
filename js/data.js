/* Homes PK Marketing — business info, static project data, and shared helpers.
   Property listings themselves now live in Supabase — see js/properties-data.js. */

const BUSINESS = {
  name: "Homes PK Marketing",
  agent: "Kamran Abbasi",
  phones: ["0333-5492279", "0312-5492279"],
  whatsappNumbers: ["923335492279", "923125492279"],
  email: "kamranabbasi240@outlook.com",
  address: "LG 50, Gulberg Trade Centre, Business Park, Gulberg Greens, Islamabad — 440000",
  tagline: "Where Your Future Begins",
  domain: "kamranproperty.com",
  facebook: "https://www.facebook.com/share/1Eu5KTfqS9/",
  instagram: "https://www.instagram.com/kamranabbasi240",
  youtube: "https://youtube.com/@kamranabbasivlogs",
};

function waLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function defaultWaMessage() {
  return "Hi, I'm interested in a property listing on Homes PK Marketing";
}

function formatPKR(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.00$/, "") + " Crore";
  if (n >= 100000) return (n / 100000).toFixed(2).replace(/\.00$/, "") + " Lac";
  return n.toLocaleString("en-PK");
}

const PROJECTS = [
  {
    id: "proj-001",
    category: "current",
    name: "Gulberg Greens Boulevard Residences",
    location: "Gulberg Greens, Islamabad",
    status: "Bookings Open",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    description: "A modern block of residential plots and homes along the main boulevard of Gulberg Greens.",
  },
  {
    id: "proj-002",
    category: "current",
    name: "DHA Valley Homes",
    location: "DHA Islamabad",
    status: "Selling Fast",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
    description: "Ready and under-construction homes in a premium DHA Islamabad sector.",
  },
  {
    id: "proj-003",
    category: "collaboration",
    name: "Green Vista Enclave",
    location: "Gulberg Greens, Islamabad",
    status: "In Partnership",
    partner: "Al-Rehman Builders & Developers",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    description: "A joint development bringing gated apartment living to Gulberg Greens, in collaboration with a trusted regional builder.",
  },
  {
    id: "proj-004",
    category: "collaboration",
    name: "Capital Business Arcade",
    location: "Business Park, Gulberg Greens, Islamabad",
    status: "In Partnership",
    partner: "Capital Developers Group",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description: "A commercial arcade project developed jointly for shops and offices in Gulberg Greens Business Park.",
  },
  {
    id: "proj-005",
    category: "construction",
    name: "Homes PK Signature Villas",
    location: "Gulberg Greens, Islamabad",
    status: "Under Construction",
    completion: "December 2026",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    description: "A limited collection of signature villas currently under construction, supervised directly by Kamran Abbasi.",
  },
  {
    id: "proj-006",
    category: "construction",
    name: "DHA Skyline Apartments",
    location: "DHA Islamabad",
    status: "Under Construction",
    completion: "June 2027",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    description: "Modern apartment tower under construction, offering 2 and 3 bedroom units with skyline views.",
  },
];

const NEIGHBOURHOOD_INFO = [
  {
    name: "Gulberg Greens",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
    tagline: "Islamabad's fastest-growing green community",
    match: "gulberg",
  },
  {
    name: "DHA Islamabad",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    tagline: "Premium planned living across all phases",
    match: "dha",
  },
];
