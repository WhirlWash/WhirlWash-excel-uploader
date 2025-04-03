import React, { useState } from "react";
import * as XLSX from "xlsx";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setMessage("Processing file...");

    try {
      // Read the Excel file
      const data = await readExcelFile(file);

      // Upload to Firebase
      await uploadToFirebase(data);

      setMessage("File uploaded successfully to Firebase!");
    } catch (error) {
      console.error("Error processing file:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData);
        } catch (error) {
          reject(new Error("Failed to parse Excel file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const uploadToFirebase = async (data) => {
    // Import Firebase at the top of your file:
    // import { initializeApp } from "firebase/app";
    // import { getFirestore, collection, addDoc } from "firebase/firestore";

    try {
      // Your Firebase config - you'll need to replace these values with your actual Firebase project details
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
      };

      // Initialize Firebase (you can also do this once at the app level)
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // Upload each row as a document
      const collectionRef = collection(db, "whirlwash-data");

      console.log(`Uploading ${data.length} records to Firebase...`);

      // Upload each item
      for (const item of data) {
        await addDoc(collectionRef, item);
      }

      console.log("Upload complete!");
      return true;
    } catch (error) {
      console.error("Firebase upload error:", error);
      throw new Error("Failed to upload to Firebase: " + error.message);
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "30px",
         
        }}
      >

        <h1
          style={{ fontSize: "40px", color: "#3D4EB0", marginBottom: "30px"}}
        >
          WhirlWash
        </h1>

        <img
          src="/image.png"
          alt="WhirlWash Logo"
          width="50"
          height="50"
          style={{ marginRight: "15px" }}
        />

      </div>

      <div
        style={{
          border: "2px dashed #3D4EB0",
          borderRadius: "10px",
          padding: "30px",
          marginBottom: "20px",
          backgroundColor: "#F8F9FA",
        }}
      >
        <p style={{ marginBottom: "15px" }}>
          Selected file: <strong>{fileName}</strong>
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <input
            type="file"
            id="excel-upload"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <label
            htmlFor="excel-upload"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "#3498DB",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Choose Excel File
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={{
              padding: "12px 20px",
              backgroundColor: file ? "#2ECC71" : "#95A5A6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginRight: "10px",
              cursor: file ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Uploading..." : "Upload to Firebase"}
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "15px",
            backgroundColor: message.includes("Error") ? "#FADBD8" : "#D5F5E3",
            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
