import React from 'react';

const TeacherDashboard = ({ teacher }) => {
  if (!teacher) {
    return <div>No teacher data available.</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teacher Dashboard</h1>
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Teacher Details</h2>
        <p><strong>Name:</strong> {teacher.name}</p>
        <p><strong>Teacher ID:</strong> {teacher.teacherId}</p>
        <div>
          <h3>Assigned Classes</h3>
          {teacher.tclass && teacher.tclass.length > 0 ? (
            <ul>
              {teacher.tclass.map((classId) => (
                <li key={classId}>{classId}</li>
              ))}
            </ul>
          ) : (
            <p>No classes assigned.</p>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Attendance Record</h2>
        {teacher.attendance && Object.keys(teacher.attendance).length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(teacher.attendance).map(([date, isPresent]) => (
                <tr key={date}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{date}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', color: isPresent ? 'green' : 'red' }}>
                    {isPresent ? 'Present' : 'Absent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance record available.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;