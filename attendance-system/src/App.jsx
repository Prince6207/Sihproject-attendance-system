import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Signup from './pages/Signup';
import Attend from './pages/Attendance';
import Login from './pages/Login';
const router=createBrowserRouter([
  {
    path:'/signup',
    element:<Signup></Signup>
  },{
    path:'/attend',
    element:<Attend></Attend>
  },{
    path:'/login',
    element:<Login></Login>
  }
])
function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
