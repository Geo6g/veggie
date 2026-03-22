"use client";

import { useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { Settings, Save, ToggleLeft, ToggleRight } from "lucide-react";
import "./admin.css";

export default function AdminPage() {
  const { products, updateProduct, toggleAvailability } = useProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditPrice(product.price);
  };

  const handleSave = (product: any) => {
    updateProduct({ ...product, price: editPrice });
    setEditingId(null);
  };

  return (
    <div className="container section pt-header">
      <div className="admin-header">
        <Settings size={32} color="var(--primary-color)" />
        <h1 className="title mb-0">Admin Dashboard</h1>
      </div>
      
      <div className="admin-panel glass-panel">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={!product.isAvailable ? 'row-disabled' : ''}>
                  <td>
                    <div className="admin-product-info">
                      <div className="admin-img-placeholder">
                        {product.image ? <img src={product.image} alt={product.name} /> : <span>No Img</span>}
                      </div>
                      <div>
                        <p className="fw-600">{product.name}</p>
                        <p className="fs-sm text-muted">{product.packSize}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-category">{product.categoryId}</span></td>
                  <td>
                    {editingId === product.id ? (
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="admin-input"
                      />
                    ) : (
                      <span>₹{product.price}</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="toggle-btn" 
                      onClick={() => toggleAvailability(product.id)}
                      title={product.isAvailable ? "Mark Out of Stock" : "Mark In Stock"}
                    >
                      {product.isAvailable ? (
                        <ToggleRight size={28} color="var(--primary-color)" />
                      ) : (
                        <ToggleLeft size={28} color="var(--text-muted)" />
                      )}
                    </button>
                    <span className="fs-sm ml-2">
                       {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    {editingId === product.id ? (
                      <button className="btn btn-sm btn-primary" onClick={() => handleSave(product)}>
                        <Save size={16} className="mr-1" /> Save
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(product)}>
                        Edit Price
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
