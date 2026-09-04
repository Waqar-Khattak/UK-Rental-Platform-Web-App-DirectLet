import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const ALL_VERIFICATIONS = gql`
  query AllVerifications($status: String) {
    allVerifications(status: $status) {
      id
      userId
      type
      status
      documentUrl
      verificationDate
      createdAt
    }
  }
`;

const ALL_USERS = gql`
  query AllUsers($role: String) {
    allUsers(role: $role) {
      id
      email
      firstName
      lastName
      role
      isVerified
    }
  }
`;

const UPDATE_VERIFICATION = gql`
  mutation UpdateVerification($id: ID!, $status: String!) {
    updateVerificationStatus(id: $id, status: $status) {
      id
      status
      verificationDate
    }
  }
`;

function AdminVerifications() {
  const { data, loading, refetch } = useQuery(ALL_VERIFICATIONS);
  const { data: usersData } = useQuery(ALL_USERS);
  const [updateVerification] = useMutation(UPDATE_VERIFICATION);

  const verifications = data?.allVerifications || [];
  const users = usersData?.allUsers || [];
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  const handleUpdate = async (id, status) => {
    try {
      await updateVerification({ variables: { id, status } });
      refetch();
      alert('Verification updated');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Admin — Verifications</h1>
        <p className="text-muted">Review and approve or reject user verification requests.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map(v => {
                const u = userMap[v.userId] || { email: v.userId, firstName: '', lastName: '' };
                return (
                  <tr key={v.id}>
                    <td>{u.firstName} {u.lastName} <div className="muted">{u.email}</div></td>
                    <td>{v.type}</td>
                    <td>{v.status}</td>
                    <td>{new Date(v.createdAt).toLocaleString()}</td>
                    <td>
                      {v.status === 'pending' && (
                        <>
                          <button className="btn-action btn-primary-action" onClick={() => handleUpdate(v.id, 'verified')}>Approve</button>
                          <button className="btn-action btn-secondary-action" onClick={() => handleUpdate(v.id, 'failed')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminVerifications;
