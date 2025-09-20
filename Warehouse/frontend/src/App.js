import { Route, Routes } from "react-router-dom";
import "./App.css";
import Supplier from "./Components/Supplier/Supplier";
import React from "react";
import GetSuppliers from "./Components/GetSuppliers/GetSuppliers"
import AddSupplier from "./Components/AddSupplier/AddSupplier";
import UpdateSupplier from "./Components/UpdateSupplier/UpdateSupplier";

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Supplier />} />

          <Route path="/mainhome" element={<Supplier />} />
          <Route path="/getAll" element={<GetSuppliers />} />
          <Route path="/add" element={<AddSupplier />} />
          <Route path="/getAll/:Id" element={<UpdateSupplier />} />

        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
