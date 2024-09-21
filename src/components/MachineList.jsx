
import React, { useEffect, useState } from "react";
import * as xlsx from "xlsx";

const MachineList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/Machine_List.xlsx')
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const workbook = xlsx.read(buffer, { type: 'array' });
        const worksheet = workbook.Sheets['Machine List (2)'];
        let jsonData = xlsx.utils.sheet_to_json(worksheet);

        console.log("Parsed Json Data:", jsonData);
        
        setData(jsonData);
      })
      .catch(error => console.error('Error fetching or parsing Excel file:', error));
  }, []);

  return (
    <div>
      <h1>Machine List and Status</h1>
      <table>
        <thead>
          <tr>
            <th>S#</th>
            <th>Department</th>
            <th>Machine Type</th>
            <th>Brand Name</th>
            <th>QTY</th>
            <th>Running</th>
            <th>Idle</th>
            <th>Product</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item['S#']}</td>
              <td>{item['Department']}</td>
              <td>{item['Machine Type']}</td>
              <td>{item['Brand Name']}</td>
              <td>{item['QTY']}</td>
              <td>{item['Running']}</td>
              <td>{item['Idle']}</td>
              <td>{item['Product']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MachineList;