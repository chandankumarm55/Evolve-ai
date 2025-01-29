import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './Pages/LandingPage/LandingPage';
import Home from './Pages/Home/Home';
import DashboardLayout from './components/ClearkComponents/DashboardLayout';
import RootLayout from './components/ClearkComponents/RootLayout';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from './components/ClearkComponents/Constant';
import './App.css';
import SignUp from './Pages/Auth/SingUp';
import Conversation from './Pages/Services/Conversation/Conversation';
import { Dashboard } from './components/Layouts/Dashboard';
import { ImageGeneration } from './Pages/Services/ImageGeneration/ImageGeneration';
import { TextToSpeech } from './Pages/Services/TextToSpeech';
import JokeGenerator from './Pages/Services/JokeGenerator';
import { Translator } from './Pages/Services/LanguageTrasalation/Translator';
import { Dictionary } from './Pages/Services/Dictionary';
import DashboardIndex from './Pages/Services/DashboardIndex';
import SpeechToText from './Pages/Services/SpeechToText/SpeechToText';
import QRCodeGenerator from './Pages/Services/QRCodeGenerator/QRCodeGenerator';
import { Toaster } from "./components/ui/toaster";
import Pricing from './Pages/Pricing/Pricing';
import SignIn from './Pages/Auth/SingIn';
import TermsAndConditions from './Pages/TermsAndConditions/TermsAndConditions';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';
import RefundPolicy from './Pages/RefundPolicy/RefundPolicy';
import DonatePage from './Pages/DonatePage/DonatePage';

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
              <Route path="/" element={ <Home /> } />
              <Route path='/sign-up/*' element={ <SignUp /> } />
              <Route path='/sign-in/*' element={ <SignIn /> } />
              <Route path='/donation' element={ <DonatePage /> } />
              <Route element={ <RootLayout /> }>
                <Route path='/terms-and-conditions' element={ <TermsAndConditions /> } />
                <Route path='/privacy-policy' element={ <PrivacyPolicy /> } />
                <Route element={ <Pricing /> } path='/pricing' />
                <Route element={ <RefundPolicy /> } path='/refund-policy' />

              </Route>
              <Route element={ <DashboardLayout /> }>
                <Route path="/dashboard" element={ <Dashboard /> } >
                  <Route index element={ <DashboardIndex /> } />
                  <Route path="conversation" element={ <Conversation /> } />
                  <Route path="image-generation" element={ <ImageGeneration /> } />
                  <Route path="speech-to-text" element={ <SpeechToText /> } />
                  <Route path='text-to-speech' element={ <TextToSpeech /> } />
                  <Route path='joke-generator' element={ <JokeGenerator /> } />
                  <Route path='translator' element={ <Translator /> } />
                  <Route path='QR-Code-Generator' element={ <QRCodeGenerator /> } />
                  <Route path='dictionary' element={ <Dictionary /> } />
                </Route>
              </Route>
            </Routes>

          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
