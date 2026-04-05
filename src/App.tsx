//PAGE IMPORTS//////////////////////////////
import Profile from "./pages/Profile";
import "./App.css";

//OTHER IMPORTS/////////////////////////////
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Landing />} /> */}
        <Route path="/profile/:username" element={<Profile />} />
        {/* <Route path='*' element={<NotFound/>}></Route>  */}
      </Routes>
    </>
  )
}

export default App;
