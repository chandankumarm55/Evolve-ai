import React from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layout/root-layout';
import DashboardLayout from './layout/dashboard-layout';
import IndexPage from './Pages/Index';

import SignInPage from './Pages/Sign-in';
import SignUpPage from './Pages/Sign-up';

import ImageGeneration from './Pages/ImageGeneration';
import TextToSpeech from './Pages/TextToSpeech';
import LanguageTransalation from './Pages/LanguageTransalation';
import ObjectDeduction from './Pages/ObjectDeduction';
import ChatBoat from './Pages/ChatBoat';
import Dictionary from './Pages/Dictionary';
import Joke from './Pages/Joke'
import Explore from './Pages/Explore';

const App = () => {
  return (
    <>
      <Toaster />

      <BrowserRouter>

        <Routes>
          <Route
            element={ <RootLayout /> }
            path="/"
          >
            <Route index element={ <IndexPage /> } />

            <Route path="sign-in/*" element={ <SignInPage /> } />
            <Route path="sign-up/*" element={ <SignUpPage /> } />
            <Route
              element={ <DashboardLayout /> }
            >
              <Route path='explore' element={ <Explore /> } />
              <Route path="imagegeneration" element={ <ImageGeneration /> } />
              <Route path="texttospeech" element={ <TextToSpeech /> } />
              <Route path="languagetransalation" element={ <LanguageTransalation /> } />
              <Route path='objectdeduction' element={ <ObjectDeduction /> } />
              <Route path='chatboat' element={ <ChatBoat /> } />
              < Route path='dictionary' element={ <Dictionary /> } />
              <Route path='jokegenerator' element={ <Joke /> } />
            </Route>
          </Route>
        </Routes>

      </BrowserRouter>
    </>
  );
}

export default App;
