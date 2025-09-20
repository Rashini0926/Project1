import React from "react";
import { useState } from "react";
import "./Supplierdata.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Supplierdata(props) {
  const { Id, Name, Person, ContactNumber, Email, Material, Status, Address } =
    props.supplierdata;

  const [status, setStatus] = useState(Status.toLowerCase()); // track UI status


  const history = useNavigate();
  const deleteHandler = async () => {
    await axios
      .delete(`http://localhost:5000/suppliers/${Id}`)
      .then((res) => res.data)
      .then(() => history("/"))
      .then(() => history("/getAll"));
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await axios.patch(
        `http://localhost:5000/suppliers/${Id}/status`,
        {
          status: newStatus,
        }
      );
      setStatus(res.data.Status); // update UI with new status from DB
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div>
      <div class="supplier-card">
        <div class="supplier-name">{Name}</div>
        <div class="supplier-info">
          <div class="supplier-info-column">
            <p>
              <span class="icon">🆔</span> <strong>Id:</strong> {Id}
            </p>
            <p>
              <span class="icon">👤</span> <strong>Person:</strong> {Person}
            </p>
            <p>
              <span class="icon">📞</span> <strong>Contact:</strong>{" "}
              {ContactNumber}
            </p>
            <p>
              <span class="icon">📧</span> <strong>Email:</strong>
              {Email}
            </p>
          </div>
          <div class="supplier-info-column">
            <p>
              <span class="icon">📦</span> <strong>Material:</strong>
              {Material}
            </p>
            <p>
              <span class="icon">⚡</span> <strong>Status:</strong>
              <span className={`status-badge ${Status.toLowerCase()}`}>
                {status}
              </span>
            </p>
            <p>
              <span class="icon">📍</span> <strong>Address:</strong> {Address}
            </p>
            <p>
              <span className="icon">⚡</span> <strong>Status:</strong>
              <select
                value={status}
                onChange={handleStatusChange}
                className="status-select"
              >
                <option value="preferred">Preferred</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </p>
          </div>
        </div>
        <div class="supplier-card-buttons">
          <button class="edit-button">
            <span class="icon">✏️</span>{" "}
            <Link to={`/getAll/${Id}`} className="active home-a">
              {" "}
              Edit
            </Link>
          </button>
          <button class="delete-button" onClick={deleteHandler}>
            <span class="icon">🗑️</span> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Supplierdata;
