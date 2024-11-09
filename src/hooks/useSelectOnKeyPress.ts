import { useEffect, RefObject } from 'react';

const useSelectOnKeyPress = (inputRef: RefObject<HTMLInputElement>, triggerKey: string = 'Enter') => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === triggerKey) {
        inputRef.current?.select();
      }
    };

    document.documentElement.addEventListener('keypress', handleKeyPress);

    return () => {
      document.documentElement.removeEventListener('keypress', handleKeyPress);
    };
  }, [inputRef, triggerKey]);
};

export default useSelectOnKeyPress;