
// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import "./PreventiveMaintenanceLog.css"; // Import the updated CSS file

// const convertExcelDate = (excelSerial) => {
//   const excelStartDate = new Date(1899, 11, 30);
//   const date = new Date(excelStartDate.getTime() + excelSerial * 86400000);

//   const day = date.getDate();
//   const monthNames = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const month = monthNames[date.getMonth()];
//   const year = date.getFullYear();

//   return `${day}-${month}-${year}`;
// };

// const PreventiveMaintenanceLog = () => {
//   const [dates, setDates] = useState([]);
//   const [formData, setFormData] = useState({
//     department: "",
//     operator_name: "",
//     machine_no: "",
//     maintenance_type: "",
//     schedule_date: "",
//     start_date_time: "",
//     end_date_time: "",
//     total_time: "",
//     pms_package: "",
//     issued_to: "",
//     issued_by: "",
//     remarks: "",
//   });

//   // Fetch and load dates from Excel
//   useEffect(() => {
//     fetch("/validation.xlsx")
//       .then((response) => response.arrayBuffer())
//       .then((buffer) => {
//         const workbook = XLSX.read(buffer, { type: "array" });
//         const worksheet = workbook.Sheets["Validation (2)"];
//         let jsonData = XLSX.utils.sheet_to_json(worksheet);

//         // Convert the date field and extract only the date
//         const extractedDates = jsonData.map((item) =>
//           convertExcelDate(item.Date)
//         );
//         setDates(extractedDates);
//       })
//       .catch((error) =>
//         console.error("Error fetching or parsing Excel file:", error)
//       );
//   }, []);

//   // Function to calculate total time in HH:MM:SS format
//   const calculateTotalTime = (startDateTime, endDateTime) => {
//     if (startDateTime && endDateTime) {
//       const start = new Date(startDateTime);
//       const end = new Date(endDateTime);

//       // Get time difference in milliseconds
//       const timeDifference = end - start;

//       // Convert milliseconds to total seconds
//       const totalSeconds = timeDifference / 1000;

//       // Convert seconds into HH:MM:SS format
//       const hours = Math.floor(totalSeconds / 3600);
//       const minutes = Math.floor((totalSeconds % 3600) / 60);
//       const seconds = Math.floor(totalSeconds % 60);

//       const formattedTime = `${String(hours).padStart(2, "0")}:${String(
//         minutes
//       ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

//       // Update total_time in formData
//       setFormData((prevData) => ({
//         ...prevData,
//         total_time: formattedTime, // Store in HH:MM:SS format
//       }));
//     }
//   };

//   // Handle input change
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//     // Calculate total time when start or end time changes
//     if (e.target.name === "start_date_time" || e.target.name === "end_date_time") {
//       const { start_date_time, end_date_time } = {
//         ...formData,
//         [e.target.name]: e.target.value,
//       };
//       calculateTotalTime(start_date_time, end_date_time);
//     }
//   };

//   // Handle form submit
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     fetch("http://localhost:5000/api/maintenance/submit-log", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.error) {
//           alert("Failed to submit data");
//         } else {
//           alert("Data submitted successfully");
//         }
//       })
//       .catch((error) => console.error("Error submitting data:", error));
//   };

//   return (
//     <div className="container">
//       <h1 className="title">Preventive Maintenance Log</h1>
//       <form onSubmit={handleSubmit}>
//         <table className="log-table">
//           <thead>
//             <tr>
//               <th>Department</th>
//               <th>Operator Name</th>
//               <th>Machine No</th>
//               <th>Maintenance Type</th>
//               <th>Schedule Date</th>
//               <th>Start Date and Time</th>
//               <th>End Date and Time</th>
//               <th>Total Time (HH:MM:SS)</th>
//               <th>PMS Package</th>
//               <th>Issued to</th>
//               <th>Issued By</th>
//               <th>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>
//                 <select
//                   name="department"
//                   className="select-field"
//                   onChange={handleChange}
//                 >
//                   <option value="ST-1">ST-1</option>
//                   <option value="ST-2">ST-2</option>
//                   <option value="ST-3">ST-3</option>
//                   <option value="ST-4">ST-4</option>
//                   <option value="ST-5">ST-5</option>
//                   <option value="ST-6">ST-6</option>
//                   <option value="ST-7">ST-7</option>
//                 </select>
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   name="operator_name"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="number"
//                   name="machine_no"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <select
//                   name="maintenance_type"
//                   className="select-field"
//                   onChange={handleChange}
//                 >
//                   <option value="empty"> </option>
//                   <option value="MLP">MLP</option>
//                   <option value="PMS">PMS</option>
//                 </select>
//               </td>
//               <td>
//                 <select
//                   name="schedule_date"
//                   className="select-field"
//                   onChange={handleChange}
//                 >
//                   <option value="empty"> </option>
//                   {dates.map((date, index) => (
//                     <option key={index} value={date}>
//                       {date}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//               <td>
//                 <input
//                   type="datetime-local"
//                   name="start_date_time"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="datetime-local"
//                   name="end_date_time"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   name="total_time"
//                   className="input-field"
//                   value={formData.total_time} // Show calculated total time
//                   readOnly
//                 />
//               </td>
//               <td>
//                 <select
//                   name="pms_package"
//                   className="select-field"
//                   onChange={handleChange}
//                 >
//                   <option value="PMS-1">PMS-1</option>
//                   <option value="PMS-2">PMS-2</option>
//                 </select>
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   name="issued_to"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   name="issued_by"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   name="remarks"
//                   className="input-field"
//                   onChange={handleChange}
//                 />
//               </td>
//             </tr>
//           </tbody>
//         </table>
//         <button type="submit" className="submit-button">
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PreventiveMaintenanceLog;

import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import "./PreventiveMaintenanceLog.css"; // Import the updated CSS file

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

const PreventiveMaintenanceLog = () => {
  const [dates, setDates] = useState([]);
  const [partOptions, setPartOptions] = useState([]); // Part options for selection
  const [selectedParts, setSelectedParts] = useState([]); // To store selected parts

  const [formData, setFormData] = useState({
    department: "",
    operator_name: "",
    machine_no: "",
    maintenance_type: "",
    schedule_date: "",
    start_date_time: "",
    end_date_time: "",
    total_time: "",
    pms_package: "",
    issued_to: "",
    issued_by: "",
    remarks: "",
    partsUsed: [] // Store parts details
  });

  // Fetch and load dates from Excel
  useEffect(() => {
    fetch("/validation.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets["Validation (2)"];
        let jsonData = XLSX.utils.sheet_to_json(worksheet);

        const extractedDates = jsonData.map((item) => convertExcelDate(item.Date));
        setDates(extractedDates);
      })
      .catch((error) => console.error("Error fetching or parsing Excel file:", error));

    // Fetch parts data from the backend
    fetchPartsData();
  }, []);

  // Fetch parts data from the API
  const fetchPartsData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/parts");
      const data = await response.json();
      const options = data.map((part) => ({
        label: part.part_code,
        value: part.part_code,
        partName: part.part_name,
        openBalance: part.open_balance, // Fetch open balance to subtract later
      }));
      setPartOptions(options);
    } catch (error) {
      console.error("Error fetching parts data:", error);
    }
  };

  const calculateTotalTime = (startDateTime, endDateTime) => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
  
      // Get time difference in milliseconds
      const timeDifference = end - start;
  
      // If time difference is valid (end time is after start time)
      if (timeDifference > 0) {
        // Convert milliseconds to total seconds
        const totalSeconds = timeDifference / 1000;
  
        // Convert seconds into HH:MM:SS format
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
  
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
        // Update total_time in formData
        setFormData((prevData) => ({
          ...prevData,
          total_time: formattedTime, // Store in HH:MM:SS format
        }));
      }
    }
  };

  // Handle part selection and populate part name
  const handlePartsChange = (selectedOption) => {
    const partCode = selectedOption.value;
    const partName = selectedOption.partName;
    const openBalance = selectedOption.openBalance;

    const newPart = {
      partCode,
      partName,
      quantity: 1, // Default quantity is 1
      openBalance: openBalance - 1, // Automatically subtract 1 from the balance
    };

    setSelectedParts((prevParts) => [...prevParts, newPart]);
    setFormData((prevData) => ({
      ...prevData,
      partsUsed: [...prevData.partsUsed, newPart],
    }));
  };

  // Handle input change for general form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Update formData state
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    // Calculate total time when start or end time changes
    if (name === "start_date_time" || name === "end_date_time") {
      const newStartDateTime = name === "start_date_time" ? value : formData.start_date_time;
      const newEndDateTime = name === "end_date_time" ? value : formData.end_date_time;
  
      // Call the calculation function with the updated values
      calculateTotalTime(newStartDateTime, newEndDateTime);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/maintenance/submit-log", {
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
      <h1 className="title">Preventive Maintenance Log</h1>
      <form onSubmit={handleSubmit}>
        <table className="log-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Operator Name</th>
              <th>Machine No</th>
              <th>Maintenance Type</th>
              <th>Schedule Date</th>
              <th>Start Date and Time</th>
              <th>End Date and Time</th>
              <th>Total Time (HH:MM:SS)</th>
              <th>PMS Package</th>
              <th>Issued to</th>
              <th>Issued By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <select name="department" className="select-field" onChange={handleChange}>
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
                <input type="text" name="operator_name" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="number" name="machine_no" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <select name="maintenance_type" className="select-field" onChange={handleChange}>
                  <option value="empty"> </option>
                  <option value="MLP">MLP</option>
                  <option value="PMS">PMS</option>
                </select>
              </td>
              <td>
                <select name="schedule_date" className="select-field" onChange={handleChange}>
                  <option value="empty"> </option>
                  {dates.map((date, index) => (
                    <option key={index} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input type="datetime-local" name="start_date_time" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="datetime-local" name="end_date_time" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="text" name="total_time" className="input-field" value={formData.total_time} readOnly />
              </td>
              <td>
                <select name="pms_package" className="select-field" onChange={handleChange}>
                  <option value="PMS-1">PMS-1</option>
                  <option value="PMS-2">PMS-2</option>
                </select>
              </td>
              <td>
                <input type="text" name="issued_to" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="text" name="issued_by" className="input-field" onChange={handleChange} />
              </td>
              <td>
                <input type="text" name="remarks" className="input-field" onChange={handleChange} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Parts Selection */}
        <h2>Parts Used</h2>
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
            </tr>
          </thead>
          <tbody>
            {selectedParts.map((part, index) => (
              <tr key={index}>
                <td>{part.partCode}</td>
                <td>{part.partName}</td>
                <td>{part.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PreventiveMaintenanceLog;
