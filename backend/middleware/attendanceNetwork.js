
const net = require("net");

// =====================================================
// NORMALIZE IP ADDRESS
// =====================================================
const normalizeIP = (ip) => {
  if (!ip) return "";

  let value = String(ip).trim().split("%")[0];

  if (value.toLowerCase().startsWith("::ffff:")) {
    value = value.substring(7);
  }

  return value;
};

// =====================================================
// CHECK WHETHER AN IP IS ALLOWED
// Supports IPv4 address and IPv4 CIDR range
// =====================================================
const isIPAllowed = (requestIP, rule) => {
  const ip = normalizeIP(requestIP);
  const allowed = String(rule || "").trim();

  if (net.isIP(ip) !== 4 || !allowed) {
    return false;
  }

  const [network, prefixText] = allowed.split("/");

  if (net.isIP(network) !== 4) {
    return false;
  }

  // Exact IPv4 match
  if (prefixText === undefined) {
    return ip === network;
  }

  // Validate CIDR prefix
  const prefix = Number(prefixText);

  if (
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32
  ) {
    return false;
  }

  const toNumber = (address) =>
    address.split(".").reduce(
      (total, octet) => total * 256 + Number(octet),
      0
    );

  const mask =
    prefix === 0
      ? 0
      : (0xffffffff << (32 - prefix)) >>> 0;

  return (
    (toNumber(ip) & mask) ===
    (toNumber(network) & mask)
  );
};

// =====================================================
// ATTENDANCE NETWORK MIDDLEWARE
// =====================================================
module.exports = function attendanceNetwork(req, res, next) {
  const isProduction =
    String(process.env.NODE_ENV || "").toLowerCase() ===
    "production";

  const requestIP = normalizeIP(
    req.ip || req.socket?.remoteAddress || ""
  );

  // ---------------------------------------------------
  // LOCAL DEVELOPMENT ONLY
  // Allow loopback connections on the same computer.
  // Never allow this bypass in production.
  // ---------------------------------------------------
  const isLoopback = [
    "127.0.0.1",
    "::1",
  ].includes(requestIP);

  if (
    !isProduction &&
    process.env.ATTENDANCE_ALLOW_LOCAL === "true" &&
    isLoopback
  ) {
    return next();
  }

  // ---------------------------------------------------
  // REQUIRE NETWORK RESTRICTION
  // ---------------------------------------------------
  if (
    String(process.env.ATTENDANCE_IP_RESTRICTION || "")
      .toLowerCase() !== "true"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Attendance network restriction is not enabled.",
    });
  }

  // ---------------------------------------------------
  // READ ALLOWED INSTITUTE PUBLIC IP ADDRESSES
  // Supports comma-separated IPs and CIDR ranges.
  // ---------------------------------------------------
  const allowedIPs = (
    process.env.ATTENDANCE_ALLOWED_IPS || ""
  )
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (!allowedIPs.length) {
    console.error(
      "ATTENDANCE_ALLOWED_IPS is not configured."
    );

    return res.status(403).json({
      success: false,
      message:
        "Attendance network is not configured.",
    });
  }

  // ---------------------------------------------------
  // VERIFY REQUEST IP
  // ---------------------------------------------------
  const allowed = allowedIPs.some((rule) =>
    isIPAllowed(requestIP, rule)
  );

  if (!allowed) {
    console.warn(
      "Attendance request blocked. Client IP:",
      requestIP
    );

    return res.status(403).json({
      success: false,
      message:
        "Attendance is only available on the institute network.",
    });
  }

  return next();
};
