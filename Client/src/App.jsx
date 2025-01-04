// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import LandingPage from './Pages/LandingPage';
// import { ThemeProvider } from './contexts/ThemeContext';
// import Home from './Pages/Home';
// import DashBoardPage from './Pages/DashBoardPage';
// import DashboardLayout from './components/ClearkComponents/DashboardLayout';
// import RootLayout from './components/ClearkComponents/RootLayout';
// // import { Landing } from './pages/Landing';
// // import { DashboardLayout } from './components/layout/DashboardLayout';
// // import { Conversation } from './pages/services/Conversation';
// // import { ImageGeneration } from './pages/services/ImageGeneration';
// // import { TextToSpeech } from './pages/services/TextToSpeech';
// // import { JokeGenerator } from './pages/services/JokeGenerator';
// // import { Translator } from './pages/services/Translator';
// // import { Dictionary } from './pages/services/Dictionary';
// // import { ThemeProvider } from './contexts/ThemeContext';
// // import GalaxyAnimation from './components/ui/GalaxyAnimation'
// function App() {
//   return (
//     <ThemeProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route element={ <RootLayout /> }>
//             <Route path="/" element={ <LandingPage /> } />
//             <Route path="/Evolve" element={ <Home /> } />
//           </Route>

//           <Route element={ <DashboardLayout /> }>
//             <Route path='/dashboard' element={ <DashBoardPage /> } />
//           </Route>


//           {/*
//           <Route path="/dashboard" element={ <DashboardLayout /> }>
//             <Route index element={ <Conversation /> } />
//             <Route path="conversation" element={ <Conversation /> } />
//             <Route path="image-generation" element={ <ImageGeneration /> } />
//             <Route path="text-to-speech" element={ <TextToSpeech /> } />
//             <Route path="joke-generator" element={ <JokeGenerator /> } />
//             <Route path="translator" element={ <Translator /> } />
//             <Route path="dictionary" element={ <Dictionary /> } />
//           </Route>
//           <Route path="*" element={ <Navigate to="/" replace /> } /> */}
//         </Routes>
//       </BrowserRouter>
//     </ThemeProvider>

//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './Pages/LandingPage';
import Home from './Pages/Home';
import DashboardLayout from './components/ClearkComponents/DashboardLayout';
import RootLayout from './components/ClearkComponents/RootLayout';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from './components/ClearkComponents/Constant';
import './App.css';
import SignUp from './Pages/SingUp';
import { Conversation } from './Pages/Services/Conversation';
import { Dashboard } from './components/Layouts/Dashboard';
import { ImageGeneration } from './Pages/Services/ImageGeneration';
import { TextToSpeech } from './Pages/Services/TextToSpeech';
import { JokeGenerator } from './Pages/Services/JokeGenerator';
import { Translator } from './Pages/Services/Translator';
import { Dictionary } from './Pages/Services/Dictionary';

// Clerk Publishable Key
const PUBLISHABLE_KEY = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={ PUBLISHABLE_KEY }>
      <ThemeProvider>
        <BrowserRouter>
          <div className="app-container">
            <Routes>
              <Route path="/" element={ <LandingPage /> } />
              <Route path='/sign-up/*' element={ <SignUp /> } />
              <Route element={ <RootLayout /> }>

                <Route path="/Evolve" element={ <Home /> } />
              </Route>

              {/* Protected Routes */ }
              <Route path="/dashboard" element={ <Dashboard /> }>
                <Route index element={ <Conversation /> } />
                <Route path="conversation" element={ <Conversation /> } />
                <Route path="image-generation" element={ <ImageGeneration /> } />
                <Route path='text-to-speech' element={ <TextToSpeech /> } />
                <Route path='joke-generator' element={ <JokeGenerator /> } />
                <Route path='translator' element={ <Translator /> } />
                <Route path='dictionary' element={ <Dictionary /> } />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
