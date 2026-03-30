import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import './App.css'
import MainFeed from './pages/MainFeed';


function App() {
  return (
    <>
    <Toaster position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/mainfeed" element={<MainFeed />}/>      
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
