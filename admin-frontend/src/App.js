import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './components/AdminLogin';
import AdminNavbar from './components/AdminNavbar';
import UserList from './components/UserList';
import UserDetail from './components/UserDetail';

function AdminApp() {
  const { admin } = useAdmin();
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (!admin) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main>
        {selectedUserId ? (
          <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        ) : (
          <UserList onSelectUser={(id) => setSelectedUserId(id)} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  );
}
