import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const UsersContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/get_users.php`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (data.success) {
        // Filter out admin users (assuming admin has role 'admin')
        const nonAdminUsers = data.data.filter((user) => user.role !== "admin");
        setUsers(nonAdminUsers);
      } else {
        throw new Error(data.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/admin_crud/delete_user.php?id=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchUsers(); // Refresh the user list
        } else {
          throw new Error(data.message || "Failed to delete user");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
        Loading users...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">User Management</h2>
      <div className="card">
        {/*<div className="card-header d-flex justify-content-between align-items-center">
          <h5>All Users</h5>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New User
          </button>
        </div>*/}
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  {/*<th>ID</th>*/}
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      {/*<td>{user.id}</td>*/}
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "admin" ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        {/*<button className="btn btn-sm btn-outline-primary me-2">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>*/}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersContent;
