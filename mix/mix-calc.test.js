"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calc = require("./mix-calc.js");

const byId = Object.fromEntries(calc.PRODUCTS.map((product) => [product.id, product]));

test("the master list keeps each GorillaDesk column separate", () => {
  assert.equal(calc.PRODUCTS.length, 28);
  assert.ok(calc.METHODS.includes("Backpack Sprayer"));
  assert.ok(calc.LOCATIONS.includes("Exterior Foundation"));
  assert.ok(calc.PESTS.includes("Carpenter Ants"));
  assert.deepEqual(calc.AREA_UNITS, ["Square ft", "Linear Feet", "Localized Spots"]);
  assert.equal(calc.gallonLabel(1.5), "1.5 Gallons");
  assert.equal(calc.gallonLabel(2), "2.0 Gallons");
  assert.ok(calc.UNITS.includes("floz"));
  assert.ok(calc.UNITS.includes("blocks"));
});

test("1.5 gallons at 0.40 oz per gallon is 0.60 oz of concentrate", () => {
  const result = calc.calculate({
    product: byId["cyzmic-cs"],
    gallons: 1.5,
    ozPerGallon: 0.4,
    sqft: 1500,
    pests: ["Ants"],
  });
  assert.equal(result.status, "ok");
  assert.equal(calc.formatOz(result.totalOz), "0.60");
  assert.equal(result.dilution, "0.40 fl oz per gallon");
});

test("Bifen I/T at 1 fl oz per gallon on 1,000 sq ft is the label ceiling", () => {
  const ok = calc.calculate({ product: byId["bifen-it"], gallons: 1, ozPerGallon: 1, sqft: 1000 });
  assert.equal(ok.status, "ok");
  assert.equal(calc.formatOz(ok.totalOz), "1.00");
  const over = calc.calculate({ product: byId["bifen-it"], gallons: 1.5, ozPerGallon: 1, sqft: 1000 });
  assert.equal(over.status, "over");
  assert.match(over.reason, /1\.50 floz per 1,000/);
});

test("Bifen without square feet does not get a clean pass", () => {
  const result = calc.calculate({ product: byId["bifen-it"], gallons: 1, ozPerGallon: 0.33 });
  assert.equal(result.status, "need-area");
});

test("a dose that is not on the label is rejected", () => {
  const result = calc.calculate({ product: byId["cyzmic-cs"], gallons: 1, ozPerGallon: 0.5 });
  assert.equal(result.status, "bad-dose");
});

test("a blocked pest and dose is rejected", () => {
  const result = calc.calculate({
    product: {
      kind: "mix",
      unit: "floz",
      doses: [{ oz: 0.54, percent: "", blockedPests: ["Bed Bugs"] }],
    },
    gallons: 1,
    ozPerGallon: 0.54,
    sqft: 1000,
    pests: ["Bed Bugs"],
  });
  assert.equal(result.status, "over");
});

test("Alpine WSG 30 g per gallon stays at 30 g per 1,000 sq ft", () => {
  const ok = calc.calculate({ product: byId["alpine-wsg"], gallons: 1, ozPerGallon: 30, sqft: 1000 });
  assert.equal(ok.status, "ok");
  assert.equal(calc.formatAmount(ok.totalOz, "grams"), "30");
  const over = calc.calculate({ product: byId["alpine-wsg"], gallons: 1.5, ozPerGallon: 30, sqft: 1000 });
  assert.equal(over.status, "over");
});

test("Taurus foundation band stops extra gallons", () => {
  const over = calc.calculate({
    product: byId["taurus-sc"],
    gallons: 2,
    ozPerGallon: 0.8,
    linearFeet: 160,
    useFoundationLimit: true,
  });
  assert.equal(over.status, "over");
  const ok = calc.calculate({
    product: byId["taurus-sc"],
    gallons: 0.5,
    ozPerGallon: 0.4,
    linearFeet: 160,
    useFoundationLimit: true,
  });
  assert.equal(ok.status, "ok");
  assert.equal(calc.formatOz(ok.totalOz), "0.20");
});

test("bait is a count, not a per-gallon mix", () => {
  const result = calc.calculate({ product: byId["final-blox"], count: 4 });
  assert.equal(result.status, "ok");
  assert.equal(result.totalOz, 4);
  assert.equal(result.dilution, "");
});

test("the same concentrate four stops in a row is a streak", () => {
  const history = [1, 2, 3, 4].map(() => ({ tech: "Ben", productId: "bifen-it", totalOz: 1 }));
  assert.equal(calc.sameAmountStreak(history, { tech: "Ben", productId: "bifen-it", totalOz: 1 }), true);
  assert.equal(calc.sameAmountStreak(history, { tech: "Ben", productId: "bifen-it", totalOz: 0.5 }), false);
});

test("the slip uses master-list wording", () => {
  const result = calc.calculate({
    product: byId["bifen-it"],
    gallons: 1.5,
    ozPerGallon: 0.5,
    sqft: 2000,
    pests: ["Ants"],
  });
  const slip = calc.buildSlip({
    tech: "Ben",
    when: "Fri, Nov 6, 2026, 10:45 AM Pacific",
    product: byId["bifen-it"],
    result,
    gallons: 1.5,
    gallonLabel: "1.5 Gallons",
    sqft: 2000,
    linearFeet: 0,
    areaUnit: "Square ft",
    site: "Exterior Foundation",
    method: "Backpack Sprayer",
    pests: ["Ants"],
  });
  assert.match(slip, /Material: Bifen I\/T/);
  assert.match(slip, /Total Concen: 0\.75/);
  assert.match(slip, /Unit: floz/);
  assert.match(slip, /Finished Dilution \(Gallons\): 1\.5 Gallons/);
  assert.match(slip, /Method: Backpack Sprayer/);
  assert.match(slip, /Locations: Exterior Foundation/);
  assert.match(slip, /Target Pest\(s\): Ants/);
  assert.match(slip, /Area unit: Square ft/);
});
