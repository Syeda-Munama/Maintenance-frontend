import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';


const convertExcelDate = (excelSerial) => {
  const excelStartDate = new Date(1899, 11, 30);
  const date = new Date(excelStartDate.getTime() + excelSerial * 86400000);

  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const Validation = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/validation.xlsx') 
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const worksheet = workbook.Sheets['Validation (2)'];

        
        let jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Convert the date field
        jsonData = jsonData.map(item => ({
          ...item,
          Date: convertExcelDate(item.Date)  // Apply conversion here
        }));

        console.log("Parsed JSON Data with Date Conversion:", jsonData);

        setData(jsonData);
      })
      .catch(error => console.error('Error fetching or parsing Excel file:', error));
  }, []);

  return (
    <div>
      <h1>Validation Data</h1>
      <table>
        <thead>
          <tr>
            <th>Machine No</th>
            <th>Maintenance Type</th>
            <th>Date</th>
            <th>Fault Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item['Machine No']}</td>
              <td>{item['Maintenance Type']}</td>
              <td>{item['Date']}</td>
              <td>{item['Fault Type']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Validation;