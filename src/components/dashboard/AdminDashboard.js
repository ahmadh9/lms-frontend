import React, { useState, useEffect } from 'react';
import './AdminDashboard.css'; // Import CSS file

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, users, courses

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const usersRes = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      const coursesRes = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all related data?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('Course deleted successfully');
        setCourses(courses.filter(c => c.id !== courseId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const approveCourse = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        alert('Course approved successfully');
        loadData();
      } else {
        alert('Failed to approve course');
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const rejectCourse = async (courseId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          is_approved: false,
          rejection_reason: reason
        })
      });
      
      if (res.ok) {
        alert('Course rejected successfully');
        loadData();
      } else {
        alert('Failed to reject course');
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const pendingCourses = courses.filter(c => !c.is_approved && c.status !== 'rejected');

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">System administration and management</p>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} 
          className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <button 
          className={activeView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('dashboard')}
        >
          📊 Dashboard Overview
        </button>
        <button 
          className={activeView === 'users' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('users')}
        >
          👥 User Management ({users.length})
        </button>
        <button 
          className={activeView === 'courses' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveView('courses')}
        >
          📚 Course Management ({courses.length})
        </button>
      </div>

      {/* Dashboard Overview */}
      {activeView === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{courses.length}</h3>
                <p>Total Courses</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{pendingCourses.length}</h3>
                <p>Pending Approval</p>
              </div>
            </div>
          </div>

          {pendingCourses.length > 0 && (
            <div className="section">
              <h2 className="section-title">⏳ Pending Course Approvals</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Instructor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCourses.map(course => (
                      <tr key={course.id}>
                        <td>{course.id}</td>
                        <td>{course.title}</td>
                        <td>{course.instructor_name}</td>
                        <td>
                          <button onClick={() => approveCourse(course.id)} className="btn btn-success">
                            Approve
                          </button>
                          <button onClick={() => rejectCourse(course.id)} className="btn btn-danger">
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Management */}
      {activeView === 'users' && (
        <div className="section">
          <h2 className="section-title">👥 User Management</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'admin' && (
                        <button onClick={() => deleteUser(user.id)} className="btn btn-danger">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Management */}
      {activeView === 'courses' && (
        <div className="section">
          <h2 className="section-title">📚 Course Management</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.title}</td>
                    <td>{course.instructor_name}</td>
                    <td>
                      <span className={`status-badge status-${course.status || (course.is_approved ? 'approved' : 'pending')}`}>
                        {course.status || (course.is_approved ? 'approved' : 'pending')}
                      </span>
                    </td>
                    <td>{new Date(course.created_at).toLocaleDateString()}</td>
                    <td>
                      {!course.is_approved && course.status !== 'rejected' && (
                        <>
                          <button onClick={() => approveCourse(course.id)} className="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button onClick={() => rejectCourse(course.id)} className="btn btn-warning btn-sm">
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteCourse(course.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;