import React, { useState } from 'react';

// Define the shape of the results prop
type JsonTextAreaProps = {
    onConvert: (json: any) => void;
  };

const JsonTextArea = ({ onConvert }: JsonTextAreaProps) => {
  const [jsonText, setJsonText] = useState('');
  const [isValidJson, setIsValidJson] = useState(false);

  const handleJsonChange = (event: any) => {
    const value = event.target.value;
    setJsonText(value);
    try {
      JSON.parse(value);
      if (value === '') {
        throw Error('Empty Json Object')
      }
      setIsValidJson(true);
      onConvert(value)
    } catch (error) {
      setIsValidJson(false);
    }
  };

  return (
    <form>
      <textarea
        value={jsonText}
        onChange={handleJsonChange}
        placeholder="Enter JSON here"
        rows={10}
        cols={100}
        style={{ fontFamily: 'monospace' }}
      />
      <div style={{ margin: '8px' }}>
        {jsonText && !isValidJson && <span style={{ color: 'red' }}>Invalid JSON format!</span>}
      </div>
    </form>
  );
};

export default JsonTextArea;

/*
{
  "TransactionType": "TrustSet",
  "Account": "rPMh7Pi9ct699iZUTWaytJUoHcJ7cgyziK",
  "Flags": 262144,
  "LimitAmount": {
    "currency": "BZO",
    "issuer": "rHyB8fpHCTB4NhwayEtNH9DsjLue33n1ph",
    "value": "100000000000"
  }
}
*/
