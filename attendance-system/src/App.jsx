import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Signup from './pages/Signup';
import Attend from './pages/Attendance';
import Login from './pages/Login';
import Tlogin from './pages/tlogin';
import Tsignup from './pages/tsignup';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
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
    }
])
function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
