
//import { useNavigate } from 'react-router-dom'
import Nav from '../Nav/Nav';
import React, {useState} from 'react';
import axios from 'axios';
import './AddSupplier.css'

function AddSupplier() {
    //const history = useNavigate();        
    const [inputs,setInputs] = useState({
        Name:"",
        Person:"",
        Email:"",
        ContactNumber:"",
        Material:"",
        Status:"active",
        Address:"",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [successSupplier, setSuccessSupplier] = useState(null);


  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "Name":
      case "Person":
        if (!/^[A-Za-z\s]{3,50}$/.test(value)) {
          error = "Must be 3–50 letters only";
        }
        break;

      case "ContactNumber":
        if (!/^[0-9]{7,15}$/.test(value)) {
          error = "Must be 7–15 digits";
        }
        break;

      case "Email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Enter a valid email address";
        }
        break;

      case "Material":
        if (!/^[A-Za-z0-9\s]{2,100}$/.test(value)) {
          error = "Must be 2–100 letters/numbers only";
        }
        break;

      case "Address":
        if (value.length < 5 || value.length > 200) {
          error = "Must be 5–200 characters";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };


    const handleChange =(e)=>{
        let { name, value } = e.target;

    // Restrict typing
    if (name === "ContactNumber") {
      value = value.replace(/[^0-9]/g, "").slice(0, 15);
    }
    if (name === "Name" || name === "Person") {
      value = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
    }
    if (name === "Material") {
      value = value.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 100);
    }
    if (name === "Address") {
      value = value.slice(0, 200);
    }
        setInputs((prevState)=> ({
            ...prevState,
            [name]: value,
        }));
        validateField(name, value);
    };
    const handleSubmit = async (e) =>{
      e.preventDefault();

      Object.keys(inputs).forEach((key) => validateField(key, inputs[key]));

    if (Object.values(errors).some((err) => err)) {
      setMessage({ type: "error", text: "Please fix the errors above" });
      return;
    }

    try {
      const newSupplier = await sendRequest();
      setSuccessSupplier(newSupplier);
      setMessage(null);

      // Reset form
      setInputs({
        Name: "",
        Person: "",
        ContactNumber: "",
        Email: "",
        Material: "",
        Status: "active",
        Address: ""
      });
      setErrors({});
    } catch (err) {
      let errorMsg = "Failed to add supplier";

        if (err.response?.data?.message) {
            errorMsg = err.response.data.message;
      }     
      else if (err.response?.data?.errors) {
    // If it's a mongoose validation error, errors object might exist
      errorMsg = Object.values(err.response.data.errors)
      .map(e => e.message)
      .join(", ");
  }

  setMessage({ type: "error", text: errorMsg });
  setSuccessSupplier(null);
    }
    }
    const sendRequest = async()=>{
      try{
        console.log("Submitting supplier data:", inputs);
        const res = await axios.post("http://localhost:5000/suppliers",{
            Name: String(inputs.Name).trim(),
            Person: String(inputs.Person).trim(),
            Email: String(inputs.Email).trim(),
            Material: String(inputs.Material).trim(),
            Status: String(inputs.Status).trim(),
            Address: String(inputs.Address).trim(),
            ContactNumber: String(inputs.ContactNumber).trim(),
        });
        return res.data;
      }
      catch(err){
        console.error("Error response:", err.response?.data || err.message);
        console.error(err.response?.data || err.message);
        throw err;
      }
    }

  return (
    <div>
      <Nav/>
      <div class="form-container">
    <h2>Add Supplier</h2>
      {message && message.type === "error" && (
        <div
          style={{
            border: "1px solid red",
            backgroundColor: "#ffe6e6",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "red", marginBottom: "10px" }}>Error</h3>
          <p>{message.text}</p>
        </div>
      )}
      {successSupplier && (
        <div
          style={{
            border: "1px solid green",
            backgroundColor: "#e6ffed",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          }}
        >
          <h3 style={{ color: "green", marginBottom: "10px" }}>Supplier Added Successfully!</h3>
          <p><strong>ID:</strong> {successSupplier.Id}</p>
          <p><strong>Name:</strong> {successSupplier.Name}</p>
          <p><strong>Email:</strong> {successSupplier.Email}</p>
          <p><strong>Contact:</strong> {successSupplier.ContactNumber}</p>
          <p><strong>Material:</strong> {successSupplier.Material}</p>
        </div>
      )}
    <form onSubmit={handleSubmit}>
      <div class="form-group">
        <input type="text" name='Name' value={inputs.Name} onChange={handleChange} id="name" placeholder="Enter Supplier Name" required></input>
        {errors.Name && <small style={{ color: "red" }}>{errors.Name}</small>}
      </div>

      <div class="form-group">
        <input type="text" name='Person' value={inputs.Person} onChange={handleChange} id="person" placeholder="Enter Contact Person" required></input>
        {errors.Person && <small style={{ color: "red" }}>{errors.Person}</small>}
      </div>

      <div class="form-group">
        <input type="email" name='Email' value={inputs.Email} onChange={handleChange} id="email" placeholder="Enter Email" required></input>
        {errors.Email && <small style={{ color: "red" }}>{errors.Email}</small>}
      </div>

      <div class="form-group">
        <input type="text" name='Material' value={inputs.Material} onChange={handleChange} id="material" placeholder="Enter Material" required></input>
        {errors.Material && <small style={{ color: "red" }}>{errors.Material}</small>}
      </div>

      <div class="form-group">
        <select id="status" name='Status' value={inputs.Status} onChange={handleChange} required>
          <option value="">Select Status</option>
          <option value="preferred">Preferred</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">BlackListed</option>
        </select>
      </div>

      <div class="form-group">
        <input type="text" name='Address' value={inputs.Address} onChange={handleChange} id="address" placeholder="Enter Address" required></input>
        {errors.Address && <small style={{ color: "red" }}>{errors.Address}</small>}
      </div>

      <div class="form-group">
        <input type="tel" name='ContactNumber' value={inputs.ContactNumber} onChange={handleChange} id="contact" placeholder="Enter Contact Number" required></input>
        {errors.ContactNumber && <small style={{ color: "red" }}>{errors.ContactNumber}</small>}
      </div>

      <div class="btn-group">
        <button type="submit" class="btn btn-primary" disabled={Object.values(errors).some(e => e)}>Add Supplier</button>
        <button type="button" className="btn btn-danger">Back to Dashboard</button>
      </div>
    </form>
  </div>
    </div>
  )
}

export default AddSupplier
