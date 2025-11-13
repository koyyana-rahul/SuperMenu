import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import useFetchUserDetails from "./hooks/useFetchUserDetails";

const App = () => {
  // Fetch user details on initial load if a token is present
  useFetchUserDetails();

  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
