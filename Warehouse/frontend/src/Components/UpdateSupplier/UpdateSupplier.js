import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './UpdateSupplier.css';

function UpdateSupplier() {
  const [inputs, setInputs] = useState({
    Name: '',
    Person: '',
    Email: '',
    Material: '',
    Status: 'active',
    Address: '',
    ContactNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // success or error message
  const { Id } = useParams();

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/suppliers/${Id}`);
        setInputs(res.data.suppliers);
      } catch (err) {
        console.error('Error fetching supplier:', err);
        setMessage({ type: 'error', text: 'Failed to fetch supplier data.' });
      }
    };
    fetchSupplier();
  }, [Id]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Validation
  const validate = () => {
    const tempErrors = {};
    if (!inputs.Name.trim()) tempErrors.Name = "Name is required.";
    if (!inputs.Person.trim()) tempErrors.Person = "Contact person is required.";
    if (!inputs.Email.trim()) tempErrors.Email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(inputs.Email)) tempErrors.Email = "Email is invalid.";
    if (!inputs.ContactNumber.trim()) tempErrors.ContactNumber = "Contact number is required.";
    else if (!/^\d{7,15}$/.test(inputs.ContactNumber)) tempErrors.ContactNumber = "Contact number must be 7-15 digits.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit updated supplier
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.put(`http://localhost:5000/suppliers/${Id}`, {
        Name: inputs.Name.trim(),
        Person: inputs.Person.trim(),
        Email: inputs.Email.trim(),
        Material: inputs.Material.trim(),
        Status: inputs.Status.trim(),
        Address: inputs.Address.trim(),
        ContactNumber: inputs.ContactNumber.trim(),
      });

      setMessage({ type: 'success', text: 'Supplier updated successfully!', data: res.data.supplier });
      // Optionally: navigate('/suppliers'); // if you want to go back after a few seconds
    } catch (err) {
      console.error('Error updating supplier:', err);
      setMessage({ type: 'error', text: 'Failed to update supplier. Please try again.' });
    }
  };

  return (
    <div className="update-supplier-wrapper">
      <div className="update-supplier-card">
        <h2 className="form-title">Update Supplier</h2>

        {message && (
          <div className={`message ${message.type}`}>
            <p>{message.text}</p>
            {message.type === 'success' && message.data && (
              <div className="updated-details">
                <p><strong>Name:</strong> {message.data.Name}</p>
                <p><strong>Contact Person:</strong> {message.data.Person}</p>
                <p><strong>Email:</strong> {message.data.Email}</p>
                <p><strong>Material:</strong> {message.data.Material}</p>
                <p><strong>Status:</strong> {message.data.Status}</p>
                <p><strong>Address:</strong> {message.data.Address}</p>
                <p><strong>Contact Number:</strong> {message.data.ContactNumber}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Name', name: 'Name', type: 'text' },
            { label: 'Contact Person', name: 'Person', type: 'text' },
            { label: 'Email', name: 'Email', type: 'email' },
            { label: 'Material', name: 'Material', type: 'text' },
            { label: 'Address', name: 'Address', type: 'text' },
            { label: 'Contact Number', name: 'ContactNumber', type: 'text' },
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <input
                type={field.type}
                name={field.name}
                value={inputs[field.name]}
                onChange={handleChange}
                required
                className={inputs[field.name] ? 'has-value' : ''}
              />
              <label>{field.label}</label>
              {errors[field.name] && <span className="error">{errors[field.name]}</span>}
            </div>
          ))}

          <div className="form-group select-group">
            <select name="Status" value={inputs.Status} onChange={handleChange}>
              <option value="preferred">Preferred</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">BlackListed</option>
            </select>
            <label>Status</label>
          </div>

          <button type="submit" className="update-btn">Update Supplier</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateSupplier;
