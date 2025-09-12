"use client";

import { useEffect, useState } from "react";
import { getUsersWithRoles, updateUserRole } from "@/services/firestore";
// Removed duplicate useState imports

export default function UsersRolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const usersData = await getUsersWithRoles();
        setUsers(usersData);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.uid === uid ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      alert("Failed to update role");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users & Roles</h1>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-center align-middle">Name</th>
            <th className="border px-4 py-2 text-center align-middle">Email</th>
            <th className="border px-4 py-2 text-center align-middle">Role</th>
            <th className="border px-4 py-2 text-center align-middle">Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.uid}
              className="cursor-pointer hover:bg-red-50"
              onClick={() => {
                setUserToDelete(user);
                setShowDeleteModal(true);
              }}
            >
              <td className="border px-4 py-2 align-middle"><div className="w-full text-center">{user.displayName || "-"}</div></td>
              <td className="border px-4 py-2 align-middle"><div className="w-full text-center">{user.email}</div></td>
              <td className="border px-4 py-2 align-middle"><div className="w-full text-center">{user.role || "user"}</div></td>
              <td className="border px-4 py-2 align-middle"><div className="w-full text-center">
                <select
                  value={user.role || "user"}
                  onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/*
      Delete User Modal
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-4 border-green-500">
            <h2 className="text-xl font-bold mb-2 text-red-600">Delete User</h2>
            <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{userToDelete.displayName || userToDelete.email}</span>?<br/>This action <span className="font-bold text-red-600">cannot be undone</span> and will remove the user from authentication.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
              >
                Delete
              </button>
            </div>
            {deleteError && <div className="text-red-600 mt-2">{deleteError}</div>}
          </div>
        </div>
      )}
      */}
    </div>
  );
}
