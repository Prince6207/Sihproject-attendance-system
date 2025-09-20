import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Signup from './pages/Signup';
import Attend from './pages/Attendance';
import Login from './pages/Login';
import Tlogin from './pages/tlogin';
import Tsignup from './pages/tsignup';
import Home from './pages/Home';
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
])
function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
