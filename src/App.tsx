import { useEffect } from "react";
import Header from "./components/Header";

function App() {
  useEffect(() => {
    document.body.setAttribute("data-bs-theme", "dark");
  }, []);


  return (
    <>
      <Header/>
    </>
  )
}

export default App
