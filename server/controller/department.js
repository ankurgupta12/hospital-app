const express = require("express");
const router = express.Router();
const fs = require("fs");

/**
 * HTTP - GET method
 */
router.get("/", (req, res) => {
  const departmentList = getDepartmentList();
  res.send(departmentList);
});
/**
 * HTPP Get Department List based on name
 */
router.get("/:hospitalname", (req, res) => {
  const departmentList = getDepartmentList();
  const hospotalName = req.params.hospitalname;
  const departmenet = departmentList.filter((res)=>res.hospitalname===hospotalName);
  res.send(departmenet);
});

/**
 * HTTP - PATCH method
 */
router.patch("/:departmentname", (req, res) => {
  const departmentName = req.params.departmentname;
  const data = req.body;
  console.log(data);
  if (
    !data.departmentname ||
    !data.contactnumber ||
    !data.head ||
    !data.hospitalname
  ) {
    return res
      .status(401)
      .send({ error: true, msg: "Department data missing" });
  }
  const existingList = getDepartmentList();
  const idx = existingList.findIndex(
    (department) =>
      department.departmentname === departmentName &&
      department.hospitalname === data.hospitalname
  );
  if (idx === -1) {
    return res
      .status(409)
      .send({ error: true, msg: "Department does not exist" });
  }
  existingList[idx] = data;
  saveDepartmentData(existingList);
  res.send({ success: true, msg: "Department updated successfully" });
});

/**
 * HTTP - POST method
 */
router.post("/", (req, res) => {
  const existingList = getDepartmentList();
  const reqData = req.body;
  if (
    !reqData.contactnumber ||
    !reqData.departmentname ||
    !reqData.head ||
    !reqData.hospitalname
  ) {
    return res
      .status(401)
      .send({ error: true, msg: "Department data missing" });
  }

  const departmentExists = existingList.find(
    (department) =>
      department.departmentname === reqData.departmentname &&
      department.hospitalname === reqData.hospitalname
  );
  if (departmentExists) {
    return res
      .status(409)
      .send({ error: true, msg: "Department already exists" });
  }
  existingList.push(reqData);
  saveDepartmentData(existingList);
  res.send({ success: true, msg: "Department added successfully" });
});

/**
 * HTTP - DELETE api call
 */
router.delete("/:departmentname/:hospitalname", (req, res) => {
  const departmentName = req.params.departmentname;
  const hospitalname = req.params.hospitalname;
  const existingDepartments = getDepartmentList();
  const filterData = existingDepartments.filter(
    (department) =>
      department.departmentname !== departmentName &&
      department.hospitalname !== hospitalname
  );
  if (!hospitalname) {
    return res
      .status(401)
      .send({ error: true, msg: "Hospital name missing in request body" });
  }
  if (existingDepartments.length == filterData.length) {
    return res
      .status(409)
      .send({ error: true, msg: "Department does not exist" });
  }
  saveDepartmentData(filterData);

  res.send({ success: true, msg: "Department removed successfully" });
});

/**
 * function used to update the data in json db
 * @param {departmentdata} data
 */
const saveDepartmentData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync("json/departments.json", stringifyData);
};

/**
 * funtion to fetch all the data using filesystem
 */
const getDepartmentList = () => {
  const jsonData = fs.readFileSync("json/departments.json");
  return JSON.parse(jsonData);
};

module.exports = router;
