"use strict";

/**
 * Turns "gallons I sprayed" and "ounces I put in each gallon"
 * into the concentrate total GorillaDesk Quantity should hold,
 * and checks that total against the label limits stored on the product.
 *
 * Rates below are the labeled mix steps and ceilings read from the
 * product labels cited on each product. They are not a substitute
 * for the jug in the truck.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MixCalc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const PRODUCTS = [
    {
      id: "demand-cs",
      name: "Demand CS",
      epa: "100-1066",
      source: "Demand CS label, EPA 100-1066, structural pest table (0.2, 0.4, or 0.8 fl oz per gallon of water).",
      doses: [
        { oz: 0.2, percent: "0.015%", hint: "Maintenance" },
        { oz: 0.4, percent: "0.03%", hint: "Heavier" },
        { oz: 0.8, percent: "0.06%", hint: "Severe" },
      ],
    },
    {
      id: "talstar-p",
      name: "Talstar P",
      epa: "279-3206",
      source: "Talstar P Professional label, EPA 279-3206. Mix 0.33 or 1 fl oz per gallon. Do not apply more than 1 fl oz per 1,000 sq ft.",
      maxOzPer1000: 1,
      doses: [
        { oz: 0.33, percent: "0.02%", hint: "Low rate" },
        { oz: 1, percent: "0.06%", hint: "High rate" },
      ],
    },
    {
      id: "temprid-fx",
      name: "Temprid FX",
      epa: "432-1544",
      source: "Temprid FX label, EPA 432-1544. 0.27 fl oz (8 mL) or 0.54 fl oz (16 mL) per gallon. Outdoor rate up to 0.54 fl oz per 1,000 sq ft. Bed bugs stay at 0.27.",
      maxOzPer1000: 0.54,
      doses: [
        { oz: 0.27, percent: "0.075%", hint: "Normal, and bed bugs" },
        { oz: 0.54, percent: "0.15%", hint: "Severe. Not bed bugs.", blockedPests: ["bed bugs"] },
      ],
    },
    {
      id: "suspend-polyzone",
      name: "Suspend PolyZone",
      epa: "101563-143",
      source: "Suspend PolyZone label. 0.25, 0.75, or 1.5 fl oz per gallon, applied so the product stays at 0.25 to 1.5 fl oz per 1,000 sq ft.",
      maxOzPer1000: 1.5,
      doses: [
        { oz: 0.25, percent: "0.01%", hint: "Maintenance" },
        { oz: 0.75, percent: "0.03%", hint: "Clean-out" },
        { oz: 1.5, percent: "0.06%", hint: "Severe" },
      ],
    },
    {
      id: "termidor-sc",
      name: "Termidor SC",
      epa: "7969-210",
      source: "Termidor SC label, EPA 7969-210. 0.4 fl oz per gallon is 0.03%. 0.8 fl oz per gallon is 0.06%. Foundation band: 2 quarts of finished spray per 160 linear feet. This check is the spray tank, not a trench treatment.",
      foundationQuartsPer160: 2,
      doses: [
        { oz: 0.4, percent: "0.03%", hint: "General pest" },
        { oz: 0.8, percent: "0.06%", hint: "0.06% mix" },
      ],
    },
  ];

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function formatOz(n) {
    if (!Number.isFinite(n)) return "";
    return round2(n).toFixed(2);
  }

  function findDose(product, ozPerGallon) {
    return product.doses.find((dose) => Math.abs(dose.oz - ozPerGallon) < 0.001) || null;
  }

  function foundationMaxGallons(product, linearFeet) {
    if (!product.foundationQuartsPer160 || !(linearFeet > 0)) return null;
    return (linearFeet / 160) * (product.foundationQuartsPer160 / 4);
  }

  function calculate(input) {
    const product = input.product;
    const gallons = Number(input.gallons);
    const ozPerGallon = Number(input.ozPerGallon);
    const sqft = Number(input.sqft);
    const linearFeet = Number(input.linearFeet);
    const pests = Array.isArray(input.pests) ? input.pests : [];
    const hasGallons = Number.isFinite(gallons) && gallons > 0;
    const hasDose = Number.isFinite(ozPerGallon) && ozPerGallon > 0;

    if (!product || !hasGallons || !hasDose) {
      return { status: "need-input", totalOz: null, per1000: null, dose: null };
    }

    const dose = findDose(product, ozPerGallon);
    const totalOz = gallons * ozPerGallon;
    const per1000 = sqft > 0 ? totalOz / (sqft / 1000) : null;
    const maxGallons = foundationMaxGallons(product, linearFeet);
    const blocked = dose && (dose.blockedPests || []).some((pest) => pests.includes(pest));

    let status = "ok";
    let reason = "";

    if (!dose) {
      status = "bad-dose";
      reason = "That ounces-per-gallon is not one of the label rates saved for this product.";
    } else if (blocked) {
      status = "over";
      reason = "The label does not allow " + formatOz(dose.oz) + " fl oz per gallon on bed bugs. Use 0.27.";
    } else if (per1000 != null && product.maxOzPer1000 != null && per1000 - product.maxOzPer1000 > 0.005) {
      status = "over";
      reason =
        "This is " +
        formatOz(per1000) +
        " fl oz per 1,000 sq ft. The label max saved here is " +
        formatOz(product.maxOzPer1000) +
        " fl oz per 1,000 sq ft.";
    } else if (maxGallons != null && gallons - maxGallons > 0.01) {
      status = "over";
      reason =
        linearFeet +
        " feet of foundation band allows " +
        formatOz(maxGallons) +
        " gallons of finished spray (2 quarts per 160 feet). You entered " +
        formatOz(gallons) +
        " gallons.";
    } else if (product.maxOzPer1000 != null && !(sqft > 0)) {
      status = "need-area";
      reason = "Add the square feet you actually wet. That is how the per-1,000 sq ft limit gets checked.";
    } else if (product.foundationQuartsPer160 && !(linearFeet > 0)) {
      status = "need-area";
      reason = "Add the linear feet of foundation you sprayed. That is the Termidor band limit.";
    }

    return {
      status,
      reason,
      dose,
      totalOz,
      per1000,
      maxGallons,
      dilution: dose ? formatOz(dose.oz) + " fl oz per gallon" : "",
      percent: dose ? dose.percent : "",
    };
  }

  function sameAmountStreak(history, entry, count) {
    const need = count || 4;
    const recent = (history || [])
      .filter((row) => row.tech === entry.tech && row.productId === entry.productId)
      .slice(0, need);
    if (recent.length < need || !Number.isFinite(entry.totalOz)) return false;
    return recent.every((row) => Math.abs(row.totalOz - entry.totalOz) < 0.051);
  }

  function buildSlip(fields) {
    const lines = [
      "Crosstown material slip",
      "Tech: " + fields.tech,
      "When: " + fields.when,
      "Product: " + fields.product.name,
      "EPA: " + fields.product.epa,
      "TYPE INTO GORILLADESK QUANTITY: " + formatOz(fields.result.totalOz) + " fl oz",
      "Unit: fl oz",
      "Dilution: " + fields.result.dilution + " (" + fields.result.percent + ")",
      "Finished spray: " + formatOz(fields.gallons) + " gal",
    ];
    if (fields.sqft > 0) {
      lines.push("Treated area: " + Math.round(fields.sqft) + " sq ft");
      lines.push("Rate: " + formatOz(fields.result.per1000) + " fl oz per 1,000 sq ft");
    }
    if (fields.linearFeet > 0) lines.push("Foundation: " + Math.round(fields.linearFeet) + " linear ft");
    if (fields.site) lines.push("Where: " + fields.site);
    if (fields.pests && fields.pests.length) lines.push("Pests: " + fields.pests.join(", "));
    lines.push("Quantity is the product from the jug, not the gallons of water.");
    lines.push("Still put wind, temperature, and start/stop time on the GorillaDesk job the same day.");
    return lines.join("\n");
  }

  return {
    PRODUCTS,
    round2,
    formatOz,
    findDose,
    calculate,
    sameAmountStreak,
    buildSlip,
    foundationMaxGallons,
  };
});
