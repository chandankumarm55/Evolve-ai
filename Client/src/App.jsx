
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/Pages/LandingPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <LandingPage /> } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
