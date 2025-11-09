import React from 'react';

const SettingsContent = () => {
  return (
    <div className="p-4">
      <h2 className="mb-4">System Settings</h2>
      <div className="card">
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label className="form-label">Site Name</label>
              <input type="text" className="form-control" defaultValue="Tourist Travel Agency" />
            </div>
            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <input type="email" className="form-control" defaultValue="admin@example.com" />
            </div>
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <select className="form-select">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;