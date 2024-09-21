// //Inventorylog.jsx
// import React, { useState, useEffect } from "react";
// import { Card, CardContent, Grid, TextField, Button, Autocomplete } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import axios from "axios";

// const InventoryLog = () => {
//   const theme = useTheme();

//   // State for the selected part, part details, and inventory data
//   const [partName, setPartName] = useState("");
//   const [partCode, setPartCode] = useState("");
//   const [partCost, setPartCost] = useState("");
//   const [partOpenBalance, setPartOpenBalance] = useState(0);
//   const [month, setMonth] = useState("");
//   const [year, setYear] = useState("");
//   const [used, setUsed] = useState(0);
//   const [bought, setBought] = useState(0);
//   const [totalStock, setTotalStock] = useState(0);
//   const [partList, setPartList] = useState([]);
//   const [yearlySummary, setYearlySummary] = useState({ totalUsed: 0, totalBought: 0 });

//   // Fetch the list of parts from the API on component mount
//   useEffect(() => {
//     const fetchPartNames = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/parts");
//         setPartList(response.data);
//       } catch (error) {
//         console.error("Error fetching part names:", error);
//       }
//     };
//     fetchPartNames();
//   }, []);

//   // Handle part selection and fetch part details
//   const handlePartNameChange = async (event, newPartName) => {
//     setPartName(newPartName);

//     const selectedPart = partList.find((part) => part.part_name === newPartName);

//     if (selectedPart) {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/parts/${selectedPart.part_id}`);

//         if (response && response.data) {
//           const partDetails = response.data;
//           setPartCode(partDetails.part_code || "");
//           setPartCost(partDetails.part_cost || "");
//           setPartOpenBalance(partDetails.open_balance || 0);
//           setTotalStock(partDetails.open_balance || 0);
//         }
//       } catch (error) {
//         console.error("Error fetching part details:", error);
//       }
//     }
//   };

//   // Handle changes to the 'Used' field and update total stock accordingly
//   const handleUsedChange = (e) => {
//     const usedQty = parseInt(e.target.value, 10) || 0;
//     setUsed(usedQty);
//     const newOpenBalance = partOpenBalance - usedQty;
//     setPartOpenBalance(newOpenBalance > 0 ? newOpenBalance : 0);
//     setTotalStock(newOpenBalance + bought);
//   };

//   // Handle changes to the 'Bought' field and update total stock accordingly
//   const handleBoughtChange = (e) => {
//     const boughtQty = parseInt(e.target.value, 10) || 0;
//     setBought(boughtQty);
//     const newOpenBalance = partOpenBalance + boughtQty;
//     setPartOpenBalance(newOpenBalance);
//     setTotalStock(newOpenBalance);
//   };

//   // Submit the inventory data to the backend
//   const SubmitInformation = async (e) => {
//     e.preventDefault();

//     try {
//       const selectedPart = partList.find((part) => part.part_name === partName);

//       if (selectedPart) {
//         await axios.post("http://localhost:5000/api/inventory", {
//           part_id: selectedPart.part_id,
//           month,
//           year,
//           used,
//           bought,
//           stock: totalStock,
//         });

//         // Update the open balance for the selected part
//         await axios.put(`http://localhost:5000/api/parts/update-balance/${selectedPart.part_id}`, {
//           newOpenBalance: totalStock,
//         });

//         alert("Inventory information recorded and open balance updated successfully.");
//       } else {
//         alert("Part not selected.");
//       }
//     } catch (error) {
//       console.error("Error recording inventory or updating balance:", error);
//     }
//   };

//   // Fetch yearly summary for the selected part and year
//   const fetchYearlySummary = async () => {
//     try {
//       const selectedPart = partList.find((part) => part.part_name === partName);

//       if (selectedPart) {
//         const response = await axios.post(`http://localhost:5000/api/yearly-summary/${selectedPart.part_id}/${year}`);

//         if (response && response.data) {
//           setYearlySummary({
//             totalUsed: response.data.total_used || 0,
//             totalBought: response.data.total_bought || 0,
//           });
//         } else {
//           console.error("No summary data received.");
//         }
//       } else {
//         alert("Part not selected.");
//       }
//     } catch (error) {
//       console.error("Error fetching yearly summary:", error);
//     }
//   };

//   return (
//     <div style={{ margin: "20px" }}>
//       <h1 style={{ textAlign: "center" }}>Inventory Log</h1>
//       <Card style={{ padding: "20px", backgroundColor: theme.palette.background.default }}>
//         <CardContent>
//           <form onSubmit={SubmitInformation}>
//             <Grid container spacing={2}>
//               {/* Autocomplete Part Name */}
//               <Grid item xs={12} sm={6}>
//                 <Autocomplete
//                   options={partList.map((part) => part.part_name)} // Autocomplete options: part names
//                   value={partName}
//                   onChange={handlePartNameChange}
//                   renderInput={(params) => (
//                     <TextField {...params} label="Part Name" variant="outlined" fullWidth />
//                   )}
//                 />
//               </Grid>
              
//               {/* Part Code */}
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Part Code" variant="outlined" fullWidth value={partCode} disabled />
//               </Grid>

//               {/* Part Cost */}
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Part Cost" variant="outlined" fullWidth value={partCost} disabled />
//               </Grid>

//               {/* Open Balance */}
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Open Balance" variant="outlined" fullWidth value={partOpenBalance} disabled />
//               </Grid>

//               {/* Month and Year Fields */}
//               <Grid item xs={12} sm={6}>
//                 <TextField id="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} variant="outlined" fullWidth />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField id="year" label="Year" value={year} onChange={(e) => setYear(e.target.value)} variant="outlined" fullWidth />
//               </Grid>

//               {/* Used and Bought Fields */}
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Used" variant="outlined" fullWidth value={used} onChange={handleUsedChange} />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Bought" variant="outlined" fullWidth value={bought} onChange={handleBoughtChange} />
//               </Grid>

//               {/* Total Stock */}
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Total Stock" variant="outlined" fullWidth value={totalStock} disabled />
//               </Grid>

//               {/* Submit Button */}
//               <Grid item xs={12}>
//                 <Button type="submit" variant="contained" color="primary" fullWidth>
//                   Submit Inventory
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>

//           {/* Yearly Summary Section */}
//           <div style={{ marginTop: "20px" }}>
//             <h2>Yearly Summary</h2>
//             <Button variant="outlined" color="secondary" onClick={fetchYearlySummary}>
//               Fetch Yearly Summary
//             </Button>

//             <Grid container spacing={2} style={{ marginTop: "10px" }}>
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Total Used" variant="outlined" fullWidth value={yearlySummary.totalUsed} disabled />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField label="Total Bought" variant="outlined" fullWidth value={yearlySummary.totalBought} disabled />
//               </Grid>
//             </Grid>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default InventoryLog;
import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, TextField, Button, Autocomplete } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const InventoryLog = () => {
  const theme = useTheme();

  // State for the selected part, part details, and inventory data
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

  // Fetch the list of parts from the API on component mount
  useEffect(() => {
    const fetchPartNames = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/parts");
        setPartList(response.data);
      } catch (error) {
        console.error("Error fetching part names:", error);
      }
    };
    fetchPartNames();
  }, []);

  // Handle part selection and fetch part details
  const handlePartNameChange = async (event, newPartName) => {
    setPartName(newPartName);

    const selectedPart = partList.find((part) => part.part_name === newPartName);

    if (selectedPart) {
      try {
        const response = await axios.get(`http://localhost:5000/api/parts/${selectedPart.part_id}`);

        if (response && response.data) {
          const partDetails = response.data;
          setPartCode(partDetails.part_code || "");
          setPartCost(partDetails.part_cost || "");
          setPartOpenBalance(partDetails.open_balance || 0);
          setTotalStock(partDetails.open_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching part details:", error);
      }
    }
  };

  // Handle changes to the 'Bought' field and update total stock accordingly
  const handleBoughtChange = (e) => {
    const boughtQty = parseInt(e.target.value, 10) || 0;
    setBought(boughtQty);
    const newOpenBalance = partOpenBalance + boughtQty;
    setPartOpenBalance(newOpenBalance);
    setTotalStock(newOpenBalance);
  };

  // Submit the inventory data to the backend
  const SubmitInformation = async (e) => {
    e.preventDefault();

    try {
      const selectedPart = partList.find((part) => part.part_name === partName);

      if (selectedPart) {
        await axios.post("http://localhost:5000/api/inventory", {
          part_id: selectedPart.part_id,
          month,
          year,
          bought,
          stock: totalStock,
        });

        // Update the open balance for the selected part
        await axios.put(`http://localhost:5000/api/parts/update-balance/${selectedPart.part_id}`, {
          newOpenBalance: totalStock,
        });

        alert("Inventory information recorded and open balance updated successfully.");
      } else {
        alert("Part not selected.");
      }
    } catch (error) {
      console.error("Error recording inventory or updating balance:", error);
    }
  };

  // Fetch yearly summary for the selected part and year
  const fetchYearlySummary = async () => {
    try {
      const selectedPart = partList.find((part) => part.part_name === partName);

      if (selectedPart) {
        const response = await axios.post(`http://localhost:5000/api/yearly-summary/${selectedPart.part_id}/${year}`);

        if (response && response.data) {
          setYearlySummary({
            totalUsed: response.data.total_used || 0,
            totalBought: response.data.total_bought || 0,
          });
        } else {
          console.error("No summary data received.");
        }
      } else {
        alert("Part not selected.");
      }
    } catch (error) {
      console.error("Error fetching yearly summary:", error);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Inventory Log</h1>
      <Card style={{ padding: "20px", backgroundColor: theme.palette.background.default }}>
        <CardContent>
          <form onSubmit={SubmitInformation}>
            <Grid container spacing={2}>
              {/* Autocomplete Part Name */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={partList.map((part) => part.part_name)} // Autocomplete options: part names
                  value={partName}
                  onChange={handlePartNameChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Part Name" variant="outlined" fullWidth />
                  )}
                />
              </Grid>
              
              {/* Part Code */}
              <Grid item xs={12} sm={6}>
                <TextField label="Part Code" variant="outlined" fullWidth value={partCode} disabled />
              </Grid>

              {/* Part Cost */}
              <Grid item xs={12} sm={6}>
                <TextField label="Part Cost" variant="outlined" fullWidth value={partCost} disabled />
              </Grid>

              {/* Open Balance */}
              <Grid item xs={12} sm={6}>
                <TextField label="Open Balance" variant="outlined" fullWidth value={partOpenBalance} disabled />
              </Grid>

              {/* Month and Year Fields */}
              <Grid item xs={12} sm={6}>
                <TextField id="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} variant="outlined" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField id="year" label="Year" value={year} onChange={(e) => setYear(e.target.value)} variant="outlined" fullWidth />
              </Grid>

              {/* Bought Field */}
              <Grid item xs={12} sm={6}>
                <TextField label="Bought" variant="outlined" fullWidth value={bought} onChange={handleBoughtChange} />
              </Grid>

              {/* Total Stock */}
              <Grid item xs={12} sm={6}>
                <TextField label="Total Stock" variant="outlined" fullWidth value={totalStock} disabled />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Submit Inventory
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Yearly Summary Section */}
          <div style={{ marginTop: "20px" }}>
            <h2>Yearly Summary</h2>
            <Button variant="outlined" color="secondary" onClick={fetchYearlySummary}>
              Fetch Yearly Summary
            </Button>

            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12} sm={6}>
                <TextField label="Total Used" variant="outlined" fullWidth value={yearlySummary.totalUsed} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Total Bought" variant="outlined" fullWidth value={yearlySummary.totalBought} disabled />
              </Grid>
            </Grid>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryLog;
