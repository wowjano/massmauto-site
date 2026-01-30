import { useMemo, useState } from "react";
import { Lock, Phone, Mail } from "lucide-react";

const COLORS = {
  charcoal: "#363732",
  sky: "#53d8fb",
  azure: "#66c3ff",
  mist: "#dce1e9",
  rose: "#d4afb9",
};

function encode(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

export default function FinancingApply() {
  const PHONE = "+15083716512";
  const EMAIL = "contact@massmauto.com";

  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [statusText, setStatusText] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUS, setStateUS] = useState("MA");
  const [zip, setZip] = useState("");
  const [housingStatus, setHousingStatus] = useState("Rent");
  const [housingPayment, setHousingPayment] = useState("");

  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [vehicleInterest, setVehicleInterest] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [hasTrade, setHasTrade] = useState("No");
  const [tradeVehicle, setTradeVehicle] = useState("");
  const [tradeVin, setTradeVin] = useState("");
  const [tradePayoff, setTradePayoff] = useState("");

  // Safer than full SSN in email:
  const [ssnLast4, setSsnLast4] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [dlState, setDlState] = useState("MA");

  const [consentCredit, setConsentCredit] = useState(false);
  const [consentContact, setConsentContact] = useState(true);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      phone.trim() &&
      email.trim() &&
      dob.trim() &&
      address.trim() &&
      city.trim() &&
      stateUS.trim() &&
      zip.trim() &&
      housingStatus.trim() &&
      housingPayment.trim() &&
      employmentStatus.trim() &&
      monthlyIncome.trim() &&
      ssnLast4.trim().length === 4 &&
      dlNumber.trim() &&
      dlState.trim() &&
      consentCredit
    );
  }, [
    firstName, lastName, phone, email, dob,
    address, city, stateUS, zip, housingStatus, housingPayment,
    employmentStatus, monthlyIncome,
    ssnLast4, dlNumber, dlState, consentCredit
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setStatus("error");
      setStatusText("Please complete all required fields and accept the authorization.");
      return;
    }

    try {
      setStatus("sending");
      setStatusText("");

      const payload = {
        "form-name": "financing-application",

        firstName,
        lastName,
        phone,
        email,
        dob,

        address,
        city,
        state: stateUS,
        zip,
        housingStatus,
        housingPayment,

        employmentStatus,
        employerName,
        jobTitle,
        monthlyIncome,

        vehicleInterest,
        downPayment,
        hasTrade,
        tradeVehicle,
        tradeVin,
        tradePayoff,

        ssnLast4,
        dlNumber,
        dlState,

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
      setStatusText("Application submitted! We’ll reach out shortly—usually within the hour during business hours.");

      // Optional: clear
      // (Keeping fields can be helpful in case they want to screenshot/review)
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusText("Something went wrong. Please try again, or call/text us.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 mt-10 mb-16">
      <div className="rounded-3xl border p-6 md:p-8 bg-white/80 shadow-sm"
           style={{ borderColor: COLORS.mist }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.charcoal }}>
              Apply for Financing
            </h1>
            <p className="mt-2 text-gray-700">
              Get pre-approved in minutes. No obligation.
            </p>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Lock size={16} /> Your information is encrypted and only used to help you get approved.
            </p>
          </div>

          <div className="flex gap-2">
            <a className="rounded-2xl px-4 py-2 font-semibold shadow-sm border"
               style={{ borderColor: COLORS.mist }}
               href={`tel:${PHONE}`}>
              <span className="inline-flex items-center gap-2"><Phone size={16}/> Call / Text</span>
            </a>
            <a className="rounded-2xl px-4 py-2 font-semibold shadow-sm border"
               style={{ borderColor: COLORS.mist }}
               href={`mailto:${EMAIL}`}>
              <span className="inline-flex items-center gap-2"><Mail size={16}/> Email</span>
            </a>
          </div>
        </div>

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

        <form
          className="mt-6 grid gap-6"
          onSubmit={handleSubmit}
          name="financing-application"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="financing-application" />
          <p className="hidden">
            <label>Don’t fill this out: <input name="bot-field" /></label>
          </p>

          {/* Section: Basic Info */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>Basic Info</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="First name *" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Last name *" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Phone *" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Email *" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>

            <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                   placeholder="Date of birth (MM/DD/YYYY) *" value={dob} onChange={(e)=>setDob(e.target.value)} />
            <p className="text-xs text-gray-500">We only contact you about this application.</p>
          </section>

          {/* Section: Residence */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>Residence</h2>
            <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                   placeholder="Street address *" value={address} onChange={(e)=>setAddress(e.target.value)} />

            <div className="grid md:grid-cols-3 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="City *" value={city} onChange={(e)=>setCity(e.target.value)} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="State *" value={stateUS} onChange={(e)=>setStateUS(e.target.value)} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="ZIP *" value={zip} onChange={(e)=>setZip(e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <select className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                      value={housingStatus} onChange={(e)=>setHousingStatus(e.target.value)}>
                <option>Rent</option>
                <option>Own</option>
                <option>Live with family</option>
                <option>Other</option>
              </select>
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Monthly housing payment *" value={housingPayment} onChange={(e)=>setHousingPayment(e.target.value)} />
            </div>
          </section>

          {/* Section: Employment */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>Employment & Income</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <select className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                      value={employmentStatus} onChange={(e)=>setEmploymentStatus(e.target.value)}>
                <option>Employed</option>
                <option>Self-employed</option>
                <option>Retired</option>
                <option>Unemployed</option>
                <option>Student</option>
              </select>
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Monthly gross income *" value={monthlyIncome} onChange={(e)=>setMonthlyIncome(e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Employer name (optional)" value={employerName} onChange={(e)=>setEmployerName(e.target.value)} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Job title (optional)" value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} />
            </div>
            <p className="text-xs text-gray-500">Estimate is okay.</p>
          </section>

          {/* Section: Vehicle */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>Vehicle (optional)</h2>
            <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                   placeholder="Vehicle interested in (optional)" value={vehicleInterest} onChange={(e)=>setVehicleInterest(e.target.value)} />
            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Down payment (optional)" value={downPayment} onChange={(e)=>setDownPayment(e.target.value)} />
              <select className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                      value={hasTrade} onChange={(e)=>setHasTrade(e.target.value)}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            {hasTrade === "Yes" && (
              <div className="grid gap-3">
                <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                       placeholder="Trade vehicle (Year Make Model) (optional)" value={tradeVehicle} onChange={(e)=>setTradeVehicle(e.target.value)} />
                <div className="grid md:grid-cols-2 gap-3">
                  <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                         placeholder="Trade VIN (optional)" value={tradeVin} onChange={(e)=>setTradeVin(e.target.value)} />
                  <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                         placeholder="Estimated payoff (optional)" value={tradePayoff} onChange={(e)=>setTradePayoff(e.target.value)} />
                </div>
              </div>
            )}
          </section>

          {/* Section: Secure Info */}
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>Secure Information</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="SSN (last 4) *" value={ssnLast4} onChange={(e)=>setSsnLast4(e.target.value.replace(/\D/g, "").slice(0,4))} />
              <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                     placeholder="Driver’s license number *" value={dlNumber} onChange={(e)=>setDlNumber(e.target.value)} />
            </div>
            <input className="rounded-xl border px-3 py-2" style={{ borderColor: COLORS.mist }}
                   placeholder="Driver’s license state *" value={dlState} onChange={(e)=>setDlState(e.target.value)} />
            <p className="text-xs text-gray-500">
              <span className="inline-flex items-center gap-2"><Lock size={14}/> Encrypted. Used only for financing approval.</span>
            </p>
          </section>

          {/* Consent */}
          <section className="grid gap-2">
            <label className="flex gap-2 items-start text-sm text-gray-700">
              <input type="checkbox" checked={consentCredit} onChange={(e)=>setConsentCredit(e.target.checked)} />
              <span>
                <b>Authorization (required):</b> I authorize Mass Market Auto Sales to obtain my credit information for the purpose of financing this vehicle.
              </span>
            </label>

            <label className="flex gap-2 items-start text-sm text-gray-700">
              <input type="checkbox" checked={consentContact} onChange={(e)=>setConsentContact(e.target.checked)} />
              <span>Contact permission: You may contact me by phone, text, or email about my application.</span>
            </label>
            <p className="text-xs text-gray-500">
              By submitting, you agree to be contacted by Mass Market Auto Sales.
            </p>
          </section>

          {/* Submit */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="submit"
              disabled={status === "sending" || !canSubmit}
              className="rounded-2xl px-5 py-2 font-semibold shadow-sm disabled:opacity-60"
              style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
            >
              {status === "sending" ? "Submitting..." : "Submit Application"}
            </button>

            <a className="text-sm underline" style={{ color: COLORS.azure }} href="#finance">
              Back to Financing Calculator
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
