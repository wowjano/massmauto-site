import { useEffect, useMemo, useState } from "react";
import { Lock, Phone, Mail, ExternalLink } from "lucide-react";

const COLORS = {
  charcoal: "#363732",
  sky: "#53d8fb",
  azure: "#66c3ff",
  mist: "#dce1e9",
  rose: "#d4afb9",
};

// Netlify needs URL-encoded body for fetch POST
function encode(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

const yearsOptions = Array.from({ length: 31 }, (_, i) => String(i)); // 0-30
const monthsOptions = Array.from({ length: 12 }, (_, i) => String(i)); // 0-11

export default function FinancingApply() {
  const PHONE = "+15083716512";
  const EMAIL = "contact@massmauto.com";

  // ✅ Replace this URL with your DealerCenter secure credit app link (when you have it)
  // Example could be a DealerCenter hosted credit app or another secure lender portal.
  const DEALERCENTER_CREDIT_APP_URL = "https://YOUR-DEALERCENTER-CREDIT-APP-LINK";

  // Scroll to top when arriving on this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [statusText, setStatusText] = useState("");

  // Buyer / Co-Buyer toggle (matches reference)
  const [party, setParty] = useState("buyer"); // buyer | cobuyer

  // ---------------------------
  // Buyer: Personal Information
  // ---------------------------
  const [bFirstName, setBFirstName] = useState("");
  const [bLastName, setBLastName] = useState("");
  const [bEmail, setBEmail] = useState("");
  const [bCellPhone, setBCellPhone] = useState("");
  const [bHomePhone, setBHomePhone] = useState("");
  const [bDob, setBDob] = useState(""); // mm/dd/yyyy (keep as text for now)

  const [bDlNumber, setBDlNumber] = useState("");
  const [bDlState, setBDlState] = useState("MA");
  const [bDlIssueDate, setBDlIssueDate] = useState(""); // mm/dd/yyyy
  const [bDlExpiryDate, setBDlExpiryDate] = useState(""); // mm/dd/yyyy

  // ---------------------------
  // Buyer: Residential Information
  // ---------------------------
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUS, setStateUS] = useState("MA");
  const [zip, setZip] = useState("");
  const [housingType, setHousingType] = useState("Rent"); // Rent | Own | Other
  const [monthlyHousing, setMonthlyHousing] = useState("");

  const [addrYears, setAddrYears] = useState("0");
  const [addrMonths, setAddrMonths] = useState("0");

  const [showPrevAddress, setShowPrevAddress] = useState(false);
  const [prevStreet, setPrevStreet] = useState("");
  const [prevCity, setPrevCity] = useState("");
  const [prevState, setPrevState] = useState("MA");
  const [prevZip, setPrevZip] = useState("");

  // ---------------------------
  // Buyer: Employment Information
  // ---------------------------
  const [employerName, setEmployerName] = useState("");
  const [titlePosition, setTitlePosition] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [jobYears, setJobYears] = useState("0");
  const [jobMonths, setJobMonths] = useState("0");

  const [showPrevEmployment, setShowPrevEmployment] = useState(false);
  const [prevEmployerName, setPrevEmployerName] = useState("");
  const [prevTitlePosition, setPrevTitlePosition] = useState("");
  const [prevEmployerPhone, setPrevEmployerPhone] = useState("");

  // ---------------------------
  // Interested Vehicle (matches reference fields)
  // ---------------------------
  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [stockNumber, setStockNumber] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [exteriorColor, setExteriorColor] = useState("");
  const [interiorColor, setInteriorColor] = useState("");

  // ---------------------------
  // Co-Buyer (optional)
  // ---------------------------
  const [cFirstName, setCFirstName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cCellPhone, setCCellPhone] = useState("");
  const [cHomePhone, setCHomePhone] = useState("");
  const [cDob, setCDob] = useState("");

  const [cDlNumber, setCDlNumber] = useState("");
  const [cDlState, setCDlState] = useState("MA");
  const [cDlIssueDate, setCDlIssueDate] = useState("");
  const [cDlExpiryDate, setCDlExpiryDate] = useState("");

  const [cEmployerName, setCEmployerName] = useState("");
  const [cTitlePosition, setCTitlePosition] = useState("");
  const [cEmployerPhone, setCEmployerPhone] = useState("");
  const [cMonthlyIncome, setCMonthlyIncome] = useState("");
  const [cJobYears, setCJobYears] = useState("0");
  const [cJobMonths, setCJobMonths] = useState("0");

  // Consent
  const [consentCredit, setConsentCredit] = useState(false);
  const [consentContact, setConsentContact] = useState(true);

  // ---------------------------
  // Required validation (matches “asterisk required” idea)
  // ---------------------------
  const canSubmit = useMemo(() => {
    const buyerOk =
      bFirstName.trim() &&
      bLastName.trim() &&
      bEmail.trim() &&
      bCellPhone.trim() &&
      bDob.trim() &&
      bDlNumber.trim() &&
      bDlState.trim() &&
      bDlIssueDate.trim() &&
      bDlExpiryDate.trim() &&
      streetAddress.trim() &&
      city.trim() &&
      stateUS.trim() &&
      zip.trim() &&
      housingType.trim() &&
      monthlyHousing.trim() &&
      employerName.trim() &&
      titlePosition.trim() &&
      employerPhone.trim() &&
      monthlyIncome.trim() &&
      addrYears !== "" &&
      addrMonths !== "" &&
      jobYears !== "" &&
      jobMonths !== "" &&
      consentCredit;

    if (!buyerOk) return false;

    // If co-buyer is selected, require their personal + employment fields too
    if (party === "cobuyer") {
      const coOk =
        cFirstName.trim() &&
        cLastName.trim() &&
        cEmail.trim() &&
        cCellPhone.trim() &&
        cDob.trim() &&
        cDlNumber.trim() &&
        cDlState.trim() &&
        cDlIssueDate.trim() &&
        cDlExpiryDate.trim() &&
        cEmployerName.trim() &&
        cTitlePosition.trim() &&
        cEmployerPhone.trim() &&
        cMonthlyIncome.trim() &&
        cJobYears !== "" &&
        cJobMonths !== "";
      return Boolean(coOk);
    }

    return true;
  }, [
    party,
    bFirstName,
    bLastName,
    bEmail,
    bCellPhone,
    bDob,
    bDlNumber,
    bDlState,
    bDlIssueDate,
    bDlExpiryDate,
    streetAddress,
    city,
    stateUS,
    zip,
    housingType,
    monthlyHousing,
    addrYears,
    addrMonths,
    employerName,
    titlePosition,
    employerPhone,
    monthlyIncome,
    jobYears,
    jobMonths,
    consentCredit,
    cFirstName,
    cLastName,
    cEmail,
    cCellPhone,
    cDob,
    cDlNumber,
    cDlState,
    cDlIssueDate,
    cDlExpiryDate,
    cEmployerName,
    cTitlePosition,
    cEmployerPhone,
    cMonthlyIncome,
    cJobYears,
    cJobMonths,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setStatus("error");
      setStatusText("Please complete all required fields (marked with *) and accept the authorization.");
      return;
    }

    try {
      setStatus("sending");
      setStatusText("");

      const payload = {
        "form-name": "financing-application",
        party, // buyer | cobuyer

        // Buyer personal
        bFirstName,
        bLastName,
        bEmail,
        bCellPhone,
        bHomePhone,
        bDob,
        bDlNumber,
        bDlState,
        bDlIssueDate,
        bDlExpiryDate,

        // Residential
        streetAddress,
        city,
        stateUS,
        zip,
        housingType,
        monthlyHousing,
        addrYears,
        addrMonths,

        prevStreet,
        prevCity,
        prevState,
        prevZip,
        showPrevAddress: showPrevAddress ? "Yes" : "No",

        // Employment
        employerName,
        titlePosition,
        employerPhone,
        monthlyIncome,
        jobYears,
        jobMonths,

        prevEmployerName,
        prevTitlePosition,
        prevEmployerPhone,
        showPrevEmployment: showPrevEmployment ? "Yes" : "No",

        // Vehicle
        vehicleKeyword,
        stockNumber,
        vehicleYear,
        vehicleMake,
        vehicleModel,
        vehiclePrice,
        downPayment,
        exteriorColor,
        interiorColor,

        // Co-buyer (if used)
        cFirstName,
        cLastName,
        cEmail,
        cCellPhone,
        cHomePhone,
        cDob,
        cDlNumber,
        cDlState,
        cDlIssueDate,
        cDlExpiryDate,
        cEmployerName,
        cTitlePosition,
        cEmployerPhone,
        cMonthlyIncome,
        cJobYears,
        cJobMonths,

        // Consent
        consentCredit: consentCredit ? "Yes" : "No",
        consentContact: consentContact ? "Yes" : "No",
      };

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setStatus("success");
      setStatusText(
        "Application submitted! Next, please complete the secure credit application to enter your SSN and run approval."
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusText("Something went wrong. Please try again, or call/text us.");
    }
  }

  const Input = ({ value, onChange, placeholder, name, type = "text" }) => (
    <input
      className="rounded-xl border px-3 py-2 bg-white"
      style={{ borderColor: COLORS.mist }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      type={type}
    />
  );

  const SectionTitle = ({ children }) => (
    <h2 className="text-[13px] font-semibold mt-2" style={{ color: COLORS.charcoal }}>
      {children}
    </h2>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 mt-10 mb-16">
      <div className="rounded-3xl border p-6 md:p-8 bg-white/80 shadow-sm" style={{ borderColor: COLORS.mist }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.charcoal }}>
              Apply for Financing
            </h1>
            <p className="mt-2 text-gray-700">Get pre-approved in minutes. No obligation.</p>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Lock size={16} /> Your information is encrypted and only used to help you get approved.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              className="rounded-2xl px-4 py-2 font-semibold shadow-sm border"
              style={{ borderColor: COLORS.mist }}
              href={`tel:${PHONE}`}
            >
              <span className="inline-flex items-center gap-2">
                <Phone size={16} /> Call / Text
              </span>
            </a>
            <a
              className="rounded-2xl px-4 py-2 font-semibold shadow-sm border"
              style={{ borderColor: COLORS.mist }}
              href={`mailto:${EMAIL}`}
            >
              <span className="inline-flex items-center gap-2">
                <Mail size={16} /> Email
              </span>
            </a>
          </div>
        </div>

        {/* Status banner */}
        {status !== "idle" && (
          <div
            className="mt-5 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: COLORS.mist,
              background:
                status === "success"
                  ? "rgba(187, 247, 208, 0.5)"
                  : status === "error"
                  ? "rgba(254, 202, 202, 0.5)"
                  : "rgba(220, 225, 233, 0.5)",
              color: COLORS.charcoal,
            }}
            role="status"
            aria-live="polite"
          >
            {status === "sending" ? "Submitting…" : statusText}
          </div>
        )}

        {/* Buyer / Co-buyer Toggle */}
        <div className="mt-6 inline-flex rounded-xl border overflow-hidden" style={{ borderColor: COLORS.mist }}>
          <button
            type="button"
            onClick={() => setParty("buyer")}
            className="px-4 py-2 text-sm font-semibold"
            style={{
              background: party === "buyer" ? `linear-gradient(180deg, ${COLORS.azure}, ${COLORS.sky})` : "#fff",
              color: party === "buyer" ? "#0b2e3a" : COLORS.charcoal,
            }}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setParty("cobuyer")}
            className="px-4 py-2 text-sm font-semibold"
            style={{
              background: party === "cobuyer" ? `linear-gradient(180deg, ${COLORS.azure}, ${COLORS.sky})` : "#fff",
              color: party === "cobuyer" ? "#0b2e3a" : COLORS.charcoal,
              borderLeft: `1px solid ${COLORS.mist}`,
            }}
          >
            Co-Buyer
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">All fields marked with an asterisk (*) are required.</p>

        {/* Form */}
        <form
          className="mt-5 grid gap-6"
          onSubmit={handleSubmit}
          name="financing-application"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="financing-application" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" />
            </label>
          </p>

          {/* Personal Information */}
          <section className="grid gap-3">
            <SectionTitle>Personal Information</SectionTitle>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={bFirstName} onChange={(e) => setBFirstName(e.target.value)} placeholder="First name *" name="bFirstName" />
              <Input value={bLastName} onChange={(e) => setBLastName(e.target.value)} placeholder="Last name *" name="bLastName" />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <Input value={bEmail} onChange={(e) => setBEmail(e.target.value)} placeholder="Email *" name="bEmail" type="email" />
              <Input value={bCellPhone} onChange={(e) => setBCellPhone(e.target.value)} placeholder="Cell phone *" name="bCellPhone" />
              <Input value={bHomePhone} onChange={(e) => setBHomePhone(e.target.value)} placeholder="Home phone (optional)" name="bHomePhone" />
            </div>

            <Input value={bDob} onChange={(e) => setBDob(e.target.value)} placeholder="Date of birth (MM/DD/YYYY) *" name="bDob" />

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={bDlNumber} onChange={(e) => setBDlNumber(e.target.value)} placeholder="Driver’s license number *" name="bDlNumber" />
              <Input value={bDlState} onChange={(e) => setBDlState(e.target.value)} placeholder="Driver’s license state *" name="bDlState" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={bDlIssueDate} onChange={(e) => setBDlIssueDate(e.target.value)} placeholder="Driver’s license issue date (MM/DD/YYYY) *" name="bDlIssueDate" />
              <Input value={bDlExpiryDate} onChange={(e) => setBDlExpiryDate(e.target.value)} placeholder="Driver’s license expiry date (MM/DD/YYYY) *" name="bDlExpiryDate" />
            </div>

            <div className="text-xs text-gray-600 flex items-center gap-2">
              <Lock size={14} />
              SSN is collected on the secure credit application (next step).
            </div>
          </section>

          {/* Residential Information */}
          <section className="grid gap-3">
            <SectionTitle>Residential Information</SectionTitle>

            <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street address *" name="streetAddress" />

            <div className="grid md:grid-cols-3 gap-3">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" name="city" />
              <Input value={stateUS} onChange={(e) => setStateUS(e.target.value)} placeholder="State *" name="stateUS" />
              <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Zip code *" name="zip" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <select
                className="rounded-xl border px-3 py-2 bg-white"
                style={{ borderColor: COLORS.mist }}
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                name="housingType"
              >
                <option>Rent</option>
                <option>Own</option>
                <option>Other</option>
              </select>

              <Input
                value={monthlyHousing}
                onChange={(e) => setMonthlyHousing(e.target.value)}
                placeholder="Monthly rent/mortgage amount *"
                name="monthlyHousing"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Years at address *</div>
                <select
                  className="rounded-xl border px-3 py-2 bg-white w-full"
                  style={{ borderColor: COLORS.mist }}
                  value={addrYears}
                  onChange={(e) => setAddrYears(e.target.value)}
                  name="addrYears"
                >
                  {yearsOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Months at address *</div>
                <select
                  className="rounded-xl border px-3 py-2 bg-white w-full"
                  style={{ borderColor: COLORS.mist }}
                  value={addrMonths}
                  onChange={(e) => setAddrMonths(e.target.value)}
                  name="addrMonths"
                >
                  {monthsOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrevAddress((s) => !s)}
              className="text-sm underline text-left"
              style={{ color: COLORS.azure }}
            >
              + Add Previous Address
            </button>

            {showPrevAddress && (
              <div className="grid gap-3 rounded-2xl border p-4 bg-white" style={{ borderColor: COLORS.mist }}>
                <Input value={prevStreet} onChange={(e) => setPrevStreet(e.target.value)} placeholder="Previous street address" name="prevStreet" />
                <div className="grid md:grid-cols-3 gap-3">
                  <Input value={prevCity} onChange={(e) => setPrevCity(e.target.value)} placeholder="Previous city" name="prevCity" />
                  <Input value={prevState} onChange={(e) => setPrevState(e.target.value)} placeholder="Previous state" name="prevState" />
                  <Input value={prevZip} onChange={(e) => setPrevZip(e.target.value)} placeholder="Previous zip" name="prevZip" />
                </div>
              </div>
            )}
          </section>

          {/* Employment Information */}
          <section className="grid gap-3">
            <SectionTitle>Employment Information</SectionTitle>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Employer name *" name="employerName" />
              <Input value={titlePosition} onChange={(e) => setTitlePosition(e.target.value)} placeholder="Title/position *" name="titlePosition" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={employerPhone} onChange={(e) => setEmployerPhone(e.target.value)} placeholder="Employer phone number *" name="employerPhone" />
              <Input value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="Monthly gross income *" name="monthlyIncome" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Years at job *</div>
                <select
                  className="rounded-xl border px-3 py-2 bg-white w-full"
                  style={{ borderColor: COLORS.mist }}
                  value={jobYears}
                  onChange={(e) => setJobYears(e.target.value)}
                  name="jobYears"
                >
                  {yearsOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Months at job *</div>
                <select
                  className="rounded-xl border px-3 py-2 bg-white w-full"
                  style={{ borderColor: COLORS.mist }}
                  value={jobMonths}
                  onChange={(e) => setJobMonths(e.target.value)}
                  name="jobMonths"
                >
                  {monthsOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrevEmployment((s) => !s)}
              className="text-sm underline text-left"
              style={{ color: COLORS.azure }}
            >
              + Add Previous Employment
            </button>

            {showPrevEmployment && (
              <div className="grid gap-3 rounded-2xl border p-4 bg-white" style={{ borderColor: COLORS.mist }}>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input value={prevEmployerName} onChange={(e) => setPrevEmployerName(e.target.value)} placeholder="Previous employer name" name="prevEmployerName" />
                  <Input value={prevTitlePosition} onChange={(e) => setPrevTitlePosition(e.target.value)} placeholder="Previous title/position" name="prevTitlePosition" />
                </div>
                <Input value={prevEmployerPhone} onChange={(e) => setPrevEmployerPhone(e.target.value)} placeholder="Previous employer phone number" name="prevEmployerPhone" />
              </div>
            )}
          </section>

          {/* Interested Vehicle */}
          <section className="grid gap-3">
            <SectionTitle>Interested Vehicle</SectionTitle>

            <Input value={vehicleKeyword} onChange={(e) => setVehicleKeyword(e.target.value)} placeholder="Vehicle keyword" name="vehicleKeyword" />

            <div className="grid md:grid-cols-4 gap-3">
              <Input value={stockNumber} onChange={(e) => setStockNumber(e.target.value)} placeholder="Stock number" name="stockNumber" />
              <Input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="Year" name="vehicleYear" />
              <Input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Make" name="vehicleMake" />
              <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Model" name="vehicleModel" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} placeholder="Vehicle price" name="vehiclePrice" />
              <Input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="Down payment" name="downPayment" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input value={exteriorColor} onChange={(e) => setExteriorColor(e.target.value)} placeholder="Exterior color" name="exteriorColor" />
              <Input value={interiorColor} onChange={(e) => setInteriorColor(e.target.value)} placeholder="Interior color" name="interiorColor" />
            </div>
          </section>

          {/* Co-buyer block */}
          {party === "cobuyer" && (
            <section className="grid gap-3">
              <SectionTitle>Co-Buyer Information</SectionTitle>

              <div className="grid md:grid-cols-2 gap-3">
                <Input value={cFirstName} onChange={(e) => setCFirstName(e.target.value)} placeholder="Co-buyer first name *" name="cFirstName" />
                <Input value={cLastName} onChange={(e) => setCLastName(e.target.value)} placeholder="Co-buyer last name *" name="cLastName" />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <Input value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="Co-buyer email *" name="cEmail" type="email" />
                <Input value={cCellPhone} onChange={(e) => setCCellPhone(e.target.value)} placeholder="Co-buyer cell phone *" name="cCellPhone" />
                <Input value={cHomePhone} onChange={(e) => setCHomePhone(e.target.value)} placeholder="Co-buyer home phone (optional)" name="cHomePhone" />
              </div>

              <Input value={cDob} onChange={(e) => setCDob(e.target.value)} placeholder="Co-buyer date of birth (MM/DD/YYYY) *" name="cDob" />

              <div className="grid md:grid-cols-2 gap-3">
                <Input value={cDlNumber} onChange={(e) => setCDlNumber(e.target.value)} placeholder="Co-buyer DL number *" name="cDlNumber" />
                <Input value={cDlState} onChange={(e) => setCDlState(e.target.value)} placeholder="Co-buyer DL state *" name="cDlState" />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input value={cDlIssueDate} onChange={(e) => setCDlIssueDate(e.target.value)} placeholder="Co-buyer DL issue date (MM/DD/YYYY) *" name="cDlIssueDate" />
                <Input value={cDlExpiryDate} onChange={(e) => setCDlExpiryDate(e.target.value)} placeholder="Co-buyer DL expiry date (MM/DD/YYYY) *" name="cDlExpiryDate" />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input value={cEmployerName} onChange={(e) => setCEmployerName(e.target.value)} placeholder="Co-buyer employer name *" name="cEmployerName" />
                <Input value={cTitlePosition} onChange={(e) => setCTitlePosition(e.target.value)} placeholder="Co-buyer title/position *" name="cTitlePosition" />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input value={cEmployerPhone} onChange={(e) => setCEmployerPhone(e.target.value)} placeholder="Co-buyer employer phone *" name="cEmployerPhone" />
                <Input value={cMonthlyIncome} onChange={(e) => setCMonthlyIncome(e.target.value)} placeholder="Co-buyer monthly gross income *" name="cMonthlyIncome" />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Co-buyer years at job *</div>
                  <select
                    className="rounded-xl border px-3 py-2 bg-white w-full"
                    style={{ borderColor: COLORS.mist }}
                    value={cJobYears}
                    onChange={(e) => setCJobYears(e.target.value)}
                    name="cJobYears"
                  >
                    {yearsOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Co-buyer months at job *</div>
                  <select
                    className="rounded-xl border px-3 py-2 bg-white w-full"
                    style={{ borderColor: COLORS.mist }}
                    value={cJobMonths}
                    onChange={(e) => setCJobMonths(e.target.value)}
                    name="cJobMonths"
                  >
                    {monthsOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Consent */}
          <section className="grid gap-2">
            <label className="flex gap-2 items-start text-sm text-gray-700">
              <input type="checkbox" checked={consentCredit} onChange={(e) => setConsentCredit(e.target.checked)} />
              <span>
                <b>Authorization (required):</b> I authorize Mass Market Auto Sales to obtain my credit information for the purpose of financing this vehicle.
              </span>
            </label>

            <label className="flex gap-2 items-start text-sm text-gray-700">
              <input type="checkbox" checked={consentContact} onChange={(e) => setConsentContact(e.target.checked)} />
              <span>Contact permission: You may contact me by phone, text, or email about my application.</span>
            </label>

            <p className="text-xs text-gray-500">
              After you submit this form, you’ll complete the secure credit application to enter your SSN.
            </p>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="submit"
              disabled={status === "sending" || !canSubmit}
              className="rounded-2xl px-5 py-2 font-semibold shadow-sm disabled:opacity-60"
              style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
            >
              {status === "sending" ? "Submitting..." : "Submit Application"}
            </button>

            <a
              href={DEALERCENTER_CREDIT_APP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl px-5 py-2 font-semibold shadow-sm border"
              style={{ borderColor: COLORS.mist }}
              title="Opens a secure credit application to enter SSN"
            >
              <span className="inline-flex items-center gap-2">
                Continue to Secure Credit App <ExternalLink size={16} />
              </span>
            </a>

            <a className="text-sm underline" style={{ color: COLORS.azure }} href="#finance">
              Back to Financing Calculator
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
