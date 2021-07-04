const express = require("express");
const router = express.Router();
const fs = require("fs");

/**
 * HTTP - GET method
 */
router.get("/", (req, res) => {
  const hospitalList = getHospitalData();
  res.send(hospitalList);
});

/**
 * HTTP - PATCH method
 */
router.patch("/:hospitalname", (req, res) => {
  const hospitalName = req.params.hospitalname;
  const data = req.body;
  if (!data.hospitalname || !data.contactnumber) {
    return res.status(401).send({ error: true, msg: "Hospital data missing" });
  }
  const existingList = getHospitalData();
  const idx = existingList.findIndex(
    (hospital) => hospital.hospitalname === hospitalName
  );
  if (idx === -1) {
    return res
      .status(409)
      .send({ error: true, msg: "Hospital does not exist" });
  }
  existingList[idx] = data;
  saveHospitalData(existingList);
  res.send({ success: true, msg: "Hospital updated successfully" });
});

/**
 * HTTP - POST method
 */
router.post("/", (req, res) => {
  const existingList = getHospitalData();
  const reqData = req.body;
  // TODO - add validataions
  if (!reqData.contactnumber || !reqData.hospitalname) {
    return res.status(401).send({ error: true, msg: "Hospital data missing" });
  }
  // check if hospital already exists
  const hospitalExists = existingList.find(
    (hospital) => hospital.hospitalname === reqData.hospitalname
  );
  if (hospitalExists) {
    return res
      .status(409)
      .send({ error: true, msg: "Hospital already exists" });
  }
  console.log(existingList);
  console.log(reqData);
  existingList.push(reqData);
  saveHospitalData(existingList);
  res.send({ success: true, msg: "Hospital added successfully" });
  res.send("this is a post request");
});

/**
 * HTTP - DELETE method
 */
router.delete("/:hospitalname", (req, res) => {
  const hospitalName = req.params.hospitalname;
  const existingHospitals = getHospitalData();
  const filterData = existingHospitals.filter(
    (hospital) => hospital["hospitalname"] !== hospitalName
  );
  console.log(req.params);
  if (existingHospitals.length == filterData.length) {
    return res
      .status(409)
      .send({ error: true, msg: "hospital does not exist" });
  }
  saveHospitalData(filterData);

  res.send({ success: true, msg: "Hospital removed successfully" });
});

/**
 * function used to update the data in json db
 * @param {hospitalData} data
 */
const saveHospitalData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync("json/hospitals.json", stringifyData);
};

/**
 * funtion to fetch all the data using filesystem
 */
const getHospitalData = () => {
  const jsonData = fs.readFileSync("json/hospitals.json");
  return JSON.parse(jsonData);
};

module.exports = router;
