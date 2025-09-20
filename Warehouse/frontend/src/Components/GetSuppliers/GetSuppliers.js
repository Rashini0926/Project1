import React, { useState, useEffect, useRef } from "react";
import Supplier from "../Supplier/Supplier";
import axios from "axios";
import Supplierdata from "../Supplierdata/Supplierdata";
import { useReactToPrint } from "react-to-print";
import "../Supplierdata/Supplierdata.css";

const URL = "http://localhost:5000/suppliers";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function GetSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);


  useEffect(() => {
    fetchHandler().then((data) => {
      setSuppliers(data.suppliers);
      setFilteredSuppliers(data.suppliers); });
  }, []);

  const contentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    contentRef: contentRef,
    documentTitle: "Supplier List",

    onAfterPrint: () => alert("Supplier List successfully generated"),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const applyFilters = () => {
    let filtered = suppliers;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (supplier) => supplier.Status.toLowerCase() === statusFilter
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((supplier) =>
        Object.values(supplier).some((field) =>
          field
            ? field.toString().toLowerCase().includes(searchQuery.toLowerCase())
            : false
        )
      );
    }

    setFilteredSuppliers(filtered);
    setNoResults(filtered.length === 0);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleFilter = () => {
    applyFilters();
  };

  return (
    <div>
      <Supplier
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      <div className="filter-container">
        <label>
          <strong>Filter by Status:</strong>
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="preferred">Preferred</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">Blacklisted</option>
        </select>
        <button onClick={handleFilter}>Apply Filter</button>
      </div>
      <div className="download-button-container">
        <button
          className="download-button"
          onClick={handlePrint}
          disabled={!filteredSuppliers || filteredSuppliers.length === 0}
        >
          <span className="icon">⬇️</span> Download Report
        </button>
      </div>

      {noResults ? (
        <div>
          <p>No users Found</p>
        </div>
      ) : (
        <div ref={contentRef}>
          {filteredSuppliers && filteredSuppliers.map((supplierdata, i) => (
              <div key={i}>
                <Supplierdata supplierdata={supplierdata} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default GetSuppliers;
