
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1>Are you a teacher or student?</h1>
      <button onClick={() => navigate("/teacher/login")}>Teacher Login</button>
      <button onClick={() => navigate("/login")}>Student Login</button>
    </>
  );
};

export default Home;
