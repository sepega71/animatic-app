import React from 'react';

interface CopyButtonProps {
  onClick: () => void;
  isCopied: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ onClick, isCopied }) => {
  return (
    <button onClick={onClick} className={`copy-button ${isCopied ? 'copied' : ''}`}>
      {isCopied ? '✓ Copied!' : 'Copy CSS'}
    </button>
  );
};

export default CopyButton;