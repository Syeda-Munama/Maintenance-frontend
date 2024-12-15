
import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, TextField, Button, Autocomplete } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";


const InventoryLog = () => {
  const theme = useTheme();

  // State management
  const [partName, setPartName] = useState("");
  const [partCode, setPartCode] = useState("");
  const [partCost, setPartCost] = useState("");
  const [partOpenBalance, setPartOpenBalance] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [bought, setBought] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [partList, setPartList] = useState([]);
  const [yearlySummary, setYearlySummary] = useState({ totalUsed: 0, totalBought: 0 });
  const [inventoryData, setInventoryData] = useState([]);

  // Fetch part list on component mount
  useEffect(() => {
    const fetchPartList = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/parts");
        setPartList(response.data);
      } catch (error) {
        console.error("Error fetching part list:", error);
      }
    };
    fetchPartList();
  }, []);

  // Handle part selection
  const handlePartNameChange = async (event, newPartName) => {
    setPartName(newPartName);

    const selectedPart = partList.find((part) => part.part_name === newPartName);
    if (selectedPart) {
      try {
        const response = await axios.get(`http://localhost:5000/api/parts/${selectedPart.part_id}`);
        const { part_code, part_cost, open_balance } = response.data;

        setPartCode(part_code || "");
        setPartCost(part_cost || "");
        setPartOpenBalance(open_balance || 0);
        setTotalStock(open_balance || 0);
      } catch (error) {
        console.error("Error fetching part details:", error);
      }
    }
  };

  // Handle 'Bought' field changes
  const handleBoughtChange = (e) => {
    const boughtQty = parseInt(e.target.value, 10) || 0;
    setBought(boughtQty);
    setTotalStock(partOpenBalance + boughtQty);
  };

  // Submit inventory data
  const submitInformation = async (e) => {
    e.preventDefault();

    const selectedPart = partList.find((part) => part.part_name === partName);
    if (!selectedPart) {
      alert("Please select a valid part.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/inventory", {
        part_id: selectedPart.part_id,
        month,
        year,
        bought,
        stock: totalStock,
      });

      await axios.put(`http://localhost:5000/api/parts/update-balance/${selectedPart.part_id}`, {
        newOpenBalance: totalStock,
      });

      alert("Inventory information recorded successfully.");
    } catch (error) {
      console.error("Error recording inventory:", error);
    }
  };

  // Fetch yearly summary
  const fetchYearlySummary = async () => {
    const selectedPart = partList.find((part) => part.part_name === partName);
    if (!selectedPart) {
      alert("Please select a valid part.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/yearly-summary/${selectedPart.part_id}/${year}`);
      const { total_used, total_bought } = response.data;

      setYearlySummary({
        totalUsed: total_used || 0,
        totalBought: total_bought || 0,
      });
    } catch (error) {
      console.error("Error fetching yearly summary:", error);
    }
  };

  // Fetch combined data
  const fetchCombinedData = async () => {
    const selectedPart = partList.find((part) => part.part_name === partName);
    if (!selectedPart) {
      alert("Please select a valid part.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/get-inventory/combined-data/${selectedPart.part_id}/${year}`
      );
      const { yearlySummary, inventoryData } = response.data;

      setYearlySummary({
        totalUsed: yearlySummary.totalUsed,
        totalBought: yearlySummary.totalBought,
      });
      setInventoryData(inventoryData || []);
    } catch (error) {
      console.error("Error fetching combined data:", error);
    }
  };

  const fetchCompleteHistory = async () => {
    try {
      const selectedPart = partList.find((part) => part.part_name === partName);
  
      if (selectedPart) {
        const startYear = 2000; // Starting year for the history
        const currentYear = new Date().getFullYear(); // Current year
        const allData = []; // Array to store the combined data
  
        // Array of promises for parallel fetching
        const fetchPromises = [];
  
        for (let year = startYear; year <= currentYear; year++) {
          fetchPromises.push(
            axios.get(
              `http://localhost:5000/api/get-inventory/combined-data/${selectedPart.part_id}/${year}`
            )
          );
        }
  
        // Wait for all promises to resolve
        const results = await Promise.all(fetchPromises);
  
        // Combine the results
        results.forEach((response) => {
          if (response && response.data) {
            allData.push(...response.data);
          }
        });
  
        // Set the aggregated data to the state
        setInventoryData(allData);
      } else {
        alert("Part not found.");
      }
    } catch (error) {
      console.error("Error fetching complete history:", error);
    }
  };
  
  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Data", 14, 10);

    const tableData = inventoryData.map((row) => [
      row.month,
      row.year,
      row.bought,
      row.stock,
    ]);
    autoTable(doc, {
      head: [["Month", "Year", "Bought", "Stock"]],
      body: tableData,
    });

    doc.save("InventoryData.pdf");
  };

  // Download as Excel
  const downloadAsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventoryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InventoryData");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "InventoryData.xlsx");
  };


  return (
    <div style={{ margin: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Inventory Log</h1>
      <Card style={{ padding: "20px", backgroundColor: theme.palette.background.default }}>
        <CardContent>
          <form onSubmit={submitInformation}>
            <Grid container spacing={2}>
              {/* Part Name */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={partList.map((part) => part.part_name)}
                  value={partName}
                  onChange={handlePartNameChange}
                  renderInput={(params) => <TextField {...params} label="Part Name" variant="outlined" fullWidth />}
                />
              </Grid>

              {/* Part Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Part Code"
                  variant="outlined"
                  fullWidth
                  value={partCode}
                  disabled
                />
              </Grid>

              {/* Part Cost */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Part Cost"
                  variant="outlined"
                  fullWidth
                  value={partCost}
                  disabled
                />
              </Grid>

              {/* Open Balance */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Open Balance"
                  variant="outlined"
                  fullWidth
                  value={partOpenBalance}
                  disabled
                />
              </Grid>

              {/* Month and Year */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Month"
                  variant="outlined"
                  fullWidth
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year"
                  variant="outlined"
                  fullWidth
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Grid>

              {/* Bought */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bought"
                  variant="outlined"
                  fullWidth
                  value={bought}
                  onChange={handleBoughtChange}
                />
              </Grid>

              {/* Total Stock */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Stock"
                  variant="outlined"
                  fullWidth
                  value={totalStock}
                  disabled
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Submit Inventory
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Yearly Summary */}
          <div style={{ marginTop: "20px" }}>
            <h2>Yearly Summary</h2>
            <Button variant="outlined" color="secondary" onClick={fetchYearlySummary}>
              Fetch Yearly Summary
            </Button>
            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Used"
                  variant="outlined"
                  fullWidth
                  value={yearlySummary.totalUsed}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Bought"
                  variant="outlined"
                  fullWidth
                  value={yearlySummary.totalBought}
                  disabled
                />
              </Grid>
            </Grid>
          </div>

          {/* Combined Data */}
          <div style={{ marginTop: "20px" }}>
            <h2>Inventory Data</h2>
            <Button variant="outlined" color="secondary" onClick={fetchCombinedData}>
              Fetch Combined Data
            </Button>
            <div style={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              onClick={downloadAsPDF}
            >
              Download as PDF
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={downloadAsExcel}
            >
              Download as Excel
            </Button>
          </div>
            {inventoryData.length > 0 ? (
  <table
    style={{
      width: "100%",
      marginTop: "10px",
      borderCollapse: "collapse",
    }}
  >
    <thead>
      <tr>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Month</th>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Year</th>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Bought</th>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Stock</th>
      </tr>
    </thead>
    <tbody>
      {inventoryData.map((row, index) => (
        <tr key={index}>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.month}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.year}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.bought}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.stock}</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p style={{ marginTop: "10px" }}>No inventory data available.</p>
)}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryLog;
