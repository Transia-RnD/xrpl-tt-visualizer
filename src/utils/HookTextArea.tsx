import React from 'react';

// Define the shape of the results prop
type JsonTextAreaProps = {
  value: string;
};

const HookTextArea = ({ value }: JsonTextAreaProps) => {
  return (
    <textarea
      value={value}
      placeholder="Hook C Tx Output"
      rows={40}
      cols={150}
      style={{ fontFamily: 'monospace' }}
    />
  );
};

export default HookTextArea;