import { useState } from 'react';
import { PrototypingShell } from './prototype/PrototypingShell';
import { PrototypeApp } from './prototype/PrototypeApp';

function App() {
  const [viewMode, setViewMode] = useState<'shell' | 'app'>('shell');

  // Se URL tem ?app=beneficiario, mostra PrototypeApp
  const queryParams = new URLSearchParams(window.location.search);
  const appParam = queryParams.get('app');

  if (appParam === 'beneficiario' || appParam === 'profissional') {
    return <PrototypeApp />;
  }

  return <PrototypingShell />;
}

export default App;
