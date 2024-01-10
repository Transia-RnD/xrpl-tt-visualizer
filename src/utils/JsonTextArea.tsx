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
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (isValidJson) {
      // Handle the submission of valid JSON data
      onConvert(jsonText)
    } else {
    //   alert('The JSON is invalid. Please correct it before submitting.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={jsonText}
        onChange={handleJsonChange}
        placeholder="Enter JSON here"
        rows={10}
        cols={100}
        style={{ fontFamily: 'monospace' }}
      />
      <div>
        {jsonText && !isValidJson && <span style={{ color: 'red' }}>Invalid JSON format!</span>}
      </div>
      <button type="submit" disabled={!isValidJson}>
        Convert to Hook Tx
      </button>
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