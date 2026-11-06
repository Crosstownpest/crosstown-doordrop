"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calc = require("./mix-calc.js");

const byId = Object.fromEntries(calc.PRODUCTS.map((product) => [product.id, product]));

test("1.5 gallons at 0.40 oz per gallon is 0.60 oz of concentrate", () => {
  const result = calc.calculate({
    product: byId["demand-cs"],
    gallons: 1.5,
    ozPerGallon: 0.4,
    sqft: 1500,
    pests: ["ants"],
  });
  assert.equal(result.status, "ok");
  assert.equal(calc.formatOz(result.totalOz), "0.60");
  assert.equal(result.dilution, "0.40 fl oz per gallon");
  assert.equal(calc.formatOz(result.per1000), "0.40");
});

test("2 gallons at 1.00 oz per gallon is 2.00 oz", () => {
  const result = calc.calculate({
    product: byId["talstar-p"],
    gallons: 2,
    ozPerGallon: 1,
    sqft: 2000,
    pests: ["spiders"],
  });
  assert.equal(result.status, "ok");
  assert.equal(calc.formatOz(result.totalOz), "2.00");
  assert.equal(calc.formatOz(result.per1000), "1.00");
});

test("Talstar over the 1 oz per 1,000 sq ft ceiling is rejected", () => {
  const result = calc.calculate({
    product: byId["talstar-p"],
    gallons: 3,
    ozPerGallon: 1,
    sqft: 1000,
  });
  assert.equal(result.status, "over");
  assert.match(result.reason, /3\.00 fl oz per 1,000/);
});

test("Talstar without square feet does not get a clean pass", () => {
  const result = calc.calculate({
    product: byId["talstar-p"],
    gallons: 1,
    ozPerGallon: 0.33,
  });
  assert.equal(result.status, "need-area");
  assert.equal(calc.formatOz(result.totalOz), "0.33");
});

test("a dose that is not on the label is rejected", () => {
  const result = calc.calculate({
    product: byId["demand-cs"],
    gallons: 1,
    ozPerGallon: 0.5,
  });
  assert.equal(result.status, "bad-dose");
});

test("Temprid high rate on bed bugs is rejected", () => {
  const result = calc.calculate({
    product: byId["temprid-fx"],
    gallons: 1,
    ozPerGallon: 0.54,
    sqft: 1000,
    pests: ["bed bugs"],
  });
  assert.equal(result.status, "over");
});

test("Suspend at 1 gallon of the 1.50 rate on 1,000 sq ft is the ceiling", () => {
  const ok = calc.calculate({
    product: byId["suspend-polyzone"],
    gallons: 1,
    ozPerGallon: 1.5,
    sqft: 1000,
  });
  assert.equal(ok.status, "ok");
  const over = calc.calculate({
    product: byId["suspend-polyzone"],
    gallons: 2,
    ozPerGallon: 1.5,
    sqft: 1000,
  });
  assert.equal(over.status, "over");
});

test("Termidor foundation band stops extra gallons", () => {
  const over = calc.calculate({
    product: byId["termidor-sc"],
    gallons: 2,
    ozPerGallon: 0.4,
    linearFeet: 160,
  });
  assert.equal(over.status, "over");
  assert.match(over.reason, /0\.50 gallons/);
  const ok = calc.calculate({
    product: byId["termidor-sc"],
    gallons: 0.5,
    ozPerGallon: 0.4,
    linearFeet: 160,
  });
  assert.equal(ok.status, "ok");
  assert.equal(calc.formatOz(ok.totalOz), "0.20");
});

test("the same concentrate four stops in a row is a streak", () => {
  const history = [1, 2, 3, 4].map(() => ({ tech: "Ben", productId: "demand-cs", totalOz: 0.6 }));
  assert.equal(
    calc.sameAmountStreak(history, { tech: "Ben", productId: "demand-cs", totalOz: 0.6 }),
    true,
  );
  assert.equal(
    calc.sameAmountStreak(history, { tech: "Ben", productId: "demand-cs", totalOz: 1.2 }),
    false,
  );
  assert.equal(
    calc.sameAmountStreak(history.slice(0, 3), { tech: "Ben", productId: "demand-cs", totalOz: 0.6 }),
    false,
  );
});

test("Bifen I/T at 1 fl oz per gallon on 1,000 sq ft is the label ceiling", () => {
  const ok = calc.calculate({
    product: byId["bifen-it"],
    gallons: 1,
    ozPerGallon: 1,
    sqft: 1000,
  });
  assert.equal(ok.status, "ok");
  assert.equal(calc.formatOz(ok.totalOz), "1.00");
  const over = calc.calculate({
    product: byId["bifen-it"],
    gallons: 1.5,
    ozPerGallon: 1,
    sqft: 1000,
  });
  assert.equal(over.status, "over");
});

test("the slip uses the Add Material field names", () => {
  const result = calc.calculate({
    product: byId["demand-cs"],
    gallons: 1.5,
    ozPerGallon: 0.4,
    sqft: 1500,
    pests: ["ants"],
  });
  const slip = calc.buildSlip({
    tech: "Ben",
    when: "Fri, Nov 6, 2026, 10:45 AM Pacific",
    product: byId["demand-cs"],
    result,
    gallons: 1.5,
    sqft: 1500,
    linearFeet: 0,
    site: "Exterior foundation",
    method: "Perimeter spray",
    pests: ["ants"],
  });
  assert.match(slip, /Material: Demand CS/);
  assert.match(slip, /Total Concen: 0\.60/);
  assert.match(slip, /Unit: floz/);
  assert.match(slip, /Finished Dilution \(Gallons\): 1\.50/);
  assert.match(slip, /Locations: Exterior foundation/);
  assert.match(slip, /Target Pest\(s\): ants/);
  assert.match(slip, /Area\/Quantity: 1500/);
  assert.match(slip, /Area unit: Square ft/);
  assert.match(slip, /product from the jug/);
});
