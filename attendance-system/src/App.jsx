import './App.css'
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Signup from './pages/Signup';
import Attend from './pages/Attendance';
const router=createBrowserRouter([
  {
    path:'/signup',
    element:<Signup></Signup>
  },{
    path:'/attend',
    element:<Attend></Attend>
  }
])
function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
