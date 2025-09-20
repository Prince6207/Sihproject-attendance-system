import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Signup from './pages/Signup';
import Attend from './pages/Attendance';
import Login from './pages/Login';
import Tlogin from './pages/tlogin';
import Tsignup from './pages/tsignup';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
const student = {
    name: "Shruti Garg",
    rollNumber: 101,
    class: "B.Tech",
    section: "CSE-A",
    studentMail: "shruti@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    attendance: {
      "2025-09-01": true,
      "2025-09-02": false,
      "2025-09-03": true,
    },
  };
  const teacher = {
  name: "Jane Doe",
  teacherId: "T-12345",
  tclass: ["65d21b77c3e5a5a1f6a1c8d5", "65d21b77c3e5a5a1f6a1c8d6"],
  attendance: {
    "2025-09-18": true,
    "2025-09-19": false,
    "2025-09-20": true,
  },
};

const router=createBrowserRouter([
    {
       path:'/',
    element:<Home></Home> 
    }
    ,
  {
    path:'/signup',
    element:<Signup></Signup>
  },{
    path:'/attend',
    element:<Attend></Attend>
  },{
    path:'/login',
    element:<Login></Login>
  },
    {
      path:'/teacher/login',
      element:<Tlogin></Tlogin>
    },{
      path:'/teacher/signup',
      element:<Tsignup></Tsignup>
    }
    ,{
        path:'/student/dashboard',
        element:<StudentDashboard student={student}></StudentDashboard>
    },
    {
        path:'/teacher/dashboard',
        element:<TeacherDashboard teacher={teacher}></TeacherDashboard>
    }
])
function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
