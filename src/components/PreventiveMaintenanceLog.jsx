
import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  const [logData, setLogData] = useState([]); // State to hold log data


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
  
  const [logs, setLogs] = useState([]);

  // Fetch logs from the backend
  useEffect(() => {
      fetch("http://localhost:5000/api/maintenance/logs")
          .then((response) => response.json())
          .then((data) => setLogs(data))
          .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  // Function to download data as Excel
  const downloadExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(logs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Preventive Maintenance Logs");
      XLSX.writeFile(workbook, "Preventive_Maintenance_Logs.xlsx");
  };

  // Function to download data as PDF
  const downloadPDF = () => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Preventive Log Report", 14,20);

      const tableColumn = [
          "Department", 
          "Operator Name", 
          "Machine No", 
          "Maintenance Type", 
          "Schedule Date", 
          "Start Date and Time", 
          "End Date and Time", 
          "Total Time", 
          "PMS Package", 
          "Issued To", 
          "Issued By", 
          "Remarks"
      ];
      const tableRows = logs.map((log) => [
        log.department || "N/A", // Fallback for missing values
        log.operator_name || "N/A",
        log.machine_no || "N/A",
        log.maintenance_type || "N/A",
        log.schedule_date ? new Date(log.schedule_date).toLocaleString() : "N/A", // Format schedule date
        log.start_date_time ? new Date(log.start_date_time).toLocaleString() : "N/A", // Format start date/time
        log.end_date_time ? new Date(log.end_date_time).toLocaleString() : "N/A", // Format end date/time
        log.total_time, // Safe total time
        log.pms_package || "N/A",
        log.issued_to || "N/A",
        log.issued_by || "N/A",
        log.remarks || "N/A",
    ]);

      doc.autoTable({ head: [tableColumn], body: tableRows,
        startY: 30,
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          3: { halign: "center" }, // Machine No
          8: { halign: "right" },  // Repair Time
          9: { halign: "right" },  // Breakdown Time
        },
        styles: {
          fontSize: 6,
          cellPadding: 2,
          overflow: "linebreak",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: (data) => {
          // Footer for page number
          const pageCount = doc.internal.getNumberOfPages();
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(6);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
       });
      doc.save("Preventive_Maintenance_Logs.pdf");
  };


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
  const handleSubmit = async () => {
    // if (!formData.machine_no || isNaN(formData.machine_no)) {
    //     alert("Machine number must be a valid integer.");
    //     return;
    // }

    try {
        const response = await fetch("http://localhost:5000/api/submit-log", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
            alert("Log submitted successfully!");
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
    }
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
        <div>
            <h1>Preventive Maintenance Logs</h1>
            <button onClick={downloadExcel}>Download Excel</button>
            <button onClick={downloadPDF}>Download PDF</button>

            {/* Table to Display Data */}
            <table>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Operator Name</th>
                        <th>Machine No</th>
                        <th>Maintenance Type</th>
                        <th>Schedule Date</th>
                        <th>Start Date and Time</th>
                        <th>End Date and Time</th>
                        <th>Total Time</th>
                        <th>PMS Package</th>
                        <th>Issued To</th>
                        <th>Issued By</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.department}</td>
                            <td>{log.operator_name}</td>
                            <td>{log.machine_no}</td>
                            <td>{log.maintenance_type}</td>
                            <td>{log.schedule_date}</td>
                            <td>{log.start_date_time}</td>
                            <td>{log.end_date_time}</td>
                            <td>{log.total_time}</td>
                            <td>{log.pms_package}</td>
                            <td>{log.issued_to}</td>
                            <td>{log.issued_by}</td>
                            <td>{log.remarks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </form>
    </div>
  );
};

export default PreventiveMaintenanceLog;
