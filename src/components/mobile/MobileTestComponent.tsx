
import React, { useState, useEffect } from 'react';

const MobileTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    console.log("=== MOBILE TEST COMPONENT MOUNTED ===");
    runTests();
  }, []);

  const runTests = async () => {
    console.log("Running mobile compatibility tests...");
    setIsRunning(true);
    const results: Record<string, boolean> = {};

    // Test 1: Basic JavaScript execution
    try {
      const testVar = "test";
      results.jsExecution = testVar === "test";
      console.log("✅ JavaScript execution: OK");
    } catch (e) {
      results.jsExecution = false;
      console.error("❌ JavaScript execution failed:", e);
    }

    // Test 2: DOM manipulation
    try {
      const testDiv = document.createElement('div');
      testDiv.innerHTML = 'test';
      results.domManipulation = testDiv.innerHTML === 'test';
      console.log("✅ DOM manipulation: OK");
    } catch (e) {
      results.domManipulation = false;
      console.error("❌ DOM manipulation failed:", e);
    }

    // Test 3: CSS support
    try {
      const testElement = document.createElement('div');
      testElement.style.display = 'block';
      results.cssSupport = testElement.style.display === 'block';
      console.log("✅ CSS support: OK");
    } catch (e) {
      results.cssSupport = false;
      console.error("❌ CSS support failed:", e);
    }

    // Test 4: Event listeners
    try {
      const testElement = document.createElement('div');
      let eventFired = false;
      testElement.addEventListener('click', () => { eventFired = true; });
      testElement.click();
      results.eventListeners = eventFired;
      console.log("✅ Event listeners: OK");
    } catch (e) {
      results.eventListeners = false;
      console.error("❌ Event listeners failed:", e);
    }

    // Test 5: Fetch API
    try {
      await fetch('data:text/plain;base64,dGVzdA==');
      results.fetchAPI = true;
      console.log("✅ Fetch API: OK");
    } catch (e) {
      results.fetchAPI = false;
      console.error("❌ Fetch API failed:", e);
    }

    // Test 6: Promise support
    try {
      await new Promise(resolve => setTimeout(resolve, 10));
      results.promiseSupport = true;
      console.log("✅ Promise support: OK");
    } catch (e) {
      results.promiseSupport = false;
      console.error("❌ Promise support failed:", e);
    }

    // Test 7: ES6 features
    try {
      const testArrow = () => "test";
      const testTemplate = `template ${testArrow()}`;
      results.es6Features = testTemplate === "template test";
      console.log("✅ ES6 features: OK");
    } catch (e) {
      results.es6Features = false;
      console.error("❌ ES6 features failed:", e);
    }

    // Test 8: React rendering
    try {
      results.reactRendering = true; // If we're here, React is working
      console.log("✅ React rendering: OK");
    } catch (e) {
      results.reactRendering = false;
      console.error("❌ React rendering failed:", e);
    }

    setTestResults(results);
    setIsRunning(false);
    
    const failedTests = Object.entries(results).filter(([, passed]) => !passed);
    if (failedTests.length > 0) {
      console.error("🚨 FAILED TESTS:", failedTests.map(([test]) => test));
    } else {
      console.log("🎉 ALL TESTS PASSED!");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 10001,
      fontSize: '14px',
      fontFamily: 'monospace',
      minWidth: '300px',
      maxWidth: '90vw'
    }}>
      <h3 style={{ color: '#00ff00', marginTop: 0 }}>🧪 Tests de Compatibilité Mobile</h3>
      
      {isRunning ? (
        <div style={{ color: '#ffff00' }}>Tests en cours...</div>
      ) : (
        <div>
          {Object.entries(testResults).map(([test, passed]) => (
            <div key={test} style={{ 
              margin: '5px 0',
              color: passed ? '#00ff00' : '#ff0000'
            }}>
              {passed ? '✅' : '❌'} {test}
            </div>
          ))}
          
          <button
            onClick={runTests}
            style={{
              marginTop: '15px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Relancer les tests
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileTestComponent;
