import React from "react";

const StudentDashboard = ({ student }) => {
  if (!student) return <p>Loading student data...</p>;

  // Calculate attendance stats
  const totalClasses = student.attendance ? Object.keys(student.attendance).length : 0;
  const attendedClasses = student.attendance
    ? Object.values(student.attendance).filter(Boolean).length
    : 0;
  const attendancePercentage = totalClasses
    ? ((attendedClasses / totalClasses) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-4xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-6">
          <img
            src={student.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-gray-600">Roll No: {student.rollNumber}</p>
            <p className="text-gray-600">
              Class: {student.class} - {student.section}
            </p>
            <p className="text-gray-600">Email: {student.studentMail}</p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Attendance Summary</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">Total Classes: {totalClasses}</p>
              <p className="text-gray-700">Attended: {attendedClasses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold">Percentage</p>
              <p
                className={`text-2xl font-bold ${
                  attendancePercentage >= 75
                    ? "text-green-600"
                    : attendancePercentage >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {attendancePercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Attendance Record</h2>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-medium">Date</th>
                <th className="px-4 py-2 text-left text-gray-700 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance && Object.entries(student.attendance).length ? (
                Object.entries(student.attendance).map(([date, present]) => (
                  <tr key={date} className="border-b border-gray-200">
                    <td className="px-4 py-2">{date}</td>
                    <td className={`px-4 py-2 font-semibold ${present ? "text-green-600" : "text-red-600"}`}>
                      {present ? "Present" : "Absent"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
                    No attendance data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;