// breakdownLog.jxs
import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";

const BreakdownLog = () => {
  const [dates, setDates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [faultDescriptions, setFaultDescriptions] = useState([]);
  const [partOptions, setPartOptions] = useState([]); // For Part Code/Name options
  const [selectedParts, setSelectedParts] = useState([]); // Store selected parts data

  const [formData, setFormData] = useState({
    date: "",
    department: "",
    operatorName: "",
    machineNo: "",
    faultDescription: "",
    faultTime: "",
    startTime: "",
    endTime: "",
    repairTime: "",
    breakdownTime: "",
    partDetails: [], // Details of selected parts
    remarks: "",
  });

  const convertExcelDate = (excelSerial) => {
    const excelStartDate = new Date(1899, 11, 30);
    const date = new Date(excelStartDate.getTime() + excelSerial * 86400000);
  
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };

  // Fetch validation data from validation.xlsx
  const fetchValidationData = async () => {
    try {
      const response = await fetch("/validation.xlsx");
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const validationSheet = workbook.Sheets["Validation (2)"];

      const validationData = XLSX.utils.sheet_to_json(validationSheet);
      const extractedDates = validationData.map((item) =>
        convertExcelDate(item.Date)
      );
      setDates(extractedDates);
      setFaultDescriptions(validationData.map((row) => row["Fault Type"]));
      setMachines(validationData.map((row) => row["Machine No"]));
    } catch (error) {
      console.error("Error fetching validation data:", error);
    }
  };

  // Fetch parts data from the backend
  const fetchPartsData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/parts");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();

      // Set options for Part Code/Part Name selection
      const options = data.map((part) => ({
        label: part.part_code, // Use part_code for the selection
        value: part.part_code, // Part Code will be the value
        partName: part.part_name, // Associate part name with the option
      }));
      setPartOptions(options);
    } catch (error) {
      console.error("Error fetching parts data:", error);
    }
  };

  useEffect(() => {
    fetchPartsData();
    fetchValidationData();
  }, []);

  const calculateRepairTime = (startTime, endTime) => {
        if (!startTime || !endTime) return "";
        const start = new Date(startTime);
        const end = new Date(endTime);
    
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
        if (end > start) {
          const diffMs = end - start;
          const diffHrs = diffMs / (1000 * 60 * 60);
          return diffHrs.toFixed(2);
        } else {
          const diffMs = (end.getTime() + 24 * 60 * 60 * 1000) - start.getTime();
          const diffHrs = diffMs / (1000 * 60 * 60);
          return diffHrs.toFixed(2);
        }
      };
    
      // Calculate breakdown time
      const calculateBreakdownTime = (faultTime, startTime) => {
        if (!faultTime || !startTime) return "";
        const fault = new Date(faultTime);
        const start = new Date(startTime);
    
        if (isNaN(fault.getTime()) || isNaN(start.getTime())) return "";
        if (start > fault) {
          const diffMs = start - fault;
          const diffHrs = diffMs / (1000 * 60 * 60);
          return diffHrs.toFixed(2);
        } else {
          const diffMs = (start.getTime() + 24 * 60 * 60 * 1000) - fault.getTime();
          const diffHrs = diffMs / (1000 * 60 * 60);
          return diffHrs.toFixed(2);
        }
      };

  // Handle the Part Code selection, automatically populate Part Name
  const handlePartsChange = (selectedOption) => {
    const partCode = selectedOption.value;
    const partName = selectedOption.partName;

    // Add the selected part to the partDetails array with default values for quantity, issuedTo, issuedBy
    const newPart = {
      partCode,
      partName,
      quantity: "", // Default empty
      issuedTo: "",
      issuedBy: "",
      partStatus: "",
    };

    // Update the selected parts
    setSelectedParts((prevParts) => [...prevParts, newPart]);
    setFormData((prevData) => ({
      ...prevData,
      partDetails: [...prevData.partDetails, newPart],
    }));
  };

  // Handle input changes for part details (quantity, issuedTo, issuedBy)
  // Handle input changes for part details (quantity, issuedTo, issuedBy, partStatus)
const handlePartDetailChange = (index, field, value) => {
  const updatedParts = [...selectedParts];
  updatedParts[index][field] = value;

  // Check if partStatus is set to "Repaired" and update fields accordingly
  if (field === "partStatus" && value === "Repaired") {
    updatedParts[index].quantity = 0;
    updatedParts[index].issuedTo = "NONE";
    updatedParts[index].issuedBy = "NONE";
  }

  setSelectedParts(updatedParts);
  setFormData((prevData) => ({
    ...prevData,
    partDetails: updatedParts,
  }));
};


  // Handle other form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newFormData = { ...prevData, [name]: value };

      // If the input is either startTime or endTime, calculate the repair time
      if (name === "startTime" || name === "endTime") {
        const repairTime = calculateRepairTime(
          newFormData.startTime,
          newFormData.endTime
        );
        newFormData.repairTime = repairTime;
      }

      // If the input is either faultTime or startTime, calculate the breakdown time
      if (name === "faultTime" || name === "startTime") {
        const breakdownTime = calculateBreakdownTime(
          newFormData.faultTime,
          newFormData.startTime
        );
        newFormData.breakdownTime = breakdownTime;
      }
     
      return newFormData;
          });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/breakdown-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Failed to submit data");
        } else {
          alert("Data submitted successfully");
        }
      })
      .catch((error) => console.error("Error submitting data:", error));
  };
 
  

  return (
    <div className="container">
      <h1 className="title">Breakdown Log</h1>
      <form onSubmit={handleSubmit}>
        {/* First Table: Breakdown Log Form */}
        <table className="log-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Department</th>
              <th>Operator Name</th>
              <th>Machine No</th>
              <th>Fault Description</th>
              <th>Fault Time</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Repair Time (hrs.)</th>
              <th>Breakdown Time (hrs.)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
              <select
                  name="date"
                  className="select-field"
                  onChange={handleChange}
                > 
                  <option value="empty"> </option>
                  {dates.map((date, index) => (
                    <option key={index} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select name="department" className="select-field" onChange={handleChange}>
                  <option value="">Select Department</option>
                  <option value="ST-1">ST-1</option>
                  <option value="ST-2">ST-2</option>
                  <option value="ST-3">ST-3</option>
                  <option value="ST-4">ST-4</option>
                  <option value="ST-5">ST-5</option>
                  <option value="ST-6">ST-6</option>
                  <option value="ST-7">ST-7</option>
                </select>
              </td>
              <td>
                <input type="text" name="operatorName" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <select name="machineNo" className="select-field" onChange={handleChange}>
                  <option value="">Select Machine No</option>
                  {machines.map((machine, index) => (
                    <option key={index} value={machine}>
                      {machine}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select name="faultDescription" className="select-field" onChange={handleChange}>
                  <option value="">Select Fault Description</option>
                  {faultDescriptions.map((fault, index) => (
                    <option key={index} value={fault}>
                      {fault}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input type="datetime-local" name="faultTime" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="datetime-local" name="startTime" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="datetime-local" name="endTime" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="text" name="repairTime" className="input-field" value={formData.repairTime} readOnly />
              </td>
              <td>
                <input type="text" name="breakdownTime" className="input-field" value={formData.breakdownTime} readOnly />
              </td>
              <td>
                <input type="text" name="remarks" className="input-field" onChange={handleChange} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Second Table: Parts Table */}
        <h2>Parts Details</h2>
        <Select
          options={partOptions}
          className="select-field"
          onChange={handlePartsChange}
          placeholder="Select Part Code"
        />

<table className="parts-table">
  <thead>
    <tr>
      <th>Part Code</th>
      <th>Part Name</th>
      <th>Quantity</th>
      <th>Issued To</th>
      <th>Issued By</th>
      <th>Part Status</th> {/* Add Part Status column */}
    </tr>
  </thead>
  <tbody>
    {selectedParts.map((part, index) => (
      <tr key={index}>
        <td>{part.partCode}</td>
        <td>{part.partName}</td>
        <td>
          <input
            type="text"
            className="input-field"
            value={part.quantity}
            onChange={(e) => handlePartDetailChange(index, "quantity", e.target.value)}
            placeholder="Quantity"
          />
        </td>
        <td>
          <input
            type="text"
            className="input-field"
            value={part.issuedTo}
            onChange={(e) => handlePartDetailChange(index, "issuedTo", e.target.value)}
            placeholder="Issued To"
          />
        </td>
        <td>
          <input
            type="text"
            className="input-field"
            value={part.issuedBy}
            onChange={(e) => handlePartDetailChange(index, "issuedBy", e.target.value)}
            placeholder="Issued By"
          />
        </td>
        <td>
  <select
    name="partStatus"
    className="select-field"
    value={part.partStatus}
    onChange={(e) => handlePartDetailChange(index, "partStatus", e.target.value)}
  >
    <option value="">Select Part Status</option>
    <option value="Repaired">Repaired</option>
    <option value="Replaced">Replaced</option>
  </select>
</td>

      </tr>
    ))}
  </tbody>
</table>


        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default BreakdownLog;




