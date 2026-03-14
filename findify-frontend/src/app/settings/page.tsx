"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Mail, Clock, Save, CheckCircle2, ChevronUp, ChevronDown, Phone, MessageCircle, AlertCircle, Send } from "lucide-react";

const daysOfWeek = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  
  // Notification State
  const [notifications, setNotifications] = useState({
    email_alerts_enabled: false,
    whatsapp_alerts_enabled: false,
    phone_number: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [selectedDays, setSelectedDays] = useState<string[]>(["sun"]);

  // --- CLOCK STATE ---
  const [hour, setHour] = useState<string>("09");
  const [minute, setMinute] = useState<string>("00");
  const [period, setPeriod] = useState<string>("AM");

  const [hourRotation, setHourRotation] = useState(270); 
  const [minRotation, setMinRotation] = useState(0);    

  // FETCH SETTINGS ON LOAD
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev/settings", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          setNotifications({
            email_alerts_enabled: data.email_alerts_enabled,
            whatsapp_alerts_enabled: data.whatsapp_alerts_enabled,
            phone_number: data.phone_number || "",
          });

          if (data.run_days) setSelectedDays(data.run_days);

          if (data.run_hour !== undefined && data.run_minute !== undefined) {
            let bHour = parseInt(data.run_hour, 10);
            const bMin = parseInt(data.run_minute, 10);
            const p = bHour >= 12 ? "PM" : "AM";
            let displayHour = bHour % 12;
            if (displayHour === 0) displayHour = 12;

            setHour(String(displayHour).padStart(2, "0"));
            setMinute(String(bMin).padStart(2, "0"));
            setPeriod(p);

            // Set absolute initial rotations to prevent the Strict Mode double-spin bug
            setHourRotation((displayHour % 12) * 30);
            setMinRotation((Math.round(bMin / 5) * 5 % 60) * 6);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const updateRotations = (newHour: number, newMin: number) => {
    const currentHourAngle = hourRotation % 360;
    const targetHourAngle = (newHour % 12) * 30;
    let diffH = targetHourAngle - currentHourAngle;
    if (diffH > 180) diffH -= 360;
    if (diffH < -180) diffH += 360;
    setHourRotation(prev => prev + diffH);

    const roundedMin = Math.round(newMin / 5) * 5;
    const currentMinAngle = minRotation % 360;
    const targetMinAngle = (roundedMin % 60) * 6;
    let diffM = targetMinAngle - currentMinAngle;
    if (diffM > 180) diffM -= 360;
    if (diffM < -180) diffM += 360;
    setMinRotation(prev => prev + diffM);
  };

  const handleManualEntry = (type: "h" | "m", val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    
    if (type === "h") {
      setHour(cleanVal);
      const num = parseInt(cleanVal, 10);
      if (!isNaN(num) && num > 0) {
        updateRotations(num, parseInt(minute, 10) || 0);
      }
    } else {
      setMinute(cleanVal);
      const num = parseInt(cleanVal, 10);
      if (!isNaN(num)) {
        updateRotations(parseInt(hour, 10) || 12, num);
      }
    }
  };

  const handleTimeBlur = () => {
    let h = parseInt(hour, 10);
    let m = parseInt(minute, 10);

    // Switched to 12-hour logic (1 to 12)
    if (isNaN(h) || h < 1 || h > 12) h = 12;
    if (isNaN(m) || m < 0 || m > 59) m = 0;

    // Removed the math rounding logic here so it displays exactly what the user typed.
    setHour(String(h).padStart(2, "0"));
    setMinute(String(m).padStart(2, "0"));
    updateRotations(h, m);
  };

  const adjustTime = (type: "h" | "m", direction: "up" | "down") => {
    const amount = direction === "up" ? 1 : -1;
    let h = parseInt(hour, 10) || 12;
    let m = parseInt(minute, 10) || 0;

    if (type === "h") {
      // 12-hour wrap logic
      let newH = h + amount;
      if (newH > 12) newH = 1;
      if (newH < 1) newH = 12;
      
      setHour(String(newH).padStart(2, "0"));
      setHourRotation(prev => prev + (amount * 30));
    } else {
      m = (m + (amount * 5) + 60) % 60;
      setMinute(String(m).padStart(2, "0"));
      setMinRotation(prev => prev + (amount * 30));
    }
  };

  // --- WHATSAPP FORMATTING & VALIDATION (RESTORED) ---
  const formatPhoneNumber = (val: string) => {
    if (!val) return "";

    let cleaned = val.replace(/[^\d+]/g, "");

    if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }
    
    cleaned = cleaned.charAt(0) + cleaned.slice(1).replace(/\+/g, "");
    if (cleaned === "+") return cleaned;

    const digits = cleaned.slice(1);

    // USA: +1 415-123-4567
    if (digits.startsWith("1")) {
      const match = digits.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        let res = `+${match[1]}`;
        if (match[2]) res += ` ${match[2]}`;
        if (match[3]) res += `-${match[3]}`;
        if (match[4]) res += `-${match[4]}`;
        return res;
      }
    } 
    // UK: +44 0201 2345678
    else if (digits.startsWith("44")) {
      const match = digits.match(/^(\d{2})(\d{0,4})(\d{0,6})$/);
      if (match) {
        let res = `+${match[1]}`;
        if (match[2]) res += ` ${match[2]}`;
        if (match[3]) res += `-${match[3]}`;
        return res;
      }
    }
    // INDIA: +91 75698-23610
    else if (digits.startsWith("91")) {
      const match = digits.match(/^(\d{2})(\d{0,5})(\d{0,5})$/);
      if (match) {
        let res = `+${match[1]}`;
        if (match[2]) res += ` ${match[2]}`;
        if (match[3]) res += `-${match[3]}`;
        return res;
      }
    }

    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedVal = formatPhoneNumber(e.target.value);
    setNotifications({ ...notifications, phone_number: formattedVal });
    if (phoneError) setPhoneError(null); 
  };

  const validatePhone = () => {
    const val = notifications.phone_number.trim();
    if (!notifications.whatsapp_alerts_enabled) {
      setPhoneError(null);
      return true;
    }
    if (!val) {
      setPhoneError("Phone number is required for WhatsApp alerts.");
      return false;
    }
    if (!val.startsWith("+")) {
      setPhoneError("Number must start with a country code (e.g., +1).");
      return false;
    }

    const digitsOnly = val.replace(/\D/g, "");

    if (digitsOnly.startsWith("1")) {
      if (digitsOnly.length !== 11) {
        setPhoneError("USA numbers must be exactly 10 digits after +1.");
        return false;
      }
    } else if (digitsOnly.startsWith("44")) {
      if (digitsOnly.length !== 12) {
        setPhoneError("UK numbers must be exactly 10 digits after +44.");
        return false;
      }
    } else if (digitsOnly.startsWith("91")) {
      if (digitsOnly.length !== 12) {
        setPhoneError("India numbers must be exactly 10 digits after +91.");
        return false;
      }
    } else if (digitsOnly.length < 10) {
      setPhoneError("Please enter a valid, complete phone number.");
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const handlePhoneBlur = () => {
    validatePhone();
  };

  // --- ACTIONS ---
  const handleSave = async () => {
    if (notifications.whatsapp_alerts_enabled && !validatePhone()) {
      setActiveTab("notifications"); 
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return;
    }

    setSaveStatus("saving");

    let backendHour = parseInt(hour, 10);
    if (period === "PM" && backendHour !== 12) backendHour += 12;
    if (period === "AM" && backendHour === 12) backendHour = 0;
    const formattedHour = String(backendHour).padStart(2, "0");

    const payload = {
      email_alerts_enabled: notifications.email_alerts_enabled,
      whatsapp_alerts_enabled: notifications.whatsapp_alerts_enabled,
      phone_number: notifications.phone_number || null,
      run_days: selectedDays,
      run_hour: formattedHour,
      run_minute: minute
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev/settings", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      setSaveStatus("success"); 
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 2000); 
    }
  };

  const handleTestNotification = async () => {
    if (notifications.whatsapp_alerts_enabled && !validatePhone()) {
      return;
    }
    
    setTestStatus("testing");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(notifications),
      });
      if (!response.ok) throw new Error("Failed to send test");
      setTestStatus("success");
    } catch (error) {
      setTestStatus("error");
    } finally {
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      <div className="max-w-5xl mx-auto pt-16 px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-gray-900">Settings</h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">Configuration & Automation</p>
          </div>
          <button 
            onClick={handleSave} 
            className={`px-8 py-3 rounded-md transition-all flex items-center gap-2 font-medium active:scale-95 text-white ${saveStatus === "error" ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-gray-800"}`}
          >
            {saveStatus === "success" ? <CheckCircle2 size={18} /> : saveStatus === "error" ? <AlertCircle size={18} /> : <Save size={18} />}
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Changes Saved" : saveStatus === "error" ? "Fix Errors" : "Apply Settings"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* NAV */}
          <div className="space-y-1">
            <button onClick={() => setActiveTab("notifications")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === "notifications" ? "bg-gray-100 border-l-4 border-black text-black" : "text-gray-400 hover:text-black"}`}>Notifications</button>
            <button onClick={() => setActiveTab("scheduler")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === "scheduler" ? "bg-gray-100 border-l-4 border-black text-black" : "text-gray-400 hover:text-black"}`}>Scheduler</button>
          </div>

          <div className="md:col-span-3">
            
            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
                
                {/* CONFIGURATION COLUMN */}
                <section className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell size={20}/> Alert Relay
                  </h2>
                  
                  {/* Email Toggle */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-black transition-colors cursor-pointer" onClick={() => setNotifications({...notifications, email_alerts_enabled: !notifications.email_alerts_enabled})}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${notifications.email_alerts_enabled ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}><Mail size={20}/></div>
                      <div>
                        <p className="font-bold text-sm">Email Alerts</p>
                        <p className="text-xs text-gray-500 font-medium">Sent to your account email</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notifications.email_alerts_enabled ? "bg-black" : "bg-gray-200"}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notifications.email_alerts_enabled ? "left-6" : "left-1"}`} />
                    </div>
                  </div>

                  {/* WhatsApp Toggle */}
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-[#25D366] transition-colors cursor-pointer" onClick={() => {
                    const willBeEnabled = !notifications.whatsapp_alerts_enabled;
                    setNotifications({...notifications, whatsapp_alerts_enabled: willBeEnabled});
                    if (!willBeEnabled) setPhoneError(null); 
                  }}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${notifications.whatsapp_alerts_enabled ? "bg-[#25D366] text-white" : "bg-gray-100 text-gray-400"}`}><MessageCircle size={20}/></div>
                      <div>
                        <p className="font-bold text-sm">WhatsApp Alerts</p>
                        <p className="text-xs text-gray-500 font-medium">Instant messages for priority items</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notifications.whatsapp_alerts_enabled ? "bg-[#25D366]" : "bg-gray-200"}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notifications.whatsapp_alerts_enabled ? "left-6" : "left-1"}`} />
                    </div>
                  </div>

                  {/* WhatsApp Number Input */}
                  {notifications.whatsapp_alerts_enabled && (
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-end">
                        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${phoneError ? "text-red-500" : "text-gray-500"}`}>
                          <Phone size={14}/> WhatsApp Number
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Include country code</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="+1 123-456-7890" 
                          value={notifications.phone_number} 
                          onChange={handlePhoneChange} 
                          onBlur={handlePhoneBlur}
                          className={`w-full bg-white border p-3 pl-4 rounded-lg focus:outline-none focus:ring-2 transition-all font-mono text-lg ${
                            phoneError 
                              ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                              : "border-gray-200 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                          }`} 
                        />
                      </div>
                      {phoneError ? (
                        <p className="text-xs text-red-500 font-medium animate-in fade-in flex items-center gap-1">
                          <AlertCircle size={12} /> {phoneError}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-2">Example: <strong className="text-gray-700">+1</strong> for US, <strong className="text-gray-700">+44</strong> for UK, <strong className="text-gray-700">+91</strong> for India.</p>
                      )}
                    </div>
                  )}

                  {/* Test Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleTestNotification}
                      disabled={(!notifications.email_alerts_enabled && !notifications.whatsapp_alerts_enabled) || testStatus === "testing"}
                      className={`w-full py-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                        (!notifications.email_alerts_enabled && !notifications.whatsapp_alerts_enabled) ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : 
                        testStatus === "success" ? "bg-green-50 text-green-600 border-green-200" :
                        testStatus === "error" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-white text-black border-gray-200 hover:border-black active:scale-[0.98]"
                      }`}
                    >
                      {testStatus === "testing" ? "Sending..." : testStatus === "success" ? "Test Sent!" : testStatus === "error" ? "Send Failed" : <><Send size={16}/> Send Test Notification</>}
                    </button>
                  </div>
                </section>

                {/* PREVIEW COLUMN */}
                <section className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-400">
                    Message Preview
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Email Preview */}
                    <div className={`p-6 border rounded-xl transition-all ${notifications.email_alerts_enabled ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-50 grayscale"}`}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Email Format</h3>
                      <div className="space-y-3 text-sm">
                        <p><span className="text-gray-400">Subject:</span> <strong className="font-medium">New internship detected — Shopify / Backend Intern</strong></p>
                        <hr className="border-gray-100" />
                        <p className="text-gray-600">A new internship has been detected:</p>
                        <div className="bg-gray-50 p-3 rounded-md font-mono text-xs text-gray-600 space-y-1">
                          <p>Company: Shopify</p>
                          <p>Position: Backend Software Engineer Intern</p>
                          <p>Location: Toronto, ON</p>
                          <p>Posted: 2026-03-14 14:30:22</p>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Preview */}
                    <div className={`p-6 border rounded-xl transition-all ${notifications.whatsapp_alerts_enabled ? "bg-white border-[#25D366]/30 shadow-sm" : "bg-gray-50 border-gray-100 opacity-50 grayscale"}`}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">WhatsApp Format</h3>
                      <div className="bg-[#E7FFDB] p-4 rounded-xl rounded-tl-sm relative w-5/6 shadow-sm border border-[#D1F4C9]">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          *Findify:* New internship at Shopify - Backend Software Engineer Intern. View details in dashboard.
                        </p>
                        <span className="text-[10px] text-gray-400 absolute bottom-2 right-3">12:00 PM</span>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* SCHEDULER TAB (Unchanged) */}
            {activeTab === "scheduler" && (
              <div className="space-y-16 animate-in fade-in duration-500">
                <section>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Calendar size={20}/> Run Days</h2>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <button key={day.id} onClick={() => setSelectedDays(prev => prev.includes(day.id) ? prev.filter(d => d !== day.id) : [...prev, day.id])}
                        className={`px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedDays.includes(day.id) ? "border-black bg-black text-white" : "border-gray-100 text-gray-400 hover:border-gray-300"}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Clock size={20} /> Execution Time</h2>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-10 bg-gray-50 p-10 rounded-3xl w-fit border border-gray-100 shadow-sm">
                    {/* DIGITAL INPUTS */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <button onClick={() => adjustTime("h", "up")} className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-black"><ChevronUp size={24}/></button>
                        <input 
                          type="text"
                          value={hour}
                          onChange={(e) => handleManualEntry("h", e.target.value)}
                          onBlur={handleTimeBlur}
                          className="w-20 text-6xl font-black font-mono tracking-tighter text-center bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-200"
                          placeholder="12"
                          maxLength={2}
                        />
                        <button onClick={() => adjustTime("h", "down")} className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-black"><ChevronDown size={24}/></button>
                      </div>

                      <div className="text-4xl font-bold text-gray-300 mb-2">:</div>

                      <div className="flex flex-col items-center">
                        <button onClick={() => adjustTime("m", "up")} className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-black"><ChevronUp size={24}/></button>
                        <input 
                          type="text"
                          value={minute}
                          onChange={(e) => handleManualEntry("m", e.target.value)}
                          onBlur={handleTimeBlur}
                          className="w-20 text-6xl font-black font-mono tracking-tighter text-center bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-200"
                          placeholder="00"
                          maxLength={2}
                        />
                        <button onClick={() => adjustTime("m", "down")} className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-black"><ChevronDown size={24}/></button>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {["AM", "PM"].map((p) => (
                          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-black tracking-widest transition-all ${period === p ? "bg-black text-white shadow-md" : "text-gray-300 hover:text-black"}`}>{p}</button>
                        ))}
                      </div>
                    </div>

                    <div className="hidden sm:block h-24 w-[1px] bg-gray-200" />

                    {/* ANALOG CLOCK */}
                    <div className="relative w-36 h-36 rounded-full border-[4px] border-black bg-white shadow-inner flex items-center justify-center">
                      <div className="absolute inset-2">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-200 rounded-full" />
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-200 rounded-full" />
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-3 bg-gray-200 rounded-full" />
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1 w-3 bg-gray-200 rounded-full" />
                      </div>

                      <div 
                        className="absolute w-1 h-[50px] bg-gray-300 rounded-full left-1/2 top-1/2 origin-bottom transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                        style={{ transform: `translateX(-50%) translateY(-100%) rotate(${minRotation}deg)` }}
                      />

                      <div 
                        className="absolute w-1.5 h-[35px] bg-black rounded-full left-1/2 top-1/2 origin-bottom z-10 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                        style={{ transform: `translateX(-50%) translateY(-100%) rotate(${hourRotation}deg)` }}
                      />
                      
                      <div className="absolute w-3.5 h-3.5 bg-black rounded-full border-2 border-white z-20" />
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-8 uppercase tracking-[0.2em] font-bold">Target Execution: {hour || "09"}:{minute || "00"} {period} EST</p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}