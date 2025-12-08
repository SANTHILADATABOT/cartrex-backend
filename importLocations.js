// -----------------------------------------------------------
// importLocations.js
// -----------------------------------------------------------
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// -------------------- CONFIG --------------------
const EXCEL_FILE = 'uscities_zipcode.xlsx';       // place this file on server
const OUTPUT_PREVIEW = 'preview_locations.html';
const dryRun = false;                      // true = preview only, false = insert to DB

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI; // update as needed

// -------------------- MODEL --------------------
const LocationNew = require("./models/LocationNew"); // your existing model

// Helper: escape HTML
function h(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m])
  );
}

// ------------------------------------------------------
// READ EXCEL
// ------------------------------------------------------

if (!fs.existsSync(EXCEL_FILE)) {
  console.log(`❌ Excel file not found: ${EXCEL_FILE}`);
  process.exit(1);
}

console.log(`📘 Excel file found: ${EXCEL_FILE}`);
const workbook = XLSX.readFile(EXCEL_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

console.log(`📄 Rows read from Excel: ${rows.length}`);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connected to MongoDB");

    const planned = [];
    let rowIndex = 0;

    for (const raw of rows) {
      rowIndex++;

      const city = raw["city"]?.toString().trim();
      const state = raw["state"]?.toString().trim();
      const stateCode = raw["stateCode"]?.toString().trim();
    //   const zipcode = raw["zips"]?.toString().trim();
      let zipcode = raw["zips"]?.toString().trim();
        if (zipcode && zipcode.includes(" ")) {
        zipcode = zipcode.split(" ")[0];
        }

        // Clean non-digits
        zipcode = zipcode.replace(/\D/g, "");

        // Pad 1–4 digit ZIPs (e.g. 918 → 00918)
        zipcode = zipcode.padStart(5, "0");

        // If still not 5 digits, skip bad data
        if (zipcode.length !== 5) {
        console.log("Skipping invalid ZIP:", zipcode);
        continue;
        }

      if (!city || !zipcode) continue;

      const fullAddress = `${city}, ${state} ${zipcode}`;
      const formattedAddress = fullAddress;

      planned.push({
        excelRow: rowIndex + 1,
        city,
        state,
        stateCode,
        zipcode,
        fullAddress,
        formattedAddress,
        placeId: uuidv4(), // optional
        createdBy: null,
        updatedBy: null,
        ipAddress: "0.0.0.0",
        userAgent: "location-import-script",
      });
    }

    // -------------------------------------------------------
    // BUILD PREVIEW HTML
    // -------------------------------------------------------

    let html = `
<!doctype html>
<html>
<head><meta charset="utf-8"><title>LocationNew Preview</title></head>
<body style="font-family:Arial,Helvetica,sans-serif">
<h2 style="color:${dryRun ? "orange" : "green"}">
  ${dryRun ? "🔍 PREVIEW MODE" : "🚀 LIVE EXECUTION MODE"}
</h2>
<p>Total Excel rows: ${rows.length}</p>
<p>Valid planned inserts: <strong>${planned.length}</strong></p>
`;

    function table(data, columns) {
      let html = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">';
      html += "<tr style='background:#efefef'>";
      for (const c of columns) html += `<th>${h(c)}</th>`;
      html += "</tr>";

      let i = 1;
      for (const r of data) {
        html += "<tr>";
        for (const c of columns) {
          let val = r[c] ?? "";
          if (c === "#") val = i;
          html += `<td>${h(val)}</td>`;
        }
        html += "</tr>";
        i++;
      }
      html += "</table>";
      return html;
    }

    if (planned.length) {
      html += "<h3 style='color:green'>Planned Inserts</h3>";
      html += table(planned, [
        "#",
        "excelRow",
        "city",
        "state",
        "stateCode",
        "zipcode",
        "fullAddress",
      ]);
    }

    html += "</body></html>";

    fs.writeFileSync(OUTPUT_PREVIEW, html, "utf8");
    console.log(`📄 Preview written to ${OUTPUT_PREVIEW}`);

    // -------------------------------------------------------
    // INSERT TO DB IF NOT DRY-RUN
    // -------------------------------------------------------

    if (!dryRun && planned.length) {
      console.log("🚀 Inserting into MongoDB...");

      await LocationNew.insertMany(planned);
      console.log(`✅ Inserted ${planned.length} locations`);
    }

    console.log("🎉 DONE.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
