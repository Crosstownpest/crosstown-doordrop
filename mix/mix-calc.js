"use strict";

/**
 * GorillaDesk master lists for Crosstown Pest Control, one column each.
 * Mix rates are only on products whose label states them.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MixCalc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const UNITS = ["floz", "lb", "gal", "packs", "tubes", "blocks", "strips", "stations", "traps", "grams", "boards", "bellow", "seconds", "Brush", "Cans", "Ounces", "Tablet(s)", "Mechanical"];
  const METHODS = ["Backpack Sprayer", "Hand Sprayer", "Spreader", "Gel Bait Applicator", "Aerosol", "Rodent Station", "Inspection", "Brush/Sweep", "Power Duster", "Tuna fish Traps", "Trapper T-Rex", "MBS1 Station", "Pouch", "Mosquito Station"];
  const LOCATIONS = ["Exterior Foundation", "Interior Baseboards", "Interior of Garage", "Kitchen", "Bathroom(s)", "Shed/Shop", "Kitchen equipment - under", "Utility or Storage Closet", "Dumpster Area", "Wall Voids", "Cabinets", "Attic Space", "Crawl Space", "Warehouse", "Windows & Doors", "Bedrooms", "Wash Room", "Eaves/Soffit", "Localized Spots", "Yard/Flower Beds", "Fenceline", "Gazebo"];
  const PESTS = ["Spiders", "Ants", "Wasps, yellow jackets, hornets", "Mice", "Rats", "Voles", "Carpenter Ants", "Springtails", "Clover Mites", "Silverfish", "Box Elder Bugs", "Fleas", "Ticks", "Carpet Beetles", "Flies", "Drugstore Beetles", "Earwigs", "Seed Bugs/Stink Bugs", "Bed Bugs", "Birds", "Mosquito", "Cockroaches", "Carpenter Bees", "Termites", "Snails & Slugs"];
  const AREA_UNITS = ["Square ft", "Linear Feet", "Localized Spots"];
  const GALLONS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.25, 3.5].map(function (n) {
    const label = (n % 1 === 0 ? String(n) : String(n)) + " Gallons";
    return { n: n, label: n === 2 ? "2.0 Gallons" : label };
  });

  function mix(partial) {
    return Object.assign({ kind: "mix", unit: "floz", method: "Backpack Sprayer" }, partial);
  }
  function count(partial) {
    return Object.assign({ kind: "count", method: "Inspection" }, partial);
  }

  const PRODUCTS = [
    count({ id: "delta-dust", name: "Delta Dust", epa: "432-772", unit: "Ounces", method: "Power Duster", source: "Dust. Enter how many ounces you put out. No per-gallon mix." }),
    count({ id: "d-fense", name: "D-Fense", epa: "53883-283", unit: "Ounces", method: "Power Duster", source: "Dust. Enter how many ounces you put out. No per-gallon mix." }),
    count({ id: "niban", name: "Niban", epa: "64405-2", unit: "lb", method: "Spreader", source: "Granular bait. Enter the pounds you spread." }),
    mix({
      id: "bifen-it",
      name: "Bifen I/T",
      epa: "53883-118",
      source: "Bifen I/T label, EPA 53883-118. Outside spray is 0.33 to 1 fl oz per gallon. Perimeter use is 0.33 to 1.0 fl oz per 1,000 sq ft.",
      maxOzPer1000: 1,
      doses: [
        { oz: 0.33, percent: "0.02%", hint: "Low" },
        { oz: 0.5, percent: "", hint: "Chart" },
        { oz: 0.67, percent: "", hint: "Chart" },
        { oz: 0.75, percent: "", hint: "Chart" },
        { oz: 1, percent: "0.06%", hint: "High" },
      ],
    }),
    mix({
      id: "taurus-sc",
      name: "Taurus SC",
      epa: "53883-279",
      source: "Taurus SC label, EPA 53883-279. Perimeter spray is 0.4 fl oz per gallon (0.03%) or 0.8 fl oz per gallon (0.06%). Foundation band is 2 quarts of finished spray per 160 linear feet. This is not a trench rate.",
      foundationQuartsPer160: 2,
      doses: [
        { oz: 0.4, percent: "0.03%", hint: "0.03%" },
        { oz: 0.8, percent: "0.06%", hint: "0.06%" },
      ],
    }),
    count({ id: "final-blox", name: "Final Blox", epa: "12455-89", unit: "blocks", method: "Rodent Station", source: "Bait block. Enter how many blocks you placed." }),
    count({ id: "maxforce-fleet", name: "Maxforce Fleet Ant Gel", epa: "432-1264", unit: "grams", method: "Gel Bait Applicator", source: "Ant gel. Enter the grams you applied." }),
    mix({
      id: "alpine-wsg",
      name: "Alpine WSG",
      epa: "499-561",
      unit: "grams",
      source: "Alpine WSG label, EPA 499-561. 10 g, 20 g, or 30 g makes 1 gallon, to treat up to 1,000 sq ft.",
      maxPer1000EqualsDose: true,
      doses: [
        { oz: 10, percent: "0.1%", hint: "Ants" },
        { oz: 20, percent: "0.2%", hint: "Flies" },
        { oz: 30, percent: "0.3%", hint: "Roaches" },
      ],
    }),
    mix({
      id: "cyzmic-cs",
      name: "Cyzmic CS",
      epa: "53883-389",
      source: "Cyzmic CS label, EPA 53883-389. 0.2 to 0.4 fl oz per gallon, and 0.8 fl oz per gallon for severe infestations.",
      doses: [
        { oz: 0.2, percent: "0.015%", hint: "Low" },
        { oz: 0.4, percent: "0.03%", hint: "Normal" },
        { oz: 0.8, percent: "0.06%", hint: "Severe" },
      ],
    }),
    count({ id: "nectus", name: "Nectus Soft Bait", epa: "82744-2-56", unit: "blocks", method: "Rodent Station", source: "Soft bait. Enter how many blocks you placed." }),
    count({ id: "bifen-lp", name: "Bifenthrin L/P Granular", epa: "53883-124", unit: "lb", method: "Spreader", source: "Granule. Enter the pounds you spread. Label steps for this jug are not on this page." }),
    count({ id: "essentria", name: "Essentria IC PRO", epa: "FIFRA 25(b)", unit: "floz", method: "Backpack Sprayer", source: "25(b) product. Enter the ounces you used. Per-gallon steps are not saved here." }),
    mix({
      id: "onslaught",
      name: "Onslaught Fastcap",
      epa: "1021-2574",
      source: "Onslaught FastCap label, EPA 1021-2574. 0.5 fl oz per gallon for light or maintenance, 1.0 fl oz per gallon for a heavy infestation.",
      doses: [
        { oz: 0.5, percent: "", hint: "Light" },
        { oz: 1, percent: "", hint: "Heavy" },
      ],
    }),
    count({ id: "glue-board", name: "Monitoring Glue Board", epa: "", unit: "boards", method: "Inspection", source: "Enter how many boards you placed." }),
    count({ id: "sweeping", name: "Sweeping for nests or webs", epa: "", unit: "bellow", method: "Brush/Sweep", source: "No mix. Method is Brush/Sweep." }),
    count({ id: "pt-alpine", name: "PT Alpine Fly Bait", epa: "499-568", unit: "Ounces", method: "Pouch", source: "Fly bait. Enter the ounces you placed." }),
    mix({
      id: "crossfire",
      name: "Crossfire Bed Bug",
      epa: "1021-2776",
      source: "Crossfire label, EPA 1021-2776. 13 fl oz per finished gallon, applied at 1 gallon per 1,000 sq ft.",
      maxOzPer1000: 13,
      doses: [{ oz: 13, percent: "1.42%", hint: "Only rate" }],
    }),
    count({ id: "electronic-trap", name: "Electronic Rodent Trap", epa: "", unit: "traps", method: "Inspection", source: "Enter how many traps you placed." }),
    count({ id: "cb-80", name: "CB-80 Aerosol", epa: "279-3393", unit: "seconds", method: "Aerosol", source: "Enter how many seconds you sprayed." }),
    count({ id: "maxforce-magnum", name: "Maxforce FC Magnum", epa: "432-1460", unit: "grams", method: "Gel Bait Applicator", source: "Roach gel. Enter the grams you applied." }),
    count({ id: "min-rex", name: "Trapper Min-Rex", epa: "", unit: "traps", method: "Trapper T-Rex", source: "Enter how many traps you placed." }),
    count({ id: "dunks", name: "Mosquito Dunks", epa: "", unit: "Tablet(s)", method: "Mosquito Station", source: "Enter how many tablets you placed." }),
    count({ id: "avesta", name: "Avesta CS", epa: "74530-53-5481", unit: "floz", method: "Backpack Sprayer", source: "Enter the ounces you used. Per-gallon steps for this jug are not saved here." }),
    count({ id: "resolv", name: "Resolv Soft Bait", epa: "7173-297", unit: "blocks", method: "Rodent Station", source: "Enter how many blocks you placed." }),
    count({ id: "yj-trap", name: "Yellow Jacket/Wasp Trap", epa: "EPA exempt", unit: "traps", method: "Inspection", source: "Enter how many traps you placed." }),
    count({ id: "natular", name: "Natular DT", epa: "8329-602", unit: "Tablet(s)", method: "Mosquito Station", source: "Enter how many tablets you placed." }),
    mix({
      id: "lambdastar",
      name: "LambdaStar UltraCap",
      epa: "71532-33-91026",
      source: "LambdaStar UltraCap 9.7% label, EPA 71532-33-91026. 0.2 to 0.4 fl oz per gallon, and 0.8 fl oz per gallon for a heavy infestation.",
      doses: [
        { oz: 0.2, percent: "0.015%", hint: "Low" },
        { oz: 0.4, percent: "0.03%", hint: "Normal" },
        { oz: 0.8, percent: "0.06%", hint: "Severe" },
      ],
    }),
    count({ id: "gentrol", name: "Gentrol Point Source", epa: "2724-469", unit: "stations", method: "Inspection", source: "Enter how many stations you placed." }),
  ];

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function formatOz(n) {
    if (!Number.isFinite(n)) return "";
    return round2(n).toFixed(2);
  }

  function formatAmount(n, unit) {
    if (!Number.isFinite(n)) return "";
    const whole = ["grams", "blocks", "strips", "stations", "traps", "boards", "bellow", "seconds", "Cans", "Tablet(s)", "packs", "tubes", "lb"];
    if (whole.indexOf(unit) !== -1 && Math.abs(n - Math.round(n)) < 0.001) return String(Math.round(n));
    return formatOz(n);
  }

  function gallonLabel(n) {
    const found = GALLONS.find(function (row) { return Math.abs(row.n - n) < 0.001; });
    return found ? found.label : formatOz(n) + " Gallons";
  }

  function findDose(product, ozPerGallon) {
    return (product.doses || []).find(function (dose) { return Math.abs(dose.oz - ozPerGallon) < 0.001; }) || null;
  }

  function foundationMaxGallons(product, linearFeet) {
    if (!product.foundationQuartsPer160 || !(linearFeet > 0)) return null;
    return (linearFeet / 160) * (product.foundationQuartsPer160 / 4);
  }

  function calculate(input) {
    const product = input.product;
    if (!product) return { status: "need-input", totalOz: null, per1000: null, dose: null };

    if (product.kind === "count") {
      const count = Number(input.count);
      if (!(count > 0)) return { status: "need-input", totalOz: null, per1000: null, dose: null, dilution: "", percent: "" };
      return { status: "ok", reason: "", dose: null, totalOz: count, per1000: null, maxGallons: null, dilution: "", percent: "" };
    }

    const gallons = Number(input.gallons);
    const ozPerGallon = Number(input.ozPerGallon);
    const sqft = Number(input.sqft);
    const linearFeet = Number(input.linearFeet);
    const pests = Array.isArray(input.pests) ? input.pests : [];
    const hasGallons = Number.isFinite(gallons) && gallons > 0;
    const hasDose = Number.isFinite(ozPerGallon) && ozPerGallon > 0;
    if (!hasGallons || !hasDose) return { status: "need-input", totalOz: null, per1000: null, dose: null };

    const dose = findDose(product, ozPerGallon);
    const totalOz = gallons * ozPerGallon;
    const per1000 = sqft > 0 ? totalOz / (sqft / 1000) : null;
    const useFoundation = input.useFoundationLimit && product.foundationQuartsPer160;
    const maxGallons = useFoundation ? foundationMaxGallons(product, linearFeet) : null;
    const ceiling = product.maxPer1000EqualsDose && dose ? dose.oz : product.maxOzPer1000;
    const blocked = dose && (dose.blockedPests || []).some(function (pest) { return pests.indexOf(pest) !== -1; });
    const doseWord = product.unit === "grams" ? " g per gallon" : " fl oz per gallon";

    let status = "ok";
    let reason = "";
    if (!dose) {
      status = "bad-dose";
      reason = "That amount per gallon is not one of the label rates saved for this product.";
    } else if (blocked) {
      status = "over";
      reason = "That per-gallon rate is not allowed for the pest you picked.";
    } else if (per1000 != null && ceiling != null && per1000 - ceiling > 0.005) {
      status = "over";
      reason = "This is " + formatAmount(per1000, product.unit) + " " + product.unit + " per 1,000 sq ft. The label max saved here is " + formatAmount(ceiling, product.unit) + ".";
    } else if (maxGallons != null && gallons - maxGallons > 0.01) {
      status = "over";
      reason = linearFeet + " feet of foundation band allows " + formatOz(maxGallons) + " gallons of finished spray (2 quarts per 160 feet). You picked " + gallonLabel(gallons) + ".";
    } else if (ceiling != null && !(sqft > 0)) {
      status = "need-area";
      reason = "Pick Square ft and enter the area you wet. That is how the per-1,000 sq ft limit gets checked.";
    } else if (useFoundation && !(linearFeet > 0)) {
      status = "need-area";
      reason = "Pick Linear Feet and enter the foundation you sprayed. That is the 2 quarts per 160 feet check.";
    }

    return {
      status: status,
      reason: reason,
      dose: dose,
      totalOz: totalOz,
      per1000: per1000,
      maxGallons: maxGallons,
      dilution: dose ? formatAmount(dose.oz, product.unit) + doseWord : "",
      percent: dose ? dose.percent : "",
    };
  }

  function sameAmountStreak(history, entry, count) {
    const need = count || 4;
    const recent = (history || []).filter(function (row) {
      return row.tech === entry.tech && row.productId === entry.productId;
    }).slice(0, need);
    if (recent.length < need || !Number.isFinite(entry.totalOz)) return false;
    return recent.every(function (row) { return Math.abs(row.totalOz - entry.totalOz) < 0.051; });
  }

  function findProduct(name) {
    const needle = String(name || "").trim().toLowerCase();
    if (!needle) return null;
    return PRODUCTS.find(function (product) {
      return product.id === needle || product.name.toLowerCase() === needle;
    }) || PRODUCTS.find(function (product) {
      return needle.length >= 4 && product.name.toLowerCase().indexOf(needle) !== -1;
    }) || null;
  }

  function findProductInLine(line) {
    const lower = String(line || "").toLowerCase();
    const ranked = PRODUCTS.slice().sort(function (a, b) { return b.name.length - a.name.length; });
    for (let i = 0; i < ranked.length; i++) {
      const at = lower.indexOf(ranked[i].name.toLowerCase());
      if (at !== -1) return { product: ranked[i], index: at };
    }
    return null;
  }

  function parseUsage(text) {
    const entries = [];
    const skipped = [];
    String(text || "").split(/\r?\n/).forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      if (/^tech\b/i.test(line) && /material/i.test(line)) return;
      const found = findProductInLine(line);
      if (!found) {
        skipped.push(line);
        return;
      }
      const tech = line.slice(0, found.index).replace(/[,|\t]+/g, " ").replace(/\s+/g, " ").trim();
      const rest = line.slice(found.index + found.product.name.length);
      if (!tech) {
        skipped.push(line);
        return;
      }
      const stopsMatch = rest.match(/(\d+)\s*(stops|stop|jobs|job|times)\b/i);
      const galMatch = rest.match(/(\d*\.?\d+)\s*(gallons|gallon|gals|gal)\b/i);
      const doseMatch = rest.match(/(\d*\.?\d+)\s*(?:fl\.?\s*oz|oz|g|grams)?\s*(?:per|\/)\s*(?:gal|gallon)\b/i);
      const sqMatch = rest.match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|square\s*feet|sqft)\b/i);
      const lfMatch = rest.match(/(\d+(?:\.\d+)?)\s*(?:linear\s*feet|lin\.?\s*ft)\b/i);
      let restNumbers = rest;
      [stopsMatch, galMatch, doseMatch, sqMatch, lfMatch].forEach(function (match) {
        if (match) restNumbers = restNumbers.replace(match[0], " ");
      });
      const totalMatch = restNumbers.match(/(\d*\.?\d+)/);
      const totalOz = totalMatch ? Number(totalMatch[1]) : NaN;
      if (!(totalOz > 0)) {
        skipped.push(line);
        return;
      }
      entries.push({
        tech: tech,
        productId: found.product.id,
        totalOz: totalOz,
        gallons: galMatch ? Number(galMatch[1]) : null,
        ozPerGallon: doseMatch ? Number(doseMatch[1]) : null,
        sqft: sqMatch ? Number(sqMatch[1]) : null,
        linearFeet: lfMatch ? Number(lfMatch[1]) : null,
        stops: stopsMatch ? Number(stopsMatch[1]) : 1,
      });
    });
    return { entries: entries, skipped: skipped };
  }

  function speakNumber(n) {
    if (!Number.isFinite(n)) return "";
    const rounded = round2(n);
    if (Math.abs(rounded - Math.round(rounded)) < 0.001) return String(Math.round(rounded));
    return String(rounded);
  }

  function sayAmount(n, product) {
    return formatAmount(n, product.unit) + " " + product.unit;
  }

  function closeAmount(a, b) {
    return Math.abs(a - b) < 0.051;
  }

  function labelDoseForTotal(product, gallons, total) {
    return (product.doses || []).find(function (dose) {
      return Math.abs(gallons * dose.oz - total) < 0.051;
    }) || null;
  }

  function closestDose(product, rate) {
    let best = null;
    (product.doses || []).forEach(function (dose) {
      const dist = Math.abs(dose.oz - rate);
      if (!best || dist < best.dist) best = { dose: dose, dist: dist };
    });
    return best ? best.dose : null;
  }

  function doseList(product) {
    return (product.doses || []).map(function (dose) {
      return formatAmount(dose.oz, product.unit);
    }).join(", ");
  }

  function coachGroup(tech, product, rows) {
    const stops = rows.reduce(function (sum, row) { return sum + (row.stops || 1); }, 0);
    const firstTotal = rows[0].totalOz;
    const same = rows.every(function (row) { return closeAmount(row.totalOz, firstTotal); });
    const repeated = same && stops >= 4;
    const mathProblems = [];
    const overProblems = [];
    const gallonLabels = [];

    rows.forEach(function (row) {
      const gallons = Number(row.gallons);
      const hasGallons = Number.isFinite(gallons) && gallons > 0;
      if (hasGallons) gallonLabels.push(speakNumber(gallons));
      if (product.kind !== "mix" || !hasGallons) return;
      const given = Number(row.ozPerGallon);
      const hasDose = Number.isFinite(given) && given > 0;
      const sqft = Number(row.sqft) || 0;
      const linearFeet = Number(row.linearFeet) || 0;
      if (hasDose) {
        const right = gallons * given;
        if (Math.abs(right - row.totalOz) > 0.051) {
          mathProblems.push({ gallons: gallons, dose: given, wrote: row.totalOz, right: right, stops: row.stops || 1 });
          return;
        }
        const checked = calculate({
          product: product,
          gallons: gallons,
          ozPerGallon: given,
          sqft: sqft,
          linearFeet: linearFeet,
          pests: row.pests || [],
          useFoundationLimit: !!row.useFoundationLimit,
        });
        if (checked.status === "bad-dose" || checked.status === "over") {
          overProblems.push({ calc: checked, gallons: gallons, dose: given, wrote: row.totalOz });
        }
        return;
      }
      const matched = labelDoseForTotal(product, gallons, row.totalOz);
      if (!matched) {
        const near = closestDose(product, row.totalOz / gallons);
        mathProblems.push({
          gallons: gallons,
          dose: near ? near.oz : null,
          wrote: row.totalOz,
          right: near ? gallons * near.oz : null,
          stops: row.stops || 1,
          inferred: true,
        });
        return;
      }
      if (sqft > 0 || (row.useFoundationLimit && linearFeet > 0)) {
        const checked = calculate({
          product: product,
          gallons: gallons,
          ozPerGallon: matched.oz,
          sqft: sqft,
          linearFeet: linearFeet,
          pests: row.pests || [],
          useFoundationLimit: !!row.useFoundationLimit,
        });
        if (checked.status === "over") overProblems.push({ calc: checked, gallons: gallons, dose: matched.oz, wrote: row.totalOz });
      }
    });

    if (!mathProblems.length && !overProblems.length && !repeated) return null;

    const distinctGallons = gallonLabels.filter(function (label, index) { return gallonLabels.indexOf(label) === index; });
    const wrote = sayAmount(firstTotal, product);
    const sentences = [];
    sentences.push(tech + ", you wrote " + wrote + " of " + product.name + " on " + stops + (stops === 1 ? " stop" : " stops") + ".");

    let kind = "repeat";
    if (overProblems.length) {
      kind = "over";
      sentences.push(overProblems[0].calc.reason);
      sentences.push("Before you save the next one, change the gallons or the dose so the rate stays inside that label line.");
    } else if (mathProblems.length) {
      kind = "math";
      const problem = mathProblems[0];
      if (problem.inferred) {
        sentences.push(speakNumber(problem.gallons) + " gallons with " + sayAmount(problem.wrote, product) + " written down is " + speakNumber(problem.wrote / problem.gallons) + " per gallon.");
        sentences.push("That is not a " + product.name + " rate on this list. The saved rates are " + doseList(product) + ".");
        if (problem.right != null) {
          sentences.push("The closest one makes " + sayAmount(problem.right, product) + " in " + speakNumber(problem.gallons) + " gallons. Write that if it is what you poured, or write the rate you actually poured.");
        }
      } else {
        sentences.push(speakNumber(problem.gallons) + " gallons at " + formatAmount(problem.dose, product.unit) + " per gallon is " + sayAmount(problem.right, product) + ".");
        sentences.push("You wrote " + sayAmount(problem.wrote, product) + ". Next time, put " + sayAmount(problem.right, product) + " in Total Concen.");
      }
      if (repeated) sentences.push("The same total is also on " + stops + " stops. It has to change when the gallons change.");
    } else if (product.kind === "mix") {
      const low = product.doses[0];
      if (distinctGallons.length > 1) {
        sentences.push("The gallons on those stops were " + distinctGallons.join(" and ") + ", and Total Concen stayed " + wrote + ".");
      }
      sentences.push("Total Concen is the gallons times the dose. 1 gallon at " + formatAmount(low.oz, product.unit) + " per gallon is " + sayAmount(low.oz, product) + ". 2 gallons at that dose is " + sayAmount(low.oz * 2, product) + ".");
      sentences.push("If a house used different gallons, write the new number. If it really was the same gallons and the same dose, leave it, and fill in Finished Dilution so the gallons are on the job.");
    } else {
      sentences.push("If a house used a different number of " + product.unit + ", write that number. Leave " + wrote + " only when that is what you put out.");
    }

    const check = product.kind === "mix"
      ? "Next week, look at " + product.name + " again. Finished Dilution should be filled in, and Total Concen should move when the gallons move."
      : "Next week, look at " + product.name + " again. The count should change when the stop used a different number.";

    const headline = kind === "over"
      ? "Over the label rate saved here"
      : (kind === "math" ? "Total Concen does not match the gallons" : "Same " + wrote + " on " + stops + " stops");

    const detailParts = [stops + (stops === 1 ? " stop" : " stops") + " at " + wrote];
    if (distinctGallons.length) detailParts.push("gallons " + distinctGallons.join(", "));
    const dosesSeen = rows.map(function (row) { return Number(row.ozPerGallon); }).filter(function (n) { return n > 0; });
    if (dosesSeen.length) detailParts.push("dose " + dosesSeen.map(speakNumber).filter(function (label, index, list) { return list.indexOf(label) === index; }).join(", "));

    return {
      tech: tech,
      productId: product.id,
      productName: product.name,
      kind: kind,
      headline: headline,
      detail: detailParts.join(". ") + ".",
      say: sentences.join(" "),
      check: check,
    };
  }

  function coachWeek(entries) {
    const groups = {};
    (entries || []).forEach(function (entry) {
      const product = findProduct(entry.productId) || findProduct(entry.productName);
      const tech = String(entry.tech || "").trim();
      const totalOz = Number(entry.totalOz);
      if (!product || !tech || !(totalOz > 0)) return;
      const key = tech.toLowerCase() + "\n" + product.id;
      if (!groups[key]) groups[key] = { tech: tech, product: product, rows: [] };
      groups[key].rows.push({
        totalOz: totalOz,
        gallons: entry.gallons,
        ozPerGallon: entry.ozPerGallon,
        sqft: entry.sqft,
        linearFeet: entry.linearFeet,
        stops: entry.stops || 1,
        pests: entry.pests || [],
        useFoundationLimit: !!entry.useFoundationLimit,
      });
    });

    const byTech = {};
    Object.keys(groups).forEach(function (key) {
      const group = groups[key];
      const note = coachGroup(group.tech, group.product, group.rows);
      if (!byTech[group.tech]) byTech[group.tech] = { tech: group.tech, notes: [], clean: true };
      if (note) {
        byTech[group.tech].notes.push(note);
        byTech[group.tech].clean = false;
      }
    });

    const rank = { over: 0, math: 1, repeat: 2 };
    const techs = Object.keys(byTech).map(function (name) { return byTech[name]; });
    techs.sort(function (a, b) { return a.tech.localeCompare(b.tech); });
    techs.forEach(function (bucket) {
      bucket.notes.sort(function (a, b) { return rank[a.kind] - rank[b.kind]; });
    });

    return {
      empty: techs.length === 0,
      flagged: techs.filter(function (bucket) { return bucket.notes.length > 0; }),
      clear: techs.filter(function (bucket) { return bucket.notes.length === 0; }).map(function (bucket) { return bucket.tech; }),
    };
  }

  function coachingScript(report) {
    if (!report || report.empty) return "No stops entered yet.";
    if (!report.flagged.length) return "Nothing to coach this week. The lines entered match the label math saved here.";
    return report.flagged.map(function (bucket) {
      return bucket.notes.map(function (note) {
        return note.tech + " — " + note.productName + "\n" + note.say + "\n" + note.check;
      }).join("\n\n");
    }).join("\n\n");
  }

  function buildSlip(fields) {
    const product = fields.product;
    const result = fields.result;
    const lines = [
      "GorillaDesk Add Material",
      "Tech: " + fields.tech,
      "When: " + fields.when,
      "Material: " + product.name,
    ];
    if (product.epa) lines.push("EPA: " + product.epa);
    lines.push("Total Concen: " + formatAmount(result.totalOz, product.unit));
    lines.push("Unit: " + product.unit);
    if (result.dilution) lines.push("In each gallon: " + result.dilution + (result.percent ? " (" + result.percent + ")" : ""));
    if (product.kind === "mix") lines.push("Finished Dilution (Gallons): " + (fields.gallonLabel || gallonLabel(fields.gallons)));
    if (fields.method) lines.push("Method: " + fields.method);
    if (fields.site) lines.push("Locations: " + fields.site);
    if (fields.pests && fields.pests.length) lines.push("Target Pest(s): " + fields.pests.join(", "));
    if (fields.areaUnit === "Square ft" && fields.sqft > 0) {
      lines.push("Area/Quantity: " + Math.round(fields.sqft));
      lines.push("Area unit: Square ft");
      if (result.per1000 != null) lines.push("Rate: " + formatAmount(result.per1000, product.unit) + " " + product.unit + " per 1,000 sq ft");
    } else if (fields.areaUnit === "Linear Feet" && fields.linearFeet > 0) {
      lines.push("Area/Quantity: " + Math.round(fields.linearFeet));
      lines.push("Area unit: Linear Feet");
    } else if (fields.areaUnit) {
      lines.push("Area/Quantity: " + fields.areaUnit);
    }
    lines.push("Every line is a choice on the Crosstown master list.");
    lines.push("Still put wind, temperature, and start/stop time on the job the same day.");
    return lines.join("\n");
  }

  return {
    UNITS: UNITS,
    METHODS: METHODS,
    LOCATIONS: LOCATIONS,
    PESTS: PESTS,
    AREA_UNITS: AREA_UNITS,
    GALLONS: GALLONS,
    PRODUCTS: PRODUCTS,
    round2: round2,
    formatOz: formatOz,
    formatAmount: formatAmount,
    gallonLabel: gallonLabel,
    findDose: findDose,
    calculate: calculate,
    sameAmountStreak: sameAmountStreak,
    findProduct: findProduct,
    parseUsage: parseUsage,
    coachWeek: coachWeek,
    coachingScript: coachingScript,
    buildSlip: buildSlip,
    foundationMaxGallons: foundationMaxGallons,
  };
});
