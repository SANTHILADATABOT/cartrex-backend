const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Location = require("./models/Location"); // Adjust path if needed


const MONGO_URI = process.env.MONGODB_URI;

// Replace with your actual User ID (creator/updater)
const userId = new mongoose.Types.ObjectId("6501a2b3c4d567e89f0abc12");

async function insertLocations() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const ipAddress = "192.168.1.10";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

    // Helper to create audit fields
    const createAudit = () => ({
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      deletedBy: null,
      deletedAt: null,
      deletstatus: 0,
      ipAddress,
      userAgent,
    });

    // 📍 Sample U.S. Locations
    const locationsData = [
      {
        city: "New York",
        state: "New York",
        stateCode: "NY",
        zipcode: "10001",
        fullAddress: "New York, NY 10001, USA",
        formattedAddress: "New York, NY, USA",
        placeId: "ChIJOwg_06VPwokRYv534QaPC8g",
      },
      {
        city: "Los Angeles",
        state: "California",
        stateCode: "CA",
        zipcode: "90001",
        fullAddress: "Los Angeles, CA 90001, USA",
        formattedAddress: "Los Angeles, CA, USA",
        placeId: "ChIJE9on3F3HwoAR9AhGJW_fL-I",
      },
      {
        city: "Chicago",
        state: "Illinois",
        stateCode: "IL",
        zipcode: "60601",
        fullAddress: "Chicago, IL 60601, USA",
        formattedAddress: "Chicago, IL, USA",
        placeId: "ChIJ7cv00DwsDogRAMDACa2m4K8",
      },
      {
        city: "Houston",
        state: "Texas",
        stateCode: "TX",
        zipcode: "77001",
        fullAddress: "Houston, TX 77001, USA",
        formattedAddress: "Houston, TX, USA",
        placeId: "ChIJAYWNSLS4QIYROwVl894CDco",
      },
      {
        city: "Phoenix",
        state: "Arizona",
        stateCode: "AZ",
        zipcode: "85001",
        fullAddress: "Phoenix, AZ 85001, USA",
        formattedAddress: "Phoenix, AZ, USA",
        placeId: "ChIJ7aVxnOTHxIcRrrtMZxD2R8g",
      },
      {
        city: "Philadelphia",
        state: "Pennsylvania",
        stateCode: "PA",
        zipcode: "19104",
        fullAddress: "Philadelphia, PA 19104, USA",
        formattedAddress: "Philadelphia, PA, USA",
        placeId: "ChIJ60u11Ni3xokRwVg-jNgU9Yk",
      },
      {
        city: "San Antonio",
        state: "Texas",
        stateCode: "TX",
        zipcode: "78201",
        fullAddress: "San Antonio, TX 78201, USA",
        formattedAddress: "San Antonio, TX, USA",
        placeId: "ChIJrw7QBK9YXIYRvBagEDvhVgg",
      },
      {
        city: "San Diego",
        state: "California",
        stateCode: "CA",
        zipcode: "92101",
        fullAddress: "San Diego, CA 92101, USA",
        formattedAddress: "San Diego, CA, USA",
        placeId: "ChIJSx6SrQ9T2YARed8V_f0hOg0",
      },
      {
        city: "Dallas",
        state: "Texas",
        stateCode: "TX",
        zipcode: "75201",
        fullAddress: "Dallas, TX 75201, USA",
        formattedAddress: "Dallas, TX, USA",
        placeId: "ChIJS5dFe_cZTIYRj2dH9qSb7Lk",
      },
      {
        city: "San Jose",
        state: "California",
        stateCode: "CA",
        zipcode: "95101",
        fullAddress: "San Jose, CA 95101, USA",
        formattedAddress: "San Jose, CA, USA",
        placeId: "ChIJ9T_5iuTKj4AR1p1nTSaRtuQ",
      },
      {
        city: "Austin",
        state: "Texas",
        stateCode: "TX",
        zipcode: "73301",
        fullAddress: "Austin, TX 73301, USA",
        formattedAddress: "Austin, TX, USA",
        placeId: "ChIJLwPMoJm1RIYRetVp1EtGm10",
      },
      {
        city: "Jacksonville",
        state: "Florida",
        stateCode: "FL",
        zipcode: "32099",
        fullAddress: "Jacksonville, FL 32099, USA",
        formattedAddress: "Jacksonville, FL, USA",
        placeId: "ChIJ66_O8Ra35YgR4sf8ljh1y1k",
      },
      {
        city: "San Francisco",
        state: "California",
        stateCode: "CA",
        zipcode: "94102",
        fullAddress: "San Francisco, CA 94102, USA",
        formattedAddress: "San Francisco, CA, USA",
        placeId: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      },
      {
        city: "Columbus",
        state: "Ohio",
        stateCode: "OH",
        zipcode: "43085",
        fullAddress: "Columbus, OH 43085, USA",
        formattedAddress: "Columbus, OH, USA",
        placeId: "ChIJcd6QucGJOIgRM7Wxz_hmMuQ",
      },
      {
        city: "Fort Worth",
        state: "Texas",
        stateCode: "TX",
        zipcode: "76101",
        fullAddress: "Fort Worth, TX 76101, USA",
        formattedAddress: "Fort Worth, TX, USA",
        placeId: "ChIJrQfILRJuToYRnKuv04TbeCo",
      },
      {
        city: "Charlotte",
        state: "North Carolina",
        stateCode: "NC",
        zipcode: "28202",
        fullAddress: "Charlotte, NC 28202, USA",
        formattedAddress: "Charlotte, NC, USA",
        placeId: "ChIJgRo4_MQfVIgRZNFDv-ZQRog",
      },
      {
        city: "Indianapolis",
        state: "Indiana",
        stateCode: "IN",
        zipcode: "46201",
        fullAddress: "Indianapolis, IN 46201, USA",
        formattedAddress: "Indianapolis, IN, USA",
        placeId: "ChIJyYpJjrwXa4gR0E7HW9MTLvc",
      },
      {
        city: "Seattle",
        state: "Washington",
        stateCode: "WA",
        zipcode: "98101",
        fullAddress: "Seattle, WA 98101, USA",
        formattedAddress: "Seattle, WA, USA",
        placeId: "ChIJVTPokywQkFQRmtVEaUZlJRA",
      },
      {
        city: "Denver",
        state: "Colorado",
        stateCode: "CO",
        zipcode: "80201",
        fullAddress: "Denver, CO 80201, USA",
        formattedAddress: "Denver, CO, USA",
        placeId: "ChIJzxcfI6qAa4cR1jaKJ_j0jhE",
      },
      {
        city: "Boston",
        state: "Massachusetts",
        stateCode: "MA",
        zipcode: "02108",
        fullAddress: "Boston, MA 02108, USA",
        formattedAddress: "Boston, MA, USA",
        placeId: "ChIJGzE9DS1l44kRoOhiASS_fHg",
      },
    ].map((loc) => ({ ...loc, ...createAudit() }));

    const inserted = await Location.insertMany(locationsData);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting locations:", err);
  }
}

insertLocations();
